import { zodSignupRequestSchema } from '@/common/definitions/zod/signupRequestSchema'
import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import {
  Address,
  Booking,
  Customer,
  Order,
  Prisma,
  Review,
  StripeCustomerAccount,
  User,
  Vehicle,
} from '@prisma/client'
import { PrismaService } from 'src/prisma/prisma.service'
import { z } from 'zod'

@Injectable()
export class CustomerService {
  constructor(private readonly prisma: PrismaService) {}

  async createCustomer(
    reqBody: z.infer<typeof zodSignupRequestSchema>,
  ): Promise<User> {
    const prismaData: Prisma.UserCreateInput = {
      firstName: reqBody.firstName,
      lastName: reqBody.lastName,
      email: reqBody.email,
      savedAddresses: {
        create: {
          zipcode: reqBody.address.zipcode,
          lat: reqBody.address.lat,
          long: reqBody.address.long,
          street: reqBody.address.street,
          suburb: reqBody.address.suburb,
          city: reqBody.address.city,
        },
      },
      phoneNumber: reqBody.phoneNumber,
      isPhoneVerified: reqBody.isPhoneVerified,
      verifiedOn: reqBody.verifiedOn,
      role: reqBody.role,
      customer: {
        create: {
          // email: reqBody.email,
        },
      },
    }

    const user = await this.prisma.user.create({
      data: prismaData,
      include: {
        customer: true,
        savedAddresses: true,
      },
    })
    if (!user) {
      // throw new Error("The user could not be created,\nplease check your details")
      console.error('The Customer could not be created')
    }
    return user
  }

  // Get functions

  async getAllCustomers(): Promise<Customer[]> {
    const customers = await this.prisma.customer.findMany()
    if (!customers) {
      return []
    }
    return customers
  }

  async getCustomerById(id: string): Promise<
    Customer & {
      user: User & {
        savedAddresses: Address[]
      }
      bookings: Booking[]
      cars: Vehicle[]
      Order: Order[]
      Review: Review[]
    }
  > {
    const customer = await this.prisma.customer.findUnique({
      where: {
        id: id,
      },
      include: {
        bookings: true,
        cars: true,
        Order: true,
        user: {
          include: {
            savedAddresses: true,
          },
        },
        Review: true,
      },
    })
    if (!customer) {
      throw new Error(
        `Could not find a customer with customerId:${id}\nPlease check your params`,
      )
    }
    return customer
  }

  async getCustomerByUserId(id: string): Promise<Customer> {
    const customer = await this.prisma.customer.findUnique({
      where: {
        userId: id,
      },
      include: {
        bookings: true,
        cars: true,
        Order: true,
        user: true,
      },
    })
    if (!customer) {
      throw new Error(
        `Could not find a customer with customerId:${id}\nPlease check your params`,
      )
    }
    return customer
  }

  // update functions
  async updateCustomerById(
    id: string,
    customer: Prisma.CustomerUncheckedUpdateInput,
  ): Promise<
    Customer & {
      user: User
      bookings: Booking[]
      cars: Vehicle[]
      Order: Order[]
      Review: Review[]
      stripeCustomerAccount?: StripeCustomerAccount
    }
  > {
    try {
      const newCustomer = await this.prisma.customer.update({
        where: {
          id: id,
        },
        data: { ...customer },
        include: {
          user: true,
          bookings: true,
          cars: true,
          Order: true,
          Review: true,
          StripeCustomerAccount: true,
        },
      })
      if (!newCustomer) {
        throw new HttpException(
          `Could not update a customer with customerId:${id}\nPlease check your params`,
          HttpStatus.BAD_REQUEST,
        )
      }
      return newCustomer
    } catch (error) {
      switch (true) {
        case error instanceof Prisma.PrismaClientValidationError:
          throw new HttpException(
            {
              message: error.message,
              name: error.name,
              stack: error.stack,
            },
            HttpStatus.BAD_REQUEST,
          )
        case error instanceof Prisma.PrismaClientKnownRequestError:
          throw new HttpException(
            {
              message: error.message,
              name: error.name,
              stack: error.stack,
              description: error.meta,
              code: error.code,
            },
            HttpStatus.BAD_REQUEST,
          )
        case error instanceof Prisma.PrismaClientUnknownRequestError:
          throw new HttpException(
            {
              message: error.message,
              name: 'Prisma Unknown Req Error',
            },
            HttpStatus.BAD_REQUEST,
          )
        default:
          throw new HttpException(
            'An unexpected error occurred.',
            HttpStatus.INTERNAL_SERVER_ERROR,
          )
      }
    }
  }

  async updateMultipleCustomersByfilters(
    filter: Record<string, any>,
    update: Partial<Customer>,
  ): Promise<Customer[]> {
    console.log(filter, update, 'filters')
    const batchPayload = await this.prisma.customer.updateMany({
      where: filter,
      data: { ...update },
    })

    // Query the updated customers based on the provided filter
    const updatedCustomers = await this.prisma.customer.findMany({
      where: filter,
    })

    // Throw an error if no customers were updated
    if (!batchPayload.count || updatedCustomers.length === 0) {
      throw new Error(`No customers found matching the provided criteria`)
    }

    return updatedCustomers
  }

  // delete functions
  async deleteCustomerById(id: string): Promise<any> {
    const deletedUser = await this.prisma.user.deleteMany({
      where: {
        customer: {
          id: id,
        },
      },
    })

    if (!deletedUser) {
      throw new Error(
        `Could not delete a customer with customerId:${id}\nPlease check your params`,
      )
    }
    return deletedUser
  }
}
