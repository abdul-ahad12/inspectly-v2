import { z } from 'zod'
import { ZUserRoleEnums } from '../enums/userRoles'

const ZCreateMechUserRoSchema = z.object({
  firstName: z.string().max(15).min(2),
  lastName: z.string().max(15).min(2),
  email: z.string().email().nullable().optional(),
  phoneNumber: z.string(),
  isPhoneVerified: z.boolean().nullable().optional(),
  verifiedOn: z.date().nullable().optional(),
  role: ZUserRoleEnums,

  // uncomment the below property when testing with australian numbers
  // phoneNumber: z.string().regex(/^(?:\+?(61))? ?(?:\((?=.*\)))?(0?[2-57-8])\)? ?(\d\d(?:[- ](?=\d{3})|(?!\d\d[- ]?\d[- ]))\d\d[- ]?\d[- ]?\d{3})$/, {
  //   message: 'Invalid Australian mobile phone number',
  // }),
})

export { ZCreateMechUserRoSchema }
