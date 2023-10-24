import {ElasticsearchService} from '@nestjs/elasticsearch';
import {Test, TestingModule} from '@nestjs/testing';
import {FileDocument, SearchService} from './search.service';
import {estypes} from "@elastic/elasticsearch";

describe('SearchService', () => {
  let service: SearchService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchService,
        {provide: ElasticsearchService, useValue: null},
      ],
    }).compile();

    service = module.get<SearchService>(SearchService);
  });

  const content = 'Hello World\nThis is a World!\nWorld be greeted.';
  const highlight = 'Hello <b>World</b>\nThis is a <b>World</b>!\n<b>World</b> be greeted.';

  it('should build line start list', () => {
    const lineStarts = service._buildLineStartList(content);
    expect(lineStarts).toEqual([0, 12, 29]);
  });

  it('should find locations', () => {
    const lineStarts = [0, 12, 29];
    expect(service._findLocation(lineStarts, 6)).toEqual({line: 0, character: 6});
    expect(service._findLocation(lineStarts, 11)).toEqual({line: 0, character: 11});
    expect(service._findLocation(lineStarts, 22)).toEqual({line: 1, character: 10});
    expect(service._findLocation(lineStarts, 27)).toEqual({line: 1, character: 15});
    expect(service._findLocation(lineStarts, 29)).toEqual({line: 2, character: 0});
    expect(service._findLocation(lineStarts, 34)).toEqual({line: 2, character: 5});
  });

  it('should convert hits', () => {
    const hit: estypes.SearchHit<FileDocument> = {
      _index: 'files',
      _id: '0',
      _source: {assignment: 'a1', solution: 's1', file: 'test.java', content: content},
      highlight: {content: [highlight]},
    };
    const result = service._convertHit(hit, 'b');
    expect(result.assignment).toBe('a1');
    expect(result.solution).toBe('s1');
    expect(result.snippets[0]).toStrictEqual({
      file: 'test.java',
      code: 'World',
      comment: '',
      from: {line: 0, character: 6},
      to: {line: 0, character: 11},
    });
    expect(result.snippets[1]).toStrictEqual({
      file: 'test.java',
      code: 'World',
      comment: '',
      from: {line: 1, character: 10},
      to: {line: 1, character: 15},
    });
    expect(result.snippets[2]).toStrictEqual({
      file: 'test.java',
      code: 'World',
      comment: '',
      from: {line: 2, character: 0},
      to: {line: 2, character: 5},
    });
  });

  it('should convert wildcard hits', () => {
    const highlight = 'Hello World\n<b>This</b> is a <b>World</b>!\nWorld be greeted.';
    const hit: estypes.SearchHit<FileDocument> = {
      _index: 'files',
      _id: '0',
      _source: {assignment: 'a1', solution: 's1', file: 'test.java', content},
      highlight: {content: [highlight]},
    };
    const result = service._convertHit(hit, 'b', undefined, 2);
    expect(result.assignment).toBe('a1');
    expect(result.solution).toBe('s1');
    expect(result.snippets[0]).toStrictEqual({
      file: 'test.java',
      code: 'This is a World',
      comment: '',
      from: {line: 1, character: 0},
      to: {line: 1, character: 15},
    });
  });

  it('should create phrase queries', () => {
    const query = service._createQuery('Hello there, General Kenobi');
    expect(query).toStrictEqual({
      tokens: 1,
      highlighter: 'fvh',
      query: {
        match_phrase: {
          content: {
            query: 'Hello there, General Kenobi',
          },
        },
      },
    });
  });

  it('should create wildcard queries', () => {
    const query = service._createQuery('Hello there, ## Kenobi', '##');
    expect(query).toStrictEqual({
      tokens: 4,
      highlighter: 'unified',
      query: {
        span_near: {
          in_order: true,
          slop: 100,
          clauses: [
            {
              span_near: {
                in_order: true,
                slop: 0,
                clauses: [
                  {span_term: {content: 'Hello'}},
                  {span_term: {content: 'there'}},
                  {span_term: {content: ','}},
                ],
              },
            },
            {span_term: {content: 'Kenobi'}},
          ],
        },
      },
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
