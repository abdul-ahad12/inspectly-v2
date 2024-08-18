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
import { MechanicService } from '@/user/mechanic/mechanic.service'
import { SocketGateway } from '@/gateways/socket.gateway'
import { BookingService } from '@/booking/booking.service'
import { REAgentService } from '@/user/real-estate-agent/agent.service'
import { ReBookingService } from '@/re-booking/re-booking.service'

@Module({
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
    MechanicService,
    REAgentService,
    PrismaService,
    SocketGateway,
    BookingService,
    ReBookingService,
  ],
  exports: [AuthService, CustomerService, JwtModule],
})
export class AuthModule {}
