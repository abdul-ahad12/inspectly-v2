import { Test, TestingModule } from '@nestjs/testing'
import { InspectionReportController } from './inspection-report.controller'

describe('InspectionReportController', () => {
  let controller: InspectionReportController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InspectionReportController],
    }).compile()

    controller = module.get<InspectionReportController>(
      InspectionReportController,
    )
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
