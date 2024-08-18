import { HttpStatus } from '@nestjs/common'
import { Request } from 'express'
import { Logger } from 'winston'
import { v4 as uuidv4 } from 'uuid'

type PaymentErrorJSON = {
  name: string
  message: string
  statusCode: HttpStatus
  errorCode: string
  requestId: string
  userId: string
  timestamp: Date
  operationType: string
  clientInfo?: Record<string, any>
  stripeErrorCode?: string
  stripeErrorMessage?: string
  metadata?: Record<string, any>
  stack?: string
}

export class PaymentError extends Error {
  private readonly logger: Logger
  private readonly requestId: string
  private readonly timestamp: Date

  constructor(
    message: string,
    public statusCode: HttpStatus,
    public errorCode: string,
    public userId: string,
    public operationType: string,
    public request: Request | undefined,
    logger: Logger,
    public stripeErrorCode?: string,
    public stripeErrorMessage?: string,
    public metadata?: Record<string, any>,
  ) {
    super(message)
    this.name = 'PaymentError'
    this.requestId = uuidv4()
    this.timestamp = new Date()
    this.logger = logger
    this.logError()
  }

  private logError(): void {
    console.error('Payment Error', {
      errorDetails: this.toJSON(),
    })
  }

  toJSON(): PaymentErrorJSON {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      errorCode: this.errorCode,
      requestId: this.requestId,
      userId: this.userId,
      timestamp: this.timestamp,
      operationType: this.operationType,
      clientInfo: this.getClientInfo(),
      stripeErrorCode: this.stripeErrorCode,
      stripeErrorMessage: this.stripeErrorMessage,
      metadata: this.metadata,
      stack: this.stack,
    }
  }

  private getClientInfo() {
    if (!this.request) {
      return undefined
    }
    return {
      ip: this.request.ip,
      userAgent: this.request.headers['user-agent'],
      referer: this.request.headers.referer,
      acceptLanguage: this.request.headers['accept-language'],
      host: this.request.headers.host,
      method: this.request.method,
      path: this.request.path,
      query: this.request.query,
    }
  }

  static createAndLog(
    message: string,
    statusCode: HttpStatus,
    errorCode: string,
    userId: string,
    operationType: string,
    request: Request | undefined,
    logger: Logger,
    stripeErrorCode?: string,
    stripeErrorMessage?: string,
    metadata?: Record<string, any>,
  ): PaymentError {
    return new PaymentError(
      message,
      statusCode,
      errorCode,
      userId,
      operationType,
      request,
      logger,
      stripeErrorCode,
      stripeErrorMessage,
      metadata,
    )
  }
}
