import { z } from 'zod'

function buildDefaultsMap<T extends z.AnyZodObject>(
  schema: T,
  defaults: Partial<z.infer<T>>,
): Map<keyof z.infer<T>, z.infer<T>[keyof z.infer<T>]> {
  const defaultsMap = new Map<keyof z.infer<T>, z.infer<T>[keyof z.infer<T>]>()

  // Extract the shape from the schema for validation purposes
  const shape = schema.shape

  // Validate that the keys in defaults are present in the schema
  for (const key in defaults) {
    if (!(key in shape)) {
      console.error('Invalid key in defaults:', key)
      throw new Error(`Defaults contain a key not in the schema: ${key}`)
    }
  }

  Object.entries(defaults).forEach(([key, value]) => {
    if (value !== undefined) {
      // Ensure only defined values are set
      defaultsMap.set(key as keyof z.infer<T>, value)
    }
  })

  return defaultsMap
}

export { buildDefaultsMap }
