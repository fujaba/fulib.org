import {Component, HostListener, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {merge, Observable, Subject} from 'rxjs';
import {debounceTime, distinctUntilChanged, map, switchMap} from 'rxjs/operators';
import {CreateEvaluationDto, RemarkDto} from '../../../model/evaluation';
import Task from '../../../model/task';
import {ConfigService} from '../../../services/config.service';
import {SolutionService} from '../../../services/solution.service';

@Component({
  selector: 'app-evaluation-form',
  templateUrl: './evaluation-form.component.html',
  styleUrls: ['./evaluation-form.component.scss'],
})
export class EvaluationFormComponent implements OnInit, OnChanges {
  @Input() dto: CreateEvaluationDto;
  @Input() task?: Task;

  loggedIn = false;
  min = 0;
  max = 0;
  remarkLines = 1;

  remarks: RemarkDto[] = [];

  constructor(
    private solutionService: SolutionService,
    private configService: ConfigService,
    private route: ActivatedRoute,
  ) {
  }

  ngOnInit(): void {
    this.route.params.pipe(
      switchMap(({aid, task}) => this.solutionService.getEvaluationRemarks(aid, {task})),
    ).subscribe(remarks => this.remarks = remarks);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.dto) {
      const dto: CreateEvaluationDto = changes.dto.currentValue;
      this.remarkLines = dto.remark.split('\n').length;
    }
    if (changes.task) {
      const task: Task | undefined = changes.task.currentValue;
      if (task) {
        this.min = Math.min(task.points, 0);
        this.max = Math.max(task.points, 0);
      }
    }
  }

  @HostListener('document:keyup', ['$event'])
  onCtrl0(event: KeyboardEvent) {
    if (event.ctrlKey && event.key === '0') {
      this.setPoints(0);
    }
  }

  setPoints(points: number) {
    this.dto.points = points;
  }

  saveDraft(): void {
    this.configService.set('name', this.dto.author);
  }

  setRemark(remark: RemarkDto) {
    this.dto.remark = remark.remark;
    this.dto.points = remark.points;
  }
}
