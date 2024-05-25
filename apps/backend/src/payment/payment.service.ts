import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common'
import { PAYMENT_CLIENT } from './payment.constants'
import Stripe from 'stripe'
import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} from '@prisma/client/runtime/library'
import { PrismaService } from '@/prisma/prisma.service'
import { SocketGateway } from '@/gateways/socket.gateway'
import { CustomerService } from '@/user/customer/customer.service'
import { BookingService } from '@/booking/booking.service'
import { Order, StripeCustomerAccount } from '@prisma/client'
import { updateTransactionInJsonArray } from '@/common/utils/functions/arrays'
import { formatISO } from 'date-fns'

interface IcreatePaymentIntentResponse {
  paymentIntent: Stripe.Response<Stripe.PaymentIntent>
  updatedOrder: Order
  stripeCustomer: Stripe.Response<Stripe.Customer>
  stripeCustomerAccount: StripeCustomerAccount
}

@Injectable()
export class PaymentService {
  constructor(
    @Inject(PAYMENT_CLIENT) private readonly paymentClient: Stripe,
    private readonly prismaService: PrismaService,
    private readonly socketGateway: SocketGateway,
    private readonly customerService: CustomerService,
    private readonly bookingService: BookingService,
  ) {}
  async createPaymentIntent(
    orderId: string,
    customerId: string,
    amount: number,
    currency: string = 'aud',
  ): Promise<IcreatePaymentIntentResponse> {
    try {
      // find the customer
      const customer = await this.customerService.getCustomerById(customerId)

      if (!customerId) {
        throw new HttpException(
          {
            success: false,
            message: `Customer with customer Id: ${customerId} does not exist.\nPlease make sure you're passing the correct information`,
            error: {
              name: 'Bad Request, Validation',
              code: HttpStatus.BAD_REQUEST,
              message: `Customer NOT_FOUND: Customer with customer Id: ${customerId} does not exist.\nPlease make sure you're passing the correct information`,
              error: customer,
            },
          },
          HttpStatus.BAD_REQUEST,
        )
      }

      // create a stripe customer with customer data from our DB
      const stripeCustomer = await this.paymentClient.customers.create({
        address: {
          city: customer.user.savedAddresses[0].city,
          country: 'AU',
          postal_code: customer.user.savedAddresses[0].zipcode,
          line1: customer.user.savedAddresses[0].street,
        },
        name: customer.user.firstName + customer.user.lastName,
        email: customer.email,
        phone: customer.phoneNumber,
        metadata: {
          dateOfOnboarding: `${customer.user.createdAt}`,
          customerId: customerId,
          uerId: customer.userId,
        },
      })
      if (!stripeCustomer) {
        throw new HttpException(
          {
            success: false,
            message: `Could not create the stripe customer`,
            error: {
              name: 'STRIPE_ERROR',
              code: HttpStatus.BAD_REQUEST,
              message: `Strip Customer not created. \nPlease make sure you're passing the correct information`,
              error: stripeCustomer,
            },
          },
          HttpStatus.BAD_REQUEST,
        )
      }

      // using stripe customer, create a payment intent
      const paymentIntent = await this.paymentClient.paymentIntents.create({
        amount: amount,
        currency: currency,
        automatic_payment_methods: {
          enabled: true,
        },
        payment_method_options: {
          card: {
            capture_method: 'manual',
          },
        },
        // application_fee_amount: 1000,
        metadata: {
          customerId: customerId,
          orderId: orderId,
        },
        customer: stripeCustomer.id,
      })
      if (!paymentIntent) {
        throw new HttpException(
          {
            success: false,
            message: 'The payment could not be created, Please try again later',
            error: {
              name: 'UNKNOWN_ERROR',
              message: 'The payment could not be created.',
              code: HttpStatus.BAD_REQUEST,
              error:
                paymentIntent instanceof PrismaClientValidationError ||
                paymentIntent instanceof PrismaClientKnownRequestError
                  ? paymentIntent
                  : null,
            },
          },
          HttpStatus.BAD_REQUEST,
        )
      }
      // create stripeCustomerAccount and update the customer with it
      const updatedCustomer = await this.customerService.updateCustomerById(
        customerId,
        {
          StripeCustomerAccount: {
            create: {
              stripeCustomerId: stripeCustomer.id,
              paymentIntents: [
                {
                  id: paymentIntent.id,
                  amount: paymentIntent.amount,
                  status: paymentIntent.status,
                  amountRecieved: paymentIntent.amount_received,
                  createdAt: formatISO(paymentIntent.created),
                  lastUpdated: formatISO(new Date()),
                },
              ],
            },
          },
        },
      )

      if (!updatedCustomer) {
        throw new HttpException(
          {
            success: false,
            message:
              "Could not update the customer, \n Make sure you're making the right request",
            error: updatedCustomer,
          },
          HttpStatus.BAD_REQUEST,
        )
      }

      // update the order with paymentId
      const updatedOrder = await this.bookingService.updateOrderByOrderId(
        orderId,
        {
          paymentId: paymentIntent.id,
        },
      )

      // extract customer stripe account from updated customer
      const { stripeCustomerAccount } = updatedCustomer

      this.socketGateway.notifyCustomer(
        customerId,
        'Payment Initiated Successfully',
      )

      return {
        paymentIntent: paymentIntent,
        updatedOrder: updatedOrder,
        stripeCustomer: stripeCustomer,
        stripeCustomerAccount: stripeCustomerAccount,
      }
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'An unknown exception has occured, Please try again later.',
          code: HttpStatus.INTERNAL_SERVER_ERROR,
          error: error,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }

  async createPaymentMethod(
    paymentMethodType: Stripe.PaymentMethodCreateParams.Type,
    details:
      | Stripe.PaymentMethodCreateParams.Card1
      | Stripe.PaymentMethodCreateParams.Card2,
  ) {
    const paymentMethod = await this.paymentClient.paymentMethods.create({
      type: paymentMethodType,
      card: details,
    })

    if (!paymentMethod) {
      throw new HttpException(
        {
          success: false,
          message: 'Could not initiate payment, please try again later.',
          error: {
            name: 'UNKNOWN_ERROR',
            message: 'The paymentMethod could not be created.',
            code: HttpStatus.BAD_REQUEST,
            error:
              paymentMethod instanceof PrismaClientValidationError ||
              paymentMethod instanceof PrismaClientKnownRequestError
                ? paymentMethod
                : null,
          },
        },
        HttpStatus.BAD_REQUEST,
      )
    }
    return paymentMethod
  }

  async confirmAndCapturePayment(
    paymentIntentId: string,
    amount: number,
    paymentMethodId: string,
    returnUrl: string,
  ) {
    const confirmIntent = await this.paymentClient.paymentIntents.confirm(
      paymentIntentId,
      {
        payment_method: paymentMethodId,
        return_url: returnUrl,
      },
    )

    if (!confirmIntent) {
      throw new HttpException(
        {
          success: false,
          message: 'Could not confirm payment, please try again later.',
          error: {
            name: 'UNKNOWN_ERROR',
            message: 'The payment could not be confirmed.',
            code: HttpStatus.BAD_REQUEST,
            error:
              confirmIntent instanceof PrismaClientValidationError ||
              confirmIntent instanceof PrismaClientKnownRequestError
                ? confirmIntent
                : null,
          },
        },
        HttpStatus.BAD_REQUEST,
      )
    }

    const customerStripeAcc =
      await this.prismaService.stripeCustomerAccount.findFirst({
        where: {
          customerId: confirmIntent.metadata.customerId,
        },
      })

    const updatedJsonArray = updateTransactionInJsonArray<{
      id: string
      amount: number
      status: string
      amountRecieved: number
      createdAt: string
      lastUpdated: string
    }>({
      transactionId: confirmIntent.id,
      transactionArray: customerStripeAcc.paymentIntents as unknown as [],
      updateTransaction: {
        amountRecieved: confirmIntent.amount_received,
        status: confirmIntent.status,
        lastUpdated: formatISO(new Date()),
      },
    })

    const updatedCustomerStripeAcc =
      await this.prismaService.stripeCustomerAccount.update({
        where: {
          customerId: confirmIntent.metadata.customerId,
        },
        data: {
          paymentIntents: updatedJsonArray,
        },
      })

    const capturePayment = await this.paymentClient.paymentIntents.capture(
      paymentIntentId,
      {
        amount_to_capture: amount,
      },
    )
    if (!capturePayment) {
      throw new HttpException(
        {
          success: false,
          message: 'Could not capture payment, please try again later.',
          error: {
            name: 'UNKNOWN_ERROR',
            message: 'The payment could not be captured.',
            code: HttpStatus.BAD_REQUEST,
            error:
              capturePayment instanceof PrismaClientValidationError ||
              capturePayment instanceof PrismaClientKnownRequestError
                ? capturePayment
                : null,
          },
        },
        HttpStatus.BAD_REQUEST,
      )
    }

    return { capturePayment, updatedCustomerStripeAcc }
  }

  async handlePaymentSuccess(
    orderId: string,
    paymentId: string,
  ): Promise<void> {
    // Update order status
    await this.prismaService.order.update({
      where: { id: orderId },
      data: { isFullfilled: true, paymentId: paymentId },
    })

    // Notify mechanics via WebSocket
    // this.socketGateway.notifyMechanics("New booking available")
  }

  async getAllowedPaymentMethods(): Promise<any> {
    const paymentMethods =
      await this.paymentClient.paymentMethodConfigurations.list({
        // customer: 'your-customer-id', // Replace with dynamic customer ID if necessary
      })
    return paymentMethods
  }
}
