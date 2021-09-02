import { Test, TestingModule } from '@nestjs/testing';
import { AssigneeService } from './assignee.service';

describe('assigneeService', () => {
  let service: AssigneeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AssigneeService],
    }).compile();

    service = module.get<AssigneeService>(AssigneeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
