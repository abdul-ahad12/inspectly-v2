import { z } from 'zod'
import { VehicleEnums } from '../enums'

const ZCreateMechRoSchema = z.object({
  avv: z.string().nullable().optional(),
  certifications: z.string().array().optional(),
  licences: z.string().array().optional(),
  available: z.boolean().optional(),
  deviceIds: z.string().array().nullable().optional(),

  profilePic: z.string().url(),
  hasAgreedToPolicies: z.boolean(),
  vehicleTypes: VehicleEnums.ZVehicleTypeEnum.optional(),
  vehicleFuelType: VehicleEnums.ZVehicleFuelTypeEnum.optional(),
  vehicleUseType: VehicleEnums.ZVehicleUseTypeEnum,
  vehicleWheels: VehicleEnums.ZVehicleWheelsEnum.optional(),
})

export { ZCreateMechRoSchema }
