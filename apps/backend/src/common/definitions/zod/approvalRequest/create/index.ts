import { z } from 'zod'
import { MechEnums } from '../../enums'
import { validateABN } from '@/common/utils/functions/validators'
import { ZCreateAddressRoSchema } from '../../mech/createAddressRo.schema'

const ZCreateMechApprovalReqRoSchema = z.object({
  status: MechEnums.ZMechApprovalStatusEnums,
  certificate_3: z.string().url(),
  certificate_4: z.string().url().nullable().optional(),
  publicLiabilityInsurance: z.string().url(),
  ausIdentificationDoc: z.string().url(),
  abn: z.string().refine((value: string) => validateABN(value)),
  workshopAddress: ZCreateAddressRoSchema,
  experienceYears: MechEnums.ZMechExperienceEnums,
})

export { ZCreateMechApprovalReqRoSchema }
