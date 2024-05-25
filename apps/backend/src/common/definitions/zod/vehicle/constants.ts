import {
  ZVehicleFuelTypeEnum,
  ZVehicleTypeEnum,
  ZVehicleUseTypeEnum,
  ZVehicleWheelsEnum,
} from '../enums/vehicle'

export const createVehicleRoDefaults = {
  WHEELS: ZVehicleWheelsEnum.Values.FOUR,
  USE_TYPE: ZVehicleUseTypeEnum.Values.NONCOMMERCIAL,
  FUEL_TYPE: ZVehicleFuelTypeEnum.Values.PETROL,
  TYPE: ZVehicleTypeEnum.Values.SEDAN,
} as const
