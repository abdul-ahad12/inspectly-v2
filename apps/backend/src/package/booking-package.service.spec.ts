import { Test, TestingModule } from '@nestjs/testing'
import { BookingPackageService } from './booking-package.service'

describe('BookingPackageService', () => {
  let service: BookingPackageService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BookingPackageService],
    }).compile()

    service = module.get<BookingPackageService>(BookingPackageService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
