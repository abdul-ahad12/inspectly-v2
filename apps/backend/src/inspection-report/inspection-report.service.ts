import { ICreateInspectionReportRoSchema } from '@/common/definitions/zod/inspectionReport/create'
import { PrismaService } from '@/prisma/prisma.service'
import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'

@Injectable()
export class InspectionReportService {
  constructor(private readonly prismaService: PrismaService) {}

  async createInspectionReport(body: ICreateInspectionReportRoSchema) {
    const createObj: Prisma.InspectionReportCreateInput = {
      booking: {
        connect: {
          id: body.bookingId,
        },
      },
      mechanic: {
        connect: {
          id: body.mechanicId,
        },
      },
      additionalComments: body.additionalComments,
      bodyStructure: body.bodyStructure,
      engineAndPeripherals: body.engineAndPeripherals,
      finalChecks: body.finalChecks,
      interior: body.interior,
      odometer: body.odometer,
      recommendation: body.recommendation,
      suspensionAndBrakes: body.suspensionAndBrakes,
      transmission: body.transmission,
      transmissionDrivetrain: body.transmissionDrivetrain,
      url: body.url,
      vehicleColor: body.vehicleColor,
      wheelsAndTires: body.wheelIsAndTires,
    }
    const inspectionReport = await this.prismaService.inspectionReport.create({
      data: createObj,
    })

    if (!inspectionReport) {
      throw new HttpException(
        {
          success: false,
          message: 'Could Not Create Inspection Report',
          error: {
            name: 'COULD_NOT_CREATE',
            message: 'Could Not Create Inspection Report',
            error: inspectionReport,
          },
        },
        HttpStatus.BAD_REQUEST,
      )
    }

    return inspectionReport
  }

  async getAllInspectionReports() {
    const inspectionReports =
      await this.prismaService.inspectionReport.findMany({
        include: {
          booking: true,
          mechanic: true,
        },
      })

    if (!inspectionReports) {
      throw new HttpException(
        {
          success: false,
          message: 'Could not find any inspection reports',
          error: inspectionReports,
        },
        HttpStatus.BAD_REQUEST,
      )
    }

    return inspectionReports
  }
  async getAllInspectionReportsByMech(id: string) {
    const inspectionReports =
      await this.prismaService.inspectionReport.findMany({
        where: {
          mechanicId: id,
        },
        include: {
          booking: true,
          mechanic: true,
        },
      })

    if (!inspectionReports) {
      throw new HttpException(
        {
          success: false,
          message: 'Could not find any inspection reports',
          error: inspectionReports,
        },
        HttpStatus.BAD_REQUEST,
      )
    }

    return inspectionReports
  }
  async getAllInspectionReportsByBooking(id: string) {
    const inspectionReports =
      await this.prismaService.inspectionReport.findMany({
        where: {
          bookingId: id,
        },
        include: {
          booking: true,
          mechanic: true,
        },
      })

    if (!inspectionReports) {
      throw new HttpException(
        {
          success: false,
          message: 'Could not find any inspection reports',
          error: inspectionReports,
        },
        HttpStatus.BAD_REQUEST,
      )
    }

    return inspectionReports
  }
}
