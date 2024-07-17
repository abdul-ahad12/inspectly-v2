import { z } from 'zod'
import { ZstripeDocUploadPurposeEnum } from '../../enums/files/stripe/purpose'

const ZUploadVerificationDocRoSchema = z.object({
  purpose: ZstripeDocUploadPurposeEnum,
  file: z.instanceof(Buffer),
  fileName: z.string(),
})

export { ZUploadVerificationDocRoSchema }
