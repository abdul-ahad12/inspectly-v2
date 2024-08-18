import { HttpStatus, Injectable, Scope } from '@nestjs/common'
import { Request } from 'express'
import { Logger } from 'winston'
import { PaymentError } from './payment.error'

@Injectable({ scope: Scope.REQUEST })
export class BaseService {
  protected request: Request | undefined
  protected logger: Logger

  setContext(request: Request, logger: Logger) {
    this.request = request
    this.logger = logger
  }

  public createPaymentError(
    message: string,
    statusCode: HttpStatus,
    errorCode: string,
    userId: string,
    operationType: string,
    stripeErrorCode?: string,
    stripeErrorMessage?: string,
    metadata?: Record<string, any>,
  ): PaymentError {
    return PaymentError.createAndLog(
      message,
      statusCode,
      errorCode,
      userId,
      operationType,
      this.request,
      this.logger,
      stripeErrorCode,
      stripeErrorMessage,
      metadata,
    )
  }
}
