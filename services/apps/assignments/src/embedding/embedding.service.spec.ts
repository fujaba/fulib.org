import { Test, TestingModule } from '@nestjs/testing';
import {EmbeddingService, findIndentEnd} from './embedding.service';

describe('EmbeddingService', () => {
  let service: EmbeddingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmbeddingService],
    }).compile();

    service = module.get<EmbeddingService>(EmbeddingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

describe('EmbeddingService helpers', () => {
  it('should calculate indent end', () => {
    const code = `\
def foo():
  if bar:
    return 1

def baz():
  pass`;

    expect(findIndentEnd(code, 0, 10)).toEqual(34);
    expect(findIndentEnd(code, 35, 45)).toEqual(52);
  });
});
