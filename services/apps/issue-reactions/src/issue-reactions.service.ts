import { Injectable } from '@nestjs/common';

@Injectable()
export class IssueReactionsService {
  getHello(): string {
    return 'Hello World!';
  }
}
