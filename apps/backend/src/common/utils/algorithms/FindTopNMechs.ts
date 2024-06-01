import { Mechanic } from '@prisma/client'
import { map, orderBy, take } from 'lodash'

export interface MechanicWithScore extends Mechanic {
  score: number
}

// interface mech extends Prisma.MechanicInclude,  Mechanic{}

const calculateMechanicScore = (mechanic: Mechanic): number => {
  const ratingWeight = 0.5 // Adjust weights as needed
  const levelWeight = 0.3
  // const reviewCountWeight = 0.2

  const ratingScore = mechanic.rating * ratingWeight
  const levelScore = mechanic.level * levelWeight
  // const reviewCountScore = mechanic.

  // return ratingScore + levelScore + reviewCountScore;
  return ratingScore + levelScore
}

const selectTopMechanics = (
  mechanics: Mechanic[],
  topN: number,
): MechanicWithScore[] | Mechanic[] => {
  // Calculate scores for each mechanic

  if (topN < mechanics.length) {
    const mechanicsWithScores = map(mechanics, (mechanic) => ({
      ...mechanic,
      score: calculateMechanicScore(mechanic),
    }))

    // Sort mechanics by score in descending order
    const sortedMechanics = orderBy(mechanicsWithScores, ['score'], ['desc'])

    // Select top N mechanics
    return take(sortedMechanics, topN)
  }
  return mechanics
}

export { selectTopMechanics }
