import { Prisma } from '@prisma/client'
import _ from 'lodash'

interface IUpdateTransactionInJsonArrayParams<T> {
  transactionId: string
  transactionArray: T[]
  updateTransaction: Partial<T>
}

const updateTransactionInJsonArray = <T extends Prisma.JsonValue>({
  transactionId,
  transactionArray,
  updateTransaction,
}: IUpdateTransactionInJsonArrayParams<T>): T[] => {
  const clonedArray = _.cloneDeep(transactionArray)
  const transactionToUpdate = _.find(clonedArray, { id: transactionId })

  if (transactionToUpdate) {
    _.assign(transactionToUpdate, updateTransaction)
    return clonedArray
  } else {
    throw new Error('Transaction not found')
  }
}

export { updateTransactionInJsonArray }
