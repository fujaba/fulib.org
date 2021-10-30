import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitterService } from './event.service';

describe('EventEmitterService', () => {
  let service: EventEmitterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EventEmitterService],
    }).compile();

    service = module.get<EventEmitterService>(EventEmitterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
