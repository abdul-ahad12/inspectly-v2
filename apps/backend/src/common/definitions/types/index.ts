type Address = {
  lat: number
  long: number
  zipcode: string
  street: string
  suburb: string
  city: string
}

enum UserRoles {
  ADMIN = 'ADMIN',
  CUSTOMER = 'CUSTOMER',
  MODERATOR = 'MODERATOR',
  MECHANIC = 'MECHANIC',
}

interface User {
  id: string
  firstName: string
  lastName: string
  password: string
  phoneNumber: string
  email: string
  address: Address
  isPhoneVerified: boolean
  verifiedOn: string
  role: UserRoles
  Mechanic: any[]
  Customer: any[]
}

type ResponseData<T> = Response & {
  success: boolean
  message: string
  error?: Error
  data?: T
}

export { ResponseData, User, UserRoles, Address }
