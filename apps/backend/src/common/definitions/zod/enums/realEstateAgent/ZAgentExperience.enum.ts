import z from 'zod'

const ZREAgentExperienceEnum = z.enum([
  'UnderOneYear',
  'UnderTwoYears',
  'UnderThreeYears',
  'UnderFiveYears',
  'MoreThanFiveYears',
])

export { ZREAgentExperienceEnum }
