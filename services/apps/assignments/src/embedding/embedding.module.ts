import {Module} from '@nestjs/common';
import {EmbeddingService} from './embedding.service';
import {EmbeddingController} from './embedding.controller';
import {SearchModule} from "../search/search.module";
import {ClassroomModule} from "../classroom/classroom.module";
import {ElasticsearchModule} from "@nestjs/elasticsearch";
import {environment} from "../environment";
import {AssignmentModule} from "../assignment/assignment.module";
import {EmbeddingHandler} from "./embedding.handler";
import {OpenAIService} from "./openai.service";

@Module({
  imports: [
    ElasticsearchModule.register(environment.elasticsearch), // TODO: move to search module
    SearchModule,
    ClassroomModule,
    AssignmentModule,
  ],
  providers: [
    OpenAIService,
    EmbeddingService,
    EmbeddingHandler,
  ],
  controllers: [EmbeddingController],
})
export class EmbeddingModule {
}
