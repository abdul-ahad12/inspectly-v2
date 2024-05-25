import z from 'zod'

const ZVehicleFuelTypeEnum = z.enum(['ELECTRIC', 'GAS', 'PETROL', 'DIESEL'])

export { ZVehicleFuelTypeEnum }
