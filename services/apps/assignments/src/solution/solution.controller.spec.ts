import { Test, TestingModule } from '@nestjs/testing';
import { SolutionController } from './solution.controller';
import { SolutionService } from './solution.service';

describe('SolutionController', () => {
  let controller: SolutionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SolutionController],
      providers: [SolutionService],
    }).compile();

    controller = module.get<SolutionController>(SolutionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
