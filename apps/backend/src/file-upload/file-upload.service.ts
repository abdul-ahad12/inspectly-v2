import { ZUploadVerificationDocRoSchema } from '@/common/definitions/zod/files'
import { PaymentService } from '@/payment/payment.service'
import { HeadObjectCommand, PutObjectCommand, S3 } from '@aws-sdk/client-s3'
import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Readable } from 'stream'
import { z } from 'zod'

@Injectable()
export class FileUploadService {
  private readonly s3Client = new S3({
    forcePathStyle: false, // Configures to use subdomain/virtual calling format.
    endpoint: 'https://blr1.digitaloceanspaces.com',
    region: 'us-east-1',
    credentials: {
      accessKeyId: this.configService.getOrThrow('DOACCESS_KEY'),
      secretAccessKey: this.configService.getOrThrow('DOSECRET_KEY'),
    },
  })
  constructor(
    private readonly configService: ConfigService,
    private readonly paymentService: PaymentService,
  ) {}

  async upload(fileName: string, file: Express.Multer.File['buffer']) {
    try {
      const result = await this.s3Client.send(
        new PutObjectCommand({
          Bucket: 'files-mechanic',
          Key: fileName,
          Body: file,
        }),
      )
      console.log(`File uploaded successfully: ${result}`)
      return result
    } catch (err) {
      console.error(`Error uploading file: ${err}`)
      throw err
    }
  }

  async uploadVerificationDocs(
    file: Express.Multer.File,
    body: Omit<z.infer<typeof ZUploadVerificationDocRoSchema>, 'file'>,
  ) {
    try {
      return await this.paymentService.uploadVerificationDocs(
        file,
        body.purpose,
        body.fileName,
      )
    } catch (error) {
      console.error(error)
      throw new HttpException(
        {
          success: false,
          type: 'unknown_exception',
          message:
            'An unexpected error occured on server, please try again in some time',
          error: error,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }

  async uploadImages(
    fileName: string,
    file: Express.Multer.File['buffer'],
  ): Promise<{ Location: string; Key: string }> {
    try {
      const result = await this.s3Client.send(
        new PutObjectCommand({
          Bucket: 'files-mechanic',
          Key: fileName,
          Body: file,
          ContentType: 'image/jpeg', // Adjust if needed
          ACL: 'public-read',
        }),
      )
      console.log(`File uploaded successfully: ${result}`)
      return {
        Location: `https://inspection_images.s3.us-east-1.amazonaws.com/${fileName}`,
        Key: fileName,
      }
    } catch (err) {
      console.error(`Error uploading file: ${err}`)
      throw err
    }
  }
  async uploadMultiple(
    files: { fileName: string; file: Express.Multer.File['buffer'] }[],
  ) {
    const uploadPromises = files.map(async (file) => {
      return this.upload(file.fileName, file.file)
    })
    try {
      const results = await Promise.all(uploadPromises)
      console.log(`All files uploaded successfully: ${results}`)
      return results
    } catch (err) {
      console.error(`Error uploading file: ${err}`)
      throw err
    }
  }

  async createFolder(Bucket: string, Key: string) {
    const command = new PutObjectCommand({ Bucket, Key })
    return await this.s3Client.send(command)
  }

  async existsFolder(Bucket: string, Key: string) {
    const command = new HeadObjectCommand({ Bucket, Key })

    try {
      await this.s3Client.send(command)
      return true
    } catch (error) {
      if (error.name === 'NotFound') {
        return false
      } else {
        throw error
      }
    }
  }

  async createFolderIfNotExist(Bucket: string, Key: string) {
    if (!(await this.existsFolder(Bucket, Key))) {
      return await this.createFolder(Bucket, Key)
    }
  }

  async streamToBuffer(stream: Readable): Promise<Buffer> {
    const chunks: Uint8Array[] = []
    return new Promise((resolve, reject) => {
      stream.on('data', (chunk: Uint8Array) => {
        chunks.push(chunk)
      })
      stream.on('end', () => {
        resolve(Buffer.concat(chunks))
      })
      stream.on('error', (err: Error) => {
        reject(err)
      })
    })
  }
}
