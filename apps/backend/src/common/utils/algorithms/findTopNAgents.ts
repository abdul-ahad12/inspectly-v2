import { RealEstateAgent } from '@prisma/client'
import { map, orderBy, take } from 'lodash'

export interface AgentWithScore extends RealEstateAgent {
  score: number
}

// interface mech extends Prisma.MechanicInclude,  Mechanic{}

const calculateAgentScore = (mechanic: RealEstateAgent): number => {
  const ratingWeight = 0.5 // Adjust weights as needed
  const levelWeight = 0.3
  // const reviewCountWeight = 0.2

  const ratingScore = mechanic.rating * ratingWeight
  const levelScore = mechanic.level * levelWeight
  // const reviewCountScore = mechanic.

  // return ratingScore + levelScore + reviewCountScore;
  return ratingScore + levelScore
}

const selectTopAgents = (
  agents: RealEstateAgent[],
  topN: number,
): AgentWithScore[] | RealEstateAgent[] => {
  // Calculate scores for each mechanic

  if (topN < agents.length) {
    const agentsWithScores = map(agents, (agents) => ({
      ...agents,
      score: calculateAgentScore(agents),
    }))

    // Sort mechanics by score in descending order
    const sortedAgents = orderBy(agentsWithScores, ['score'], ['desc'])

    // Select top N mechanics
    return take(sortedAgents, topN)
  }
  return agents
}

export { selectTopAgents }
