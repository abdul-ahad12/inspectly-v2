// import { User } from '@/common/definitions/types';
import { JwtStrategy } from '@/auth/jwt.strategy'
import { ZcreateConnectAccountRoSchema } from '@/common/definitions/zod/mech'
import { ZCreateREAgentRoMainSchema } from '@/common/definitions/zod/realEstateAgent/ZCreateREAgentRo.main.schema'
import { MechanicWithScore } from '@/common/utils/algorithms/FindTopNMechs'
// import {
//   MechanicWithScore,
//   // selectTopMechanics,
// } from '@/common/utils/algorithms/FindTopNMechs'
import { SocketGateway } from '@/gateways/socket.gateway'
import { PaymentService } from '@/payment/payment.service'
import { PrismaService } from '@/prisma/prisma.service'
import { ReBookingService } from '@/re-booking/re-booking.service'
import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import {
  //   ApprovalRequest,
  //   Mechanic,
  Prisma,
  ReAgentApprovalRequest,
  RealEstateAgent,
  User,
} from '@prisma/client'
import { map } from 'lodash'
import { z } from 'zod'

interface IFindAgentParams {
  latitude: number
  longitude: number
  bookingId: string
}

@Injectable()
export class REAgentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: SocketGateway,
    private readonly bookingService: ReBookingService,
    private readonly jwtService: JwtStrategy,
    private readonly paymenentService: PaymentService,
  ) {}

  // need to verify
  async createConnectAccount(
    accountData: z.infer<typeof ZcreateConnectAccountRoSchema>,
  ) {
    try {
      const agentConnectAccount =
        await this.paymenentService.createServiceProviderConnectAccount(
          accountData.metadata.userId,
          accountData,
        )
      console.log(agentConnectAccount)
      if (!agentConnectAccount) {
        throw new HttpException(
          {
            success: false,
            message: 'Connect Account Not Created',
            error: {
              message: "Couldn't create Mechanics's Connect Account",
              code: HttpStatus.BAD_REQUEST,
              error: agentConnectAccount,
            },
          },
          HttpStatus.BAD_REQUEST,
        )
      }

      return { agentConnectAccount }
    } catch (error) {
      console.error(error)
      throw new HttpException(
        {
          success: false,
          message: 'Connect Account Not Created',
          code: HttpStatus.INTERNAL_SERVER_ERROR,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }

  async createReAgent(
    reqBody: z.infer<typeof ZCreateREAgentRoMainSchema>,
  ): Promise<User> {
    const prismaData: Prisma.UserCreateInput = {
      firstName: reqBody.user.firstName,
      lastName: reqBody.user.lastName,
      email: reqBody.user.email,
      phoneNumber: reqBody.user.phoneNumber,
      isPhoneVerified: reqBody.user.isPhoneVerified,
      verifiedOn: reqBody.verifiedOn,
      // savedAddresses: {
      //     create: {
      //         zipcode: reqBody.address.zipcode,
      //         lat: reqBody.address.lat,
      //         long: reqBody.address.long,
      //         street: reqBody.address.street,
      //         suburb: reqBody.address.suburb,
      //         state: reqBody.address.state,
      //         city: reqBody.address.city,
      //     },
      // },
      role: 'REAGENT',
      RealEstateAgent: {
        create: {
          ReAgentApprovalRequest: {
            create: {
              ABN: reqBody.REAgent.abn,
              ausIdentificationDoc: reqBody.verificationDocs.ausIdentification,
              experience: reqBody.REAgent.experience,
              status: 'PENDING',
            },
          },
          abn: reqBody.REAgent.abn,
          areaOfSpecialization: reqBody.REAgent.areaOfSpecialization,
          email: reqBody.REAgent.email,
          experience: reqBody.REAgent.experience,
          hasAgreedToPolicies: reqBody.REAgent.hasAgreedToPolicies,
          identificationDocument: reqBody.REAgent.identificationDocument,
          profilePic: reqBody.REAgent.profilePic,
          realEstateLicenceNumber: reqBody.REAgent.realEstateLicenceNumber,
          available: reqBody.REAgent.available,
          companyName: reqBody.REAgent.companyName,
          residentialAddress: {
            create: {
              lat: reqBody.REAgent.residentialAddress.lat,
              long: reqBody.REAgent.residentialAddress.long,
              street: reqBody.REAgent.residentialAddress.street,
              suburb: reqBody.REAgent.residentialAddress.suburb,
              city: reqBody.REAgent.residentialAddress.city,
              zipcode: reqBody.REAgent.residentialAddress.zipcode,
              state: reqBody.REAgent.residentialAddress.state,
            },
          },
        },
      },
    }

    const user = await this.prisma.user.create({
      data: prismaData,
      include: {
        RealEstateAgent: {
          include: {
            residentialAddress: true,
            RealEstateInspectionReport: true,
          },
        },
      },
    })
    if (!user) {
      // throw new Error("The user could not be created,\nplease check your details")
      console.error('The REAgent could not be created')
      throw new HttpException('User Not Created', HttpStatus.BAD_REQUEST)
    } else {
      return user
    }
  }

  // approve the agent

  async approveAgent(id: string): Promise<ReAgentApprovalRequest | undefined> {
    try {
      const approvedAgent = await this.prisma.reAgentApprovalRequest.update({
        where: {
          agentId: id,
        },
        data: {
          status: 'ACCEPTED',
        },
        include: {
          realEstateAgent: true,
        },
      })

      // Check if the record was updated
      if (!approvedAgent) {
        // If the record was not found, throw an error
        throw new HttpException(
          `Approval request with Agent ID ${id} not found.`,
          HttpStatus.BAD_REQUEST,
        )
      }

      // If the record was successfully updated, return it
      return approvedAgent
    } catch (error) {
      // Handle errors
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        console.error('Prisma error:', error.message)
        throw new Error(
          'An error occurred while updating the approval request.',
        )
      } else {
        // Other unexpected errors
        console.error('Unexpected error:', error)
        throw new Error('An unexpected error occurred.')
      }
    }
  }

  // Get functions

  async getAllREAgents(): Promise<RealEstateAgent[]> {
    try {
      const reAgents = await this.prisma.realEstateAgent.findMany()
      if (!reAgents) {
        throw new HttpException(
          'Could Not find any Real Estate Agents',
          HttpStatus.NOT_FOUND,
        )
      }
      return reAgents
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

  async findAgentsAroundArea(
    findMechParams: IFindAgentParams,
  ): Promise<MechanicWithScore[] | RealEstateAgent[]> {
    // const { latitude, longitude } = findMechParams

    // Calculate the bounding box for the search radius
    // const earthRadiusKm = 6371
    // const radius = 50
    // const latDiff = radius / earthRadiusKm
    // const lngDiff =
    //   radius / (earthRadiusKm * Math.cos((Math.PI * latitude) / 180))

    // const latMin = latitude - latDiff
    // const latMax = latitude + latDiff
    // const lngMin = longitude - lngDiff
    // const lngMax = longitude + lngDiff

    // console.log(latMin, latMax, lngMin, lngMax)

    const agents = await this.prisma.realEstateAgent.findMany({
      where: {
        AND: [
          // {
          //   user: {
          //     savedAddresses: {
          //       some: {
          //         lat: {
          //           gte: latMin,
          //           lte: latMax,
          //         },
          //         long: {
          //           gte: lngMin,
          //           lte: lngMax,
          //         },
          //       },
          //     },
          //   },
          // },
          // {
          //   approvalRequest: {
          //     status: {
          //       equals: 'ACCEPTED',
          //     },
          //   },
          // },
          {
            available: {
              equals: true,
            },
          },
        ],
      },
      include: {
        // approvalRequest: true,
        RE_Booking: true,
        RE_Order: true,
        // reviews: true,
        user: true,
      },
    })

    if (!agents) {
      throw new HttpException(
        {
          success: false,
          message: 'BAD_REQUEST',
          error: agents,
        },
        HttpStatus.BAD_REQUEST,
      )
    }

    // const newMechs = selectTopMechanics(mechanics, 5)

    const booking = await this.bookingService.getBookingByBookingId(
      findMechParams.bookingId,
    )

    // // send booking request notifications to all mechanics
    map(agents, (agent) =>
      this.notificationService.notifyMechanics(agent.id, booking),
    )

    return agents
  }

  async getREAgentById(id: string): Promise<RealEstateAgent> {
    try {
      const reAgent = await this.prisma.realEstateAgent.findUnique({
        where: {
          id: id,
        },
        include: {
          // Booking: true,
          // Order: true,
          // reviews: true,
          user: true,
        },
      })
      if (!reAgent) {
        throw new HttpException(
          `Could not find a realEstateAgent with realEstateAgentId:${id}\nPlease check your params`,
          HttpStatus.NOT_FOUND,
        )
      }
      return reAgent
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

  async getREAgentByUserId(id: string): Promise<RealEstateAgent> {
    try {
      const reAgent = await this.prisma.realEstateAgent.findUnique({
        where: {
          userId: id,
        },
        include: {
          // Booking: true,
          // reviews: true,
          // Order: true,
          user: true,
        },
      })
      if (!reAgent) {
        throw new HttpException(
          `Could not find a real estate agent with userId:${id}\nPlease check your params`,
          HttpStatus.NOT_FOUND,
        )
      }
      return reAgent
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

  // update functions
  async updateREAgentById(
    id: string,
    reAgent:
      | Partial<RealEstateAgent>
      | Prisma.RealEstateAgentUncheckedUpdateInput,
  ): Promise<RealEstateAgent> {
    try {
      const newAgent = await this.prisma.realEstateAgent.update({
        where: {
          id: id,
        },
        data: { ...reAgent },
      })
      if (!newAgent) {
        throw new HttpException(
          `Could not update a real estate agent with realEstateAgentId:${id}\nPlease check your params`,
          HttpStatus.BAD_REQUEST,
        )
      }
      return newAgent
    } catch (error) {
      console.timeLog('exception', error)
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

  // async updateMultipleREAgentsByfilters(
  //     filter: Record<string, any>,
  //     update: Partial<RealEstateAgent>,
  // ): Promise<RealEstateAgent[]> {
  //     try {
  //         const batchPayload = await this.prisma.mechanic.updateMany({
  //             where: filter,
  //             data: update,
  //         })

  //         // Query the updated customers based on the provided filter
  //         const updatedMechanics = await this.prisma.mechanic.findMany({
  //             where: filter,
  //         })

  //         // Throw an error if no customers were updated
  //         if (!batchPayload.count || updatedMechanics.length === 0) {
  //             throw new HttpException(
  //                 `No mechanics found matching the provided criteria`,
  //                 HttpStatus.BAD_REQUEST,
  //             )
  //         }

  //         return updatedMechanics
  //     } catch (error) {
  //         switch (true) {
  //             case error instanceof Prisma.PrismaClientValidationError:
  //                 throw new HttpException(
  //                     {
  //                         message: error.message,
  //                         name: error.name,
  //                         stack: error.stack,
  //                     },
  //                     HttpStatus.BAD_REQUEST,
  //                 )
  //             case error instanceof Prisma.PrismaClientKnownRequestError:
  //                 throw new HttpException(
  //                     {
  //                         message: error.message,
  //                         name: error.name,
  //                         stack: error.stack,
  //                         description: error.meta,
  //                         code: error.code,
  //                     },
  //                     HttpStatus.BAD_REQUEST,
  //                 )
  //             case error instanceof Prisma.PrismaClientUnknownRequestError:
  //                 throw new HttpException(
  //                     {
  //                         message: error.message,
  //                         name: 'Prisma Unknown Req Error',
  //                     },
  //                     HttpStatus.BAD_REQUEST,
  //                 )
  //             default:
  //                 throw new HttpException(
  //                     'An unexpected error occurred.',
  //                     HttpStatus.INTERNAL_SERVER_ERROR,
  //                 )
  //         }
  //     }
  // }

  // delete functions
  async deleteREAgentById(id: string): Promise<RealEstateAgent> {
    try {
      // const deletedApproval = await this.prisma.approvalRequest.delete({
      //     where: {
      //         mechanicId: id,
      //     },
      // })
      const deletedUser = await this.prisma.realEstateAgent.delete({
        where: {
          id: id,
        },
      })

      if (!deletedUser) {
        throw new HttpException(
          `Could not delete a real estate agent with realEstateAgentId:${id}\nPlease check your params`,
          HttpStatus.BAD_REQUEST,
        )
      }
      return deletedUser
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
}
