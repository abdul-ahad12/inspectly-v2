import {
  Controller,
  Get,
  HttpStatus,
  Post,
  Put,
  Req,
  Res,
} from '@nestjs/common'
import { ReBookingService } from './re-booking.service'
import { REAgentService } from '@/user/real-estate-agent/agent.service'
import { Request, Response } from 'express'
import { ICreateREBookingRoSchema } from '@/common/definitions/zod/reBooking/create'

@Controller('re-booking')
export class ReBookingController {
  constructor(
    private readonly reBookingService: ReBookingService,
    private readonly reAgentService: REAgentService,
  ) {}

  @Post('/find-agents')
  async findAvailableAgents(@Req() req: Request, @Res() res: Response) {
    const agents = await this.reAgentService.findAgentsAroundArea(req.body)
    if (!agents) {
      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        error: 'unknown',
      })
    }

    res.status(HttpStatus.OK).json({
      success: true,
      data: agents,
    })
  }

  @Post('/accept/:id')
  async acceptBooking(@Req() req: Request, @Res() res: Response) {
    const { id: bookingId } = req.params
    const { agentId } = req.body
    console.log('/accept/:id', req.params, agentId)
    try {
      const updateBookingAndNotifyCustomer =
        await this.reBookingService.acceptBooking(agentId, bookingId)
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
    @Req() req: Request<unknown, unknown, ICreateREBookingRoSchema>,
    @Res() res: Response,
  ) {
    try {
      const bookings = await this.reBookingService.createBooking(req.body)

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
      const updatedBooking = await this.reBookingService.updateBookingStatus(
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
      const bookings = await this.reBookingService.getAllBookings()

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

  @Get('mechanic/:id')
  async getBookingsByMechanicId(@Req() req: Request, @Res() res: Response) {
    const { id: agentId } = req.params
    try {
      const bookings =
        await this.reBookingService.getAllBookingsByAgentId(agentId)
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
}
