import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  Logger,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'
import { Socket } from 'socket.io'

@Injectable()
export class WsLoggerInterceptor implements NestInterceptor {
  private logger = new Logger('WebSocket')

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now()
    const client: Socket = context.switchToWs().getClient<Socket>()

    // Accessing client details
    const clientIp = client.conn.remoteAddress
    const event = context.switchToWs().getData().event || 'unknown_event'

    return next.handle().pipe(
      tap(() => {
        const responseTime = Date.now() - now
        this.logger.log(`${event} - ${clientIp} - ${responseTime}ms`)
      }),
    )
  }
}
