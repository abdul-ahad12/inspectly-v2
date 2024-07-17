import { z } from 'zod'
import { ZCreateAddressRoSchema } from '../mech'
import { ZAreasOfSpecializationEnum } from '../enums/realEstateAgent/ZAreasOfSpecialization.enum'
import { ZREAgentExperienceEnum } from '../enums/realEstateAgent/ZAgentExperience.enum'

const ZCreateREAgentRoSchema = z.object({
  abn: z.string(),
  areaOfSpecialization: ZAreasOfSpecializationEnum,
  email: z.string().email(),
  experience: ZREAgentExperienceEnum,
  hasAgreedToPolicies: z.boolean(),
  identificationDocument: z.string().url(),
  profilePic: z.string(),
  realEstateLicenceNumber: z.string(),
  available: z.boolean().default(false),
  companyName: z.string().optional().nullable(),
  residentialAddress: ZCreateAddressRoSchema,
})

export { ZCreateREAgentRoSchema }
