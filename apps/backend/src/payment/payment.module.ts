import { DynamicModule, Provider, Global, Scope } from '@nestjs/common'
import Stripe from 'stripe'
import { PAYMENT_CLIENT } from './payment.constants'
import { PaymentController } from './payment.controller'
import { PaymentService } from './payment.service'
import { SocketGateway } from '@/gateways/socket.gateway'
import { PrismaService } from '@/prisma/prisma.service'
import { BookingService } from '@/booking/booking.service'
import { UserModule } from '@/user/user.module'
import { UserService } from '@/user/user.service'
import { JwtService } from '@nestjs/jwt'
import { LoggerModule } from '@/logger/logger.module'

@Global()
export class PaymentModule {
  static forRoot(apiKey: string, config: Stripe.StripeConfig): DynamicModule {
    const stripe = new Stripe(apiKey, config)

    const paymentProvider: Provider = {
      provide: PAYMENT_CLIENT,
      useValue: stripe,
    }

    return {
      imports: [UserModule, LoggerModule],
      module: PaymentModule,
      controllers: [PaymentController],
      providers: [
        {
          provide: PaymentService,
          useClass: PaymentService,
          scope: Scope.REQUEST,
        },
        paymentProvider,
        SocketGateway,
        PrismaService,
        BookingService,
        UserService,
        JwtService,
      ],
      exports: [PaymentService],
    }
  }
}
