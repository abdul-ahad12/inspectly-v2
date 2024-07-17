import { z } from 'zod'

const ZcreatePersonsAccountRoSchema = z.object({
  accountId: z.string(),
  address: z.object({
    city: z.string(),
    line1: z.string(),
    line2: z.string().optional().nullable(),
    postal_code: z.string().max(4),
    state: z.string(),
  }),
  dob: z.object({
    day: z.number().int().positive().min(1).max(2).lte(31).gte(1),
    month: z.number().int().positive().min(1).max(2).lte(1).gte(12),
    year: z
      .number()
      .int()
      .positive()
      .min(4)
      .max(4)
      .lte(new Date().getFullYear() - 20)
      .gte(1900),
  }),
  first_name: z.string(),
  last_name: z.string(),
  id_front: z.string(),
  id_back: z.string(),
  gender: z.enum(['male', 'female']),
  id_number: z.string(),
  email: z.string().email(),
  phone: z.string(),
  relationship: z.object({
    owner: z.boolean(),
  }),
})

export { ZcreatePersonsAccountRoSchema }
