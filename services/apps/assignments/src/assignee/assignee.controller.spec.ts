import { Test, TestingModule } from '@nestjs/testing';
import { AssigneeController } from './assignee.controller';
import { AssigneeService } from './assignee.service';

describe('assigneeController', () => {
  let controller: AssigneeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AssigneeController],
      providers: [AssigneeService],
    }).compile();

    controller = module.get<AssigneeController>(AssigneeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
