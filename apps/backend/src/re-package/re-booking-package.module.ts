import { Module } from '@nestjs/common'
import { ReBookingPackageService } from './re-booking-package.service'
import { ReBookingPackageController } from './re-booking-package.controller'
import { PrismaService } from '@/prisma/prisma.service'

@Module({
  providers: [ReBookingPackageService, PrismaService],
  controllers: [ReBookingPackageController],
})
export class ReBookingPackageModule {}
