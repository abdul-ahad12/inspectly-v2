import { Module } from '@nestjs/common'
import { FileUploadService } from './file-upload.service'
import { FileUploadController } from './file-upload.controller'
import { AuthModule } from '@/auth/auth.module'
import { PdfService } from '@/pdf/pdf.service'
import { JwtService } from '@nestjs/jwt'
import { SharpModule } from 'nestjs-sharp'
import { PaymentModule } from '@/payment/payment.module'

@Module({
  imports: [AuthModule, SharpModule],
  providers: [FileUploadService, PdfService, JwtService, PaymentModule],
  controllers: [FileUploadController],
})
export class FileUploadModule {}
