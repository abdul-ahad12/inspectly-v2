import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { PAYMENT_CLIENT } from './payment.constants'
import Stripe from 'stripe'
import { PrismaService } from '@/prisma/prisma.service'
import { SocketGateway } from '@/gateways/socket.gateway'
import { BookingService } from '@/booking/booking.service'
import {
  AdminStripeActionType,
  BankVerificationStatus,
  DocumentType,
  PaymentMethodType,
  PlatformTransactionType,
  TransactionStatus,
  VerificationStatus,
  VerificationType,
} from '@prisma/client'
import { z } from 'zod'
import { ZcreateConnectAccountRoSchema } from '@/common/definitions/zod/mech'
import { ZUploadVerificationDocRoSchema } from '@/common/definitions/zod/files'
import { Logger } from 'winston'

type StripeTokenParams =
  | { type: 'bank_account'; data: Stripe.TokenCreateParams.BankAccount }
  | { type: 'card'; data: Stripe.TokenCreateParams.Card }
  | { type: 'pii'; data: Stripe.TokenCreateParams.Pii }
  | { type: 'account'; data: Stripe.TokenCreateParams.Account }

@Injectable()
export class PaymentService {
  constructor(
    @Inject(PAYMENT_CLIENT) private readonly paymentClient: Stripe,
    private prisma: PrismaService,
    private socketGateway: SocketGateway,
    private bookingService: BookingService,
    @Inject('WINSTON_LOGGER') protected readonly logger: Logger,
    // private baseService: BaseService,
  ) {}

  private logError(
    message: string,
    error: any,
    metadata?: Record<string, any>,
  ) {
    this.logger.error(message, {
      error: {
        message: error.message,
        stack: error.stack,
      },
      metadata,
    })
  }

  async getCustomerById(id: string) {
    try {
      return this.prisma.customer.findUnique({
        where: {
          id: id,
        },
        include: {
          customerStripeData: {
            include: {
              paymentIntents: true,
              paymentMethods: true,
              payments: true,
            },
          },
        },
      })
    } catch (error) {
      this.logError('Error in getCustomerById', error, { customerId: id })
      throw error
    }
  }

  // Pure Stripe Interaction Methods

  private async createStripeCustomer(
    customerData: Stripe.CustomerCreateParams,
  ): Promise<Stripe.Customer> {
    try {
      // ensure the customerData includes metadata field with customerId
      return await this.paymentClient.customers.create(customerData)
    } catch (error) {
      this.logError('Failed to create Stripe customer', error, { customerData })
      throw error
    }
  }

  async addStripeCustomer(
    customerData: Stripe.CustomerCreateParams,
  ): Promise<Stripe.Customer> {
    try {
      const customer = await this.createStripeCustomer(customerData)

      await this.prisma.customerStripeData.create({
        data: {
          customer: {
            connect: {
              id: customer.metadata.customerId,
            },
          },
          stripeCustomerId: customer.id,
          totalSpent: 0,
        },
      })

      return customer
    } catch (error) {
      this.logError('Failed to add Stripe customer', error, { customerData })
      throw error
    }
  }

  private async createStripePaymentIntent(
    paymentIntentData: Stripe.PaymentIntentCreateParams,
  ): Promise<Stripe.PaymentIntent> {
    try {
      return await this.paymentClient.paymentIntents.create(paymentIntentData)
    } catch (error) {
      this.logError('Failed to create payment intent', error, {
        paymentIntentData,
      })
      throw error
    }
  }

  // TODO
  // upload to our storage as well and save the links in a document model in our db.
  async uploadFileToStripe(
    file: Buffer,
    purpose: Stripe.FileCreateParams.Purpose,
    fileName: string,
  ): Promise<Stripe.File> {
    try {
      const stripeFile = await this.paymentClient.files.create({
        file: {
          data: file,
          name: fileName,
          type: 'application/octet-stream',
        },
        purpose: purpose,
      })

      return stripeFile
    } catch (error) {
      this.logError('Failed to upload file to Stripe', error, {
        fileName,
        purpose,
      })
      throw error
    }
  }

