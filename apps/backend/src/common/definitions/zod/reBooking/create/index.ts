import z from 'zod'
import { ZServiceEnum } from '../../enums/service/reService.enum'
import { ZCreatePropertyRoSchema } from '../../property/create'

const ZCreateREBookingRoSchema = z.object({
  customerId: z.string().uuid(),
  packageName: z.string(),
  amount: z.number().refine(
    (value) => {
      // Check if the number has no more than two decimal places
      return Math.floor(value * 100) / 100 === value
    },
    {
      message:
        'The price must be a numeric value with up to two decimal places.',
    },
  ),
  service: ZServiceEnum,
  property: ZCreatePropertyRoSchema,
  // propSeller: ZCreateSellerRoSchema,
})

export { ZCreateREBookingRoSchema }
