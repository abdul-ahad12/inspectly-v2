import {
  Controller,
  Get,
  Post,
  Param,
  Delete,
  Req,
  Res,
  HttpStatus,
} from '@nestjs/common'
import { BookingService } from './booking.service'
import { Request, Response } from 'express'
import { MechanicService } from '@/user/mechanic/mechanic.service'
import { ICreateBookingRoSchema } from '@/common/definitions/zod/bookings/create'

@Controller('booking')
export class BookingController {
  constructor(
    private readonly bookingService: BookingService,
    private readonly mechanicService: MechanicService,
  ) {}

  @Get('/find-mechanics')
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
