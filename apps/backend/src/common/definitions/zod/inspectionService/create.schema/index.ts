import { z } from 'zod'

const ZcreateInspectionServiceSchema = z.object({
  name: z.string(),
})

export { ZcreateInspectionServiceSchema }
