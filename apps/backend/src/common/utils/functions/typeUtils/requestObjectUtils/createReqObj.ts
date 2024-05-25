import { z } from 'zod'

// Function to create an API request object with defaults
function createRequestObject<T extends z.AnyZodObject>(
  schema: T,
  defaultsMap: Map<keyof z.infer<T>, any>,
): Partial<z.infer<T>> {
  const result: any = {}
  // Ensure that the default values match the schema types
  defaultsMap.forEach((value, key) => {
    const schemaShape = schema.deepPartial().shape
    if (key in schemaShape) {
      const parsed = schemaShape[key].safeParse(value)
      if (parsed.success) {
        result[key] = value
      } else {
        throw new Error(
          `Invalid default value for key ${String(key)}: ${parsed.error.message}`,
        )
      }
    } else {
      throw new Error(`Key ${String(key)} is not in the schema`)
    }
  })
  return result
}

export { createRequestObject }
