import { TestBed } from '@angular/core/testing';

import { TaskMarkdownService } from './task-markdown.service';

describe('TaskMarkdownService', () => {
  let service: TaskMarkdownService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TaskMarkdownService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
