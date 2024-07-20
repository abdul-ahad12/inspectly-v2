import z from 'zod'
import {
  ZDealTypeEnum,
  ZOccupierTypeEnum,
  ZPropertyTypeEnum,
  ZPurchaseReasonEnum,
} from '../../enums/property'
import { ZCreateAddressRoSchema } from '../../mech'

const ZCreatePropertyRoSchema = z.object({
  isResidential: z.boolean(),
  isFrequentTraveller: z.boolean(),
  dealType: ZDealTypeEnum,
  propetyType: ZPropertyTypeEnum,
  purchaseReason: ZPurchaseReasonEnum,
  occupierType: ZOccupierTypeEnum,
  propertyAddress: ZCreateAddressRoSchema,
})

export { ZCreatePropertyRoSchema }
