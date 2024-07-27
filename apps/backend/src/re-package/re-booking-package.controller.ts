import {
  Controller,
  Delete,
  Get,
  HttpStatus,
  Patch,
  Post,
  Req,
  Res,
} from '@nestjs/common'
import { ReBookingPackageService } from './re-booking-package.service'
import { Request, Response } from 'express'

@Controller('re-packages')
export class ReBookingPackageController {
  constructor(private readonly packageService: ReBookingPackageService) {}

  @Get('')
  async getAllPackages(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const packages = await this.packageService.getAllPackages()
      res.status(HttpStatus.OK).json({
        success: true,
        message: `Found ${packages.length} packages`,
        data: packages,
      })
    } catch (error) {
      res.status(error.status || HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message:
          error.message ||
          'An Unexpected Error Occured.\nPlease try again later.',
        error: error.name || 'Internal Server Error',
        details: error,
      })
    }
  }

  @Get('/:id')
  async getPackagesById(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const { id } = req.params
    try {
      const packages = await this.packageService.getPackageById(id)
      res.status(HttpStatus.OK).json({
        success: true,
        message: `Found ${packages.length} packages`,
        data: packages,
      })
    } catch (error) {
      res.status(error.status || HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message:
          error.message ||
          'An Unexpected Error Occured.\nPlease try again later.',
        error: error.name || 'Internal Server Error',
        details: error,
      })
    }
  }

  @Get('/:id/orders')
  async getOrdersByPackageId(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const { id } = req.params
    try {
      const packages = await this.packageService.getOrdersByPackageId(id)
      res.status(HttpStatus.OK).json({
        success: true,
        message: `Found ${packages.length} packages`,
        data: packages,
      })
    } catch (error) {
      res.status(error.status || HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message:
          error.message ||
          'An Unexpected Error Occured.\nPlease try again later.',
        error: error.name || 'Internal Server Error',
        details: error,
      })
    }
  }

  @Get('/:id/bookings')
  async getBookingsByPackageId(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const { id } = req.params
    try {
      const packages = await this.packageService.getBookingsByPackageId(id)
      res.status(HttpStatus.OK).json({
        success: true,
        message: `Found ${packages.length} packages`,
        data: packages,
      })
    } catch (error) {
      res.status(error.status || HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message:
          error.message ||
          'An Unexpected Error Occured.\nPlease try again later.',
        error: error.name || 'Internal Server Error',
        details: error,
      })
    }
  }

  @Post('')
  async createPackage(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const { body } = req
    try {
      const inspectionPackage = await this.packageService.createPackage(body)
      res.status(HttpStatus.OK).json({
        success: true,
        message: `Package Created Successfully`,
        data: inspectionPackage,
      })
    } catch (error) {
      res.status(error.status || HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message:
          error.message ||
          'An Unexpected Error Occured.\nPlease try again later.',
        error: error.name || 'Internal Server Error',
        details: error,
      })
    }
  }

  @Patch(':id')
  async updatePackage(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const { body } = req
    const { id } = req.params
    try {
      const inspectionPackage = await this.packageService.updatePackage(
        id,
        body,
      )
      res.status(HttpStatus.OK).json({
        success: true,
        message: `Package Updated Successfully`,
        data: inspectionPackage,
      })
    } catch (error) {
      res.status(error.status || HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message:
          error.message ||
          'An Unexpected Error Occured.\nPlease try again later.',
        error: error.name || 'Internal Server Error',
        details: error,
      })
    }
  }

  @Patch(':id/price')
  async updatePackagePrice(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const { body } = req
    const { id } = req.params
    try {
      const inspectionPackage = await this.packageService.updatePackagePrice(
        id,
        body,
      )
      res.status(HttpStatus.OK).json({
        success: true,
        message: `Package Price Updated Successfully`,
        data: inspectionPackage,
      })
    } catch (error) {
      res.status(error.status || HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message:
          error.message ||
          'An Unexpected Error Occured.\nPlease try again later.',
        error: error.name || 'Internal Server Error',
        details: error,
      })
    }
  }

  @Delete(':id')
  async deletePackage(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const { id } = req.params
    try {
      const inspectionPackage = await this.packageService.deletePackage(id)
      res.status(HttpStatus.OK).json({
        success: true,
        message: `Package Deleted Successfully`,
        data: inspectionPackage,
      })
    } catch (error) {
      res.status(error.status || HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message:
          error.message ||
          'An Unexpected Error Occured.\nPlease try again later.',
        error: error.name || 'Internal Server Error',
        details: error,
      })
    }
  }
}
