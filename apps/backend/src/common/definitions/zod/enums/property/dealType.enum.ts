import z from 'zod'

const ZDealTypeEnum = z.enum(['RENTAL', 'LEASE', 'PURCHASE'])

export { ZDealTypeEnum }
