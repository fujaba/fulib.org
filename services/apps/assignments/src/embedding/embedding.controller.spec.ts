import { Test, TestingModule } from '@nestjs/testing';
import { EmbeddingController } from './embedding.controller';

describe('EmbeddingController', () => {
  let controller: EmbeddingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmbeddingController],
    }).compile();

    controller = module.get<EmbeddingController>(EmbeddingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