  async uploadVerificationDocuments(
    userId: string,
    documentData: z.infer<typeof ZUploadVerificationDocRoSchema>,
  ): Promise<Stripe.File> {
    try {
      const serviceProviderStripeData =
        await this.prisma.serviceProviderStripeData.findFirst({
          where: { serviceProviderId: userId },
        })

      if (!serviceProviderStripeData) {
        throw new Error('Service provider stripe data not found')
      }

      const stripeFile = await this.paymentClient.files.create({
        file: {
          data: documentData.file,
          name: documentData.fileName,
          type: 'application/octet-stream',
        },
        purpose: documentData.purpose as Stripe.FileCreateParams.Purpose,
      })

      const { documentType, verificationType } = this.mapPurposeToTypes(
        documentData.purpose,
      )

      await this.prisma.serviceProviderDocument.create({
        data: {
          serviceProviderStripeDataId: serviceProviderStripeData.id,
          documentType,
          verificationType,
          documentUrl: stripeFile.id,
          verificationStatus: VerificationStatus.PENDING,
          stripePurpose: documentData.purpose,
        },
      })

      return stripeFile
    } catch (error) {
      this.logError('Failed to upload verification document', error, {
        userId,
        documentData,
      })
      throw error
    }
  }

  private mapPurposeToTypes(purpose: string): {
    documentType: DocumentType
    verificationType: VerificationType
  } {
    switch (purpose) {
      case 'identity_document':
        return {
          documentType: DocumentType.IDENTITY_DOCUMENT,
          verificationType: VerificationType.IDENTITY,
        }
      case 'bank_account_ownership_verification':
        return {
          documentType: DocumentType.BANK_OWNERSHIP_VERIFICATION,
          verificationType: VerificationType.BANK_ACCOUNT,
        }
      case 'company_license':
      case 'company_registration':
        return {
          documentType: DocumentType.BUSINESS_LICENSE,
          verificationType: VerificationType.BUSINESS_LICENSE,
        }
      default:
        throw new Error(`Unsupported document purpose: ${purpose}`)
    }
  }

  private async createStripeConnectAccount(
    userId: string,
    accountData: Stripe.AccountCreateParams,
  ): Promise<Stripe.Account> {
    try {
      // return await this.paymentClient.accounts.create({
      //   country: 'AU',
      //   business_type: 'company',
      //   controller: {
      //     fees: {
      //       payer: 'application',
      //     },
      //     losses: {
      //       payments: 'application',
      //     },
      //     requirement_collection: 'application',
      //     stripe_dashboard: {
      //       type: 'none',
      //     },
      //   },
      //   documents: {
      //     bank_account_ownership_verification: {
      //       files: accountData.documents.bank_account_ownership_verification,
      //     },
      //     company_license: {
      //       files: accountData.documents.company_license,
      //     },
      //     company_registration_verification: {
      //       files: accountData.documents.company_registration_verification,
      //     },
      //   },
      //   company: {
      //     address: accountData.company.address,
      //     name: accountData.business_profile.name,
      //     owners_provided: true,
      //     structure: 'sole_proprietorship',
      //     tax_id: accountData.company.tax_id,
      //     phone: accountData.individual.phone,
      //     verification: {
      //       document: {
      //         back: accountData.individual.verification.document.back,
      //         front: accountData.individual.verification.document.back,
      //       },
      //     },
      //   },
      //   capabilities: {
      //     au_becs_debit_payments: {
      //       requested: true,
      //     },
      //     card_payments: {
      //       requested: true,
      //     },
      //     transfers: {
      //       requested: true,
      //     },
      //     bank_transfer_payments: {
      //       requested: true
      //     }
      //   },
      //   external_account: accountData.external_account,

      //   tos_acceptance: {
      //     date: Number(accountData.tos_acceptance.date),
      //     ip: accountData.tos_acceptance.ip,
      //   },
      //   business_profile: {
      //     mcc: accountData.business_profile.mcc,
      //     url: accountData.business_profile.url,
      //   },
      //   metadata: {
      //     userId: userId
      //   }
      // })

      return await this.paymentClient.accounts.create({
        ...accountData,
        metadata: { userId: userId },
      })
    } catch (error) {
      this.logError('Failed to create Stripe Connect account', error, {
        userId,
        accountData,
      })
      throw error
    }
  }

