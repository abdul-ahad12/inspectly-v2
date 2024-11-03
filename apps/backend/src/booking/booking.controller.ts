import {
  Controller,
  Get,
  Post,
  Param,
  Req,
  Res,
  HttpStatus,
  Put,
  UseGuards,
} from '@nestjs/common'
import { BookingService } from './booking.service'
import { Request, Response } from 'express'
import { MechanicService } from '@/user/mechanic/mechanic.service'
import { ICreateBookingRoSchema } from '@/common/definitions/zod/bookings/create'
import { ThrottlerGuard } from '@nestjs/throttler'

@Controller('booking')
@UseGuards(ThrottlerGuard)
export class BookingController {
  constructor(
    private readonly bookingService: BookingService,
    private readonly mechanicService: MechanicService,
  ) {}

  @Post('/find-mechanics')
  async findAvailableMechs(@Req() req: Request, @Res() res: Response) {
    const mechanics = await this.mechanicService.findMechanicsAroundArea(
      req.body,
    )
    if (!mechanics) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        error: 'unknown',
      })
    }
    return res.status(HttpStatus.OK).json({
      success: true,
      data: mechanics,
    })
  }

  @Post('/accept/:id')
  async acceptBooking(@Req() req: Request, @Res() res: Response) {
    const { id: bookingId } = req.params
    const { mechanicId } = req.body
    try {
      const updateBookingAndNotifyCustomer =
        await this.bookingService.acceptBooking(mechanicId, bookingId)
      return res.status(HttpStatus.OK).json({
        success: true,
        message: 'Booking Confirmed and Updated, Customer Notified',
        data: updateBookingAndNotifyCustomer,
      })
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'An unexpected error happened. Please try again',
        error: {
          name: error.name || 'UNHANDLED_EXCEPTION',
          message: error.message || 'An unexpected error occurred',
          error: error,
        },
      })
    }
  }

  @Post()
  async createInspectionBooking(
    @Req() req: Request<unknown, unknown, ICreateBookingRoSchema>,
    @Res() res: Response,
  ) {
    try {
      const bookings = await this.bookingService.createBooking(req.body)
      if (!bookings) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: 'Could not create an order booking',
          error: bookings,
        })
      }
      return res.status(HttpStatus.CREATED).json({
        success: true,
        message: 'Order booking created successfully',
        data: bookings,
      })
    } catch (error) {
      console.error(error)
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message,
        error: {
          name: error.name,
          code: HttpStatus.INTERNAL_SERVER_ERROR,
          error: error,
        },
      })
    }
  }

  @Put(':id')
  async updateBookingByBookingId(@Req() req: Request, @Res() res: Response) {
    const { id } = req.params
    if (!id) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: 'INVALID_REQUEST, no id param found.',
        error: {
          name: 'INVALID_REQUEST',
          message: 'Invalid request, Parameter Id was not found',
          code: HttpStatus.BAD_REQUEST,
        },
      })
    }
    try {
      const updatedBooking = await this.bookingService.updateBookingStatus(
        id,
        req.body,
      )
      return res.status(HttpStatus.OK).json({
        success: true,
        message: 'Booking updated successfully',
        data: updatedBooking,
      })
    } catch (error) {
      return res.status(error.status || HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message || 'UNEXPECTED_ERROR',
        error: error,
      })
    }
  }

  @Get('/customer/:customerId/bookings/:status?')
  async getBookingsForCustomer(
    @Param('customerId') customerId: string,
    @Param('status') status: 'PENDING' | 'COMPLETED' | undefined,
    @Res() res: Response,
  ) {
    try {
      const bookings = await this.bookingService.getBookingsForCustomer(
        customerId,
        status,
      )
      if (!bookings.length) {
        return res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          message: 'No bookings found for this customer',
          data: [],
        })
      }
      return res.status(HttpStatus.OK).json({
        success: true,
        message: `Found ${bookings.length} bookings`,
        data: bookings,
      })
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Could not retrieve bookings',
        error: error,
      })
    }
  }

  @Get('/unassigned/:customerId')
  async getUnassignedBookings(
    @Param('customerId') customerId: string,
    @Res() res: Response,
  ) {
    try {
      const bookings =
        await this.bookingService.getBookingsWhereMechanicIsNull(customerId)
      return res.status(HttpStatus.OK).json({
        success: true,
        data: bookings,
      })
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Could not retrieve bookings',
        error: error,
      })
    }
  }

  @Get('/incomplete/:customerId')
  async getIncompleteBookings(
    @Param('customerId') customerId: string,
    @Res() res: Response,
  ) {
    try {
      const bookings =
        await this.bookingService.getBookingsWhereMechanicIsNotNullAndOrderIsUnfulfilled(
          customerId,
        )
      return res.status(HttpStatus.OK).json({
        success: true,
        data: bookings,
      })
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Could not retrieve bookings',
        error: error,
      })
    }
  }

  @Get('/completed/:customerId')
  async getCompletedBookings(
    @Param('customerId') customerId: string,
    @Res() res: Response,
  ) {
    try {
      const bookings =
        await this.bookingService.getBookingsWhereOrderIsFulfilled(customerId)
      return res.status(HttpStatus.OK).json({
        success: true,
        data: bookings,
      })
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Could not retrieve bookings',
        error: error,
      })
    }
  }

  @Get('/assigned/:customerId')
  async getAssignedBookings(
    @Param('customerId') customerId: string,
    @Res() res: Response,
  ) {
    try {
      const bookings =
        await this.bookingService.getBookingsWhereMechanicIsNotNull(customerId)
      return res.status(HttpStatus.OK).json({
        success: true,
        data: bookings,
      })
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Could not retrieve bookings',
        error: error,
      })
    }
  }
}
