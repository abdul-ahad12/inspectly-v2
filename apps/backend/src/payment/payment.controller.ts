import { Controller, Get, HttpStatus, Post, Req, Res } from '@nestjs/common'
import { PaymentService } from './payment.service'
import { Request, Response } from 'express'
import Stripe from 'stripe'

interface IpaymentInitializeRo {
  orderId: string
  customerId: string
  amount: number
  currency?: string
}

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Get('allowed')
  async getAllowedPaymentMethods() {
    return this.paymentService.getAllowedPaymentMethods()
  }

  @Post('initialize')
  async initializePayment(
    @Req() req: Request<unknown, any, IpaymentInitializeRo>,
    @Res() res: Response,
  ) {
    const { amount, customerId, orderId, currency } = req.body

    try {
      const paymentInitializationObject =
        await this.paymentService.createPaymentIntent(
          orderId,
          customerId,
          amount,
          currency ?? 'aud',
        )
      if (!paymentInitializationObject) {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: `The Payment Could Not Be Initialized: Bad Request. \nPlease check your request params and try again.`,
          error: {
            name: 'BAD_REQUEST',
            message:
              'The Payment Could Not Be Initialized: Bad Request. \nPlease check your request params and try again.',
            code: HttpStatus.BAD_REQUEST,
            error: paymentInitializationObject,
          },
        })
      }

      res.status(HttpStatus.CREATED).json({
        success: true,
        message: 'Payment Initialized Successfully',
        data: paymentInitializationObject,
      })
    } catch (error) {
      console.error('Payment Initialization Error: \n', error)
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message,
        error: {
          name: error.name,
          message: error.message,
          code: HttpStatus.INTERNAL_SERVER_ERROR,
          error: error,
        },
      })
    }
  }

  @Post('method')
  async createPaymentMethod(
    @Req()
    req: Request<
      unknown,
      any,
      {
        paymentMethodType: Stripe.PaymentMethodCreateParams.Type
        details:
          | Stripe.PaymentMethodCreateParams.Card
          | Stripe.PaymentMethodCreateParams.Card
      }
    >,
    @Res() res: Response,
  ) {
    const { paymentMethodType, details } = req.body

    try {
      const paymentMethod = await this.paymentService.createPaymentMethod(
        paymentMethodType,
        details,
      )
      if (!paymentMethod) {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: `The Payment Could Not Be Initialized: Bad Request. \nPlease check your request params and try again.`,
          error: {
            name: 'BAD_REQUEST',
            message:
              'The Payment Could Not Be Initialized: Bad Request. \nPlease check your request params and try again.',
            code: HttpStatus.BAD_REQUEST,
            error: paymentMethod,
          },
        })
      }

      res.status(HttpStatus.CREATED).json({
        success: true,
        message: 'Payment Initialized Successfully',
        data: paymentMethod,
      })
    } catch (error) {
      console.error('Payment Initialization Error: \n', error)
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message,
        error: {
          name: error.name,
          message: error.message,
          code: HttpStatus.INTERNAL_SERVER_ERROR,
          error: error,
        },
      })
    }
  }

  @Post('capture')
  async confirmAndPay(
    @Req()
    req: Request<
      unknown,
      any,
      {
        paymentIntentId: string
        amount: number
        paymentMethodId: string
        returnUrl: string
      }
    >,
    @Res() res: Response,
  ) {
    const { paymentIntentId, paymentMethodId, amount, returnUrl } = req.body

    try {
      const paymentCapture = await this.paymentService.confirmAndCapturePayment(
        paymentIntentId,
        amount,
        paymentMethodId,
        returnUrl,
      )
      if (!paymentCapture) {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: `The Payment Could Not Be Initialized: Bad Request. \nPlease check your request params and try again.`,
          error: {
            name: 'BAD_REQUEST',
            message:
              'The Payment Could Not Be Initialized: Bad Request. \nPlease check your request params and try again.',
            code: HttpStatus.BAD_REQUEST,
            error: paymentCapture,
          },
        })
      }

      res.status(HttpStatus.CREATED).json({
        success: true,
        message: 'Payment Initialized Successfully',
        data: paymentCapture,
      })
    } catch (error) {
      console.error('Payment Initialization Error: \n', error)
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message,
        error: {
          name: error.name,
          message: error.message,
          code: HttpStatus.INTERNAL_SERVER_ERROR,
          error: error,
        },
      })
    }
  }
}
