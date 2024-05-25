import { z } from 'zod'

const ZCreateAddressRoSchema = z.object({
  lat: z.number(),
  long: z.number(),
  zipcode: z
    .string()
    .regex(/^(?:(?:[2-8]\d|9[0-7]|0?[28]|0?9(?=09))(?:\d{2}))$/, {
      message: 'Invalid Australian postal code',
    }),
  street: z.string(),
  suburb: z.string(),
  city: z.string(),
})

export { ZCreateAddressRoSchema }
