import {
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common'
import { PaymentService } from './payment.service'
import { Request, Response } from 'express'
import { RolesGuard } from '@/guards/roles.guard'
import { UserRole } from '@prisma/client'
import { AuthGuard } from '@/guards/auth.guard'
import { Roles } from '@/decorators/roles.decorator'

interface Req extends Request {
  user: {
    id: string
    role: string
  }
}

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  // @Get('allowed')
  // async getAllowedPaymentMethods() {
  //   return this.paymentService.getAllowedPaymentMethods()
  // }

  // @Post('initialize')
  // async initializePayment(
  //   @Req() req: Request<unknown, any, IpaymentInitializeRo>,
  //   @Res() res: Response,
  // ) {
  //   const { amount, customerId, orderId, currency } = req.body

  //   try {
  //     const paymentInitializationObject =
  //       await this.paymentService.createPaymentIntent(
  //         orderId,
  //         customerId,
  //         amount,
  //         currency ?? 'aud',
  //       )
  //     if (!paymentInitializationObject) {
  //       res.status(HttpStatus.BAD_REQUEST).json({
  //         success: false,
  //         message: `The Payment Could Not Be Initialized: Bad Request. \nPlease check your request params and try again.`,
  //         error: {
  //           name: 'BAD_REQUEST',
  //           message:
  //             'The Payment Could Not Be Initialized: Bad Request. \nPlease check your request params and try again.',
  //           code: HttpStatus.BAD_REQUEST,
  //           error: paymentInitializationObject,
  //         },
  //       })
  //     }

  //     res.status(HttpStatus.CREATED).json({
  //       success: true,
  //       message: 'Payment Initialized Successfully',
  //       data: paymentInitializationObject,
  //     })
  //   } catch (error) {
  //     console.error('Payment Initialization Error: \n', error)
  //     res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
  //       success: false,
  //       message: error.message,
  //       error: {
  //         name: error.name,
  //         message: error.message,
  //         code: HttpStatus.INTERNAL_SERVER_ERROR,
  //         error: error,
  //       },
  //     })
  //   }
  // }

  // @Post('method')
  // async createPaymentMethod(
  //   @Req()
  //   req: Request<
  //     unknown,
  //     any,
  //     {
  //       paymentMethodType: Stripe.PaymentMethodCreateParams.Type
  //       details:
  //       | Stripe.PaymentMethodCreateParams.Card1
  //       | Stripe.PaymentMethodCreateParams.Card2
  //     }
  //   >,
  //   @Res() res: Response,
  // ) {
  //   const { paymentMethodType, details } = req.body

  //   try {
  //     const paymentMethod = await this.paymentService.createPaymentMethod(
  //       paymentMethodType,
  //       details,
  //     )
  //     if (!paymentMethod) {
  //       res.status(HttpStatus.BAD_REQUEST).json({
  //         success: false,
  //         message: `The Payment Could Not Be Initialized: Bad Request. \nPlease check your request params and try again.`,
  //         error: {
  //           name: 'BAD_REQUEST',
  //           message:
  //             'The Payment Could Not Be Initialized: Bad Request. \nPlease check your request params and try again.',
  //           code: HttpStatus.BAD_REQUEST,
  //           error: paymentMethod,
  //         },
  //       })
  //     }

  //     res.status(HttpStatus.CREATED).json({
  //       success: true,
  //       message: 'Payment Initialized Successfully',
  //       data: paymentMethod,
  //     })
  //   } catch (error) {
  //     console.error('Payment Initialization Error: \n', error)
  //     res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
  //       success: false,
  //       message: error.message,
  //       error: {
  //         name: error.name,
  //         message: error.message,
  //         code: HttpStatus.INTERNAL_SERVER_ERROR,
  //         error: error,
  //       },
  //     })
  //   }
  // }

  // @Post('capture')
  // async confirmAndPay(
  //   @Req()
  //   req: Request<
  //     unknown,
  //     any,
  //     {
  //       paymentIntentId: string
  //       amount: number
  //       paymentMethodId: string
  //       returnUrl: string
  //     }
  //   >,
  //   @Res() res: Response,
  // ) {
  //   const { paymentIntentId, paymentMethodId, amount, returnUrl } = req.body

  //   try {
  //     const paymentCapture = await this.paymentService.confirmAndCapturePayment(
  //       paymentIntentId,
  //       amount,
  //       paymentMethodId,
  //       returnUrl,
  //     )
  //     if (!paymentCapture) {
  //       res.status(HttpStatus.BAD_REQUEST).json({
  //         success: false,
  //         message: `The Payment Could Not Be Initialized: Bad Request. \nPlease check your request params and try again.`,
  //         error: {
  //           name: 'BAD_REQUEST',
  //           message:
  //             'The Payment Could Not Be Initialized: Bad Request. \nPlease check your request params and try again.',
  //           code: HttpStatus.BAD_REQUEST,
  //           error: paymentCapture,
  //         },
  //       })
  //     }

  //     res.status(HttpStatus.CREATED).json({
  //       success: true,
  //       message: 'Payment Initialized Successfully',
  //       data: paymentCapture,
  //     })
  //   } catch (error) {
  //     console.error('Payment Initialization Error: \n', error)
  //     res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
  //       success: false,
  //       message: error.message,
  //       error: {
  //         name: error.name,
  //         message: error.message,
  //         code: HttpStatus.INTERNAL_SERVER_ERROR,
  //         error: error,
  //       },
  //     })
  //   }
  // }

  // @Get('accounts')
  // async getAllConnectAccounts(@Req() req: Request, @Res() res: Response) {
  //   try {
  //     const accounts = await this.paymentService.getAllConnectAccounts()
  //     res.status(HttpStatus.OK).json({
  //       success: true,
  //       message: `Found ${accounts.data.length} connect accounts`,
  //       data: accounts.data,
  //     })
  //   } catch (error) { }
  // }

  // @Post('transfer')
  // async transferFunds(@Req() req: Request, @Res() res: Response) { }

  @Post('customer/process-payment')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
  async processCustomerPayment(@Req() req: Req, @Res() res: Response) {
    try {
      const { orderId, amount, currency } = req.body
      const customerId = req.user.id
      const result = await this.paymentService.processCustomerPayment(
        orderId,
        customerId,
        amount,
        currency,
      )
      res.status(200).json(result)
    } catch (error) {
      res.status(error.statusCode || 500).json({ error: error.message })
    }
  }

  @Post('customer/add-payment-method')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
  async addPaymentMethod(@Req() req: Req, @Res() res: Response) {
    try {
      const customerId = req.user.id
      const paymentMethodData = req.body
      const result = await this.paymentService.addPaymentMethod(
        customerId,
        paymentMethodData,
      )
      res.status(200).json(result)
    } catch (error) {
      res.status(error.statusCode || 500).json({ error: error.message })
    }
  }

  @Get('customer/payment-methods')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
  async listPaymentMethods(@Req() req: Req, @Res() res: Response) {
    try {
      const customerId = req.user.id
      const paymentMethods =
        await this.paymentService.listPaymentMethods(customerId)
      res.status(200).json(paymentMethods)
    } catch (error) {
      res.status(error.statusCode || 500).json({ error: error.message })
    }
  }

  @Put('customer/payment-method/:paymentMethodId')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
  async updatePaymentMethod(@Req() req: Req, @Res() res: Response) {
    try {
      const customerId = req.user.id
      const { paymentMethodId } = req.params
      const updateData = req.body
      const result = await this.paymentService.updatePaymentMethod(
        customerId,
        paymentMethodId,
        updateData,
      )
      res.status(200).json(result)
    } catch (error) {
      res.status(error.statusCode || 500).json({ error: error.message })
    }
  }

  @Delete('customer/payment-method/:paymentMethodId')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
  async deletePaymentMethod(@Req() req: Req, @Res() res: Response) {
    try {
      const customerId = req.user.id
      const { paymentMethodId } = req.params
      await this.paymentService.deletePaymentMethod(customerId, paymentMethodId)
      res.status(204).send()
    } catch (error) {
      res.status(error.statusCode || 500).json({ error: error.message })
    }
  }

  @Post('customer/pay-order')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
  async payForOrder(@Req() req: Req, @Res() res: Response) {
    try {
      const customerId = req.user.id
      const { orderId, paymentMethodId } = req.body
      const result = await this.paymentService.payForOrder(
        customerId,
        orderId,
        paymentMethodId,
      )
      res.status(200).json(result)
    } catch (error) {
      res.status(error.statusCode || 500).json({ error: error.message })
    }
  }

  // Service Provider Endpoints

  @Post('service-provider/create-connect-account')
  async createServiceProviderConnectAccount(
    @Req() req: Req,
    @Res() res: Response,
  ) {
    try {
      const userId = req.user.id
      const result =
        await this.paymentService.createServiceProviderConnectAccount(
          userId,
          req.body,
        )
      res.status(200).json(result)
    } catch (error) {
      res.status(error.statusCode || 500).json({ error: error.message })
    }
  }

  @Post('service-provider/add-bank-account')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.MECHANIC || UserRole.REAGENT)
  async addBankAccount(@Req() req: Req, @Res() res: Response) {
    try {
      const userId = req.user.id
      const bankAccountData = req.body
      const result = await this.paymentService.addBankAccount(
        userId,
        bankAccountData,
      )
      res.status(200).json(result)
    } catch (error) {
      res.status(error.statusCode || 500).json({ error: error.message })
    }
  }

  @Post('service-provider/initiate-payout')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.MECHANIC || UserRole.REAGENT)
  async initiatePayout(@Req() req: Req, @Res() res: Response) {
    try {
      const userId = req.user.id
      const { amount } = req.body
      const result = await this.paymentService.initiatePayout(userId, amount)
      res.status(200).json(result)
    } catch (error) {
      res.status(error.statusCode || 500).json({ error: error.message })
    }
  }

  @Post('service-provider/upload-verification-documents')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.MECHANIC || UserRole.REAGENT)
  async uploadVerificationDocuments(@Req() req: Req, @Res() res: Response) {
    try {
      const userId = req.user.id
      const documentData = req.body
      const result = await this.paymentService.uploadVerificationDocuments(
        userId,
        documentData,
      )
      res.status(200).json(result)
    } catch (error) {
      res.status(error.statusCode || 500).json({ error: error.message })
    }
  }

  @Post('admin/initiate-refund')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async initiateRefund(@Req() req: Req, @Res() res: Response) {
    try {
      const userId = req.user.id
      const { paymentIntentId, amount } = req.body
      const result = await this.paymentService.initiateRefund(
        userId,
        paymentIntentId,
        amount,
      )
      res.status(200).json(result)
    } catch (error) {
      res.status(error.statusCode || 500).json({ error: error.message })
    }
  }

  @Get('admin/connect-accounts')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async listConnectAccounts(@Req() req: Req, @Res() res: Response) {
    try {
      const accounts = await this.paymentService.listConnectAccounts()
      res.status(200).json(accounts)
    } catch (error) {
      res.status(error.statusCode || 500).json({ error: error.message })
    }
  }

  @Get('admin/connect-account/:accountId')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getConnectAccountDetails(@Req() req: Req, @Res() res: Response) {
    try {
      const { accountId } = req.params
      const account =
        await this.paymentService.getConnectAccountDetails(accountId)
      res.status(200).json(account)
    } catch (error) {
      res.status(error.statusCode || 500).json({ error: error.message })
    }
  }

  @Get('admin/platform-transactions')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getPlatformTransactions(@Req() req: Req, @Res() res: Response) {
    try {
      const { startDate, endDate, type } = req.query
      const transactions = await this.paymentService.getPlatformTransactions(
        new Date(startDate as string),
        new Date(endDate as string),
        type as any,
      )
      res.status(200).json(transactions)
    } catch (error) {
      res.status(error.statusCode || 500).json({ error: error.message })
    }
  }

  @Get('admin/revenue-report')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async generateRevenueReport(@Req() req: Req, @Res() res: Response) {
    try {
      const { startDate, endDate } = req.query
      const report = await this.paymentService.generateRevenueReport(
        new Date(startDate as string),
        new Date(endDate as string),
      )
      res.status(200).json(report)
    } catch (error) {
      res.status(error.statusCode || 500).json({ error: error.message })
    }
  }

  @Put('admin/platform-settings')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async updatePlatformSettings(@Req() req: Req, @Res() res: Response) {
    try {
      const userId = req.user.id
      const settings = req.body
      const result = await this.paymentService.updatePlatformSettings(
        userId,
        settings,
      )
      res.status(200).json(result)
    } catch (error) {
      res.status(error.statusCode || 500).json({ error: error.message })
    }
  }
}
