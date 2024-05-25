import { z } from 'zod'

const ZTransmissionEnum = z.enum(['AUTOMATIC', 'MANUAL', 'HYBRID'])

export { ZTransmissionEnum }
