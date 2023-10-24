import {CommonModule} from '@angular/common';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';

import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {FormsModule as NgbxFormsModule, ModalModule} from '@mean-stream/ngbx';
import {ClipboardModule} from 'ngx-clipboard';
import {DndModule} from 'ngx-drag-drop';

import {SharedModule} from '../shared/shared.module';
import {AssignmentRoutingModule} from './assignment-routing.module';
import {AssignmentSharedModule} from './modules/shared/shared.module';
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
import {SelectionService} from "./services/selection.service";
import {SolutionContainerService} from "./services/solution-container.service";
import {TaskService} from "./services/task.service";
import {SubmitService} from "./modules/assignment/submit.service";
import {AssigneeService} from "./services/assignee.service";
import {EvaluationService} from "./services/evaluation.service";
import {EmbeddingService} from "./services/embedding.service";
import {KeycloakBearerInterceptor} from "keycloak-angular";

@NgModule({
  declarations: [
    CreateSolutionComponent,
    MyAssignmentsComponent,
    MySolutionsComponent,
    TokenModalComponent,
    OverviewComponent,
    SettingsComponent,
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
    NgbxFormsModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      multi: true,
      useClass: TokenInterceptor,
    },
    {
      provide: HTTP_INTERCEPTORS,
      multi: true,
      useClass: KeycloakBearerInterceptor,
    },
    TokenService,
    ConfigService,
    AssignmentService,
    SolutionService,
    TelemetryService,
    CourseService,
    SelectionService,
    SolutionContainerService,
    TaskService,
    SubmitService,
    AssigneeService,
    EvaluationService,
    EmbeddingService,
  ],
})
export class AssignmentModule {
}
