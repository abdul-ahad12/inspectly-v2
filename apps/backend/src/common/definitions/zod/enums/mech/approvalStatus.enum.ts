import z from 'zod'

const ZMechApprovalStatusEnums = z.enum([
  'PENDING',
  'ACCEPTED',
  'REJECTED',
  'REUPLOAD_REQUESTED',
])

export { ZMechApprovalStatusEnums }
