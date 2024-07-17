import { Injectable } from '@nestjs/common'
import { Prisma, User } from '@prisma/client'
import { zodSignupRequestSchema } from 'src/common/definitions/zod/signupRequestSchema'
import { PrismaService } from 'src/prisma/prisma.service'
import { z } from 'zod'

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async createUser(
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
          state: reqBody.address.state,
          suburb: reqBody.address.suburb,
          city: reqBody.address.city,
        },
      },
      phoneNumber: reqBody.phoneNumber,
      isPhoneVerified: reqBody.isPhoneVerified,
      verifiedOn: reqBody.verifiedOn,
      role: reqBody.role,
    }

    // console.log(prismaData)

    const user = await this.prisma.user.create({ data: prismaData })
    if (!user) {
      // throw new Error("The user could not be created,\nplease check your details")
      console.log('Couldnt do it man')
    }
    console.log(user)
    return user
  }

  async getUserByPhoneNumber(phoneNumber: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: {
        phoneNumber: phoneNumber,
      },
      include: {
        customer: true,
        mechanic: true,
        savedAddresses: true,
      },
    })
    if (!user) {
      // throw new Error("Invalid Phone Number, Could not find a user for given phone number")
      return undefined
    }
    return user
  }

  async getUserById(id: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: id,
      },
      include: {
        customer: true,
        mechanic: true,
      },
    })
    if (!user) {
      // throw new Error("Invalid Phone Number, Could not find a user for given phone number")
      return undefined
    }
    return user
  }

  async setUserBanStatus(
    phoneNumber: string,
    isBanned: boolean,
  ): Promise<User> {
    return await this.prisma.user.update({
      where: { phoneNumber },
      data: { isBanned },
    })
  }

  // async getAllUsers(): Promise<User[] | Error> {
  //     const user = await this.prisma.user.findMany({
  //         include: {
  //             _count: true,
  //             address: true,
  //             Customer: true,
  //             Mechanic: true
  //         }
  //     });
  //     if (!user) {
  //         throw new Error("The user could not be created,\nplease check your details")
  //     }
  //     return user;
  // }
  // async getAllVerifiedUsers(): Promise<User[] | Error> {
  //     const user = await this.prisma.user.findMany({
  //         where: {
  //             isPhoneVerified: true
  //         },
  //         include: {
  //             _count: true,
  //             address: true,
  //         }
  //     });
  //     if (!user) {
  //         throw new Error("The user could not be created,\nplease check your details")
  //     }
  //     return user;
  // }
  // async getAllUnverifiedUsers(): Promise<User[] | Error> {
  //     const user = await this.prisma.user.findMany({
  //         where: {
  //             isPhoneVerified: false
  //         },
  //         include: {
  //             _count: true,
  //             address: true,
  //         }
  //     });
  //     if (!user) {
  //         throw new Error("The user could not be created,\nplease check your details")
  //     }
  //     return user;
  // }
  // async getAllUsersByRole(role: TUserRoleEnums): Promise<User[] | Error> {
  //     const user = await this.prisma.user.findMany({
  //         where: {
  //             role: role.toUpperCase() as any
  //         },
  //         include: {
  //             _count: true,
  //             address: true,
  //             Customer: true,
  //             Mechanic: true
  //         }
  //     });
  //     if (!user) {
  //         throw new Error("The user could not be created,\nplease check your details")
  //     }
  //     return user;
  // }
}
