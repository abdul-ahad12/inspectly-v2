import { Module } from '@nestjs/common'
import { UserController } from './user.controller'
import { UserService } from './user.service'
import { CustomerService } from './customer/customer.service'
import { PrismaService } from 'src/prisma/prisma.service'
import { MechanicService } from './mechanic/mechanic.service'
import { SocketGateway } from '@/gateways/socket.gateway'
import { BookingService } from '@/booking/booking.service'

@Module({
  controllers: [UserController],
  providers: [
    UserService,
    CustomerService,
    MechanicService,
    PrismaService,
    SocketGateway,
    BookingService,
  ],
  exports: [UserService],
})
export class UserModule {}
