import { z } from 'zod'

const ZCrimeRateEnum = z.enum(['HIGH', 'MEDIUM', 'LOW'])

export { ZCrimeRateEnum }
