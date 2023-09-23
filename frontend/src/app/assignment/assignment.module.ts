import {CommonModule} from '@angular/common';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';

import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {ModalModule} from '@mean-stream/ngbx';
import {ClipboardModule} from 'ngx-clipboard';
import {DndModule} from 'ngx-drag-drop';

import {SharedModule} from '../shared/shared.module';
import {AssignmentRoutingModule} from './assignment-routing.module';
import {AssignmentSharedModule} from './modules/shared/shared.module';
import {ConfigFormComponent} from './pages/config-form/config-form.component';
import {CreateSolutionComponent} from './pages/create-solution/create-solution.component';
import {MyAssignmentsComponent} from './pages/my-assignments/my-assignments.component';
import {MySolutionsComponent} from './pages/my-solutions/my-solutions.component';
import {OverviewComponent} from './pages/overview/overview.component';
import {SettingsComponent} from './pages/settings/settings.component';
import {TokenModalComponent} from './pages/token-modal/token-modal.component';
import {ConfigService} from './services/config.service';
import {TokenInterceptor} from "./services/token.interceptor";
import {AssignmentService} from "./services/assignment.service";
import {TokenService} from "./services/token.service";
import {SolutionService} from "./services/solution.service";
import {TelemetryService} from "./services/telemetry.service";
import {CourseService} from "./services/course.service";
import {GithubService} from "./services/github.service";
import {SelectionService} from "./services/selection.service";
import {SolutionContainerService} from "./services/solution-container.service";
import {TaskService} from "./services/task.service";
import {SubmitService} from "./modules/assignment/submit.service";

@NgModule({
  declarations: [
    CreateSolutionComponent,
    MyAssignmentsComponent,
    MySolutionsComponent,
    TokenModalComponent,
    OverviewComponent,
    SettingsComponent,
    ConfigFormComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    HttpClientModule,
    NgbModule,
    ClipboardModule,
    AssignmentSharedModule,
    AssignmentRoutingModule,
    DndModule,
    ModalModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      multi: true,
      useClass: TokenInterceptor,
    },
    TokenService,
    ConfigService,
    AssignmentService,
    SolutionService,
    TelemetryService,
    CourseService,
    GithubService,
    SelectionService,
    SolutionContainerService,
    TaskService,
    SubmitService,
  ],
})
export class AssignmentModule {
}