  public formatAccountData(
    accountData: z.infer<typeof ZcreateConnectAccountRoSchema>,
  ): Stripe.AccountCreateParams {
    const stripeAccountData: Stripe.AccountCreateParams = {
      type: 'custom',
      country: 'AU',
      email: accountData.individual.email,
      business_type: 'individual',
      individual: {
        first_name: accountData.individual.first_name,
        last_name: accountData.individual.last_name,
        email: accountData.individual.email,
        phone: accountData.individual.phone,
        gender: accountData.individual.gender,
        id_number: accountData.individual.id_number,
        dob: {
          day: accountData.individual.dob.day,
          month: accountData.individual.dob.month,
          year: accountData.individual.dob.year,
        },
        address: {
          city: accountData.individual.address.city,
          line1: accountData.individual.address.line1,
          line2: accountData.individual.address.line2,
          postal_code: accountData.individual.address.postal_code,
          state: accountData.individual.address.state,
        },
      },
      business_profile: {
        mcc: accountData.business_profile.mcc,
        url: accountData.business_profile.url,
        name: accountData.company_name,
      },
      company: {
        name: accountData.company_name,
        tax_id: accountData.tax_id,
        phone: accountData.phone,
      },
      external_account: {
        object: 'bank_account',
        country: 'AU',
        currency: 'aud',
        account_holder_name: accountData.external_account.account_holder_name,
        account_number: accountData.external_account.account_number,
        routing_number: accountData.external_account.routing_number,
      },
      tos_acceptance: {
        // date: Number(accountData.tos_acceptance.date),
        date: this.getValidTosAcceptanceDate(accountData.tos_acceptance.date),
        ip: accountData.tos_acceptance.ip,
      },
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    }

    if (accountData.documents) {
      stripeAccountData.documents = {
        bank_account_ownership_verification: {
          files: accountData.documents.bank_account_ownership_verification,
        },
        company_license: {
          files: accountData.documents.licence,
        },
        company_registration_verification: {
          files: accountData.documents.registration,
        },
      }
    }

    if (accountData.individual.id_front && accountData.individual.id_back) {
      stripeAccountData.individual.verification = {
        document: {
          front: accountData.individual.id_front,
          back: accountData.individual.id_back,
        },
      }
    }

    return stripeAccountData
  }

  private getValidTosAcceptanceDate(providedDate?: string | number): number {
    const minDate = new Date('2009-01-01').getTime() / 1000
    const now = Math.floor(Date.now() / 1000)

    if (providedDate) {
      const date =
        typeof providedDate === 'string'
          ? Math.floor(new Date(providedDate).getTime() / 1000)
          : providedDate

      if (date > minDate && date < now) {
        return date
      }
    }

    // If the provided date is invalid or not provided, return a recent past date
    return now - 86400 // 24 hours ago
  }

  async createServiceProviderConnectAccount(
    userId: string,
    accountData: z.infer<typeof ZcreateConnectAccountRoSchema>,
  ): Promise<Stripe.Account> {
    try {
      // Create the Connect account

      const account = await this.createStripeConnectAccount(
        userId,
        this.formatAccountData(accountData),
      )
      console.log(account)

      // Store account details in our database
      await this.prisma.serviceProviderStripeData.create({
        data: {
          serviceProvider: { connect: { id: accountData.metadata.userId } },
          connectAccount: {
            create: {
              stripeConnectId: account.id,
              accountStatus: account.payouts_enabled ? 'ACTIVE' : 'PENDING',
              payoutsEnabled: account.payouts_enabled,
              chargesEnabled: account.charges_enabled,
              detailsSubmitted: account.details_submitted,
              businessUrl: accountData.business_profile?.url || '',
              abn: accountData?.tax_id || '',
            },
          },
        },
      })

      return account
    } catch (error) {
      this.logError(
        'Failed to create Connect account for service provider',
        error,
        { userId, accountData },
      )
      throw error
    }
  }

  private async createStripeTransfer(
    transferData: Stripe.TransferCreateParams,
  ): Promise<Stripe.Transfer> {
    try {
      return await this.paymentClient.transfers.create(transferData)
    } catch (error) {
      this.logError('Failed to create transfer', error, { transferData })
      throw error
    }
  }

