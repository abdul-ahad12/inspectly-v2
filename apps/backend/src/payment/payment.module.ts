import { DynamicModule, Provider, Global } from '@nestjs/common'
import Stripe from 'stripe'
import { PAYMENT_CLIENT } from './payment.constants'
import { PaymentController } from './payment.controller'
import { PaymentService } from './payment.service'
import { SocketGateway } from '@/gateways/socket.gateway'
import { PrismaService } from '@/prisma/prisma.service'
import { CustomerService } from '@/user/customer/customer.service'
import { BookingService } from '@/booking/booking.service'

@Global()
export class PaymentModule {
  static forRoot(apiKey: string, config: Stripe.StripeConfig): DynamicModule {
    const stripe = new Stripe(apiKey, config)

    const paymentProvider: Provider = {
      provide: PAYMENT_CLIENT,
      useValue: stripe,
    }

    return {
      module: PaymentModule,
      controllers: [PaymentController],
      providers: [
        paymentProvider,
        PaymentService,
        SocketGateway,
        PrismaService,
        CustomerService,
        BookingService,
      ],
      exports: [PaymentService],
    }
  }
}
