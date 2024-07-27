import { Module } from '@nestjs/common'
import { ReInspectionServiceService } from './re-inspection-service.service'
import { ReInspectionServiceController } from './re-inspection-service.controller'
import { PrismaService } from '@/prisma/prisma.service'

@Module({
  providers: [ReInspectionServiceService, PrismaService],
  controllers: [ReInspectionServiceController],
})
export class ReInspectionServiceModule {}
