import { z } from 'zod'

const ZcreateConnectAccountRoSchema = z.object({
  individual: z.object({
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
  }),
  documents: z.object({
    bank_account_ownership_verification: z.string().array(),
    licence: z.string().array(),
    registration: z.string().array(),
  }),
  address: z.object({
    city: z.string(),
    line1: z.string(),
    line2: z.string().optional().nullable(),
    postal_code: z.string().max(4),
    state: z.string(),
  }),
  company_name: z.string(),
  abn: z.string(),
  phone: z.string(),
  tax_id: z.string(),
  tos_acceptance: z
    .object({
      date: z.string().datetime(),
      ip: z.string().ip({
        version: 'v4',
      }),
    })
    .optional()
    .nullable(),
  business_profile: z.object({
    mcc: z.string().max(4),
    url: z.string().url(),
  }),
})

export { ZcreateConnectAccountRoSchema }
