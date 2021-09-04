import { Test, TestingModule } from '@nestjs/testing';
import { ContainerController } from './container.controller';
import { ContainerService } from './container.service';

describe('ContainerController', () => {
  let controller: ContainerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContainerController],
      providers: [ContainerService],
    }).compile();

    controller = module.get<ContainerController>(ContainerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
