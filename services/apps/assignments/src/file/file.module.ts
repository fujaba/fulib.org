import {Module} from '@nestjs/common';
import {SearchModule} from "../search/search.module";
import {FileService} from "./file.service";

@Module({
  imports: [SearchModule],
  providers: [FileService],
  exports: [FileService],
})
export class FileModule {
}
