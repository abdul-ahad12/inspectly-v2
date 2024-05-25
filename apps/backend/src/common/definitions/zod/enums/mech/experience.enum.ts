import z from 'zod'

const ZMechExperienceEnums = z.enum([
  'UnderOneYear',
  'UnderTwoYears',
  'UnderThreeYears',
  'UnderFiveYears',
  'MoreThanFiveYears',
])

export { ZMechExperienceEnums }
