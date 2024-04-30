import z from 'zod'

const ZUserRoleEnums = z.enum(['ADMIN', 'CUSTOMER', 'MODERATOR', 'MECHANIC'])

type TUserRoleEnums = z.infer<typeof ZUserRoleEnums>

export { ZUserRoleEnums, TUserRoleEnums }
