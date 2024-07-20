import { Test, TestingModule } from '@nestjs/testing'
import { ReBookingService } from './re-booking.service'

describe('ReBookingService', () => {
  let service: ReBookingService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReBookingService],
    }).compile()

    service = module.get<ReBookingService>(ReBookingService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
