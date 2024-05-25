import { z } from 'zod'

const ZRecommendationSchema = z.object({
  purchase: z.boolean(),
  repairsNeeded: z.string().array(),
  estimatedRepairCosts: z.number().positive(),
})

export { ZRecommendationSchema }
