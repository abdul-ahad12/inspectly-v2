import { IRealEstateInspectionReportSchema } from '@/common/definitions/zod/realEstateInspectionReport/create'
import { PrismaService } from '@/prisma/prisma.service'
import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { formatISO } from 'date-fns'

@Injectable()
export class ReInspectionReportService {
  constructor(private readonly prismaService: PrismaService) {}

  async createInspectionReport(body: IRealEstateInspectionReportSchema) {
    const {
      additionalComments,
      additionalInfo,
      crimeRate,
      nearbyFacilities,
      neighborhoodVibe,
      overallCondition,
      propertyAddress,
      propertyInfo,
      reportUrl,
      isAskingPriceCompetitive,
      isFutureDevelopmentPlans,
      isImmediateReparisNeeded,
      isLegalOrZoningIssues,
      isParkingAvailable,
      proximityToMajorRoads,
      inspectorId,
      bookingId,
    } = body
    const createObj: Prisma.RealEstateInspectionReportCreateInput = {
      inspector: {
        connect: {
          id: inspectorId,
        },
      },
      RE_Booking: {
        connect: {
          id: bookingId,
        },
      },
      propertyAddress: propertyAddress,
      inspectionDate: formatISO(Date.now()),
      isAskingPriceCompetitive: isAskingPriceCompetitive ?? true,
      isFutureDevelopmentPlans: isFutureDevelopmentPlans ?? true,
      isImmediateRepairsNeeded: isImmediateReparisNeeded ?? false,
      isLegalOrZoningIssues: isLegalOrZoningIssues ?? false,
      isParkingAvailable: isParkingAvailable ?? true,
      proximityToMajorRoads: proximityToMajorRoads,
      propertyInfo: propertyInfo,
      nearbyFacilities: nearbyFacilities,
      additionalInfo: additionalInfo,
      overallCondition: overallCondition,
      crimeRate: crimeRate,
      neighborhoodVibe: neighborhoodVibe,
      additionalComments: additionalComments,
      reportUrl: reportUrl,
    }

    const inspectionReport =
      await this.prismaService.realEstateInspectionReport.create({
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
