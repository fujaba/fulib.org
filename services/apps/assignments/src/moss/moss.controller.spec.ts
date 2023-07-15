import { Test, TestingModule } from '@nestjs/testing';
import { MossController } from './moss.controller';

describe('MossController', () => {
  let controller: MossController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MossController],
    }).compile();

    controller = module.get<MossController>(MossController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
