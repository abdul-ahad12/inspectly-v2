import { buildRequestObjWithDefaults } from '@/common/utils/functions/typeUtils/requestObjectUtils'
import { ZCreateBookingRoSchema } from './create'
import { createVehicleRoDefaults } from '../vehicle/constants'

enum DefaultPackageName {
  name = 'BASIC',
}

enum DefaultServiceName {
  name = 'PRE_PURCHASE_INSPECTION',
}

const createBookingRoDefaults = buildRequestObjWithDefaults(
  ZCreateBookingRoSchema,
  {
    packageName: DefaultPackageName.name,
    service: DefaultServiceName.name,
    vehicle: {
      carType: createVehicleRoDefaults.TYPE,
      fuelType: createVehicleRoDefaults.FUEL_TYPE,
      noOfWheels: createVehicleRoDefaults.WHEELS,
      useType: createVehicleRoDefaults.USE_TYPE,
    },
  },
)

export { createBookingRoDefaults }
