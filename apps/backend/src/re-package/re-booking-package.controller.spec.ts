import { Test, TestingModule } from '@nestjs/testing'
import { ReBookingPackageController } from './re-booking-package.controller'

describe('BookingPackageController', () => {
  let controller: ReBookingPackageController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReBookingPackageController],
    }).compile()

    controller = module.get<ReBookingPackageController>(
      ReBookingPackageController,
    )
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
