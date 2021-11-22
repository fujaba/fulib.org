import {Module} from '@nestjs/common';
import {ElasticsearchModule} from '@nestjs/elasticsearch';
import {environment} from '../environment';
import {SearchService} from './search.service';

@Module({
  imports: [
    ElasticsearchModule.register(environment.elasticsearch),
  ],
  providers: [
    SearchService,
  ],
  exports: [
    SearchService,
  ],
})
export class SearchModule {
}
