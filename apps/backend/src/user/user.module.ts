import { Module } from '@nestjs/common'
import { UserController } from './user.controller'
import { UserService } from './user.service'
import { CustomerService } from './customer/customer.service'
import { PrismaService } from 'src/prisma/prisma.service'

@Module({
  controllers: [UserController],
  providers: [UserService, CustomerService, PrismaService],
  exports: [UserService],
})
export class UserModule {}
