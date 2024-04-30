import { Module } from '@nestjs/common'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { RedisService } from '@/redis/redis.service'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { PassportModule } from '@nestjs/passport'
import { JwtModule } from '@nestjs/jwt'
import { JwtStrategy } from './jwt.strategy'
import { UserModule } from '@/user/user.module'
import { PrismaService } from '@/prisma/prisma.service'
import { RedisModule } from '@/redis/redis.module'
import { CustomerService } from '@/user/customer/customer.service'

@Module({
  // imports: [
  //   UserModule,
  //   PassportModule,
  //   JwtModule.registerAsync({
  //     imports: [ConfigModule],
  //     useFactory: async (configService: ConfigService) => ({
  //       secret: configService.get('JWT_SECRET'),
  //       signOptions: { expiresIn: '60d' },
  //     }),
  //     inject: [ConfigService],
  //   }),
  // ],
  // controllers: [AuthController], // Register AuthController
  // providers: [AuthService, JwtStrategy, OnboardingAuthGuard, RedisService], // Register AuthService and RedisService
  imports: [
    UserModule,
    RedisModule, // Make sure RedisService is available
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '60d' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    RedisService,
    CustomerService,
    PrismaService,
  ], // RedisService might not need to be provided here if it's exported from RedisModule
})
export class AuthModule {}
