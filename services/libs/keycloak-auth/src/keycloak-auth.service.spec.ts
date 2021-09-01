import { Test, TestingModule } from '@nestjs/testing';
import { KeycloakAuthService } from './keycloak-auth.service';

describe('KeycloakAuthService', () => {
  let service: KeycloakAuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [KeycloakAuthService],
    }).compile();

    service = module.get<KeycloakAuthService>(KeycloakAuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