  private async createStripePayout(
    payoutData: Stripe.PayoutCreateParams,
    accountId: string,
  ): Promise<Stripe.Payout> {
    try {
      return await this.paymentClient.payouts.create(payoutData, {
        stripeAccount: accountId,
      })
    } catch (error) {
      this.logError('Failed to create payout', error, { payoutData, accountId })
      throw error
    }
  }

  private async createStripeToken(
    params: StripeTokenParams,
  ): Promise<Stripe.Token> {
    try {
      let tokenParams: Stripe.TokenCreateParams

      switch (params.type) {
        case 'bank_account':
          tokenParams = { bank_account: params.data }
          break
        case 'card':
          tokenParams = { card: params.data }
          break
        case 'pii':
          tokenParams = { pii: params.data }
          break
        case 'account':
          tokenParams = { account: params.data }
          break
        default:
          throw new Error(`Unsupported token type: ${(params as any).type}`)
      }

      return await this.paymentClient.tokens.create(tokenParams)
    } catch (error) {
      this.logError(`Failed to create Stripe token for ${params.type}`, error, {
        tokenType: params.type,
      })
      throw error
    }
  }

  private async createStripeBankAccount(
    connectAccountId: string,
    bankAccountData: Stripe.TokenCreateParams.BankAccount,
  ): Promise<Stripe.BankAccount> {
    try {
      const token = await this.createStripeToken({
        type: 'bank_account',
        data: bankAccountData,
      })

      return (await this.paymentClient.accounts.createExternalAccount(
        connectAccountId,
        { external_account: token.id },
      )) as Stripe.BankAccount
    } catch (error) {
      this.logError('Failed to create Stripe bank account', error, {
        connectAccountId,
        bankAccountData,
      })
      throw error
    }
  }

  // Customer Methods

  async processCustomerPayment(
    orderId: string,
    customerId: string,
    amount: number,
    currency: string = 'aud',
  ): Promise<any> {
    try {
      const customer = await this.getCustomerById(customerId)
      const stripeCustomer = await this.getOrCreateStripeCustomer(customer)
      const paymentIntent = await this.createStripePaymentIntent({
        amount: Math.round(amount * 100),
        currency: currency,
        automatic_payment_methods: { enabled: true },
        payment_method_options: { card: { capture_method: 'manual' } },
        metadata: { customerId: customerId, orderId: orderId },
        application_fee_amount: 2000,
        customer: stripeCustomer.id,
      })
      await this.updateCustomerStripeData(
        customerId,
        stripeCustomer.id,
        paymentIntent,
      )
      await this.updateOrder(orderId, paymentIntent.id)
      this.notifyCustomer(customerId, 'Payment Initiated Successfully')
      return { paymentIntent, stripeCustomer }
    } catch (error) {
      this.logError('Failed to process customer payment', error, {
        orderId,
        customerId,
        amount,
        currency,
      })
      throw error
    }
  }

  async addPaymentMethod(
    customerId: string,
    paymentMethodData: Omit<Stripe.PaymentMethodCreateParams, 'type'> & {
      type: PaymentMethodType
    },
  ): Promise<Stripe.PaymentMethod> {
    try {
      const customer = await this.getCustomerById(customerId)
      const stripeCustomerId = customer.customerStripeData?.stripeCustomerId

      if (!stripeCustomerId) {
        this.logError(
          `Could Not find teh Customer with Id:${customerId}`,
          new Error(JSON.stringify(customer)),
        )
      }

      // Ensure the type is correctly formatted for Stripe
      const paymentMethodType =
        paymentMethodData.type.toLowerCase() as Stripe.PaymentMethodCreateParams.Type

      const paymentMethod = await this.paymentClient.paymentMethods.create({
        ...paymentMethodData,
        type: paymentMethodType, // Using the mapped type here
      })
      await this.paymentClient.paymentMethods.attach(paymentMethod.id, {
        customer: stripeCustomerId,
      })

      await this.prisma.customerPaymentMethod.create({
        data: {
          customerStripeData: { connect: { customerId } },
          stripeMethodId: paymentMethod.id,
          type: paymentMethodData.type,
          last4: paymentMethod.card?.last4,
          brand: paymentMethod.card?.brand,
          expiryMonth: paymentMethod.card?.exp_month,
          expiryYear: paymentMethod.card?.exp_year,
        },
      })

      return paymentMethod
    } catch (error) {
      this.logError('Failed to add payment method', error, {
        customerId,
        paymentMethodData,
      })
      throw error
    }
  }

