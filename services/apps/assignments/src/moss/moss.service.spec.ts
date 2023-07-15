import { Test, TestingModule } from '@nestjs/testing';
import { MossService } from './moss.service';

describe('MossService', () => {
  let service: MossService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MossService],
    }).compile();

    service = module.get<MossService>(MossService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
