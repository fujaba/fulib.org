import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {switchMap, tap} from 'rxjs/operators';
import {CourseService} from 'src/app/assignment/services/course.service';
import Course, {CourseStudent} from '../../../model/course';
import {authorInfoProperties} from '../../../model/solution';
import {AssignmentService} from "../../../services/assignment.service";
import {ReadAssignmentDto} from "../../../model/assignment";
import {AssigneeService} from "../../../services/assignee.service";
import {BulkUpdateAssigneeDto} from "../../../model/assignee";
import {ToastService} from "@mean-stream/ngbx";
import {TaskService} from "../../../services/task.service";

@Component({
  selector: 'app-students',
  templateUrl: './students.component.html',
  styleUrls: ['./students.component.scss'],
  standalone: false,
})
export class StudentsComponent implements OnInit {
  course?: Course;
  students?: CourseStudent[];
  assignments: (ReadAssignmentDto | undefined)[] = [];
  assignmentPoints: number[] = [];
  assignmentNames: string[] = [];
  assignees: string[] = [];

  readonly authorProperties = authorInfoProperties;

  constructor(
    private route: ActivatedRoute,
    private courseService: CourseService,
    private assignmentService: AssignmentService,
    private assigneeService: AssigneeService,
    private toastService: ToastService,
    private taskService: TaskService,
  ) {
  }

  ngOnInit(): void {
    this.route.params.pipe(
      switchMap(({cid}) => this.courseService.get(cid)),
      tap(course => this.course = course),
      switchMap(course => this.assignmentService.findIds(course.assignments)),
    ).subscribe(assignments => {
      this.assignments = assignments;
      this.assignmentNames = this.courseService.getAssignmentNames(assignments);
      this.assignmentPoints = assignments.map(a => a ? a.passingPoints ?? this.taskService.sumPositivePoints(a.tasks) / 2 : 0);
    });

    this.route.params.pipe(
      switchMap(({cid}) => this.courseService.getStudents(cid)),
    ).subscribe(students => {
      this.students = students;
      this.assignees = [...new Set(students
        .flatMap(s => s.solutions
          .map(s => s?.assignee)
          .filter((x): x is string => !!x)
        )
      )].sort();
    });
  }

  copyAssignees(to: number, from: number) {
    if (!this.course || !this.students) {
      return;
    }
    this.assigneeService.updateMany(this.course.assignments[to], this.students
      .map(student => {
        const fromSolution = student.solutions[from];
        const toSolution = student.solutions[to];
        if (!fromSolution || !toSolution || !fromSolution.assignee) {
          return;
        }
        return {
          solution: toSolution._id,
          assignee: fromSolution.assignee,
        };
      })
      .filter((x): x is BulkUpdateAssigneeDto => !!x),
    ).subscribe(assignees => {
      const solutionIdToAssignee = Object.fromEntries(assignees.map(a => [a.solution, a.assignee]));
      for (const student of this.students!) {
        const solution = student.solutions[to];
        if (!solution) {
          continue;
        }
        const assignee = solutionIdToAssignee[solution._id];
        if (!assignee) {
          continue;
        }
        solution.assignee = assignee;
      }
      this.toastService.success('Copy Assignees', `Successfully copied ${assignees.length} assignees.`);
    });
  }
}
