import { z } from 'zod'

const ZNeighborhoodVibeEnum = z.enum([
  'FAMILY_FRIENDLY',
  'QUIET',
  'BUSTLING',
  'TRENDY',
  'OTHER',
])

export { ZNeighborhoodVibeEnum }
