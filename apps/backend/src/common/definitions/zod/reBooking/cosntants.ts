import { buildRequestObjWithDefaults } from '@/common/utils/functions/typeUtils/requestObjectUtils'
import { ZCreateREBookingRoSchema } from './create'
import {} from '../vehicle/constants'
import { createPropertyRoDefaults } from '../property/defaults'

enum DefaultPackageName {
  name = 'BASIC',
}

enum DefaultServiceName {
  name = 'PRE_PURCHASE_INSPECTION',
}

const createREBookingRoDefaults = buildRequestObjWithDefaults(
  ZCreateREBookingRoSchema,
  {
    packageName: DefaultPackageName.name,
    service: DefaultServiceName.name,
    property: {
      dealType: createPropertyRoDefaults.DEAL_TYPE,
      occupierType: createPropertyRoDefaults.OCCUPIER_TYPE,
      propetyType: createPropertyRoDefaults.PROPERTY_TYPE,
      purchaseReason: createPropertyRoDefaults.PURCHASE_REASON,
    },
  },
)

export { createREBookingRoDefaults }
