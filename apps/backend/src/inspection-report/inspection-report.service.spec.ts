import { Test, TestingModule } from '@nestjs/testing'
import { InspectionReportService } from './inspection-report.service'

describe('InspectionReportService', () => {
  let service: InspectionReportService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InspectionReportService],
    }).compile()

    service = module.get<InspectionReportService>(InspectionReportService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
