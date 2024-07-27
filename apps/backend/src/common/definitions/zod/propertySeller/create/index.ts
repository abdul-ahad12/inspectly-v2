import z from 'zod'

const ZCreatePropSellerRoSchema = z.object({
  name: z.string(),
  lastname: z.string(),
  email: z.string().email(),
  phoneNumber: z.string(),
})

export { ZCreatePropSellerRoSchema }
