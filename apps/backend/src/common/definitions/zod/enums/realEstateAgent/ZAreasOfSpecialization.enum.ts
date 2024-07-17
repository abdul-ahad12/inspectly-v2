import z from 'zod'

const ZAreasOfSpecializationEnum = z.enum([
  'RESIDENTIAL',
  'COMMERCIAL',
  'INDUSTRIAL',
  'LAND',
])

export { ZAreasOfSpecializationEnum }
