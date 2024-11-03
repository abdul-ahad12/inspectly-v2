import { IRealEstateInspectionReportSchema } from '@/common/definitions/zod/realEstateInspectionReport/create'
import { PrismaService } from '@/prisma/prisma.service'
import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { Prisma, BookingStatus } from '@prisma/client'
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

    // Step 1: Create the inspection report
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

    // Step 2: Update the RE_Booking status to COMPLETED
    await this.prismaService.rE_Booking.update({
      where: { id: bookingId },
      data: { status: BookingStatus.COMPLETED },
    })

    return inspectionReport
  }

  async getAllInspectionReports() {
    const inspectionReports =
      await this.prismaService.realEstateInspectionReport.findMany({
        include: {
          RE_Booking: true,
          inspector: true,
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

  async getAllInspectionReportsByInspector(id: string) {
    const inspectionReports =
      await this.prismaService.realEstateInspectionReport.findMany({
        where: {
          inspectorId: id,
        },
        include: {
          RE_Booking: true,
          inspector: true,
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
