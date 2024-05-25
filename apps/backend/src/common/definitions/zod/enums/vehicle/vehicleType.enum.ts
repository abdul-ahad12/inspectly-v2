import z from 'zod'

const ZVehicleTypeEnum = z.enum([
  'SEDAN',
  'HATCHBACK',
  'SUV',
  'TRUCK',
  'TRACTOR',
])

export { ZVehicleTypeEnum }
