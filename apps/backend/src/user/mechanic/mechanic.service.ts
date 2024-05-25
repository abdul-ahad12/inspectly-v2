// import { User } from '@/common/definitions/types';
import { BookingService } from '@/booking/booking.service'
import { ZCreateMechanicRoMainSchema } from '@/common/definitions/zod/mech'
import {
  MechanicWithScore,
  selectTopMechanics,
} from '@/common/utils/algorithms/FindTopNMechs'
import { SocketGateway } from '@/gateways/socket.gateway'
import { PrismaService } from '@/prisma/prisma.service'
import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { ApprovalRequest, Mechanic, Prisma, User } from '@prisma/client'
import { map } from 'lodash'
import { z } from 'zod'

interface IFindMechParams {
  latitude: number
  longitude: number
  bookingId: string
}

@Injectable()
export class MechanicService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: SocketGateway,
    private readonly bookingService: BookingService,
  ) {}
  async createMechanic(
    reqBody: z.infer<typeof ZCreateMechanicRoMainSchema>,
  ): Promise<User> {
    const prismaData: Prisma.UserCreateInput = {
      firstName: reqBody.user.firstName,
      lastName: reqBody.user.lastName,
      email: reqBody.user.email,
      phoneNumber: reqBody.user.phoneNumber,
      isPhoneVerified: reqBody.user.isPhoneVerified,
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
      role: 'MECHANIC',
      mechanic: {
        create: {
          profilePic: reqBody.mechanic.profilePic,
          avv: reqBody.mechanic.avv,
          certifications: reqBody.mechanic.certifications,
          licences: reqBody.mechanic.licences,
          hasAgreedToPolicies: reqBody.mechanic.hasAgreedToPolicies,
          available: false,
          vehicleTypes: reqBody.mechanic.vehicleTypes,
          vehicleUseType: 'NONCOMMERCIAL',
          vehicleWheels: 'FOUR',
          approvalRequest: {
            create: {
              status: reqBody.approvalRequest.status || 'PENDING',
              certificate_3: reqBody.approvalRequest.certificate_3,
              certificate_4: reqBody.approvalRequest.certificate_4,
              publicLiabilityInsurance:
                reqBody.approvalRequest.publicLiabilityInsurance,
              // professionalIndemnityInsurance: reqBody.approvalRequest.professionalIndemnityInsurance,
              ausIdentificationDoc:
                reqBody.approvalRequest.ausIdentificationDoc,
              ABN: reqBody.approvalRequest.abn,
              workshopAddress: {
                create: {
                  zipcode: reqBody.address.zipcode,
                  lat: reqBody.address.lat,
                  long: reqBody.address.long,
                  street: reqBody.address.street + ' workshop',
                  suburb: reqBody.address.suburb,
                  city: reqBody.address.city,
                },
              },
              experience: reqBody.approvalRequest.experienceYears,
            },
          },
          vehicleFuelType: reqBody.mechanic.vehicleFuelType,
        },
      },
    }

    const user = await this.prisma.user.create({
      data: prismaData,
      include: {
        mechanic: {
          include: {
            approvalRequest: true,
          },
        },
        savedAddresses: true,
      },
    })
    if (!user) {
      // throw new Error("The user could not be created,\nplease check your details")
      console.error('The Mechanic could not be created')
      throw new HttpException('User Not Created', HttpStatus.BAD_REQUEST)
    } else {
      return user
    }
  }

  // approve the mechanic

  async approveMechanic(id: string): Promise<ApprovalRequest | undefined> {
    try {
      const approvedMechanic = await this.prisma.approvalRequest.update({
        where: {
          mechanicId: id,
        },
        data: {
          status: 'ACCEPTED',
        },
        include: {
          Mechanic: true,
        },
      })

      // Check if the record was updated
      if (!approvedMechanic) {
        // If the record was not found, throw an error
        throw new HttpException(
          `Approval request with mechanic ID ${id} not found.`,
          HttpStatus.BAD_REQUEST,
        )
      }

      // If the record was successfully updated, return it
      return approvedMechanic
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
  async getAllMechanics(): Promise<Mechanic[]> {
    try {
      const mechanics = await this.prisma.mechanic.findMany()
      if (!mechanics) {
        throw new HttpException(
          'Could Not find any mechanic users',
          HttpStatus.NOT_FOUND,
        )
      }
      return mechanics
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

  async findMechanicsAroundArea(
    findMechParams: IFindMechParams,
  ): Promise<MechanicWithScore[]> {
    const { latitude, longitude } = findMechParams

    // Calculate the bounding box for the search radius
    const earthRadiusKm = 6371
    const radius = 50
    const latDiff = radius / earthRadiusKm
    const lngDiff =
      radius / (earthRadiusKm * Math.cos((Math.PI * latitude) / 180))

    const latMin = latitude - latDiff
    const latMax = latitude + latDiff
    const lngMin = longitude - lngDiff
    const lngMax = longitude + lngDiff

    console.log(latMin, latMax, lngMin, lngMax)

    const mechanics = await this.prisma.mechanic.findMany({
      where: {
        AND: [
          {
            user: {
              savedAddresses: {
                some: {
                  lat: {
                    gte: latMin,
                    lte: latMax,
                  },
                  long: {
                    gte: lngMin,
                    lte: lngMax,
                  },
                },
              },
            },
          },
          {
            approvalRequest: {
              status: {
                equals: 'ACCEPTED',
              },
            },
          },
          {
            available: {
              equals: true,
            },
          },
        ],
      },
      include: {
        approvalRequest: true,
        Booking: true,
        Order: true,
        reviews: true,
        user: true,
      },
    })

    if (!mechanics) {
      throw new HttpException(
        {
          success: false,
          message: 'BAD_REQUEST',
          error: mechanics,
        },
        HttpStatus.BAD_REQUEST,
      )
    }

    const newMechs = selectTopMechanics(mechanics, 5)

    const booking = await this.bookingService.getBookingByBookingId(
      findMechParams.bookingId,
    )

    map(newMechs, (mechanic) =>
      this.notificationService.notifyMechanics(mechanic.id, booking),
    )

    return newMechs
  }

  async getMechanicById(id: string): Promise<Mechanic> {
    try {
      const mechanic = await this.prisma.mechanic.findUnique({
        where: {
          id: id,
        },
        include: {
          approvalRequest: true,
          Booking: true,
          Order: true,
          reviews: true,
          user: true,
        },
      })
      if (!mechanic) {
        throw new HttpException(
          `Could not find a mechanic with mechanicId:${id}\nPlease check your params`,
          HttpStatus.NOT_FOUND,
        )
      }
      return mechanic
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

  async getMechanicByUserId(id: string): Promise<Mechanic> {
    try {
      const mechanic = await this.prisma.mechanic.findUnique({
        where: {
          userId: id,
        },
        include: {
          approvalRequest: true,
          Booking: true,
          reviews: true,
          Order: true,
          user: true,
        },
      })
      if (!mechanic) {
        throw new HttpException(
          `Could not find a mechanic with userId:${id}\nPlease check your params`,
          HttpStatus.NOT_FOUND,
        )
      }
      return mechanic
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
  async updateMechanicById(
    id: string,
    mechanic: Partial<Mechanic> | Prisma.MechanicUncheckedUpdateInput,
  ): Promise<Mechanic> {
    try {
      console.log(id, mechanic)
      const newMechanic = await this.prisma.mechanic.update({
        where: {
          id: id,
        },
        data: { ...mechanic },
      })
      if (!newMechanic) {
        throw new HttpException(
          `Could not update a mechanic with mechanicId:${id}\nPlease check your params`,
          HttpStatus.BAD_REQUEST,
        )
      }
      return newMechanic
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

  async updateMultipleMechanicsByfilters(
    filter: Record<string, any>,
    update: Partial<Mechanic>,
  ): Promise<Mechanic[]> {
    try {
      const batchPayload = await this.prisma.mechanic.updateMany({
        where: filter,
        data: update,
      })

      // Query the updated customers based on the provided filter
      const updatedMechanics = await this.prisma.mechanic.findMany({
        where: filter,
      })

      // Throw an error if no customers were updated
      if (!batchPayload.count || updatedMechanics.length === 0) {
        throw new HttpException(
          `No mechanics found matching the provided criteria`,
          HttpStatus.BAD_REQUEST,
        )
      }

      return updatedMechanics
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

  // delete functions
  async deleteMechanicById(id: string): Promise<Mechanic> {
    try {
      const deletedApproval = await this.prisma.approvalRequest.delete({
        where: {
          mechanicId: id,
        },
      })
      if (deletedApproval) {
        const deletedUser = await this.prisma.mechanic.delete({
          where: {
            id: id,
          },
        })

        if (!deletedUser) {
          throw new HttpException(
            `Could not delete a mechanic with mechanicId:${id}\nPlease check your params`,
            HttpStatus.BAD_REQUEST,
          )
        }
        return deletedUser
      }
      if (!deletedApproval) {
        throw new HttpException(
          `Could not delete a mechanic with mechanicId:${id}\nPlease check your params`,
          HttpStatus.BAD_REQUEST,
        )
      }
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
