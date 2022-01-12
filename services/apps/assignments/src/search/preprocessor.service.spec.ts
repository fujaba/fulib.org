import {Test, TestingModule} from '@nestjs/testing';
import {PreprocessorService} from './preprocessor.service';

describe('PreprocessorService', () => {
  let service: PreprocessorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PreprocessorService,
      ],
    }).compile();

    service = module.get<PreprocessorService>(PreprocessorService);
  });

  it('should replace line comments', () => {
    const original = `
    Test code
    // some comment
    Important
    More code # end of line comment
    Remaining code
    `;
    const actual = service.stripLineComments(original);
    const expected = `
    Test code
                   
    Important
    More code                      
    Remaining code
    `;
    expect(actual).toEqual(expected);
    expect(actual.length).toEqual(original.length);
  });

  it('should replace block comments', () => {
    const original = `
    Test code
    /*
     * some comment
     */
    More code
    sneaky /* inline comment */ code
    Code /* that is
    interrupted */ ends here
    `;
    const actual = service.stripBlockComments(original);
    const expected = `
    Test code
      
                   
       
    More code
    sneaky                      code
    Code           
                   ends here
    `;
    expect(actual).toEqual(expected);
    expect(actual.length).toEqual(original.length);
  })
});
