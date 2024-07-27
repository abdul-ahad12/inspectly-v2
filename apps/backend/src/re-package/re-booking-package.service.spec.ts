import { Test, TestingModule } from '@nestjs/testing'
import { ReBookingPackageService } from './re-booking-package.service'

describe('BookingPackageService', () => {
  let service: ReBookingPackageService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReBookingPackageService],
    }).compile()

    service = module.get<ReBookingPackageService>(ReBookingPackageService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
