import {
  Controller,
  Post,
  UsePipes,
  Req,
  Res,
  HttpStatus,
  Get,
  Patch,
  Delete,
} from '@nestjs/common'
import { UserService } from './user.service'
import { ZodValidationPipe } from 'src/common/pipes/zod'
import { zodSignupRequestSchema } from 'src/common/definitions/zod/signupRequestSchema'
import { Request, Response } from 'express'
import { parseReqBodyAndValidate } from 'src/common/utils/parseReqBody'
import { CustomerService } from './customer/customer.service'

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly customerService: CustomerService,
  ) {}

  @Post('customer')
  @UsePipes(new ZodValidationPipe(zodSignupRequestSchema))
  async createCustomer(@Req() req: Request, @Res() res: Response) {
    const { body } = req

    // don't think this will ever execute because of the validation pipe.
    // After verification, remove this.
    if (!parseReqBodyAndValidate(zodSignupRequestSchema, body)) {
      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: 'The provided body is not of expected shape',
        error: zodSignupRequestSchema.safeParse(body).error,
      })
    }

    try {
      const user = await this.userService.createUser(body)

      try {
        // Call the customerService.createCustomer method and await its result
        const customer = await this.customerService.createCustomer(user)

        res.status(HttpStatus.CREATED).json({
          success: true,
          message: 'User Created Successfully',
          data: customer,
        })
      } catch (error: unknown) {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: 'Could not create the customer',
          error: error,
        })
      }
    } catch (error: unknown) {
      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: 'Could not create the user',
        error: error,
      })
    }
  }

  @Get('customer')
  async getAllCustomers(@Res() res: Response) {
    try {
      const allCustomers = await this.customerService.getAllCustomers()
      res.status(HttpStatus.OK).json({
        success: true,
        message: `Found ${allCustomers.length} customers!`,
        data: allCustomers,
      })
    } catch (error: unknown) {
      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: 'Could not find customers',
        error: error,
      })
    }
  }
  @Get('customer/:id')
  async getCustomerById(@Req() req: Request, @Res() res: Response) {
    const { id } = req.params
    if (!id) {
    }
    try {
      const customer = await this.customerService.getCustomerById(id)
      res.status(HttpStatus.OK).json({
        success: true,
        message: `Found customer!`,
        data: customer,
      })
    } catch (error: unknown) {
      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: `Could not find the customer with id:${id}`,
        error: error,
      })
    }
  }

  @Get(':id/customer')
  async getCustomerByUserId(@Req() req: Request, @Res() res: Response) {
    const { id } = req.params
    if (!id) {
    }
    try {
      const customer = await this.customerService.getCustomerByUserId(id)
      res.status(HttpStatus.OK).json({
        success: true,
        message: `Found customer!`,
        data: customer,
      })
    } catch (error: unknown) {
      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: `Could not find the customer with userId:${id}`,
        error: error,
      })
    }
  }

  @Patch('customer/:id')
  async updateCustomerById(@Req() req: Request, @Res() res: Response) {
    const { body, params } = req

    try {
      if (!params.id || !body.customer) {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: 'The request is invalid,\n please provide a valid request',
          error: new Error('Invalid Request Body'),
        })
      }
      const updatedCustomer = await this.customerService.updateCustomerById(
        params.id,
        body.customer,
      )
      res.status(HttpStatus.OK).json({
        success: true,
        message: `Found customer!`,
        data: updatedCustomer,
      })
    } catch (error) {
      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: `Could not find the customer with id:${params.id}`,
        error: error,
      })
    }
  }

  @Patch('customer')
  async updateCustomersByFilters(@Req() req: Request, @Res() res: Response) {
    const { body } = req

    try {
      if (!body.filter || !body.update) {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: 'The request is invalid,\n please provide a valid request',
          error: new Error('Invalid Request Body'),
        })
      }
      const updatedCustomers =
        await this.customerService.updateMultipleCustomersByfilters(
          JSON.parse(body.filter),
          JSON.parse(body.update),
        )
      res.status(HttpStatus.OK).json({
        success: true,
        message: `Found customer!`,
        data: updatedCustomers,
      })
    } catch (error) {
      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: `Could not find the customers for given filters`,
        error: error,
      })
    }
  }

  @Delete('customer/:id')
  async deleteCustomerById(@Req() req: Request, @Res() res: Response) {
    const { id } = req.params

    try {
      if (!id) {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: 'The request is invalid,\n please provide a valid request',
          error: new Error('Invalid Request Body'),
        })
      }
      const deletedCustomer = await this.customerService.deleteCustomerById(id)
      res.status(HttpStatus.OK).json({
        success: true,
        message: `Deleted customer!`,
        data: deletedCustomer,
      })
    } catch (error) {
      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: `Could not find the customer with id:${id}`,
        error: error,
      })
    }
  }

  // @Post('mechanic')
  // @UsePipes(new ZodValidationPipe(zodSignupRequestSchema))
  // createMechanic(@Req() req: Request, @Res() res: Response) {
  //     const { body } = req

  //     // don't think this will ever execute because of the validation pipe.
  //     // After verification, remove this.
  //     if (!parseReqBodyAndValidate(zodSignupRequestSchema, body)) {
  //         res.status(HttpStatus.BAD_REQUEST).json({
  //             success: false,
  //             message: 'The provided body is not of expected shape',
  //             error: new Error("Bad Request: Body Type Invalid!"),
  //         })
  //     }

  //     try {
  //         const user: Promise<User | Error> = this.userService.create(body)
  //         res.status(HttpStatus.CREATED).json({
  //             success: true,
  //             message: 'User Created Successfully',
  //             data: user
  //         })
  //     } catch (error: unknown) {
  //         throw error
  //     }
  // }

  // @Get('')
  // find(@Req() req: Request, @Res() res: Response) {
  //     try {
  //         const user: Promise<User | Error> = this.userService.create(body)
  //         res.status(HttpStatus.CREATED).json({
  //             success: true,
  //             message: 'User Created Successfully',
  //             data: user
  //         })
  //     } catch (error: unknown) {
  //         throw error
  //     }
  // }
  // @Get(':id')
  // findById(@Req() req: Request, @Res() res: Response) {
  //     try {
  //         const user: Promise<User | Error> = this.userService.create(body)
  //         res.status(HttpStatus.CREATED).json({
  //             success: true,
  //             message: 'User Created Successfully',
  //             data: user
  //         })
  //     } catch (error: unknown) {
  //         throw error
  //     }
  // }
  // @Get(':phone')
  // findByPhone(@Req() req: Request, @Res() res: Response) {
  //     try {
  //         const user: Promise<User | Error> = this.userService.create(body)
  //         res.status(HttpStatus.CREATED).json({
  //             success: true,
  //             message: 'User Created Successfully',
  //             data: user
  //         })
  //     } catch (error: unknown) {
  //         throw error
  //     }
  // }

  // @Get('all')
  // findAll(@Req() req: Request, @Res() res: Response) {
  //     try {
  //         const user: Promise<User | Error> = this.userService.create(body)
  //         res.status(HttpStatus.CREATED).json({
  //             success: true,
  //             message: 'User Created Successfully',
  //             data: user
  //         })
  //     } catch (error: unknown) {
  //         throw error
  //     }
  // }
  // @Patch(':id')
  // updateById(@Req() req: Request, @Res() res: Response) {
  //     try {
  //         const user: Promise<User | Error> = this.userService.create(body)
  //         res.status(HttpStatus.CREATED).json({
  //             success: true,
  //             message: 'User Created Successfully',
  //             data: user
  //         })
  //     } catch (error: unknown) {
  //         throw error
  //     }
  // }

  // @Delete(':id')
  // deleteById(@Req() req: Request, @Res() res: Response) {
  //     try {
  //         const user: Promise<User | Error> = this.userService.create(body)
  //         res.status(HttpStatus.CREATED).json({
  //             success: true,
  //             message: 'User Created Successfully',
  //             data: user
  //         })
  //     } catch (error: unknown) {
  //         throw error
  //     }
  // }
}
