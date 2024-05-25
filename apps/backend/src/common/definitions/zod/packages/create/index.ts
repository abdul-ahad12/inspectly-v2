import { z } from 'zod'

const ZCreateInspectionPackageRoSchema = z.object({
  price: z.number(),
  strikePrice: z.number().nullable().optional(),
  name: z.string(),
  description: z.string().max(100),
  items: z.string().array(),
  perks: z.string().array(),
})

export { ZCreateInspectionPackageRoSchema }
