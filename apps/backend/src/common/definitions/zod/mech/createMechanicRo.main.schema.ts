import z from 'zod'
import { ZCreateAddressRoSchema } from './createAddressRo.schema'
import { ZCreateMechApprovalReqRoSchema } from '../approvalRequest/create'
import { ZCreateMechRoSchema } from './createMech.schema'
import { ZCreateMechUserRoSchema } from './createMechUserRo.schema'

const ZCreateMechanicRoMainSchema = z.object({
  user: ZCreateMechUserRoSchema,
  mechanic: ZCreateMechRoSchema,
  approvalRequest: ZCreateMechApprovalReqRoSchema,
  address: ZCreateAddressRoSchema,
})

export { ZCreateMechanicRoMainSchema }
