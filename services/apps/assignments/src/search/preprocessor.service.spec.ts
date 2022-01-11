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
    expect(service.stripLineComments(`
    Test code
    // some comment
    Important
    More code # end of line comment
    Remaining code
    `)).toEqual(`
    Test code
    
    Important
    More code 
    Remaining code
    `);
  });

  it('should replace block comments', () => {
    expect(service.stripBlockComments(`
    Test code
    /*
     * some comment
     */
    More code
    sneaky /* inline comment */ code
    Code /* that is
    interrupted */ ends here
    `)).toEqual(`
    Test code
      
                   
       
    More code
    sneaky                      code
    Code           
                   ends here
    `);
  })
});
