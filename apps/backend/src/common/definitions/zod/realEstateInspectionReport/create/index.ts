import z from 'zod'
import { ZInspectionObjectSchema } from '../../inspectionReport/helpers/zInspectionObjectSchema'
import { ZPropertyConditionEnum } from '../../enums/realEstateInspectionReports/ZPropertyCondition.enum'
import { ZCrimeRateEnum } from '../../enums/realEstateInspectionReports/ZCrimeRate.enum'
import { ZNeighborhoodVibeEnum } from '../../enums/realEstateInspectionReports/ZNeighborhoodVibe.enum'
import {
  additionalInfoKeys,
  nearbyFacilitiesKeys,
  propertyInfoKeys,
} from '../constants'
import { mapUtility } from '../../zodUtils'

// Zod schema for the real estate inspection report
const ZRealEstateInspectionReportSchema = z.object({
  id: z.string().uuid(),
  propertyAddress: z.string(),
  inspectorId: z.string().uuid(),
  bookingId: z.string().uuid(),
  inspectionDate: z.date(),
  isAskingPriceCompetitive: z.boolean(),
  isLegalOrZoningIssues: z.boolean(),
  isImmediateReparisNeeded: z.boolean(),
  isFutureDevelopmentPlans: z.boolean(),
  isParkingAvailable: z.boolean(),
  proximityToMajorRoads: z.string(),
  propertyInfo: mapUtility(propertyInfoKeys, ZInspectionObjectSchema),
  nearbyFacilities: mapUtility(
    nearbyFacilitiesKeys,
    z.object({
      available: z.boolean(),
      details: z.string(),
    }),
  ),
  additionalInfo: mapUtility(additionalInfoKeys, ZInspectionObjectSchema),
  overallCondition: ZPropertyConditionEnum,
  crimeRate: ZCrimeRateEnum,
  neighborhoodVibe: ZNeighborhoodVibeEnum,
  additionalComments: z.string(),
  reportUrl: z.string().url().optional(),
})

export type IRealEstateInspectionReportSchema = z.infer<
  typeof ZRealEstateInspectionReportSchema
>

export { ZRealEstateInspectionReportSchema }
