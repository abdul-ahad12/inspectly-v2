import z from 'zod'
import { ZUserRoleEnums } from './enums/userRoles'

const zodAddressSchema = z.object({
  lat: z.number(),
  long: z.number(),
  zipcode: z
    .string()
    .regex(/^(?:(?:[2-8]\d|9[0-7]|0?[28]|0?9(?=09))(?:\d{2}))$/, {
      message: 'Invalid Australian postal code',
    }),
  street: z.string(),
  suburb: z.string(),
  city: z.string(),
  state: z.string(),
})

const zodSignupRequestSchema = z.object({
  firstName: z.string().max(15).min(2),
  lastName: z.string().max(15).min(2),
  email: z.string().email().nullable(),
  // uncomment the below property when testing with australian numbers
  // phoneNumber: z.string().regex(/^(?:\+?(61))? ?(?:\((?=.*\)))?(0?[2-57-8])\)? ?(\d\d(?:[- ](?=\d{3})|(?!\d\d[- ]?\d[- ]))\d\d[- ]?\d[- ]?\d{3})$/, {
  //   message: 'Invalid Australian mobile phone number',
  // }),
  phoneNumber: z.string(),
  address: zodAddressSchema,
  isPhoneVerified: z.boolean().nullable().optional(),
  verifiedOn: z.date().nullable().optional(),
  role: ZUserRoleEnums,
})

export { zodSignupRequestSchema }
