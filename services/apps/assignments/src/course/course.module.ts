import {Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {SolutionModule} from '../solution/solution.module';
import {CourseController} from './course.controller';
import {CourseSchema} from './course.schema';
import {CourseService} from './course.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'courses',
        schema: CourseSchema,
      },
    ]),
    SolutionModule,
  ],
  controllers: [CourseController],
  providers: [CourseService],
})
export class CourseModule {
}
