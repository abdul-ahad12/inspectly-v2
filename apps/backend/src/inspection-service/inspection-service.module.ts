import { Module } from '@nestjs/common'
import { InspectionServiceService } from './inspection-service.service'
import { InspectionServiceController } from './inspection-service.controller'
import { PrismaService } from '@/prisma/prisma.service'

@Module({
  providers: [InspectionServiceService, PrismaService],
  controllers: [InspectionServiceController],
})
export class InspectionServiceModule {}