  async listPaymentMethods(
    customerId: string,
  ): Promise<Stripe.PaymentMethod[]> {
    try {
      const customer = await this.getCustomerById(customerId)
      const stripeCustomerId = customer.customerStripeData?.stripeCustomerId

      if (!stripeCustomerId) {
        this.logError(
          `Could Not find teh Customer with Id:${customerId}`,
          new Error(JSON.stringify(customer)),
        )
      }

      const paymentMethods = await this.paymentClient.paymentMethods.list({
        customer: stripeCustomerId,
        type: 'card',
      })

      return paymentMethods.data
    } catch (error) {
      this.logError('Failed to list payment methods', error, { customerId })
      throw error
    }
  }

  async updatePaymentMethod(
    customerId: string,
    paymentMethodId: string,
    updateData: Stripe.PaymentMethodUpdateParams,
  ): Promise<Stripe.PaymentMethod> {
    try {
      const paymentMethod = await this.paymentClient.paymentMethods.update(
        paymentMethodId,
        updateData,
      )

      await this.prisma.customerPaymentMethod.update({
        where: { stripeMethodId: paymentMethodId },
        data: {
          last4: paymentMethod.card?.last4,
          brand: paymentMethod.card?.brand,
          expiryMonth: paymentMethod.card?.exp_month,
          expiryYear: paymentMethod.card?.exp_year,
        },
      })

      return paymentMethod
    } catch (error) {
      this.logError('Failed to update payment method', error, {
        customerId,
        paymentMethodId,
        updateData,
      })
      throw error
    }
  }

  async deletePaymentMethod(
    customerId: string,
    paymentMethodId: string,
  ): Promise<void> {
    // Find the payment method in our database
    const paymentMethod = await this.prisma.customerStripeData.findFirst({
      where: {
        customerId: customerId,
        paymentMethods: {
          some: {
            stripeMethodId: paymentMethodId,
          },
        },
      },
      include: {
        paymentMethods: true,
      },
    })

    if (!paymentMethod) {
      throw new NotFoundException('Payment method not found')
    }

    // Delete the payment method in Stripe
    await this.paymentClient.paymentMethods.detach(
      paymentMethod.paymentMethods.find(
        (pm) => pm.stripeMethodId == paymentMethodId,
      ).stripeMethodId,
    )

    // Delete the payment method from our database
    await this.prisma.customerPaymentMethod.delete({
      where: {
        id: paymentMethod.id,
      },
    })
  }

  async payForOrder(
    customerId: string,
    orderId: string,
    paymentMethodId?: string,
  ): Promise<Stripe.PaymentIntent> {
    try {
      const order = await this.bookingService.getOrderByOrderId(orderId)
      const customer = await this.getCustomerById(customerId)
      const stripeCustomerId = customer.customerStripeData?.stripeCustomerId
      const defaultPaymentMethod =
        customer.customerStripeData?.paymentMethods.find(
          (paymentMethod) => paymentMethod.isDefault,
        )

      const paymentMethodIdToUse =
        paymentMethodId ?? defaultPaymentMethod?.stripeMethodId
      if (!paymentMethodIdToUse) {
        throw this.logError(
          'Now PaymentMethods Found',
          new Error('No PaymentMethods to use'),
        )
      }

      const paymentMethodToUse =
        await this.paymentClient.paymentMethods.retrieve(paymentMethodIdToUse)

      if (!stripeCustomerId) {
        this.logError(
          `Could Not find teh Customer with Id:${customerId}`,
          new Error(JSON.stringify(customer)),
        )
      }

      const paymentIntent = await this.createStripePaymentIntent({
        amount: Math.round(order.totalOrderValue * 100),
        currency: 'aud',
        customer: stripeCustomerId,
        payment_method: paymentMethodIdToUse,
        confirm: true,
        metadata: { orderId },
      })

      await this.prisma.customerPayment.create({
        data: {
          customerStripeData: { connect: { customerId } },
          order: { connect: { id: orderId } },
          amount: order.totalOrderValue,
          status: paymentIntent.status as TransactionStatus,
          paymentMethodType:
            paymentMethodToUse.type.toUpperCase() as PaymentMethodType,
          paymentMethodId: paymentMethodIdToUse,
          stripePaymentIntentId: paymentIntent.id,
          stripeChargeId: paymentIntent.latest_charge as string,
        },
      })

      return paymentIntent
    } catch (error) {
      this.logError('Failed to delete payment method', error, {
        customerId,
        paymentMethodId,
      })
      throw error
    }
  }

