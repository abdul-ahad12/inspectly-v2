import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import * as cookieParser from 'cookie-parser'
import { IoAdapter } from '@nestjs/platform-socket.io'
import { VersioningType } from '@nestjs/common'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.useWebSocketAdapter(new IoAdapter())
  // app.useGlobalGuards(new ThrottlerGuard());

  // Enable versioning
  app.enableVersioning({
    type: VersioningType.URI,
    prefix: 'api/v',
    defaultVersion: '1',
  })
  // Enable CORS for a specific origin
  app.enableCors({
    origin: [
      'https://mechanic.inspectly.com.au',
      'https://customer.inspectly.com.au',
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true,
  })

  app.use(cookieParser())
  await app.listen(3000)
}

bootstrap()
