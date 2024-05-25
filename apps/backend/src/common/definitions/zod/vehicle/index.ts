import { z } from 'zod'
import {
  ZVehicleFuelTypeEnum,
  ZVehicleTypeEnum,
  ZVehicleUseTypeEnum,
  ZVehicleWheelsEnum,
} from '../enums/vehicle'
import { ZCreateAddressRoSchema } from '../mech'

const ZCreateVehicleRoSchema = z.object({
  carType: ZVehicleTypeEnum,
  fuelType: ZVehicleFuelTypeEnum,
  useType: ZVehicleUseTypeEnum,
  noOfWheels: ZVehicleWheelsEnum,
  make: z.string(),
  model: z.string(),
  year: z.string(),
  regNumber: z.string(),
  vehicleAddress: ZCreateAddressRoSchema.merge(
    z.object({
      name: z.string(),
      landmark: z.string(),
    }),
  ),
})

export { ZCreateVehicleRoSchema }
