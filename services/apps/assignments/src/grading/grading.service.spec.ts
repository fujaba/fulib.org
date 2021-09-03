import { Test, TestingModule } from '@nestjs/testing';
import { GradingService } from './grading.service';

describe('GradingService', () => {
  let service: GradingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GradingService],
    }).compile();

    service = module.get<GradingService>(GradingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