  async initiateRefund(
    userId: string,
    paymentIntentId: string,
    amount?: number,
  ): Promise<Stripe.Refund> {
    try {
      const refund = await this.paymentClient.refunds.create({
        payment_intent: paymentIntentId,
        amount: amount ? Math.round(amount * 100) : undefined,
      })

      await this.prisma.adminStripeActionHistory.create({
        data: {
          adminId: userId,
          actionType: AdminStripeActionType.REFUND,
          targetId: paymentIntentId,
          targetType: 'payment_intent',
          amount: refund.amount / 100,
          status: refund.status,
          notes: `Refund initiated for payment intent ${paymentIntentId}`,
        },
      })

      return refund
    } catch (error) {
      this.logError('Failed to initiate refund', error, {
        userId,
        paymentIntentId,
        amount,
      })
      throw error
    }
  }

  // Updated method to use createStripeBankAccount for connect accounts
  async addBankAccount(
    userId: string,
    bankAccountData: Stripe.TokenCreateParams.BankAccount,
  ): Promise<Stripe.BankAccount> {
    try {
      const serviceProvider = await this.getServiceProviderStripeData(userId)
      const bankAccount = await this.createStripeBankAccount(
        serviceProvider.connectAccount.stripeConnectId,
        bankAccountData,
      )

      await this.prisma.serviceProviderBankAccount.create({
        data: {
          serviceProviderStripeData: { connect: { serviceProviderId: userId } },
          stripeConnectId: serviceProvider.connectAccount.stripeConnectId,
          bankAccountId: bankAccount.id,
          accountHolderName: bankAccount.account_holder_name,
          bankName: bankAccount.bank_name,
          last4: bankAccount.last4,
          status: BankVerificationStatus.PENDING,
        },
      })

      return bankAccount
    } catch (error) {
      this.logError('Failed to add bank account', error, {
        userId,
        bankAccountData,
      })
      throw error
    }
  }

  // Updated method to use createStripePayout
  async initiatePayout(userId: string, amount: number): Promise<Stripe.Payout> {
    try {
      const serviceProvider = await this.getServiceProviderStripeData(userId)
      const payout = await this.createStripePayout(
        { amount: Math.round(amount * 100), currency: 'aud' },
        serviceProvider.connectAccount.stripeConnectId,
      )

      await this.prisma.serviceProviderPayout.create({
        data: {
          serviceProviderStripeData: { connect: { serviceProviderId: userId } },
          stripePayoutId: payout.id,
          amount: amount,
          status: payout.status as TransactionStatus,
          arrivalDate: new Date(payout.arrival_date * 1000),
          method: payout.method,
          type: payout.type,
        },
      })

      return payout
    } catch (error) {
      this.logError('Failed to initiate payout', error, { userId, amount })
      throw error
    }
  }

  async listConnectAccounts(): Promise<Stripe.Account[]> {
    try {
      const accounts = await this.paymentClient.accounts.list()
      return accounts.data
    } catch (error) {
      this.logError('Failed to list Connect accounts', error)
      throw error
    }
  }

  async getConnectAccountDetails(accountId: string): Promise<Stripe.Account> {
    try {
      const account = await this.paymentClient.accounts.retrieve(accountId)
      return account
    } catch (error) {
      this.logError('Failed to retrieve Connect account details', error, {
        accountId,
      })
      throw error
    }
  }

