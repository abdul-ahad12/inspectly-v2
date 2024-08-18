import { createREBookingRoDefaults } from '@/common/definitions/zod/reBooking/cosntants'
import { ICreateREBookingRoSchema } from '@/common/definitions/zod/reBooking/create'
import { SocketGateway } from '@/gateways/socket.gateway'
import { PrismaService } from '@/prisma/prisma.service'
import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { Prisma, RE_Booking, RE_Order } from '@prisma/client'
import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} from '@prisma/client/runtime/library'
import { formatDate } from 'date-fns'

@Injectable()
export class ReBookingService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly socketGateway: SocketGateway,
  ) {}

  async createBooking(
    requestBody: ICreateREBookingRoSchema,
  ): Promise<RE_Order> {
    const { customerId, packageName, property, propSeller, service, amount } =
      requestBody
    const {
      packageName: defaultPackageName,
      property: defaultPropertyOptions,
      service: defaultService,
    } = createREBookingRoDefaults
    const prismaOrderReqObj: Prisma.RE_OrderCreateInput = {
      booking: {
        create: {
          owner: {
            connect: {
              id: customerId,
            },
          },
          package: {
            connect: {
              name: packageName ?? defaultPackageName,
            },
          },
          service: {
            connect: {
              name: service ?? defaultService,
            },
          },
          property: {
            create: {
              dealType: property.dealType ?? defaultPropertyOptions.dealType,
              isFrequentTraveller: property.isFrequentTraveller,
              isResidential: property.isResidential,
              occupierType:
                property.occupierType ?? defaultPropertyOptions.occupierType,
              propertyType:
                property.propetyType ?? defaultPropertyOptions.propetyType,
              purchaseReason:
                property.purchaseReason ??
                defaultPropertyOptions.purchaseReason,
              inspectionFor: {
                connect: {
                  id: customerId,
                },
              },
              isNew: property.isNew,
              totalArea: property.totalArea,
              numberOfRooms: property.numberOfRooms,
              propertyAddress: {
                create: {
                  lat: property.propertyAddress.lat,
                  long: property.propertyAddress.long,
                  city: property.propertyAddress.city,
                  street: property.propertyAddress.street,
                  suburb: property.propertyAddress.suburb,
                  state: property.propertyAddress.state,
                  zipcode: property.propertyAddress.zipcode,
                },
              },
              seller: {
                connectOrCreate: {
                  where: {
                    phoneNumber: propSeller.phoneNumber,
                    email: propSeller.email,
                  },
                  create: {
                    email: propSeller.email,
                    lastname: propSeller.lastname,
                    name: propSeller.name,
                    phoneNumber: propSeller.phoneNumber,
                  },
                },
              },
            },
          },
          dateTimeOfBooking: new Date().toISOString(),
        },
      },
      initiatedBy: {
        connect: {
          id: customerId,
        },
      },
      package: {
        connect: {
          name: packageName,
        },
      },
      isFullfilled: false,
      totalOrderValue: amount,
    }

    // Step 1: Create an order with status pending
    const order = await this.prismaService.rE_Order.create({
      data: prismaOrderReqObj,
    })

    if (!order) {
      throw new HttpException(
        {
          success: false,
          message: 'The order could not be created, Please try again later',
          error: {
            name: 'UNKNOWN_ERROR',
            message: 'The order could not be created.',
            code: HttpStatus.BAD_REQUEST,
            error:
              order instanceof PrismaClientValidationError ||
              order instanceof PrismaClientKnownRequestError
                ? order
                : null,
          },
        },
        HttpStatus.BAD_REQUEST,
      )
    }
    return order
  }

  async acceptBooking(agentId: string, bookingId: string): Promise<RE_Booking> {
    try {
      const booking = await this.prismaService.rE_Booking.update({
        where: {
          id: bookingId,
          agentId: null,
        },
        data: {
          agent: {
            connect: {
              id: agentId,
            },
          },
        },
      })

      if (typeof booking == typeof PrismaClientKnownRequestError) {
        throw new HttpException(
          {
            success: false,
            message: 'Booking not available any more',
            error: booking,
          },
          HttpStatus.BAD_REQUEST,
        )
      }

      // Notify customer about booking acceptance
      this.socketGateway.notifyCustomer(
        booking.ownerId,
        'Your booking has been accepted by an agent.',
      )
      return booking
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async updatePaymentOnOrderByOrderId(
    orderId: string,
    payload: Partial<RE_Order>,
  ) {
    const { paymentId } = payload
    if (!paymentId) {
      throw new HttpException(
        {
          success: false,
          message: 'Wrong Service Function Invocation',
          error: {
            name: 'Incompatible Function Usage',
            message: 'Wrong Service Function Invocation',
            error: `This Function:${this.updatePaymentOnOrderByOrderId.name} can currently only be used to update paymentId on Orders`,
          },
        },
        HttpStatus.BAD_REQUEST,
      )
    }
    const updatedOrder = await this.prismaService.rE_Order.update({
      where: {
        id: orderId,
      },
      data: {
        paymentId: paymentId,
      },
    })

    if (!updatedOrder) {
      throw new HttpException(
        {
          success: false,
          message: `Could not update the order:${orderId}`,
          error: {
            name: '',
            message: '',
            error: updatedOrder,
          },
        },
        HttpStatus.BAD_REQUEST,
      )
    }
    return updatedOrder
  }

  async updateBookingStatus(
    id: string,
    bookingStatus: { isFullfilled: boolean },
  ) {
    const booking = await this.prismaService.rE_Booking.update({
      where: {
        id: id,
      },
      data: {
        order: {
          update: {
            where: {
              bookingId: id,
            },
            data: {
              isFullfilled: bookingStatus.isFullfilled,
            },
          },
        },
      },
      include: {
        InspectionReport: true,
        agent: true,
        order: true,
        owner: true,
        package: true,
        property: true,
        service: true,
      },
    })

    if (!booking) {
      throw new HttpException(
        {
          success: false,
          message: 'Could Not update the booking',
          error: {
            error: booking,
            message: 'Possible Prisma Error',
          },
        },
        HttpStatus.BAD_REQUEST,
      )
    }
    return booking
  }

  async getAllBookings() {
    const bookings = await this.prismaService.rE_Booking.findMany({
      include: {
        agent: true,
        order: true,
        owner: true,
        service: true,
        package: true,
        property: {
          include: {
            inspectionFor: true,
            seller: true,
            propertyAddress: true,
          },
        },
      },
    })

    if (!bookings || bookings instanceof Error) {
      throw new HttpException(
        {
          success: false,
          message: 'Could Not fetch all mechanics',
          error: {
            name: 'NOT_FOUND',
            message: 'bookings could not be fetched, Please try again later',
            error: bookings,
          },
        },
        HttpStatus.BAD_REQUEST,
      )
    }

    return bookings
  }

  async getAllBookingsByAgentId(id: string) {
    const bookings = await this.prismaService.rE_Booking.findMany({
      where: {
        agentId: id,
      },
      include: {
        agent: true,
        order: true,
        owner: true,
        service: true,
        package: true,
        property: {
          include: {
            inspectionFor: true,
            seller: true,
            propertyAddress: true,
          },
        },
      },
    })

    if (!bookings || bookings instanceof Error) {
      throw new HttpException(
        {
          success: false,
          message: 'Could Not fetch all mechanics',
          error: {
            name: 'NOT_FOUND',
            message: 'bookings could not be fetched, Please try again later',
            error: bookings,
          },
        },
        HttpStatus.BAD_REQUEST,
      )
    }

    return bookings
  }

  async getAllPendingBookingsByMechanicId(id: string) {
    const bookings = await this.prismaService.rE_Booking.findMany({
      where: {
        agentId: id,
        AND: [
          {
            agentId: id,
          },
          {
            dateTimeOfBooking: {
              gt: formatDate(new Date().getDate(), 'yyyy-mm-dd'),
            },
          },
          {
            order: {
              some: {
                isFullfilled: false,
              },
            },
          },
        ],
      },
      include: {
        agent: true,
        order: true,
        owner: true,
        service: true,
        package: true,
        property: {
          include: {
            inspectionFor: true,
            seller: true,
            propertyAddress: true,
          },
        },
      },
    })

    if (!bookings || bookings instanceof Error) {
      throw new HttpException(
        {
          success: false,
          message: 'Could Not fetch all bookings',
          error: {
            name: 'NOT_FOUND',
            message: 'bookings could not be fetched, Please try again later',
            error: bookings,
          },
        },
        HttpStatus.BAD_REQUEST,
      )
    }

    return bookings
  }

  async getBookingByBookingId(id: string) {
    const booking = await this.prismaService.rE_Booking.findUnique({
      where: {
        id: id,
      },
      include: {
        order: true,
        property: true,
        package: true,
        owner: true,
      },
    })

    if (!booking) {
      throw new HttpException(
        {
          success: false,
          message: `Could Not find the booking for id:${id}`,
          code: HttpStatus.BAD_REQUEST,
          error: {
            error: booking,
            message: `Could not find booking for id:${id}`,
          },
        },
        HttpStatus.BAD_REQUEST,
      )
    }

    return booking
  }
}
