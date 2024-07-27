import { ZCreateInspectionPackageRoSchema } from '@/common/definitions/zod/packages/create'
import { ZUpdateInspectionPackagePrice } from '@/common/definitions/zod/packages/update'
import { parseReqBodyAndValidate } from '@/common/utils/parseReqBody'
import { PrismaService } from '@/prisma/prisma.service'
import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { z } from 'zod'

@Injectable()
export class ReBookingPackageService {
  constructor(private readonly prismaService: PrismaService) {}

  async createPackage(
    reqBody: z.infer<typeof ZCreateInspectionPackageRoSchema>,
  ) {
    const data: Prisma.PackageCreateInput = {
      name: reqBody['name'],
      description: reqBody['description'],
      price: reqBody['price'],
      strikePrice: reqBody['strikePrice'],
      items: reqBody['items'],
      perks: reqBody['perks'],
    }
    try {
      const newPackage = await this.prismaService.rE_Package.create({
        data: data,
      })
      if (!newPackage) {
        throw new HttpException(
          'The Inspection Package could not be created',
          HttpStatus.BAD_REQUEST,
        )
      }
      return newPackage
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

  async getAllPackages() {
    try {
      const allPackages = await this.prismaService.rE_Package.findMany({})
      if (!allPackages) {
        throw new HttpException(
          'Could not fetch all packages,\n please try again.',
          HttpStatus.BAD_REQUEST,
        )
      }
      return allPackages
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
  async getPackageById(id: string) {
    try {
      const allPackages = await this.prismaService.rE_Package.findMany({
        where: {
          id: id,
        },
      })
      if (!allPackages) {
        throw new HttpException(
          'Could not fetch all packages,\n please try again.',
          HttpStatus.BAD_REQUEST,
        )
      }
      return allPackages
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

  async getOrdersByPackageId(id: string) {
    try {
      const allPackages = await this.prismaService.rE_Package.findMany({
        where: {
          id: id,
        },
        include: {
          RE_Order: true,
          RE_Booking: true,
        },
      })
      if (!allPackages) {
        throw new HttpException(
          'Could not fetch all packages,\n please try again.',
          HttpStatus.BAD_REQUEST,
        )
      }
      return allPackages
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

  async getBookingsByPackageId(id: string) {
    try {
      const allPackages = await this.prismaService.rE_Package.findMany({
        where: {
          id: id,
        },
        include: {
          RE_Booking: true,
          RE_Order: true,
        },
      })
      if (!allPackages) {
        throw new HttpException(
          'Could not fetch all packages,\n please try again.',
          HttpStatus.BAD_REQUEST,
        )
      }
      return allPackages
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
  async updatePackagePrice(
    id: string,
    reqBody: z.infer<typeof ZUpdateInspectionPackagePrice>,
  ) {
    const data: Prisma.PackageUpdateInput = {
      price: reqBody['price'],
      strikePrice: reqBody['strikePrice'],
    }
    if (!parseReqBodyAndValidate(ZUpdateInspectionPackagePrice, reqBody)) {
      throw new HttpException(
        {
          name: 'Request Validation',
          message:
            "Request Validation failed!, please ensure you're sending the right request",
          code: '400',
          error: ZUpdateInspectionPackagePrice.safeParse(reqBody).error,
        },
        HttpStatus.BAD_REQUEST,
      )
    }
    try {
      const newPackage = await this.prismaService.rE_Package.update({
        where: {
          id: id,
        },
        data: data,
      })
      if (!newPackage) {
        throw new HttpException(
          'The Inspection Package could not be created',
          HttpStatus.BAD_REQUEST,
        )
      }
      return newPackage
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
  async updatePackage(
    id: string,
    reqBody: Partial<z.infer<typeof ZUpdateInspectionPackagePrice>>,
  ) {
    const data: Prisma.PackageUpdateInput = {
      ...reqBody,
    }
    if (
      !parseReqBodyAndValidate(ZUpdateInspectionPackagePrice.partial(), reqBody)
    ) {
      throw new HttpException(
        {
          name: 'Request Validation',
          message:
            "Request Validation failed!, please ensure you're sending the right request",
          code: '400',
          error: ZUpdateInspectionPackagePrice.safeParse(reqBody).error,
        },
        HttpStatus.BAD_REQUEST,
      )
    }
    try {
      const updatedPackage = await this.prismaService.rE_Package.update({
        where: {
          id: id,
        },
        data: data,
      })
      if (!updatedPackage) {
        throw new HttpException(
          'The Inspection Package could not be created',
          HttpStatus.BAD_REQUEST,
        )
      }
      return updatedPackage
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
  async deletePackage(id: string) {
    try {
      const updatedPackage = await this.prismaService.rE_Package.delete({
        where: {
          id: id,
        },
      })
      if (!updatedPackage) {
        throw new HttpException(
          'The Inspection Package could not be created',
          HttpStatus.BAD_REQUEST,
        )
      }
      return updatedPackage
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
