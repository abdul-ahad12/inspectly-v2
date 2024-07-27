import { Module } from '@nestjs/common'
import { UserController } from './user.controller'
import { UserService } from './user.service'
import { CustomerService } from './customer/customer.service'
import { PrismaService } from 'src/prisma/prisma.service'
import { MechanicService } from './mechanic/mechanic.service'
import { SocketGateway } from '@/gateways/socket.gateway'
import { BookingService } from '@/booking/booking.service'
import { JwtStrategy } from '@/auth/jwt.strategy'
import { PaymentModule } from '@/payment/payment.module'
import { REAgentService } from './real-estate-agent/agent.service'
import { ReBookingService } from '@/re-booking/re-booking.service'

@Module({
  controllers: [UserController],
  providers: [
    UserService,
    CustomerService,
    MechanicService,
    REAgentService,
    PrismaService,
    SocketGateway,
    BookingService,
    ReBookingService,
    JwtStrategy,
    PaymentModule,
  ],
  exports: [UserService],
})
export class UserModule {}
