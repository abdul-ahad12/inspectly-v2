import z from 'zod'

const parseReqBodyAndValidate = (schema: z.ZodSchema, data: any): boolean => {
  console.log(schema.safeParse(data))
  return schema.safeParse(data).success
}

export { parseReqBodyAndValidate }
