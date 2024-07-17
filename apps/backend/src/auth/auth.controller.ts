import {
  Controller,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common'
import { AuthService } from './auth.service'
import { UserService } from '../user/user.service'
import { Request, Response } from 'express'
import { OnboardingGuard } from '@/guards/onboarding.guard'
import { CustomerService } from '@/user/customer/customer.service'
import { MechanicService } from '@/user/mechanic/mechanic.service'
import { ThrottlerGuard } from '@nestjs/throttler'
import { ConfigService } from '@nestjs/config'
import { REAgentService } from '@/user/real-estate-agent/agent.service'

@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly customerService: CustomerService,
    private readonly mechanicService: MechanicService,
    private readonly agentService: REAgentService,
    private readonly configService: ConfigService,
  ) {}

  // check if there is a token?
  // if token also exists then check if it is expired?
  // if expired? then send otp and upon verification, refresh the token and send as cookies.
  // if no token exists then check if phone exists in db
  // if does not exists then verify phone number and then create a new user with onboarding.
  @Post('login/verify')
  async VerifyOtpAndLogin(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const { phoneNumber, otp } = req.body
    try {
      const { accessToken, refreshToken, xsrfToken, user } =
        await this.authService.login(phoneNumber, otp)
      // Set the JWT in an HTTP-only cookie
      const secure = this.configService.get<string>('NODE_ENV') === 'PRODUCTION'
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 1 hour; adjust to your needs
        secure: secure, // Use HTTPS in production
        sameSite: 'lax', // Adjust this according to your cross-site request needs
      })
      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        path: '/',
        maxAge: 1000 * 60 * 15, // 1 hour; adjust to your needs
        secure: secure, // Use HTTPS in production
        sameSite: 'lax', // Adjust this according to your cross-site request needs
      })
      res.setHeader('x-xsrf-token', xsrfToken)
      res.status(HttpStatus.OK).json({
        success: true,
        message: `User successfully authenticated!`,
        data: user,
      })
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error?.message,
        error: error,
      })
    }
  }

  @Post('login/:phoneNumber')
  async RequestOtpForLogin(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const { phoneNumber } = req.params
    const { cookies, headers } = req
    try {
      const user = await this.userService.getUserByPhoneNumber(phoneNumber)
      if (!user) {
        // send to signup route
        res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          message: `The user with phone number: ${phoneNumber} does not exist\n Please Signup First.`,
          error: new Error(`${HttpStatus.BAD_REQUEST}, Wrong endpoint`),
        })
      }
      if (user.isPhoneVerified) {
        if (user.isBanned) {
          res.status(HttpStatus.FORBIDDEN).json({
            success: false,
            message: `The user:${user.firstName + user.lastName} is banned.\n Please try again after 24hrs from the time of ban`,
            error: new Error(
              'FORBIDDEN, User Banned due to excessive otp requests',
            ),
          })
        }

        console.log(
          `Refresh Tokens: ${cookies['refreshToken']}`,
          `XSRF Tokens: ${headers['x-xsrf-token']}`,
        )
        if (!cookies['refreshToken'] || !headers['x-xsrf-token']) {
          // the user is not banned, generate the otp and send to client
          try {
            await this.authService.requestOtp(phoneNumber)
            res.status(HttpStatus.OK).json({
              success: true,
              message: `The otp was successfully sent to ${phoneNumber}`,
            })
          } catch (error) {
            res.status(500).json(error)
          }
        } else {
          // if his phone is verified and the tokens are available, refresh the accessToken and send back
          const { accessToken, refreshToken, xsrfToken } =
            await this.authService.refreshSession(
              cookies['refreshToken'],
              headers['x-xsrf-token'] as string,
            )
          const secure =
            this.configService.get<string>('NODE_ENV') === 'PRODUCTION'
          res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            path: '/',
            maxAge: 1000 * 60 * 60 * 24 * 7, // 1 hour; adjust to your needs
            secure: secure, // Use HTTPS in production
            sameSite: 'lax', // Adjust this according to your cross-site request needs
          })
          res.cookie('accessToken', accessToken, {
            httpOnly: true,
            path: '/',
            maxAge: 1000 * 60 * 15, // 1 hour; adjust to your needs
            secure: secure, // Use HTTPS in production
            sameSite: 'lax', // Adjust this according to your cross-site request needs
          })
          res.setHeader('x-xsrf-token', xsrfToken)
          res.status(HttpStatus.OK).json({
            success: true,
            message: `User successfully authenticated!`,
            data: user,
          })
        }
      }

      // initiate login process
      // check if user is banned
    } catch (error) {
      res.status(HttpStatus.NOT_FOUND).json(error)
    }
  }

  /***************************
   ****************************
   *    Customer Onboarding    *
   ****************************
   ****************************/

  @Post('signup/customer/verify')
  async VerifyOtpAndGenSignupToken(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const { phoneNumber, otp } = req.body
    try {
      const token = await this.authService.signupInitiate(
        phoneNumber,
        otp,
        'CUSTOMER',
      )
      console.log(token, 'onboardingToken')

      // Set the JWT in an HTTP-only cookie
      res.setHeader('x-onboarding-token', token)

      res.status(HttpStatus.OK).json({
        success: true,
        message: `Phone Number verfied!, the user can now proceed with signup`,
      })
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error?.message,
        error: error,
      })
    }
  }

  @Post('signup/customer/:phoneNumber')
  async RequestOtpForSignup(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const { phoneNumber } = req.params

    try {
      // checking if user exists in db
      const user = await this.userService.getUserByPhoneNumber(phoneNumber)
      // if (user.isPhoneVerified) {
      //   // if his phone is verified, refresh the auth token and send back
      // }
      if (!user) {
        try {
          await this.authService.requestOtp(phoneNumber)
          res.status(HttpStatus.OK).json({
            success: true,
            message: `The otp was successfully sent to ${phoneNumber}`,
          })
        } catch (error) {
          res.status(error.status || 500).json({
            success: false,
            message:
              error.message || 'An Unexpected Error Occured, Please Try Again.',
            error: error.name || `Unandled Exception:\n${error}`,
          })
        }
      } else {
        // if user exists, send to login route
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: `The user with phone number: ${phoneNumber} already exist\n Please Login.`,
          error: `${HttpStatus.BAD_REQUEST}, Wrong endpoint`,
        })
      }
    } catch (error) {
      res.status(HttpStatus.NOT_FOUND).json({
        success: false,
        message: error?.message,
        error: error,
      })
    }
  }

  @Post('signup/customer')
  @UseGuards(OnboardingGuard)
  // @UsePipes(new ZodValidationPipe(zodSignupRequestSchema))
  async onboardCustomer(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const { body } = req

    // don't think this will ever execute because of the validation pipe.
    // After verification, remove this.
    // if (!parseReqBodyAndValidate(zodSignupRequestSchema, body)) {
    //   res.status(HttpStatus.BAD_REQUEST).json({
    //     success: false,
    //     message: 'The provided body is not of expected shape',
    //     error: zodSignupRequestSchema.safeParse(body).error,
    //   })
    // }
    try {
      // Call the customerService.createCustomer method and await its result
      const customer = await this.customerService.createCustomer({
        ...body,
        isPhoneVerified: true,
        verifiedOn: new Date().toISOString(),
        role: 'CUSTOMER',
      })

      const { accessToken, refreshToken, xsrfToken } =
        await this.authService.login(customer.phoneNumber)
      const secure = this.configService.get<string>('NODE_ENV') === 'PRODUCTION'

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 1 hour; adjust to your needs
        secure: secure, // Use HTTPS in production
        sameSite: 'lax', // Adjust this according to your cross-site request needs
      })

      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        path: '/',
        maxAge: 1000 * 60 * 15, // 1 hour; adjust to your needs
        secure: secure, // Use HTTPS in production
        sameSite: 'lax', // Adjust this according to your cross-site request needs
      })

      res.setHeader('x-xsrf-token', xsrfToken)

      res.status(HttpStatus.CREATED).json({
        success: true,
        message: 'User Created Successfully',
        data: customer,
      })
    } catch (error: unknown) {
      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: 'Could not create the customer',
        error: error,
      })
    }
  }

  // /************************
  //  *************************
  //  *    Mech Onboarding    *
  //  *************************
  //  ************************/

  // update the redis key-value pair storing the mechanic's details for onboarding
  // this makes frontend independent of backend structures for structuring their frontend api calls
  @Post('signup/mechanic/updateSignupProgress')
  @UseGuards(OnboardingGuard)
  async UpdateMechSignupObject(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const { body, cookies } = req

    if (
      !cookies['x-onboarding-token'] ||
      !(cookies['x-onboarding-token'].length > 0)
    ) {
      res.status(HttpStatus.UNAUTHORIZED).json({
        succes: false,
        message: 'You are unauthorized to access this resource',
        error: {
          code: 'MISSING_TOKEN',
          reason: 'Missing onboarding token',
        },
      })
    }

    const phoneNumber = this.authService.decryptOnboardingToken(
      cookies['x-onboarding-token'],
    )

    try {
      // update the store
      const updatedUserStore = await this.authService.updateMechSignupStore(
        phoneNumber,
        body,
      )

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'User Store Updated Successfully',
        data: updatedUserStore,
      })
    } catch (error) {
      console.error(error)
      res.status(error.code ?? HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message:
          error.message ??
          'An unexpected error occured, please try again later.',
        error: error.error ?? {
          code: HttpStatus.INTERNAL_SERVER_ERROR,
          reason: 'Uncaught Error',
        },
      })
    }
  }

  @Post('signup/mechanic/complete')
  @UseGuards(OnboardingGuard)
  // @UsePipes(new ZodValidationPipe(ZCreateMechanicRoMainSchema))
  async onboardMechanic(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const { cookies } = req
    const phoneNumber = this.authService.decryptOnboardingToken(
      cookies['x-onboarding-token'],
    )
    try {
      // Call the customerService.createCustomer method and await its result
      await this.authService.persistMechanic(phoneNumber)
      const { accessToken, refreshToken, user, xsrfToken } =
        await this.authService.login(phoneNumber)
      const secure = this.configService.get<string>('NODE_ENV') === 'PRODUCTION'

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 1 hour; adjust to your needs
        secure: secure, // Use HTTPS in production
        sameSite: 'lax', // Adjust this according to your cross-site request needs
      })

      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        path: '/',
        maxAge: 1000 * 60 * 15, // 1 hour; adjust to your needs
        secure: secure, // Use HTTPS in production
        sameSite: 'lax', // Adjust this according to your cross-site request needs
      })

      res.setHeader('x-xsrf-token', xsrfToken)
      // Set the JWT in an HTTP-only cookie
      // Log the Set-Cookie header
      res.status(HttpStatus.CREATED).json({
        success: true,
        message: 'User Created Successfully',
        data: user,
      })
    } catch (error: unknown) {
      console.error(error)
      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: 'Could not create the mechanic',
        error: error,
      })
    }
  }

  @Post('signup/mechanic/verify')
  async VerifyMechOtpAndGenSignupToken(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const { phoneNumber, otp } = req.body
    try {
      // 1. fetch user with phone number => user?error:nextstep
      // 2. otp?nextstep:error
      // 3. validate otp?nextstep:send to catch block(throws error)
      // 4. generate temporary onboarding-token to authenticate upcoming signup requests for onboarding => send them back
      const token = await this.authService.signupInitiate(
        phoneNumber,
        otp,
        'CUSTOMER',
      )

      // Set the JWT in an HTTP-only cookie
      res.setHeader('x-onboarding-token', token)
      res.status(HttpStatus.OK).json({
        success: true,
        message: `Phone Number verfied!, the user can now proceed with signup`,
      })
    } catch (error) {
      res.status(error.status || HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message:
          error?.message ||
          `An Unexpected Error Occured. Please Try Again Later.`,
        error: error.name || `Unhandled Exception: \n${error}`,
      })
    }
  }

  @Post('signup/mechanic/:phoneNumber')
  async RequestOtpForMechSignup(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const { phoneNumber } = req.params
    try {
      const { cookies } = req

      if (
        cookies['onboarding-token'] &&
        cookies['onboarding-token'].length > 1
      ) {
        // their phone is verified, refresh the onboarding token and send back new onboarding token
        // TODO: implement
        console.log('refresh and return onboarding token')
      }

      // checking if user exists in db
      const user = await this.userService.getUserByPhoneNumber(phoneNumber)
      // if user exists, send to login route
      if (user) {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: `The user with phone number: ${phoneNumber} already exist\n Please Login.`,
          error: {
            code: 'WRNG_ENDPOINT',
            reason: 'User exists, sending back to login',
          },
        })
      }

      // request otp for verification
      await this.authService.requestOtp(phoneNumber)
      res.status(HttpStatus.OK).json({
        success: true,
        message: `The otp was successfully sent to ${phoneNumber}`,
      })
    } catch (error) {
      res.status(HttpStatus.NOT_FOUND).json({
        success: false,
        message: error?.message,
        error: error,
      })
    }
  }

  @Post('connect/mechanic')
  async createConnectAccount(@Req() req: Request, @Res() res: Response) {
    try {
      // Call the customerService.createCustomer method and await its result
      const mechanic = await this.mechanicService.createConnectAccount(req.body)

      res.status(HttpStatus.CREATED).json({
        success: true,
        message: 'User Created Successfully',
        data: mechanic,
      })
    } catch (error: unknown) {
      console.error(error)
      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: 'Could not create the mechanic',
        error: error,
      })
    }
  }

  /********************************
   *********************************
   *    Real Estate Agent Onboarding    *
   *********************************
   *********************************/

  @Post('signup/re-agent/verify')
  async VerifyOtpAndGenSignupTokenForREAgent(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const { phoneNumber, otp } = req.body
    try {
      const token = await this.authService.signupInitiate(
        phoneNumber,
        otp,
        'REAL_AGENT',
      )
      console.log(token, 'onboardingToken')

      // Set the JWT in an HTTP-only cookie
      res.setHeader('x-onboarding-token', token)

      res.status(HttpStatus.OK).json({
        success: true,
        message: `Phone Number verfied!, the user can now proceed with signup`,
      })
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error?.message,
        error: error,
      })
    }
  }

  @Post('signup/re-agent/:phoneNumber')
  async RequestOtpForSignupForREAgent(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const { phoneNumber } = req.params

    try {
      // checking if user exists in db
      const user = await this.userService.getUserByPhoneNumber(phoneNumber)
      // if (user.isPhoneVerified) {
      //   // if his phone is verified, refresh the auth token and send back
      // }
      if (!user) {
        try {
          await this.authService.requestOtp(phoneNumber)
          res.status(HttpStatus.OK).json({
            success: true,
            message: `The otp was successfully sent to ${phoneNumber}`,
          })
        } catch (error) {
          res.status(error.status || 500).json({
            success: false,
            message:
              error.message || 'An Unexpected Error Occured, Please Try Again.',
            error: error.name || `Unandled Exception:\n${error}`,
          })
        }
      } else {
        // if user exists, send to login route
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: `The user with phone number: ${phoneNumber} already exist\n Please Login.`,
          error: `${HttpStatus.BAD_REQUEST}, Wrong endpoint`,
        })
      }
    } catch (error) {
      res.status(HttpStatus.NOT_FOUND).json({
        success: false,
        message: error?.message,
        error: error,
      })
    }
  }

  @Post('signup/re-agent')
  @UseGuards(OnboardingGuard)
  // @UsePipes(new ZodValidationPipe(zodSignupRequestSchema))
  async onboardREAgent(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const { body } = req

    try {
      // Call the agentService.createReAgent method and await its result
      const reAgent = await this.agentService.createReAgent({
        ...body,
        isPhoneVerified: true,
        verifiedOn: new Date().toISOString(),
        role: 'REAGENT',
      })

      const { accessToken, refreshToken, xsrfToken } =
        await this.authService.login(reAgent.phoneNumber)
      const secure = this.configService.get<string>('NODE_ENV') === 'PRODUCTION'

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 1 hour; adjust to your needs
        secure: secure, // Use HTTPS in production
        sameSite: 'lax', // Adjust this according to your cross-site request needs
      })

      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        path: '/',
        maxAge: 1000 * 60 * 15, // 1 hour; adjust to your needs
        secure: secure, // Use HTTPS in production
        sameSite: 'lax', // Adjust this according to your cross-site request needs
      })

      res.setHeader('x-xsrf-token', xsrfToken)

      res.status(HttpStatus.CREATED).json({
        success: true,
        message: 'User Created Successfully',
        data: reAgent,
      })
    } catch (error: unknown) {
      console.error(error)
      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: 'Could not create real estate agent',
        error: error,
      })
    }
  }
}
