import { Controller, HttpStatus, Post, Req, Res } from '@nestjs/common'
import { Request, Response } from 'express'
import { InspectionServiceService } from './inspection-service.service'

@Controller('inspection-service')
export class InspectionServiceController {
  constructor(private readonly inspectionService: InspectionServiceService) {}

  @Post('')
  async createInspectionService(@Req() req: Request, @Res() res: Response) {
    const { name } = req.body

    try {
      const newService = this.inspectionService.createNewInspectionService(name)

      if (!newService) {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: `The inspection service could not be created`,
          error: {
            name: 'VALIDATION_ERROR',
            message:
              'Inspection Service could not be created, please check your request and try again.',
            code: HttpStatus.BAD_REQUEST,
            error: newService,
          },
        })
      }

      res.status(HttpStatus.CREATED).json({
        success: true,
        message: 'Inspection Service created successfully',
        data: newService,
      })
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'The inspection service could not be created.',
        error: {
          name: 'UNKNOWN_EXCEPTION',
          message: 'could not create inspection service.',
          error: error,
        },
      })
    }
  }
}
