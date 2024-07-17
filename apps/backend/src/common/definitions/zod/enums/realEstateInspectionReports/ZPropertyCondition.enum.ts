import { z } from 'zod'

const ZPropertyConditionEnum = z.enum(['EXCELLENT', 'GOOD', 'FAIR', 'POOR'])

export { ZPropertyConditionEnum }
