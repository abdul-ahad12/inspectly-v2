import { zodSignupRequestSchema } from '@/common/definitions/zod/signupRequestSchema'
import { Injectable } from '@nestjs/common'
import { Customer, Prisma, User } from '@prisma/client'
import { PrismaService } from 'src/prisma/prisma.service'
import { z } from 'zod'

@Injectable()
export class CustomerService {
  constructor(private readonly prisma: PrismaService) {}

  // async createCustomer(user: User): Promise<Customer> {

  //     const customer = await this.prisma.customer.create({
  //         data: {
  //             user: {
  //                 connect: {
  //                     id: user.id
  //                 }
  //             }
  //         }
  //     })
  //     if (!customer) {
  //         throw new Error("The user could not be created,\nplease check your details")
  //     }

  //     return customer;
  // }

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
      Customer: {
        create: {
          // email: reqBody.email,
        },
      },
    }

    const user = await this.prisma.user.create({ data: prismaData })
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

  async getCustomerById(id: string): Promise<Customer> {
    const customer = await this.prisma.customer.findUnique({
      where: {
        id: id,
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
    customer: Partial<Customer> | Prisma.CustomerUncheckedUpdateInput,
  ): Promise<Customer> {
    const newCustomer = await this.prisma.customer.update({
      where: {
        id: id,
      },
      data: customer,
    })
    if (!newCustomer) {
      throw new Error(
        `Could not update a customer with customerId:${id}\nPlease check your params`,
      )
    }
    return newCustomer
  }

  async updateMultipleCustomersByfilters(
    filter: Record<string, any>,
    update: Partial<Customer>,
  ): Promise<Customer[]> {
    const batchPayload = await this.prisma.customer.updateMany({
      where: filter,
      data: update,
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
  async deleteCustomerById(id: string): Promise<Customer> {
    const deletedUser = await this.prisma.customer.delete({
      where: {
        id: id,
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
