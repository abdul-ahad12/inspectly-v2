import { Test, TestingModule } from '@nestjs/testing'
import { ReInspectionReportController } from './re-inspection-report.controller'

describe('InspectionReportController', () => {
  let controller: ReInspectionReportController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReInspectionReportController],
    }).compile()

    controller = module.get<ReInspectionReportController>(
      ReInspectionReportController,
    )
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
