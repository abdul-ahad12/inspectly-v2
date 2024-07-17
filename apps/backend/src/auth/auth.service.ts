import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { RedisService } from '@/redis/redis.service'
import { Twilio } from 'twilio'
import { OTP } from '@utils/functions'
import { UserService } from '@/user/user.service'
import { JwtService } from '@nestjs/jwt'
import { Prisma, User } from '@prisma/client'
import { decrypt, encrypt } from './crypto.util'
import { generate as randToken } from 'rand-token'
import { merge } from 'lodash'
import { MechanicService } from '@/user/mechanic/mechanic.service'

@Injectable()
export class AuthService {
  private twilioClient: Twilio

  constructor(
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly mechanicService: MechanicService,
    private readonly jwtService: JwtService,
  ) {
    const accountSid = this.configService.get<string>('TW_ACC_SID')
    const authToken = this.configService.get<string>('TW_AUTH_TOKEN')

    if (!accountSid || !authToken) {
      throw new HttpException(
        'Twilio credentials are not set',
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }

    this.twilioClient = new Twilio(accountSid, authToken)
  }

  //  OTP Methods

  // Public Methods for external user (encapsulation)

  async requestOtp(phoneNumber: string): Promise<void> {
    try {
      await this.manageOtpRequests(phoneNumber)
      const otp = OTP.generateOTP()
      await this.storeOtp(phoneNumber, otp)
      await this.sendOtp(phoneNumber, otp)
    } catch (error) {
      throw error
    }
  }

  // Private Methods

  private async sendOtp(phoneNumber: string, otp: string): Promise<void> {
    try {
      await this.twilioClient.messages.create({
        body: `Your OTP for NOVATECH SOL is ${otp}`,
        from:
          this.configService.get<string>('TW_PHONE_NUMBER') || '+12513090278',
        to: phoneNumber,
      })
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to send OTP.',
          error: {
            code: error.error_code || 500,
            reason: error.error_message,
            message: 'Failed to send OTP',
          },
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }

  private async manageOtpRequests(phoneNumber: string): Promise<void> {
    const requestKey = `otpRequests:${phoneNumber}`
    const ttwKey = `ttw:${phoneNumber}`

    const requests = await this.redisService.incr(requestKey)
    if (requests === 1) {
      await this.redisService.expire(requestKey, 86400) // 24 hours tracking
    }

    const currentTtw = parseInt((await this.redisService.get(ttwKey)) || '0')
    const now = Date.now()

    if (now < currentTtw) {
      throw new HttpException(
        {
          success: false,
          message: `Please wait ${Math.ceil((currentTtw - now) / 1000)} seconds before requesting a new OTP.`,
          error: {
            code: 'Early_Call',
            message: 'ttw < time waited.',
          },
        },
        HttpStatus.BAD_REQUEST,
      )
    }

    if (requests <= 3) {
      const newTtw = now + requests * 30 * 1000
      await this.redisService.set(ttwKey, newTtw.toString(), 'EX', 86400)
    } else {
      await this.redisService.set(`ban:${phoneNumber}`, 'banned', 'EX', 86400)
      throw new HttpException(
        {
          success: false,
          message: 'Too many OTP requests. You are banned for 24 hours.',
          error: {
            code: 'TOO_MANY_REQS',
            message: 'User Banned, Too many Requests',
          },
        },
        HttpStatus.BAD_REQUEST,
      )
    }
  }

  private async storeOtp(phoneNumber: string, otp: string): Promise<void> {
    const otpKey = `otp:${phoneNumber}`
    const otpRequestKey = `otp_request:${phoneNumber}`
    const secret = OTP.generateSecret(otp)

    await this.redisService.set(otpKey, secret, 'EX', 300) // 5 minutes validity
    await this.redisService.set(otpRequestKey, 'requested', 'EX', 360) // Slightly longer TTL than the OTP
  }

  private async validateOtp(
    phoneNumber: string,
    inputOtp: string,
  ): Promise<boolean> {
    try {
      const otpKey = `otp:${phoneNumber}`
      const otpRequestKey = `otp_request:${phoneNumber}`

      const otpExists = await this.redisService.get(otpRequestKey)
      if (!otpExists) {
        throw new HttpException(
          {
            success: false,
            message: 'No OTP request was found associated with this number',
            error: {
              code: 'OTP_NO_REQUEST',
              reason: 'No OTP request was made for this phone number.',
            },
          },
          HttpStatus.BAD_REQUEST,
        )
      }

      const storedSecret = await this.redisService.get(otpKey)
      if (!storedSecret) {
        throw new HttpException(
          {
            success: false,
            message:
              "The OTP you're trying to verify has expired, Please Retry!",
            error: {
              code: 'OTP_EXPIRED',
              reason: 'OTP expired',
            },
          },
          HttpStatus.BAD_REQUEST,
        )
      }

      const isValid = OTP.generateSecret(inputOtp) === storedSecret

      if (!isValid) {
        throw new HttpException(
          {
            success: false,
            message: "The OTP you're trying to verify is wrong, Please Retry!",
            error: {
              code: 'OTP_INVALID',
              reason: 'OTP expired',
            },
          },
          HttpStatus.BAD_REQUEST,
        )
      }
      return true
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message:
            error.message ??
            'An unexpected error occured while trying to verify otp.',
          error: error.error,
        },
        HttpStatus.BAD_REQUEST,
      )
    }
  }

