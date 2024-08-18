import { createBookingRoDefaults } from '@/common/definitions/zod/bookings/constants'
import { ICreateBookingRoSchema } from '@/common/definitions/zod/bookings/create'
import { SocketGateway } from '@/gateways/socket.gateway'
import { PrismaService } from '@/prisma/prisma.service'
import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { Booking, Order, Prisma } from '@prisma/client'
import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} from '@prisma/client/runtime/library'
import { formatDate } from 'date-fns'

@Injectable()
export class BookingService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly socketGateway: SocketGateway,
  ) {}

  async createBooking(requestBody: ICreateBookingRoSchema): Promise<Order> {
    const { customerId, packageName, vehicle, seller, service, amount } =
      requestBody
    const {
      packageName: defaultPackageName,
      vehicle: defaultVehicle,
      service: defaultService,
    } = createBookingRoDefaults
    const prismaOrderReqObj: Prisma.OrderCreateInput = {
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
          vehicle: {
            create: {
              carType: vehicle.carType ?? defaultVehicle.carType,
              fuelType: vehicle.fuelType ?? defaultVehicle.fuelType,
              noOfWheels: vehicle.noOfWheels ?? defaultVehicle.noOfWheels,
              useType: vehicle.useType ?? defaultVehicle.useType,
              make: vehicle.make,
              model: vehicle.model,
              regNumber: vehicle.regNumber,
              year: vehicle.year,
              owner: {
                connect: {
                  id: customerId,
                },
              },
              seller: seller
                ? {
                    create: {
                      name: seller.name,
                      lastname: seller.lastname,
                      email: seller.email,
                      phoneNumber: seller.phoneNumber,
                    },
                  }
                : null,
              vehicleAddress: {
                create: {
                  lat: vehicle.vehicleAddress.lat,
                  long: vehicle.vehicleAddress.long,
                  city: vehicle.vehicleAddress.city,
                  street: vehicle.vehicleAddress.street,
                  suburb: vehicle.vehicleAddress.suburb,
                  state: vehicle.vehicleAddress.state,
                  zipcode: vehicle.vehicleAddress.zipcode,
                  name: vehicle.vehicleAddress.name ?? null,
                  landmark: vehicle.vehicleAddress.landmark ?? null,
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
    const order = await this.prismaService.order.create({
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

  async acceptBooking(mechanicId: string, bookingId: string): Promise<Booking> {
    try {
      const booking = await this.prismaService.booking.update({
        where: {
          id: bookingId,
          mechanicId: null,
        },
        data: {
          mechanic: {
            connect: {
              id: mechanicId,
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
        'Your booking has been accepted by a mechanic.',
      )
      return booking
    } catch (error) {
      console.error(error)
    }
  }

  async updateOrderByOrderId(orderId: string, payload: Partial<Order>) {
    const { paymentId } = payload
    if (!paymentId) {
      throw new HttpException(
        {
          success: false,
          message: 'Wrong Service Function Invocation',
          error: {
            name: 'Incompatible Function Usage',
            message: 'Wrong Service Function Invocation',
            error: `This Function:${this.updateOrderByOrderId.name} can currently only be used to update paymentId on Orders`,
          },
        },
        HttpStatus.BAD_REQUEST,
      )
    }
    const updatedOrder = await this.prismaService.order.update({
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

  async getOrderByOrderId(orderId: string) {
    return this.prismaService.order.findUnique({
      where: { id: orderId },
      include: {
        booking: {
          include: {
            package: true,
            service: true,
          },
        },
        CustomerPayment: {
          include: {
            customerStripeData: true,
          },
        },
      },
    })
  }

  async getAllBookings() {
    const bookings = await this.prismaService.booking.findMany({
      include: {
        mechanic: true,
        Order: true,
        owner: true,
        service: true,
        package: true,
        vehicle: {
          include: {
            booking: true,
            owner: true,
            seller: true,
            vehicleAddress: true,
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

  async getAllBookingsByMechanicId(id: string) {
    const bookings = await this.prismaService.booking.findMany({
      where: {
        mechanicId: id,
      },
      include: {
        mechanic: true,
        Order: true,
        owner: true,
        service: true,
        package: true,
        vehicle: {
          include: {
            booking: true,
            owner: true,
            seller: true,
            vehicleAddress: true,
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
    const bookings = await this.prismaService.booking.findMany({
      where: {
        mechanicId: id,
        AND: [
          {
            mechanicId: id,
          },
          {
            dateTimeOfBooking: {
              gt: formatDate(new Date().getDate(), 'yyyy-mm-dd'),
            },
          },
          {
            Order: {
              isFullfilled: false,
            },
          },
        ],
      },
      include: {
        mechanic: true,
        Order: true,
        owner: true,
        service: true,
        package: true,
        vehicle: {
          include: {
            booking: true,
            owner: true,
            seller: true,
            vehicleAddress: true,
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

  async getBookingByBookingId(id: string) {
    const booking = await this.prismaService.booking.findUnique({
      where: {
        id: id,
      },
      include: {
        Order: true,
        vehicle: true,
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

  async updateBookingStatus(
    id: string,
    bookingStatus: { isFullfilled: boolean },
  ) {
    const booking = await this.prismaService.booking.update({
      where: {
        id: id,
      },
      data: {
        Order: {
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
        mechanic: true,
        Order: true,
        owner: true,
        package: true,
        vehicle: true,
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
}
