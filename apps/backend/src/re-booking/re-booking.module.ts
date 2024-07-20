import { Module } from '@nestjs/common'
import { ReBookingController } from './re-booking.controller'
import { ReBookingService } from './re-booking.service'
import { SocketGateway } from '@/gateways/socket.gateway'
import { PrismaService } from '@/prisma/prisma.service'

@Module({
  controllers: [ReBookingController],
  providers: [ReBookingService, SocketGateway, PrismaService],
})
export class ReBookingModule {}
