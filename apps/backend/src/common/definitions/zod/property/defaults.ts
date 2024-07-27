import {
  ZDealTypeEnum,
  ZOccupierTypeEnum,
  ZPropertyTypeEnum,
  ZPurchaseReasonEnum,
} from '../enums/property'

export const createPropertyRoDefaults = {
  DEAL_TYPE: ZDealTypeEnum.Values.RENTAL,
  OCCUPIER_TYPE: ZOccupierTypeEnum.Values.FAMILY,
  PROPERTY_TYPE: ZPropertyTypeEnum.Values.APARTMENT,
  PURCHASE_REASON: ZPurchaseReasonEnum.Values.RESIDENCE,
} as const
