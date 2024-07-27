import { Test, TestingModule } from '@nestjs/testing'
import { ReInspectionReportService } from './re-inspection-report.service'

describe('InspectionReportService', () => {
  let service: ReInspectionReportService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReInspectionReportService],
    }).compile()

    service = module.get<ReInspectionReportService>(ReInspectionReportService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
