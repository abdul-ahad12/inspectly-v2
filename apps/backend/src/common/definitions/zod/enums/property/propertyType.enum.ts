import z from 'zod'

const ZPropertyTypeEnum = z.enum([
  'APARTMENT',
  'CONDO',
  'LAND',
  'OFFICE_SPACE',
  'STANDALONE',
  'FARM_HOUSE',
  'PENT_HOUSE',
  'OTHER',
])

export { ZPropertyTypeEnum }
