import { Module } from '@nestjs/common'
import { BookingPackageService } from './booking-package.service'
import { BookingPackageController } from './booking-package.controller'
import { PrismaService } from '@/prisma/prisma.service'

@Module({
  providers: [BookingPackageService, PrismaService],
  controllers: [BookingPackageController],
})
export class BookingPackageModule {}
