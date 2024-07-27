import { Module } from '@nestjs/common'
import { ReBookingController } from './re-booking.controller'
import { ReBookingService } from './re-booking.service'
import { SocketGateway } from '@/gateways/socket.gateway'
import { PrismaService } from '@/prisma/prisma.service'
import { REAgentService } from '@/user/real-estate-agent/agent.service'
import { JwtStrategy } from '@/auth/jwt.strategy'
@Module({
  controllers: [ReBookingController],
  providers: [
    ReBookingService,
    SocketGateway,
    PrismaService,
    REAgentService,
    JwtStrategy,
  ],
})
export class ReBookingModule {}
