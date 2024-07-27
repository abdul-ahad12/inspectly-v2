import { PrismaService } from '@/prisma/prisma.service'
import { HttpException, HttpStatus, Injectable } from '@nestjs/common'

@Injectable()
export class ReInspectionServiceService {
  constructor(private readonly prismaService: PrismaService) {}

  async createNewInspectionService(name: string) {
    const newService = await this.prismaService.rE_InspectionService.create({
      data: {
        name,
      },
    })

    if (!newService) {
      throw new HttpException(
        {
          success: false,
          message: `Inspection service could not be created`,
          error: newService,
        },
        HttpStatus.BAD_REQUEST,
      )
    }
    return newService
  }
}
