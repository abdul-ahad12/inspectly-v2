import z from 'zod'
import { ZCreateREAgentUserRoSchema } from './ZCreateREAgentUserRo.schema'
import { ZCreateREAgentRoSchema } from './ZcreateREAgent.schema'
// import { ZCreateAddressRoSchema } from '../mech'

const ZCreateREAgentRoMainSchema = z.object({
  user: ZCreateREAgentUserRoSchema,
  REAgent: ZCreateREAgentRoSchema,
  verifiedOn: z.string().datetime(),
  //   approvalRequest: ZCreateMechApprovalReqRoSchema,
  // address: ZCreateAddressRoSchema,
})

export { ZCreateREAgentRoMainSchema }
