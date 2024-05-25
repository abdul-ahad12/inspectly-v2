function validateABN(abn: string): boolean {
  const abnDigits = abn.replace(/\s/g, '')
  if (!/^\d{11}$/.test(abnDigits)) {
    throw new Error(
      'Invalid ABN format. ABN should contain 11 digits without spaces.',
    )
  }

  const abnArray = abnDigits.split('').map(Number)

  abnArray[0] -= 1

  const weights = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19]

  let sum = 0
  for (let i = 0; i < abnArray.length; i++) {
    sum += abnArray[i] * weights[i]
  }

  return sum % 89 === 0
}

export { validateABN }
