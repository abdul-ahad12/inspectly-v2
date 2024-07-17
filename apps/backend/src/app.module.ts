import { MiddlewareConsumer, Module } from '@nestjs/common'
import { LoggerMiddleware } from './common/utils/logger'
import { PrismaModule } from './prisma/prisma.module'
import { UserModule } from './user/user.module'
import { AuthModule } from './auth/auth.module'
import { ConfigModule } from '@nestjs/config'
import { FileUploadModule } from './file-upload/file-upload.module'
import { MulterModule } from '@nestjs/platform-express'
import { BookingPackageModule } from './package/booking-package.module'
import { BookingModule } from './booking/booking.module'
import { PaymentModule } from './payment/payment.module'
import { InspectionServiceModule } from './inspection-service/inspection-service.module'
import { InspectionReportModule } from './inspection-report/inspection-report.module'
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler'
import { APP_GUARD } from '@nestjs/core'

@Module({
  imports: [
    PrismaModule,
    UserModule,
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PaymentModule.forRoot(process.env.STRIPE_API_KEY, {
      apiVersion: '2024-04-10',
    }),
    MulterModule.register({
      dest: './upload',
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60 * 60,
        limit: 2,
      },
    ]),
    FileUploadModule,
    BookingPackageModule,
    BookingModule,
    InspectionServiceModule,
    InspectionReportModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*')
  }
}
