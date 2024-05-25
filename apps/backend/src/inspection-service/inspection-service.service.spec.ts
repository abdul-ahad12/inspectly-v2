import { Test, TestingModule } from '@nestjs/testing'
import { InspectionServiceService } from './inspection-service.service'

describe('InspectionServiceService', () => {
  let service: InspectionServiceService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InspectionServiceService],
    }).compile()

    service = module.get<InspectionServiceService>(InspectionServiceService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
