import { Test, TestingModule } from '@nestjs/testing'
import { ReBookingController } from './re-booking.controller'

describe('ReBookingController', () => {
  let controller: ReBookingController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReBookingController],
    }).compile()

    controller = module.get<ReBookingController>(ReBookingController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
