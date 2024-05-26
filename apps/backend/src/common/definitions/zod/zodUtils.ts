// import colors from 'color-name'

import { z } from 'zod'

// const isColorName = (color: string) => {
//     return colors[color.toLowerCase()] !== undefined;
// };

// export { isColorName }

const mapUtility = (mapNames: string[], schema: z.ZodTypeAny) =>
  z.object(Object.fromEntries(mapNames.map((key) => [key, schema])))

export { mapUtility }
