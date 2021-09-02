import {Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {CourseController} from './course.controller';
import {CourseSchema} from './course.schema';
import {CourseService} from './course.service';

// TODO migration: courses { id -> _id, assignmentIds -> assignments, userId -> creator }

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'courses',
        schema: CourseSchema,
      },
    ]),
  ],
  controllers: [CourseController],
  providers: [CourseService],
})
export class CourseModule {
}
