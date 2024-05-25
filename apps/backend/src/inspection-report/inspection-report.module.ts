import { Module } from '@nestjs/common'
import { InspectionReportController } from './inspection-report.controller'
import { InspectionReportService } from './inspection-report.service'
import { PrismaService } from '@/prisma/prisma.service'

@Module({
  controllers: [InspectionReportController],
  providers: [InspectionReportService, PrismaService],
})
export class InspectionReportModule {}
