// redis.service.ts

import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import Redis from 'ioredis'

@Injectable()
export class RedisService {
  private readonly redisClient: Redis

  constructor(private readonly configService: ConfigService) {
    this.redisClient = new Redis({
      host: this.configService.get<string>('REDIS_HOST', '127.0.0.1'),
      port: this.configService.get<number>('REDIS_PORT', 6379),
      password: this.configService.get<string>('REDIS_PASSWORD'), // It's fine if this is undefined
    })

    // Optionally, handle events or errors
    this.redisClient.on('connect', () => {
      console.info('Connected to Redis server')
    })

    this.redisClient.on('error', (error: unknown) => {
      console.error('Error connecting to Redis:', error)
    })
  }

  // Example method to set a key-value pair in Redis

  async set(
    key: string,
    value: any,
    expiryMode: 'EX' = 'EX',
    time?: number,
  ): Promise<void> {
    await this.redisClient.set(key, value, expiryMode, time || 300)
  }

  async get(key: string): Promise<string | null> {
    return await this.redisClient.get(key)
  }

  async del(key: string): Promise<number> {
    return await this.redisClient.del(key)
  }

  async ttl(key: string): Promise<number> {
    return await this.redisClient.ttl(key)
  }
}
