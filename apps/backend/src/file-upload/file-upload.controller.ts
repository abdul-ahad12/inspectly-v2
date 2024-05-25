import {
  Controller,
  HttpException,
  HttpStatus,
  ParseFilePipe,
  Put,
  Req,
  Res,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common'
import {
  FileFieldsInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express'
import { memoryStorage } from 'multer'
import { FileUploadService } from './file-upload.service'
import { Request, Response } from 'express'
// import { OnboardingAuthGuard } from '@/guards/onboardingAuth.guard';
import { PdfService } from '@/pdf/pdf.service'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { getFolderStructure } from '@/common/utils/functions/digitalOcean/getFolderStructure'
// import sharp from 'sharp';
// import pAll from 'p-all'
import { SharpService } from 'nestjs-sharp'

@Controller('file-upload')
export class FileUploadController {
  constructor(
    private uploadService: FileUploadService,
    private pdfService: PdfService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly sharpService: SharpService,
  ) {}

  @Put('mech')
  // TODO protect this route with the following auth guard -> guard needs mod
  // @UseGuards(OnboardingAuthGuard)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'id_front', maxCount: 1 },
        { name: 'id_back', maxCount: 1 },
        { name: 'cert_3', maxCount: 1 },
        { name: 'cert_4', maxCount: 1 },
        { name: 'pli', maxCount: 1 },
        { name: 'pii', maxCount: 1 },
        { name: 'profile_picture', maxCount: 1 },
      ],
      {
        storage: memoryStorage(),
      },
    ),
  )
  async uploadMechDocs(
    @Req() req: Request,
    @Res() res: Response,
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          // new MaxFileSizeValidator({
          //     maxSize: 5000000,
          //     message: "Max file size allowed is 5MB"
          // }),
          // new FileTypeValidator({
          //     fileType: /\.(jpg|jpeg|png|heic|raw|webp|avif)$/i
          // })
        ],
      }),
    )
    files: {
      id_front: Express.Multer.File[]
      id_back: Express.Multer.File[]
      cert_3: Express.Multer.File[]
      cert_4?: Express.Multer.File[]
      pli: Express.Multer.File[]
      pii?: Express.Multer.File[]
      profile_picture: Express.Multer.File[]
    },
  ) {
    const doc = this.pdfService.mergeImagesToPdf([
      {
        buffer: files['id_front'][0].buffer,
        name: files['id_front'][0].fieldname,
      },
      {
        buffer: files['id_back'][0].buffer,
        name: files['id_back'][0].fieldname,
      },
    ])
    const ausIdentificationDoc = await this.pdfService.generatePdfBuffer(doc)

    const cook = req.headers.cookie.split('=')[1]
    const jwtSecret = this.configService.get('ONBOARDING_JWT_SECRET')
    const pl = this.jwtService.verify(cook, {
      secret: jwtSecret,
    })
    // console.log(pl)

    const arrays = getFolderStructure(
      pl.phone,
      ['cert_3', 'cert_4', 'pli', 'pii', 'profile_picture'],
      files,
    )
    ausIdentificationDoc
      ? arrays.push({
          fileName: `mech-verification/${pl.phone}/aus_id`,
          file: ausIdentificationDoc,
        })
      : (() => {
          throw new HttpException(
            'Unknown error occurred',
            HttpStatus.INTERNAL_SERVER_ERROR,
          )
        })()

    try {
      const uploadedFiles = await this.uploadService.uploadMultiple(arrays)
      if (!uploadedFiles) {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: 'The Files Could Not Be Uploaded',
          error: 'Bad Request',
        })
      }

      const fileUrls = [
        'cert_3',
        'cert_4',
        'pli',
        'pii',
        'profile_picture',
        'aus_id',
      ].map(
        (fileName: string) =>
          `https://files-mechanic.blr1.digitaloceanspaces.com/${pl.phone}/${fileName}`,
      )
      uploadedFiles.map((file, i) => (file['url'] = fileUrls[i]))
      res.status(HttpStatus.CREATED).json({
        success: true,
        message: 'Successfully uploaded files',
        data: uploadedFiles,
      })
    } catch (error) {
      res.status(error.status || HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message || 'An Internal server error occured',
        error: error.name || 'Unhandled Exception',
      })
    }
  }

  @Put('/inspection-images')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: memoryStorage(), // Temporarily store files in memory
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          return cb(
            new HttpException(
              'Only image files are allowed!',
              HttpStatus.BAD_REQUEST,
            ),
            false,
          )
        }
        cb(null, true)
      },
      limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
    }),
  )
  async uploadImages(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new HttpException('No files uploaded!', HttpStatus.BAD_REQUEST)
    }
    const processedFiles = await Promise.all(
      files.map(async (file) => {
        const compressedBuffer = await this.sharpService
          .edit(file.buffer)
          .resize({ width: 1024 }) // Resize image to a width of 1024 pixels
          .jpeg({ quality: 80 }) // Compress image to 80% quality
          .toBuffer()

        console.log(compressedBuffer)
        if (!compressedBuffer) {
        }

        return {
          fileName: `${Date.now().toString()}-${file.originalname}`,
          file: compressedBuffer,
        }
      }),
    )

    const uploadResults = await Promise.all(
      processedFiles.map((file) =>
        this.uploadService.uploadImages(file.fileName, file.file),
      ),
    )

    return uploadResults.map((upload) => ({
      url: upload.Location,
      key: upload.Key,
    }))
  }
}
