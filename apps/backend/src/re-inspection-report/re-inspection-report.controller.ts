import { Controller, Get, HttpStatus, Post, Req, Res } from '@nestjs/common'
import { ReInspectionReportService } from './re-inspection-report.service'
import { Request, Response } from 'express'

import { IRealEstateInspectionReportSchema } from '@/common/definitions/zod/realEstateInspectionReport/create'

@Controller('re-inspection-report')
export class ReInspectionReportController {
  constructor(private readonly inspectionReport: ReInspectionReportService) {}

  @Post()
  async createInspectionReport(
    @Req() req: Request<unknown, any, IRealEstateInspectionReportSchema>,
    @Res() res: Response,
  ) {
    const { body } = req

    try {
      const inspectionReport =
        await this.inspectionReport.createInspectionReport(body)
      res.status(HttpStatus.CREATED).json({
        success: true,
        message: 'Inspection Report Created!',
        data: inspectionReport,
      })
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message || 'An Unexpected Error Occured',
        error: {
          name: error.name,
          message: error.message,
          error: error,
        },
      })
    }
  }

  @Get()
  async getAllInspectionReports(@Req() req: Request, @Res() res: Response) {
    try {
      const inspectionReports =
        await this.inspectionReport.getAllInspectionReports()

      res.status(HttpStatus.OK).json({
        success: true,
        message: `Found ${inspectionReports.length} reports for inspection`,
        data: inspectionReports,
      })
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error,
      })
    }
  }
  @Get('/mechanic/:id')
  async getAllInspectionReportsByMech(
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const { id: mechId } = req.params
    try {
      const inspectionReports =
        await this.inspectionReport.getAllInspectionReportsByInspector(mechId)

      res.status(HttpStatus.OK).json({
        success: true,
        message: `Found ${inspectionReports.length} reports for inspection`,
        data: inspectionReports,
      })
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error,
      })
    }
  }
  @Get('/booking/:id')
  async getAllInspectionReportsByBooking(
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const { id: bookingId } = req.params
    try {
      const inspectionReports =
        await this.inspectionReport.getAllInspectionReportsByBooking(bookingId)

      res.status(HttpStatus.OK).json({
        success: true,
        message: `Found ${inspectionReports.length} reports for inspection`,
        data: inspectionReports,
      })
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error,
      })
    }
  }
}
