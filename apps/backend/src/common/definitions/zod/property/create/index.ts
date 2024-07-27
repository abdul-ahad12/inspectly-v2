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
  isNew: z.boolean().optional().nullable(),
  totalArea: z.string().optional().nullable(),
  numberOfRooms: z.number().int().positive().optional().nullable(),
  dealType: ZDealTypeEnum,
  propetyType: ZPropertyTypeEnum,
  purchaseReason: ZPurchaseReasonEnum,
  occupierType: ZOccupierTypeEnum,
  propertyAddress: ZCreateAddressRoSchema,
})

export { ZCreatePropertyRoSchema }
