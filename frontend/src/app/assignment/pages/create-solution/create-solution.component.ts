import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ToastService} from '@mean-stream/ngbx';
import {forkJoin, of} from 'rxjs';
import {switchMap, tap} from 'rxjs/operators';
import {UserService} from '../../../user/user.service';
import {ReadAssignmentDto} from '../../model/assignment';
import Course from '../../model/course';
import {AuthorInfo} from '../../model/solution';
import {AssignmentService} from '../../services/assignment.service';
import {ConfigService} from '../../services/config.service';
import {CourseService} from '../../services/course.service';
import {SolutionService} from '../../services/solution.service';

@Component({
  selector: 'app-create-solution',
  templateUrl: './create-solution.component.html',
  styleUrls: ['./create-solution.component.scss'],
  standalone: false,
})
export class CreateSolutionComponent implements OnInit {
  course?: Course;
  assignment?: ReadAssignmentDto;
  loggedIn = false;
  author: AuthorInfo;
  files: File[] = [];

  submitting: boolean;

  nextAssignment?: ReadAssignmentDto;

  constructor(
    private courseService: CourseService,
    private assignmentService: AssignmentService,
    private solutionService: SolutionService,
    private configService: ConfigService,
    private router: Router,
    private route: ActivatedRoute,
    private users: UserService,
    private toastService: ToastService,
  ) {
  }

  ngOnInit(): void {
    this.author = this.solutionService.getAuthor() ?? {
      name: this.configService.get('name'),
      studentId: '',
      email: this.configService.get('email'),
      github: '',
    };

    this.route.params.pipe(
      switchMap(params => forkJoin({
        assignment: this.assignmentService.get(params.aid).pipe(tap(assignment => {
          this.assignment = assignment;
        })),
        course: params.cid ? this.courseService.get(params.cid).pipe(tap(course => this.course = course)) : of(undefined),
      })),
      switchMap(({
                   assignment,
                   course,
                 }) => assignment && course ? this.assignmentService.getNext(course, assignment) : of(undefined)),
    ).subscribe(next => {
      this.nextAssignment = next;
    });

    this.users.getCurrent().subscribe(user => {
      this.loggedIn = !!user;
    });
  }

  saveDraft(): void {
    this.solutionService.setAuthor(this.author);
  }

  addFiles(files: FileList) {
    this.files.push(...Array.from(files));
  }

  submit(): void {
    if (!this.assignment) {
      return;
    }

    this.submitting = true;
    this.solutionService.submit(this.assignment._id, {
      author: this.author,
    }, this.files).subscribe(result => {
      this.submitting = false;
      this.toastService.success('Solution', 'Successfully submitted solution');
      if (this.course && this.nextAssignment) {
        this.router.navigate(['/assignments', 'courses', this.course._id, 'assignments', this.nextAssignment._id]);
      } else {
        this.router.navigate(['/assignments', result.assignment, 'solutions', result._id, 'share']);
      }
    }, error => {
      this.toastService.error('Solution', 'Failed to submit solution', error);
      this.submitting = false;
    });
  }
}
