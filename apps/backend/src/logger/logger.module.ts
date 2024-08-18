import { Module, Global } from '@nestjs/common'
import { createLogger, format, transports, Logger } from 'winston'

@Global()
@Module({
  providers: [
    {
      provide: 'WINSTON_LOGGER',
      useFactory: (): Logger => {
        return createLogger({
          level: 'info',
          format: format.combine(
            format.timestamp(),
            format.errors({ stack: true }),
            format.splat(),
            format.json(),
          ),
          defaultMeta: { service: 'payment-service' },
          transports: [
            new transports.Console({
              format: format.combine(format.colorize(), format.simple()),
            }),
            new transports.File({ filename: 'error.log', level: 'error' }),
            new transports.File({ filename: 'combined.log' }),
          ],
        })
      },
    },
  ],
  exports: ['WINSTON_LOGGER'],
})
export class LoggerModule {}
