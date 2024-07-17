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
import { z } from 'zod'
import {
  ZcreateConnectAccountRoSchema,
  ZcreatePersonsAccountRoSchema,
} from '@/common/definitions/zod/mech'
// import { ZUploadVerificationDocRoSchema } from '@/common/definitions/zod/files'

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

  async uploadVerificationDocs(
    file: Express.Multer.File,
    purpose: Stripe.FileCreateParams.Purpose,
    fileName: string,
  ): Promise<Stripe.File> {
    const fileUpload = await this.paymentClient.files.create({
      file: {
        data: file.buffer,
        name: fileName,
        type: 'application.octet-stream',
      },
      purpose,
    })

    if (!fileUpload.object) {
      throw new HttpException(
        {
          success: false,
          message: 'Ivalid Request, please check your request parameters.',
          error: {
            message: 'Invalid Request',
            code: HttpStatus.BAD_REQUEST,
          },
        },
        HttpStatus.BAD_REQUEST,
      )
    }
    return fileUpload
  }

  async createPersonAccount(
    body: z.infer<typeof ZcreatePersonsAccountRoSchema>,
  ) {
    try {
      const personAccount = await this.paymentClient.accounts.createPerson(
        body.accountId,
        {
          address: {
            country: 'AU',
            city: body.address.city,
            line1: body.address.line1,
            line2: body.address.line2,
            postal_code: body.address.postal_code,
            state: body.address.state,
          },
          dob: {
            day: body.dob.day,
            month: body.dob.month,
            year: body.dob.year,
          },
          first_name: body.first_name,
          last_name: body.last_name,
          email: body.email,
          gender: body.gender,
          id_number: body.id_number,
          phone: body.phone,
          relationship: {
            owner: body.relationship.owner,
            representative: true,
          },
          verification: {
            document: {
              back: body.id_back,
              front: body.id_front,
            },
          },
        },
      )

      if (!personAccount) {
        throw new HttpException(
          {
            success: false,
            message: 'Person Not Created',
            error: {
              message: "Couldn't create Person's Account",
              code: HttpStatus.BAD_REQUEST,
              error: personAccount,
            },
          },
          HttpStatus.BAD_REQUEST,
        )
      }
      return personAccount
    } catch (error) {
      console.error(error)
      throw new HttpException(
        {
          success: false,
          message: 'Person Not Created',
          code: HttpStatus.INTERNAL_SERVER_ERROR,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }

  async createConnectAccount(
    body: z.infer<typeof ZcreateConnectAccountRoSchema>,
  ) {
    try {
      const connectAccount = await this.paymentClient.accounts.create({
        // type: 'custom',
        country: 'AU',

        business_type: 'company',
        controller: {
          fees: {
            payer: 'application',
          },
          losses: {
            payments: 'application',
          },
          requirement_collection: 'application',
          stripe_dashboard: {
            type: 'none',
          },
        },
        documents: {
          bank_account_ownership_verification: {
            files: body.documents.bank_account_ownership_verification,
          },
          company_license: {
            files: body.documents.licence,
          },
          company_registration_verification: {
            files: body.documents.registration,
          },
        },
        // individual: {
        //   address: {
        //     country: 'AU',
        //     city: body.individual.address.city,
        //     line1: body.individual.address.line1,
        //     line2: body.individual.address.line2,
        //     postal_code: body.individual.address.postal_code,
        //     state: body.individual.address.state
        //   },
        //   dob: {
        //     day: body.individual.dob.day,
        //     month: body.individual.dob.month,
        //     year: body.individual.dob.year
        //   },
        //   first_name: body.individual.first_name,
        //   last_name: body.individual.last_name,
        //   email: body.individual.email,
        //   gender: body.individual.gender,
        //   id_number: body.individual.id_number,
        //   phone: body.individual.phone,
        //   relationship: {
        //     owner: body.individual.relationship.owner
        //   },
        //   verification: {
        //     document: {
        //       back: body.individual.id_back,
        //       front: body.individual.id_front
        //     }
        //   }
        // },
        company: {
          address: body.address,
          name: body.company_name,
          owners_provided: true,
          structure: 'sole_proprietorship',
          tax_id: body.tax_id,
          registration_number: body.abn,
          phone: body.phone,
          verification: {
            document: {
              back: body.individual.id_back,
              front: body.individual.id_front,
            },
          },
        },
        capabilities: {
          au_becs_debit_payments: {
            requested: true,
          },
          card_payments: {
            requested: true,
          },
          transfers: {
            requested: true,
          },
        },
        external_account: {
          account_number: '000123456',
          routing_number: '110000',
          country: 'AU',
          currency: 'AUD',
          account_holder_name: 'Shaik Noorullah',
          object: 'bank_account',
          account_holder_type: '',
        },

        tos_acceptance: {
          date: Number(body.tos_acceptance.date),
          ip: body.tos_acceptance.ip,
        },
        business_profile: {
          mcc: body.business_profile.mcc,
          url: body.business_profile.url,
        },
      })

      if (!connectAccount) {
        throw new HttpException(
          {
            success: false,
            message: 'Person Not Created',
            error: {
              message: "Couldn't create Person's Account",
              code: HttpStatus.BAD_REQUEST,
              error: connectAccount,
            },
          },
          HttpStatus.BAD_REQUEST,
        )
      }
      return connectAccount
    } catch (error) {
      console.error(error)
      throw new HttpException(
        {
          success: false,
          message: 'Person Not Created',
          code: HttpStatus.INTERNAL_SERVER_ERROR,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }

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
