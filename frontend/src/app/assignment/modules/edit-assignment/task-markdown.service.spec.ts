import {TestBed} from '@angular/core/testing';
import {TaskMarkdownService} from './task-markdown.service';
import Task from '../../model/task';
import {TaskService} from '../../services/task.service';

describe(TaskMarkdownService.name, () => {
  let md: TaskMarkdownService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TaskService, TaskMarkdownService],
    });
    md = TestBed.inject(TaskMarkdownService);
  });

  it('should render markdown', () => {
    const tasks: Task[] = [
      {
        _id: 'A', description: 'A', points: 1, children: [
          {_id: 'A.1', description: 'A.1', points: 2, children: []},
        ],
      },
      // See https://github.com/fujaba/fulib.org/issues/441.
      // This must output as a ## headline.
      {_id: 'B', description: 'B', points: -1, children: []},
      // And to avoid C becoming a child of B, it must also output as a ## headline.
      {_id: 'C', description: 'C', points: 3, children: []},
    ];
    const markdown = md.renderTasks(tasks);
    expect(markdown).toBe(`\
## A (1P)<!--{"_id":"A"}-->
- A.1 (2P)<!--{"_id":"A.1"}-->
## B (-1P)<!--{"_id":"B"}-->
## C (3P)<!--{"_id":"C"}-->
`);
  });
});