  // Public Auth Methods

  async login(
    phoneNumber: string,
    otp?: string,
  ): Promise<{
    accessToken: string
    refreshToken: string
    xsrfToken: string
    user: User
  }> {
    try {
      const user = await this.userService.getUserByPhoneNumber(phoneNumber)
      if (user.isPhoneVerified) {
      }
      const tokens = await this.generateAndStoreAllTokens(user)
      // if an otp has not been passed, this means it is to refresh the user session
      if (!otp) {
        return { ...tokens, user }
      }
      await this.validateOtp(phoneNumber, otp)
      return { ...tokens, user }
    } catch (error) {
      throw error
    }
  }

  async signupInitiate(
    phoneNumber: string,
    otp: string,
    type: 'MECHANIC' | 'CUSTOMER' | 'REAL_AGENT',
  ): Promise<string> {
    try {
      const oldUser = await this.userService.getUserByPhoneNumber(phoneNumber)
      if (oldUser) {
        throw new HttpException(
          {
            success: false,
            message: 'The user with this phone number already exists',
            error: {
              code: HttpStatus.BAD_REQUEST,
              reason: 'USER_EXISTS',
            },
          },
          HttpStatus.BAD_REQUEST,
        )
      }

      // if an otp has not been passed, this means it is to refresh the user session
      if (!otp) {
        throw new HttpException(
          {
            success: false,
            message: 'OTP was not provided',
            error: {
              code: HttpStatus.BAD_REQUEST,
              reason: 'NO_OTP',
            },
          },
          HttpStatus.BAD_REQUEST,
        )
      }
      await this.validateOtp(phoneNumber, otp)
      const onboardingToken = await this.generateOnboardingToken(phoneNumber)

      // add logic for other user types here
      switch (type) {
        case 'MECHANIC':
          await this.createMechSignupStore(phoneNumber).then((a) =>
            console.log(a),
          )
          break
        default:
          break
      }
      return onboardingToken
    } catch (error) {
      throw error
    }
  }

  async refreshSession(
    refreshToken: string,
    xsrfToken: string,
  ): Promise<{
    accessToken: string
    refreshToken: string
    xsrfToken: string
  }> {
    try {
      const payload = await this.verifyRefreshToken(refreshToken, xsrfToken)
      const user = await this.userService.getUserById(payload.userId)
      if (!user) {
        throw new UnauthorizedException('User not found')
      }
      await this.revokeRefreshToken(refreshToken)
      return this.login(user.phoneNumber)
    } catch (error) {
      throw error
    }
  }

  async logout(refreshToken: string): Promise<void> {
    await this.revokeRefreshToken(refreshToken)
  }

  // redis store for storing mechanic's details before persisting to the database.

  private async createMechSignupStore(phoneNumber: string) {
    const encryptedPhone = this.encryptPhone(phoneNumber)
    const key = `user:${encryptedPhone}`
    console.log(encryptedPhone, key)
    const userStore: Partial<Prisma.MechanicCreateInput> = {}
    try {
      await this.redisService.set(
        key,
        JSON.stringify(userStore),
        'EX',
        60 * 60 * 24,
      )
    } catch (error) {
      throw error
    }
  }

  async updateMechSignupStore(
    phoneNumber: string,
    user: Partial<Prisma.MechanicCreateInput>,
  ): Promise<Partial<Prisma.MechanicCreateInput>> {
    const encryptedPhone = this.encryptPhone(phoneNumber)
    const key = `user:${encryptedPhone}`
    const userStore = await this.redisService.get(key)
    // console.log(userStore)
    // if (!userStore.length) {
    //   throw new HttpException({
    //     success: false,
    //     message: "could not find the user's details"
    //   }, HttpStatus.BAD_REQUEST)
    // }

    // update the userStore object
    const updatedUserStore = merge(JSON.parse(userStore), user)

    try {
      // update
      await this.redisService.set(
        key,
        JSON.stringify(updatedUserStore),
        'EX',
        60 * 60 * 24,
      )
      return updatedUserStore
    } catch (error) {
      throw error
    }
  }

  async persistMechanic(phoneNumber: string) {
    const encryptedPhone = this.encryptPhone(phoneNumber)
    const key = `user:${encryptedPhone}`
    const userStore = await this.redisService.get(key)
    return this.mechanicService.createMechanic(JSON.parse(userStore))
  }

