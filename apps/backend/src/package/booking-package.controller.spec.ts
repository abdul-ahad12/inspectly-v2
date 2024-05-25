import { Test, TestingModule } from '@nestjs/testing'
import { BookingPackageController } from './booking-package.controller'

describe('BookingPackageController', () => {
  let controller: BookingPackageController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookingPackageController],
    }).compile()

    controller = module.get<BookingPackageController>(BookingPackageController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
