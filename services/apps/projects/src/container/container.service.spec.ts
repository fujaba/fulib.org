import { Test, TestingModule } from '@nestjs/testing';
import { ContainerService } from './container.service';

describe('ContainerService', () => {
  let service: ContainerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ContainerService],
    }).compile();

    service = module.get<ContainerService>(ContainerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
