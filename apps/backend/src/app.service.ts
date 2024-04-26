import { Injectable } from '@nestjs/common'
import add from '@mechanic/sdk'

@Injectable()
export class AppService {
  getHello(): string {
    return `Hello World! ${add(3, 5)}`
  }
}
