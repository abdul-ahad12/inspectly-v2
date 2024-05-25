import { z } from 'zod'
import { ZCreateVehicleRoSchema } from '../../vehicle'
import { ZServiceEnum } from '../enums/service.enum'
import { ZCreateSellerRoSchema } from '../../seller/create'

const ZCreateBookingRoSchema = z.object({
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
  vehicle: ZCreateVehicleRoSchema,
  seller: ZCreateSellerRoSchema,
})

type ICreateBookingRoSchema = z.infer<typeof ZCreateBookingRoSchema>

export { ZCreateBookingRoSchema, ICreateBookingRoSchema }
