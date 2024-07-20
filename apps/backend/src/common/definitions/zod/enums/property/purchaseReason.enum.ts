import z from 'zod'

const ZPurchaseReasonEnum = z.enum(['INVESTMENT', 'RESIDENCE', 'OTHER'])

export { ZPurchaseReasonEnum }
