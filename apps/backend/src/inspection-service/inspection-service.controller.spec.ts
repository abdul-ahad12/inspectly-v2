import { Test, TestingModule } from '@nestjs/testing'
import { InspectionServiceController } from './inspection-service.controller'

describe('InspectionServiceController', () => {
  let controller: InspectionServiceController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InspectionServiceController],
    }).compile()

    controller = module.get<InspectionServiceController>(
      InspectionServiceController,
    )
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
