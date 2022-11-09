import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ToastService} from 'ng-bootstrap-ext';
import {Observable} from 'rxjs';
import {debounceTime, distinctUntilChanged, map} from 'rxjs/operators';
import {Assignee} from '../../../model/assignee';
import {SolutionService} from '../../../services/solution.service';

@Component({
  selector: 'app-assignee-input',
  templateUrl: './assignee-input.component.html',
  styleUrls: ['./assignee-input.component.scss'],
})
export class AssigneeInputComponent implements OnInit {
  @Input() assignment: string;
  @Input() solution: string;
  @Input() assignee: string = '';

  @Input() assignees: string[] = [];

  @Output() assigneeChange = new EventEmitter<string>();
  @Output() saved = new EventEmitter<Assignee>();

  saving = false;

  assigneeTypeahead = (text$: Observable<string>): Observable<string[]> => text$.pipe(
    debounceTime(200),
    distinctUntilChanged(),
    map(searchInput => this.assignees.filter(a => a.startsWith(searchInput)).slice(0, 10)),
  );

  constructor(
    private solutionService: SolutionService,
    private toastService: ToastService,
  ) {
  }

  ngOnInit(): void {
  }

  save(): void {
    this.saving = true;
    this.solutionService.setAssignee(this.assignment, this.solution, this.assignee).subscribe(result => {
      this.saving = false;
      this.saved.next(result);
      this.assigneeChange.next(result.assignee);
      this.toastService.success('Assignee', this.assignee ? `Successfully assigned to ${this.assignee}` : 'Successfully de-assigned');
    }, error => {
      this.saving = false;
      this.toastService.error('Assignee', 'Failed to assign', error);
    });
  }
}
