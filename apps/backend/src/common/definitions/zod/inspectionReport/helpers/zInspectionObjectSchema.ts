import { z } from 'zod'

const ZInspectionObjectSchema = z.object({
  rating: z.number().min(0).max(5),
  comments: z.string(),
  images: z.string().url().array(),
})

export { ZInspectionObjectSchema }
