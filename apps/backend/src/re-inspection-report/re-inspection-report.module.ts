import { Module } from '@nestjs/common'
import { ReInspectionReportController } from './re-inspection-report.controller'
import { ReInspectionReportService } from './re-inspection-report.service'
import { PrismaService } from '@/prisma/prisma.service'

@Module({
  controllers: [ReInspectionReportController],
  providers: [ReInspectionReportService, PrismaService],
})
export class ReInspectionReportModule {}
