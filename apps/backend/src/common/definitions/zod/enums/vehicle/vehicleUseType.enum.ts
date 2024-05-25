import z from 'zod'

const ZVehicleUseTypeEnum = z.enum([
  'SPORT',
  'SEMISPORT',
  'COMMERCIAL',
  'NONCOMMERCIAL',
])

export { ZVehicleUseTypeEnum }
