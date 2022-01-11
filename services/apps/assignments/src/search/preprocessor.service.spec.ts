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
  });

  it('should rename Java variables', () => {
    expect(service.renameJavaVariables(`
    public static void main(String[] args) {
      int i = 6;
      int j = 7;
      int answer = i * j;
      String greeting = "Hello";
      System.out.println(greeting);
      System.out.println("Answer: " + answer);
    }
    `)).toEqual(`
    public static void main(String[] s0  ) {
      int i = 6;
      int j = 7;
      int i0     = i * j;
      String s1       = "Hello";
      System.out.println(s1      );
      System.out.println("Answer: " + i0    );
    }
    `);
  });
});
