import { z } from 'zod'
// import { isColorName } from "../../zodUtils";
import { ZTransmissionEnum } from '../../enums/inspectionReports/ZTransmissionEnum'
import { ZInspectionObjectSchema } from '../helpers/zInspectionObjectSchema'
import { ZRecommendationSchema } from '../helpers/recommendationSchema'

const ZCreateInspectionReportRoSchema = z.object({
  odometer: z.number().int().positive(),
  bookingId: z.string().uuid(),
  mechanicId: z.string().uuid(),
  // vehicleColor: z.string().refine(isColorName, {
  //     message: "Invalid color name",
  // }),
  vehicleColor: z.string(),
  transmission: ZTransmissionEnum,
  engineAndPeripherals: ZInspectionObjectSchema,
  transmissionDrivetrain: ZInspectionObjectSchema,
  bodyStructure: ZInspectionObjectSchema,
  interior: ZInspectionObjectSchema,
  suspensionAndBrakes: ZInspectionObjectSchema,
  wheelIsAndTires: ZInspectionObjectSchema,
  finalChecks: ZInspectionObjectSchema,
  additionalComments: z.string(),
  recommendation: ZRecommendationSchema,
  url: z.string().url(),
})

export type ICreateInspectionReportRoSchema = z.infer<
  typeof ZCreateInspectionReportRoSchema
>

export { ZCreateInspectionReportRoSchema }
