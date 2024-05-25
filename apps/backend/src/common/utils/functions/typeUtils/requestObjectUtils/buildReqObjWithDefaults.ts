import { z } from 'zod'
import { createRequestObject } from './createReqObj'
import { buildDefaultsMap } from './buildDefaultsMap'

// Function to build and return a request object with defaults set
function buildRequestObjWithDefaults<T extends z.AnyZodObject>(
  schema: T,
  defaults: Partial<z.infer<T>>,
): z.infer<T> {
  return createRequestObject(schema, buildDefaultsMap(schema, defaults))
}

export { buildRequestObjWithDefaults }
