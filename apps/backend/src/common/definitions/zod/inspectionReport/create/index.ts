import { z } from 'zod'
// import { isColorName } from "../../zodUtils";
import { ZTransmissionEnum } from '../../enums/inspectionReports/ZTransmissionEnum'
import { ZInspectionObjectSchema } from '../helpers/zInspectionObjectSchema'
import { ZRecommendationSchema } from '../helpers/recommendationSchema'
import {
  bodyStructureKeys,
  engineKeys,
  finalCheckKeys,
  interiorKeys,
  suspensionKeys,
  transmissionKeys,
  wheelsTiresKeys,
} from '../constants'
import { mapUtility } from '../../zodUtils'

const ZCreateInspectionReportRoSchema = z.object({
  odometer: z.number().int().positive(),
  bookingId: z.string().uuid(),
  mechanicId: z.string().uuid(),
  // vehicleColor: z.string().refine(isColorName, {
  //     message: "Invalid color name",
  // }),
  vehicleColor: z.string(),
  transmission: ZTransmissionEnum,
  engineAndPeripherals: mapUtility(engineKeys, ZInspectionObjectSchema),
  transmissionDrivetrain: mapUtility(transmissionKeys, ZInspectionObjectSchema),
  bodyStructure: mapUtility(bodyStructureKeys, ZInspectionObjectSchema),
  interior: mapUtility(interiorKeys, ZInspectionObjectSchema),
  suspensionAndBrakes: mapUtility(suspensionKeys, ZInspectionObjectSchema),
  wheelIsAndTires: mapUtility(wheelsTiresKeys, ZInspectionObjectSchema),
  finalChecks: mapUtility(finalCheckKeys, ZInspectionObjectSchema),
  additionalComments: z.string(),
  recommendation: ZRecommendationSchema,
  url: z.string().url(),
})

export type ICreateInspectionReportRoSchema = z.infer<
  typeof ZCreateInspectionReportRoSchema
>

export { ZCreateInspectionReportRoSchema }
