import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { RedisService } from '@/redis/redis.service'
import { Twilio } from 'twilio'
import { OTP } from '@utils/functions'
import { UserService } from '@/user/user.service'
import { JwtService } from '@nestjs/jwt'
import { User } from '@prisma/client'
import { decrypt, encrypt } from './crypto.util'

@Injectable()
export class AuthService {
  private twilioClient: Twilio

  constructor(
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
    private readonly userService: UserService,
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

  generateOnboardingToken(phoneNumber: string): string {
    const encryptedPhone = encrypt(phoneNumber)
    return this.jwtService.sign(
      { phone: encryptedPhone },
      {
        secret: process.env.ONBOARDING_JWT_SECRET,
        expiresIn: '15m',
      },
    )
  }

  verifyOnboardingToken(token: string, phoneNumber: string): boolean {
    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.ONBOARDING_JWT_SECRET,
      })
      const decryptedPhone = decrypt(payload.phone)
      return phoneNumber === decryptedPhone
    } catch (error) {
      throw new Error('Invalid or expired token')
    }
  }

  async generateJwtToken(user: User): Promise<string> {
    const payload = {
      phoneNumber: user.phoneNumber,
      sub: user.id,
      role: user.role,
    }
    return this.jwtService.sign(payload)
  }

  async sendOtp(phoneNumber: string): Promise<void> {
    const isBanned = await this.redisService.get(`ban:${phoneNumber}`)

    if (!isBanned) {
      // await this.userService.setUserBanStatus(phoneNumber, false)
      const otp = OTP.generateOTP()
      const secret = OTP.generateSecret(otp)
      const otpKey = `otp:${phoneNumber}`
      const otpRequestKey = `otp_request:${phoneNumber}`

      // if above is false, set the newly generated otp secret
      await this.redisService.set(otpKey, secret, 'EX', 300) // 5 minutes validity

      /**
       * Store an OTP request flag or timestamp this will help us in identifying any misuses by knowing if the user
       * did actually generate the otp that is now expired or they just hit the verification endpoint
       */
      await this.redisService.set(otpRequestKey, 'requested', 'EX', 360) // Slightly longer TTL than the OTP
      // this method manages resend numbers and ban functionality
      await this.manageOtpResends(phoneNumber)

      try {
        await this.twilioClient.messages.create({
          body: `Your OTP for NOVATECH SOL is ${otp}`,
          from:
            this.configService.get<string>('TW_PHONE_NUMBER') || '+12513090278',
          to: phoneNumber,
        })
      } catch (error) {
        console.error('Failed to send OTP via Twilio:', error)
        throw new HttpException(
          'Failed to send OTP.',
          HttpStatus.INTERNAL_SERVER_ERROR,
        )
      }
    } else {
      throw new HttpException(
        'This number is temporarily banned due to too many requests.',
        HttpStatus.FORBIDDEN,
      )
    }
  }

  async manageOtpResends(phoneNumber: string): Promise<void> {
    const resendsKey = `resends:${phoneNumber}`
    const resends = (await this.redisService.get(resendsKey)) || '0'
    const updatedResends = parseInt(resends) + 1
    console.log(updatedResends)

    if (updatedResends > 3) {
      await this.redisService.set(`ban:${phoneNumber}`, 'banned', 'EX', 86400) // 24-hour ban
      throw new HttpException(
        'Too many OTP requests. You are banned for 24 hours.',
        HttpStatus.TOO_MANY_REQUESTS,
      )
    }

    await this.redisService.set(
      resendsKey,
      updatedResends.toString(),
      'EX',
      30 * updatedResends,
    ) // Incremental delay
  }

  async verifyOtp(phoneNumber: string, inputOtp: string): Promise<boolean> {
    const otpKey = `otp:${phoneNumber}`
    const otpRequestKey = `otp_request:${phoneNumber}`
    const resendsKey = `resends:${phoneNumber}`
    const banKey = `ban:${phoneNumber}`
    const otpExists = await this.redisService.get(otpRequestKey)
    const otp = await this.redisService.get(otpKey)

    // Check if an OTP request was ever made
    if (!otpExists) {
      throw new HttpException(
        'No OTP request was made for this phone number.',
        HttpStatus.BAD_REQUEST,
      )
    }

    // here we check if the otp already exists and is not expired
    const ttl = await this.redisService.ttl(otpKey)

    // Check if the OTP has expired
    if (ttl > 0) {
      // Check if the OTP matches the input
      if (otp !== OTP.generateSecret(inputOtp)) {
        throw new HttpException('Invalid OTP.', HttpStatus.BAD_REQUEST)
      }

      // Cleanup after successful verification
      await this.redisService.del(otpKey)
      await this.redisService.del(otpRequestKey)
      await this.redisService.del(resendsKey)
      await this.redisService.del(banKey)

      return true
    } else {
      throw new HttpException('OTP has expired.', HttpStatus.BAD_REQUEST)
    }
  }
}
