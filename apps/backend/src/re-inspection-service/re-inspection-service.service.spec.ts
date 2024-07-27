import { Test, TestingModule } from '@nestjs/testing'
import { ReInspectionServiceService } from './re-inspection-service.service'

describe('InspectionServiceService', () => {
  let service: ReInspectionServiceService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReInspectionServiceService],
    }).compile()

    service = module.get<ReInspectionServiceService>(ReInspectionServiceService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