  // Implemented getPlatformTransactions method
  async getPlatformTransactions(
    startDate: Date,
    endDate: Date,
    type?: PlatformTransactionType,
  ): Promise<Stripe.BalanceTransaction[]> {
    try {
      const transactions = await this.paymentClient.balanceTransactions.list({
        created: {
          gte: Math.floor(startDate.getTime() / 1000),
          lte: Math.floor(endDate.getTime() / 1000),
        },
        type: type ? this.mapTransactionType(type) : undefined,
      })

      await this.storePlatformTransactions(transactions.data)

      return transactions.data
    } catch (error) {
      this.logError('Failed to retrieve platform transactions', error, {
        startDate,
        endDate,
        type,
      })
      throw error
    }
  }

  async generateRevenueReport(startDate: Date, endDate: Date): Promise<any> {
    try {
      const transactions = await this.getPlatformTransactions(
        startDate,
        endDate,
      )

      const report = transactions.reduce(
        (acc, transaction) => {
          const amount = transaction.amount / 100 // Convert cents to dollars

          if (transaction.type === 'charge') {
            acc.totalRevenue += amount
            acc.transactionCount += 1
          } else if (transaction.type === 'refund') {
            acc.totalRefunds += amount
            acc.refundCount += 1
          }

          return acc
        },
        {
          totalRevenue: 0,
          totalRefunds: 0,
          transactionCount: 0,
          refundCount: 0,
        },
      )

      report.totalRevenue = report.totalRevenue - report.totalRefunds
      report.transactionCount =
        report.transactionCount > 0
          ? report.totalRevenue / report.transactionCount
          : 0
      report.refundCount =
        report.transactionCount > 0
          ? report.refundCount / report.transactionCount
          : 0

      return report
    } catch (error) {
      this.logError('Failed to generate revenue report', error, {
        startDate,
        endDate,
      })
      throw error
    }
  }

  async updatePlatformSettings(
    userId: string,
    settings: Stripe.AccountUpdateParams,
  ): Promise<Stripe.Account> {
    try {
      const updatedAccount = await this.paymentClient.accounts.update(
        process.env.STRIPE_PLATFORM_ACCOUNT_ID,
        settings,
      )

      await this.prisma.adminStripeActionHistory.create({
        data: {
          adminId: userId,
          actionType: AdminStripeActionType.ACCOUNT_UPDATE,
          targetId: process.env.STRIPE_PLATFORM_ACCOUNT_ID,
          targetType: 'platform_account',
          status: 'completed',
          notes: `Platform account settings updated`,
        },
      })

      return updatedAccount
    } catch (error) {
      this.logError('Failed to update platform settings', error, {
        userId,
        settings,
      })
      throw error
    }
  }

  // Helper methods

  private async getOrCreateStripeCustomer(
    customer: any,
  ): Promise<Stripe.Customer | Stripe.DeletedCustomer> {
    try {
      const existingStripeCustomer = await this.prisma.customer.findUnique({
        where: { id: customer.id },
        include: { customerStripeData: true },
      })

      if (existingStripeCustomer?.customerStripeData?.stripeCustomerId) {
        return await this.paymentClient.customers.retrieve(
          existingStripeCustomer.customerStripeData.stripeCustomerId,
        )
      }

      return await this.createStripeCustomer({
        email: customer.email,
        name: `${customer.user.firstName} ${customer.user.lastName}`,
        metadata: {
          customerId: customer.id,
          userId: customer.userId,
        },
      })
    } catch (error) {
      this.logError('Failed to get or create Stripe customer', error, {
        customer,
      })
      throw error
    }
  }