  // encrypt phone number
  private encryptPhone(phoneNumber: string) {
    return encrypt(phoneNumber)
  }

  // Token methods

  // Public Token Methods

  async verifyOnboardingToken(token: string): Promise<boolean> {
    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.ONBOARDING_JWT_SECRET,
      })

      if (!payload.phone || !payload.tokenId) return false

      const verifyPhone = await this.redisService.get(
        `onboardingToken:${payload.tokenId}`,
      )
      if (!verifyPhone) return false
      return verifyPhone === payload.phone
    } catch (error) {
      throw new Error('Invalid or expired token')
    }
  }

  decryptOnboardingToken(token: string): string {
    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.ONBOARDING_JWT_SECRET,
      })
      const decryptedPhone = decrypt(payload.phone)
      return decryptedPhone
    } catch (error) {
      throw new Error('Invalid or expired token')
    }
  }

  // Private Token Methods
  private async generateOnboardingToken(phoneNumber: string): Promise<string> {
    const encryptedPhone = this.encryptPhone(phoneNumber)
    const tokenId = randToken(24)
    try {
      const token = this.jwtService.sign(
        { phone: encryptedPhone, tokenId: tokenId },
        {
          secret: process.env.ONBOARDING_JWT_SECRET,
          expiresIn: '60m',
        },
      )
      // store the phonenumber with token id to verify the onboarding token against the requests
      await this.redisService.set(
        `onboardingToken:${tokenId}`,
        encryptedPhone,
        'EX',
        60 * 60,
      )
      return token
    } catch (error) {
      throw error
    }
  }

  private async generateAndStoreAllTokens(user: User): Promise<{
    accessToken: string
    refreshToken: string
    xsrfToken: string
  }> {
    try {
      const { accessToken, xsrfToken } = this.generateAccessToken(user)
      const refreshToken = await this.generateRefreshToken(user)
      await this.storeRefreshToken(xsrfToken, user.id, 7 * 24 * 60 * 60)
      return { accessToken, refreshToken, xsrfToken }
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'An Unknown error occured, Please try again later.',
          error: {
            code: 'UNKNOWN_EXCEPTION',
            status: 500,
            message: "Couldn't store refresh token",
          },
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }

  private generateAccessToken(user: User): {
    accessToken: string
    xsrfToken: string
  } {
    const payload = {
      sub: user.id,
      phoneNumber: user.phoneNumber,
      role: user.role,
    }
    const xsrfToken = this.generateXsrfToken()
    const accessToken = this.jwtService.sign(payload, {
      secret: `${this.configService.get<string>('JWT_ACCESS_SECRET') + xsrfToken}`,
      expiresIn: this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRY'),
    })
    return { accessToken, xsrfToken }
  }

  private verifyAccessToken(
    accessToken: string,
    xsrfToken: string,
  ): Promise<any> {
    return this.jwtService.verify(accessToken, {
      secret: `${this.configService.get('JWT_ACCESS_SECRET') + xsrfToken}`,
    })
  }

  private async generateRefreshToken(user: User): Promise<string> {
    const payload = {
      userId: user.id,
    }
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRY'),
    })
    return refreshToken
  }

  private async storeRefreshToken(
    xsrfToken: string,
    userId: string,
    expiry: number,
  ): Promise<void> {
    await this.redisService.set(
      `refreshToken:${xsrfToken}`,
      userId,
      'EX',
      expiry,
    )
  }

  private async verifyRefreshToken(
    refreshToken: string,
    xsrfToken: string,
  ): Promise<{
    success: boolean
    userId?: string
    error?: any
  }> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      })
      const storedUserId = await this.redisService.get(
        `refreshToken:${xsrfToken}`,
      )
      if (!storedUserId || storedUserId !== payload.userId) {
        throw new HttpException(
          {
            success: false,
            message: 'Invalid Credentials',
            error: {
              code: 'NO_VALID_XSRF',
              reason: 'Failed to verify or find the XSRF token',
            },
          },
          HttpStatus.UNAUTHORIZED,
        )
      }
      return {
        success: true,
        userId: storedUserId,
      }
    } catch (error) {
      throw error
    }
  }

  private async revokeRefreshToken(xsrfToken: string): Promise<boolean> {
    try {
      await this.redisService.del(`refreshToken:${xsrfToken}`)
      return true
    } catch (error) {
      return false
    }
  }

  private generateXsrfToken(length?: number): string {
    return randToken(length ?? 32)
  }

  // async generateJwtToken(user: User): Promise<string> {
  //   const payload = {
  //     phoneNumber: user.phoneNumber,
  //     sub: user.id,
  //     role: user.role,
  //   }
  //   return this.jwtService.sign(payload)
  // }
}
