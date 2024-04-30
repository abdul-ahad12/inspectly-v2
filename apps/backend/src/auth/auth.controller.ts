import {
  Controller,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
  UsePipes,
} from '@nestjs/common'
import { AuthService } from './auth.service'
import { UserService } from '../user/user.service'
import { Request, Response } from 'express'
import { OnboardingAuthGuard } from '@/guards/onboardingAuth.guard'
import { CustomerService } from '@/user/customer/customer.service'
import { ZodValidationPipe } from '@/common/pipes/zod'
import { zodSignupRequestSchema } from '@/common/definitions/zod/signupRequestSchema'
import { parseReqBodyAndValidate } from '@/common/utils/parseReqBody'

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly customerService: CustomerService,
  ) {}

  // check if there is a token?
  // if token also exists then check if it is expired?
  // if expired? then send otp and upon verification, refresh the token and send as cookies.
  // if no token exists then check if phone exists in db
  // if does not exists then verify phone number and then create a new user with onboarding.
  @Post('login/customer/verify')
  async VerifyOtpAndLogin(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const { phoneNumber, otp } = req.body
    // const a = req.cookies
    // console.log(a)
    try {
      const isOtpVerified = await this.authService.verifyOtp(phoneNumber, otp)
      if (!isOtpVerified) {
        // send to signup route
        res.status(HttpStatus.UNAUTHORIZED).json({
          success: false,
          message: `incorrect otp, Please make sure you're entering the correct otp for ${phoneNumber}`,
          error: new Error(`${HttpStatus.BAD_REQUEST}, Incorrect Credentials`),
        })
      }

      const user = await this.userService.getUserByPhoneNumber(phoneNumber)
      // generate jwt tokens
      const token = await this.authService.generateJwtToken(user)

      // Set the JWT in an HTTP-only cookie
      res
        .status(HttpStatus.OK)
        .cookie('Authentication', token, {
          httpOnly: true,
          path: '/',
          maxAge: 3600000, // 1 hour; adjust to your needs
          secure: process.env.NODE_ENV === 'PROD', // Use HTTPS in production
          sameSite: 'strict', // Adjust this according to your cross-site request needs
        })
        .json({
          success: true,
          message: `User successfully authenticated!`,
        })
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error?.message,
        error: error,
      })
    }
  }

  @Post('login/customer/:phoneNumber')
  async RequestOtpForLogin(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const { phoneNumber } = req.params
    const a = req.cookies
    console.log(a)
    try {
      const user = await this.userService.getUserByPhoneNumber(phoneNumber)
      // if (user.isPhoneVerified) {
      //   // if his phone is verified, refresh the auth token and send back
      // }
      if (!user) {
        // send to signup route
        res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          message: `The user with phone number: ${phoneNumber} does not exist\n Please Signup First.`,
          error: new Error(`${HttpStatus.BAD_REQUEST}, Wrong endpoint`),
        })
      }
      // initiate login process
      // check if user is banned
      // if (user.isBanned) {
      //   res.status(HttpStatus.FORBIDDEN).json({
      //     success: false,
      //     message: `The user:${user.firstName + user.lastName} is banned.\n Please try again after 24hrs from the time of ban`,
      //     error: new Error("FORBIDDEN, User Banned due to excessive otp requests")
      //   })
      // }

      // the user is not banned, generate the otp and send to client
      try {
        await this.authService.sendOtp(phoneNumber)
        res.status(HttpStatus.OK).json({
          success: true,
          message: `The otp was successfully sent to ${phoneNumber}`,
        })
      } catch (error) {
        res.status(500).json({
          success: false,
          message: error.message,
          error: error,
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

  @Post('signup/customer/verify')
  async VerifyOtpAndGenSignupToken(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const { phoneNumber, otp } = req.body
    try {
      const isOtpVerified = await this.authService.verifyOtp(phoneNumber, otp)
      if (!isOtpVerified) {
        // send to signup route
        res.status(HttpStatus.UNAUTHORIZED).json({
          success: false,
          message: `incorrect otp, Please make sure you're entering the correct otp for ${phoneNumber}`,
          error: new Error(`${HttpStatus.BAD_REQUEST}, Incorrect Credentials`),
        })
      }
      // generate temporary onboarding-token to authenticate for onboarding request
      const token = this.authService.generateOnboardingToken(phoneNumber)

      // Set the JWT in an HTTP-only cookie
      res.cookie('onboarding-token', token, {
        httpOnly: true,
        path: '/',
        maxAge: 3600000, // 1 hour; adjust to your needs
        secure: process.env.NODE_ENV === 'production', // Use HTTPS in production
        sameSite: 'strict', // Adjust this according to your cross-site request needs
      })

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
    console.log(phoneNumber)
    const a = req.cookies
    console.log(a)
    try {
      // checking if user exists in db
      const user = await this.userService.getUserByPhoneNumber(phoneNumber)
      // if (user.isPhoneVerified) {
      //   // if his phone is verified, refresh the auth token and send back
      // }
      if (user) {
        // send to signup route
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: `The user with phone number: ${phoneNumber} already exist\n Please Login.`,
          error: new Error(`${HttpStatus.BAD_REQUEST}, Wrong endpoint`),
        })
      }

      try {
        await this.authService.sendOtp(phoneNumber)
        res.status(HttpStatus.OK).json({
          success: true,
          message: `The otp was successfully sent to ${phoneNumber}`,
        })
      } catch (error) {
        res.status(500).json({
          success: false,
          message: error.message,
          error: error,
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
  @UseGuards(OnboardingAuthGuard)
  @UsePipes(new ZodValidationPipe(zodSignupRequestSchema))
  async onboardCustomer(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const { body } = req

    // don't think this will ever execute because of the validation pipe.
    // After verification, remove this.
    if (!parseReqBodyAndValidate(zodSignupRequestSchema, body)) {
      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: 'The provided body is not of expected shape',
        error: zodSignupRequestSchema.safeParse(body).error,
      })
    }

    try {
      console.log({
        ...body,
        isPhoneVerified: true,
        // verifiedOn: Date.now(),
        role: 'CUSTOMER',
      })

      try {
        // Call the customerService.createCustomer method and await its result
        const customer = await this.customerService.createCustomer({
          ...body,
          isPhoneVerified: true,
          verifiedOn: new Date().toISOString(),
          role: 'CUSTOMER',
        })

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
    } catch (error: unknown) {
      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: 'Could not create the user',
        error: error,
      })
    }
  }
}
