import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common'
import { ZodSchema, ZodError } from 'zod'

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: any, metadata: ArgumentMetadata) {
    console.log(metadata)
    try {
      this.schema.parse(value)
      return value
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessage = error.errors[0].message
        throw new BadRequestException(errorMessage)
      }
      throw error
    }
  }
}
