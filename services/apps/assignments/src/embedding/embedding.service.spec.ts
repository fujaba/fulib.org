import {Test, TestingModule} from '@nestjs/testing';
import {
  CLIKE_FUNCTION_HEADER,
  EmbeddingService,
  findClosingBrace,
  findIndentEnd,
  PYTHON_FUNCTION_HEADER
} from './embedding.service';
import {ElasticsearchService} from "@nestjs/elasticsearch";
import {SearchService} from "../search/search.service";
import {OpenAIService} from "./openai.service";
import {SolutionService} from "../solution/solution.service";
// @ts-ignore
import * as ignore from 'ignore-file';

describe('EmbeddingService', () => {
  let service: EmbeddingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmbeddingService,
        SearchService,
        OpenAIService,
        {provide: SolutionService, useValue: null},
        {provide: ElasticsearchService, useValue: null},
      ],
    }).compile();

    service = module.get<EmbeddingService>(EmbeddingService);
  });

  it('should find C-like functions', () => {
    const code = `\
class Foo {
  void bar() {
    System.out.println()
  }

  void baz(int i) {
    if (i != 0) {
      i = i + 1;
    }
  }
`;

    expect(service.getFunctions(code, CLIKE_FUNCTION_HEADER, findClosingBrace)).toEqual([
      {
        name: 'bar',
        line: 1,
        text: `\
  void bar() {
    System.out.println()
  }`,
      },
      {
        name: 'baz',
        line: 5,
        text: `\
  void baz(int i) {
    if (i != 0) {
      i = i + 1;
    }
  }`,
      },
    ]);
  });


  it('should find Python functions', () => {
    const code = `\
class Foo:
  def bar():
    print()

    more()

  def baz(i):
    if i != 0:
      i = i + 1
`;

    expect(service.getFunctions(code, PYTHON_FUNCTION_HEADER, findIndentEnd)).toEqual([
      {
        name: 'bar',
        line: 1,
        text: `\
  def bar():
    print()

    more()

`,
      },
      {
        name: 'baz',
        line: 6,
        text: `\
  def baz(i):
    if i != 0:
      i = i + 1
`,
      },
    ]);
  });
});

describe('EmbeddingService helpers', () => {
  it('should calculate indent end', () => {
    const code = `\
def foo():
  if bar:
    return 1

def baz():
  pass
`;

    expect(findIndentEnd(code, 0, 10)).toEqual(34);
    expect(findIndentEnd(code, 35, 45)).toEqual(52);
    expect(findIndentEnd(code.trim(), 35, 45)).toEqual(51);
  });
});

describe('Ignore snippets', () => {
  it('should ignore files', () => {
    const ignoreFile = `\
      foo/
      !foo/Bar.java
    `;
    const ignoreFn = ignore.compile(ignoreFile) as (path: string) => boolean;
    expect(ignoreFn('foo/Foo.java')).toEqual(true);
    expect(ignoreFn('foo/Bar.java')).toEqual(false);
  });

  it('should ignore methods', () => {
    const ignoreFile = `\
      Foo.java#*
      !Foo.java#bar

      Bar.java
      !Bar.java#baz
    `;
    const ignoreFn = ignore.compile(ignoreFile) as (path: string) => boolean;
    // this is important, otherwise the documents will be pre-filtered
    expect(ignoreFn('Foo.java')).toEqual(false);
    expect(ignoreFn('Foo.java#bar')).toEqual(false);
    expect(ignoreFn('Foo.java#baz')).toEqual(true);

    expect(ignoreFn('Bar.java')).toEqual(true);
    expect(ignoreFn('Bar.java#bar')).toEqual(false);
    expect(ignoreFn('Bar.java#baz')).toEqual(false);
  });
});
