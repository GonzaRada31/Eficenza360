import { Test, TestingModule } from '@nestjs/testing';
import { IamService } from './iam.service';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

describe('IamService', () => {
  let service: IamService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IamService,
        {
          provide: PrismaService,
          useValue: {},
        },
        {
          provide: JwtService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<IamService>(IamService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
