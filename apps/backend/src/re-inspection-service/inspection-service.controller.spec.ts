import { Test, TestingModule } from '@nestjs/testing'
import { ReInspectionServiceController } from './re-inspection-service.controller'

describe('InspectionServiceController', () => {
  let controller: ReInspectionServiceController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReInspectionServiceController],
    }).compile()

    controller = module.get<ReInspectionServiceController>(
      ReInspectionServiceController,
    )
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
