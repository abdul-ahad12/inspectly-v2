import { Controller, Get, HttpStatus, Post, Req, Res } from '@nestjs/common'
import { InspectionReportService } from './inspection-report.service'
import { Request, Response } from 'express'
import {
  ICreateInspectionReportRoSchema,
  ZCreateInspectionReportRoSchema,
} from '@/common/definitions/zod/inspectionReport/create'

@Controller('inspection-report')
export class InspectionReportController {
  constructor(private readonly inspectionReport: InspectionReportService) {}

  @Post()
  async createInspectionReport(
    @Req() req: Request<unknown, any, ICreateInspectionReportRoSchema>,
    @Res() res: Response,
  ) {
    const { body } = req

    const validatedBody = ZCreateInspectionReportRoSchema.safeParse(body)

    if (validatedBody.success) {
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
    } else {
      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: validatedBody.error.message,
        error: {
          name: validatedBody.error.name,
          messge: validatedBody.error.message,
          error: validatedBody.error,
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
        await this.inspectionReport.getAllInspectionReportsByMech(mechId)

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
