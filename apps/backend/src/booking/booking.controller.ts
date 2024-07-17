import {
  Controller,
  Get,
  Post,
  Param,
  Delete,
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
      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        error: 'unknown',
      })
    }

    res.status(HttpStatus.OK).json({
      success: true,
      data: mechanics,
    })
  }

  @Post('/accept/:id')
  async acceptBooking(@Req() req: Request, @Res() res: Response) {
    const { id: bookingId } = req.params
    const { mechanicId } = req.body
    console.log('/accept/:id', req.params, mechanicId)
    try {
      const updateBookingAndNotifyCustomer =
        await this.bookingService.acceptBooking(mechanicId, bookingId)
      console.log('/accept/:id', updateBookingAndNotifyCustomer)

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Booking Confirmed and Updated, Customer Notified',
        data: updateBookingAndNotifyCustomer,
      })
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'An unexpected error happened. Please try again',
        errror: {
          name: error.name || 'UNHANDLED_EXCEPTION',
          message: error.message || 'An unexpected error occured',
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
        res.status(HttpStatus.BAD_REQUEST).json({
          succes: false,
          message: 'Could not create an order booking',
          error: bookings,
        })
      }

      res.status(HttpStatus.CREATED).json({
        success: true,
        message: 'Order booking created successfully',
        data: bookings,
      })
    } catch (error) {
      console.error(error)
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
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
      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: 'INVALID_REQUEST, no id param found.',
        reason: `id param not found, ${id}`,
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
      res.status(HttpStatus.OK).json({
        success: true,
        message: 'booking updated successfully',
        data: updatedBooking,
      })
    } catch (error) {
      res.status(error.status || HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message || 'UNEXPECTED_ERROR',
        error: error,
      })
    }
  }

  @Get()
  async getAllBookings(@Req() req: Request, @Res() res: Response) {
    try {
      const bookings = await this.bookingService.getAllBookings()

      if (!bookings) {
        res.status(HttpStatus.BAD_REQUEST).json({
          succes: false,
          message: 'Could not find bookings',
          error: bookings,
        })
      }

      res.status(HttpStatus.OK).json({
        success: true,
        message: `Found ${bookings.length} bookings`,
        data: bookings,
      })
    } catch (error) {
      console.error(error)
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
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

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.bookingService.getBookingByBookingId(id)
  }

  @Get('mechanic/:id')
  async getBookingsByMechanicId(@Req() req: Request, @Res() res: Response) {
    const { id: mechanicId } = req.params
    try {
      const bookings =
        await this.bookingService.getAllBookingsByMechanicId(mechanicId)
      if (!bookings) {
        res.status(HttpStatus.BAD_REQUEST).json({
          succes: false,
          message: 'Could not find bookings',
          error: bookings,
        })
      }

      res.status(HttpStatus.OK).json({
        success: true,
        message: `Found ${bookings.length} bookings`,
        data: bookings,
      })
    } catch (error) {
      console.error(error)
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
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

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bookingService.remove(+id)
  }
}
