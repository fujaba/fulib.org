import {Test, TestingModule} from '@nestjs/testing';
import {GradingController} from './grading.controller';
import {GradingService} from './grading.service';

describe('GradingController', () => {
  let controller: GradingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GradingController],
      providers: [GradingService],
    }).compile();

    controller = module.get<GradingController>(GradingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