  private async updateCustomerStripeData(
    customerId: string,
    stripeCustomerId: string,
    paymentIntent: Stripe.PaymentIntent,
  ): Promise<void> {
    try {
      await this.prisma.customer.update({
        where: { id: customerId },
        data: {
          customerStripeData: {
            upsert: {
              create: {
                stripeCustomerId,
                paymentIntents: {
                  create: {
                    amount: paymentIntent.amount,
                    status: 'REQUIRES_CONFIRMATION',
                    stripePaymentIntentId: paymentIntent.id,
                  },
                },
              },
              update: {
                stripeCustomerId,
                paymentIntents: {
                  upsert: {
                    where: {
                      stripePaymentIntentId: paymentIntent.id,
                    },
                    create: {
                      amount: paymentIntent.amount,
                      status: 'REQUIRES_CONFIRMATION',
                      stripePaymentIntentId: paymentIntent.id,
                    },
                    update: {
                      amount: paymentIntent.amount,
                      status: 'REQUIRES_CONFIRMATION',
                    },
                  },
                },
              },
            },
          },
        },
      })
    } catch (error) {
      this.logError('Failed to update customer Stripe data', error, {
        customerId,
        stripeCustomerId,
        paymentIntent,
      })
      throw error
    }
  }

  private createPaymentIntentRecord(paymentIntent: Stripe.PaymentIntent) {
    return {
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      status: paymentIntent.status,
      amountReceived: paymentIntent.amount_received,
      createdAt: new Date(paymentIntent.created * 1000).toISOString(),
      lastUpdated: new Date().toISOString(),
    }
  }

  private async updateOrder(
    orderId: string,
    paymentIntentId: string,
  ): Promise<void> {
    try {
      await this.bookingService.updateOrderByOrderId(orderId, {
        paymentId: paymentIntentId,
      })
    } catch (error) {
      this.logError('Failed to update order', error, {
        orderId,
        paymentIntentId,
      })
      throw error
    }
  }

  private notifyCustomer(customerId: string, message: string): void {
    try {
      this.socketGateway.notifyCustomer(customerId, message)
    } catch (error) {
      this.logError('Failed to notify customer', error, { customerId, message })
    }
  }

  private async getServiceProviderStripeData(userId: string) {
    try {
      const serviceProvider =
        await this.prisma.serviceProviderStripeData.findUnique({
          where: { serviceProviderId: userId },
          include: { connectAccount: true },
        })
      if (!serviceProvider) {
        throw new Error('Service provider not found')
      }
      return serviceProvider
    } catch (error) {
      this.logError('Failed to get service provider Stripe data', error, {
        userId,
      })
      throw error
    }
  }

  private async storePlatformTransactions(
    transactions: Stripe.BalanceTransaction[],
  ): Promise<void> {
    try {
      for (const transaction of transactions) {
        await this.prisma.platformStripeData.upsert({
          where: { transactionId: transaction.id },
          update: {
            amount: transaction.amount / 100,
            status: this.mapTransactionStatus(transaction.status),
            transactionType: this.mapTransactionTypeReverse(transaction.type),
          },
          create: {
            transactionId: transaction.id,
            amount: transaction.amount / 100,
            status: this.mapTransactionStatus(transaction.status),
            transactionType: this.mapTransactionTypeReverse(transaction.type),
          },
        })
      }
    } catch (error) {
      this.logError('Failed to store platform transactions', error, {
        transactionCount: transactions.length,
      })
      throw error
    }
  }

  private mapTransactionType(type: PlatformTransactionType): string {
    const typeMap: Record<PlatformTransactionType, string> = {
      PAYMENT: 'charge',
      PAYOUT: 'payout',
      REFUND: 'refund',
      TRANSFER: 'transfer',
      FEE: 'stripe_fee',
      ADJUSTMENT: 'adjustment',
    }
    return typeMap[type] || type
  }

  private mapTransactionTypeReverse(type: string): PlatformTransactionType {
    const typeMap: Record<string, PlatformTransactionType> = {
      charge: PlatformTransactionType.PAYMENT,
      payout: PlatformTransactionType.PAYOUT,
      refund: PlatformTransactionType.REFUND,
      transfer: PlatformTransactionType.TRANSFER,
      stripe_fee: PlatformTransactionType.FEE,
      adjustment: PlatformTransactionType.ADJUSTMENT,
    }
    return typeMap[type] || PlatformTransactionType.PAYMENT
  }

  private mapTransactionStatus(status: string): TransactionStatus {
    const statusMap: Record<string, TransactionStatus> = {
      available: TransactionStatus.SUCCEEDED,
      pending: TransactionStatus.PENDING,
      failed: TransactionStatus.FAILED,
    }
    return statusMap[status] || TransactionStatus.PENDING
  }
}
