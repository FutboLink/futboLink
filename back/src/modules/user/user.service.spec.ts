import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { VerificationRequest } from './entities/verification-request.entity';
import { EmailService } from '../Mailing/email.service';

function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: 'user-id',
    email: 'user@example.com',
    subscriptionType: 'Amateur',
    subscriptionExpiresAt: null as unknown as Date,
    ...overrides,
  } as User;
}

function makeUserRepoMock() {
  return {
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    manager: {
      connection: {
        createQueryRunner: jest.fn().mockReturnValue({
          connect: jest.fn().mockResolvedValue(undefined),
          release: jest.fn().mockResolvedValue(undefined),
          hasTable: jest.fn().mockResolvedValue(true),
          query: jest.fn().mockResolvedValue([]),
          hasColumn: jest.fn().mockResolvedValue(true),
        }),
      },
    },
  };
}

async function buildService() {
  const userRepo = makeUserRepoMock();
  const verificationRepo = { findOne: jest.fn() };
  const entityManager = { query: jest.fn().mockResolvedValue([]) } as unknown as EntityManager;
  const emailService = { sendMail: jest.fn() } as unknown as EmailService;

  const module: TestingModule = await Test.createTestingModule({
    providers: [
      UserService,
      { provide: getRepositoryToken(User), useValue: userRepo },
      { provide: getRepositoryToken(VerificationRequest), useValue: verificationRepo },
      { provide: EntityManager, useValue: entityManager },
      { provide: EmailService, useValue: emailService },
    ],
  }).compile();

  const service = module.get<UserService>(UserService);
  jest.spyOn(service, 'findOne' as any).mockImplementation(async (id: any) => {
    const user = await (userRepo.findOne as jest.Mock)({ where: { id } });
    if (!user) {
      throw new (require('@nestjs/common').NotFoundException)(`Usuario con ID ${id} no encontrado`);
    }
    return user;
  });
  return { service, userRepo };
}

describe('UserService - subscription state resolution', () => {
  describe('computeIsActive (via getUserSubscription)', () => {
    it('A: Profesional + null subscriptionExpiresAt -> isActive=true', async () => {
      const { service, userRepo } = await buildService();
      userRepo.findOne.mockResolvedValue(
        makeUser({ subscriptionType: 'Profesional', subscriptionExpiresAt: null as any }),
      );
      const result = await service.getUserSubscription('user-id');
      expect(result.isActive).toBe(true);
    });

    it('B: Semiprofesional + null subscriptionExpiresAt -> isActive=true', async () => {
      const { service, userRepo } = await buildService();
      userRepo.findOne.mockResolvedValue(
        makeUser({ subscriptionType: 'Semiprofesional', subscriptionExpiresAt: null as any }),
      );
      const result = await service.getUserSubscription('user-id');
      expect(result.isActive).toBe(true);
    });

    it('C: Profesional + future expiresAt -> isActive=true', async () => {
      const { service, userRepo } = await buildService();
      const future = new Date(Date.now() + 86_400_000);
      userRepo.findOne.mockResolvedValue(
        makeUser({ subscriptionType: 'Profesional', subscriptionExpiresAt: future }),
      );
      const result = await service.getUserSubscription('user-id');
      expect(result.isActive).toBe(true);
    });

    it('D: Profesional + past expiresAt -> isActive=true (cancellation invariant)', async () => {
      const { service, userRepo } = await buildService();
      const past = new Date(Date.now() - 86_400_000);
      userRepo.findOne.mockResolvedValue(
        makeUser({ subscriptionType: 'Profesional', subscriptionExpiresAt: past }),
      );
      const result = await service.getUserSubscription('user-id');
      expect(result.isActive).toBe(true);
    });

    it('E: Amateur + future expiresAt -> isActive=false', async () => {
      const { service, userRepo } = await buildService();
      const future = new Date(Date.now() + 86_400_000);
      userRepo.findOne.mockResolvedValue(
        makeUser({ subscriptionType: 'Amateur', subscriptionExpiresAt: future }),
      );
      const result = await service.getUserSubscription('user-id');
      expect(result.isActive).toBe(false);
    });

    it('F: Amateur + null expiresAt -> isActive=false', async () => {
      const { service, userRepo } = await buildService();
      userRepo.findOne.mockResolvedValue(
        makeUser({ subscriptionType: 'Amateur', subscriptionExpiresAt: null as any }),
      );
      const result = await service.getUserSubscription('user-id');
      expect(result.isActive).toBe(false);
    });

    it('G: unrecognized tier -> isActive=false (safe default)', async () => {
      const { service, userRepo } = await buildService();
      userRepo.findOne.mockResolvedValue(
        makeUser({ subscriptionType: 'FutureTier' as any, subscriptionExpiresAt: null as any }),
      );
      const result = await service.getUserSubscription('user-id');
      expect(result.isActive).toBe(false);
    });

    it('throws NotFoundException when user does not exist', async () => {
      const { service, userRepo } = await buildService();
      userRepo.findOne.mockResolvedValue(null);
      await expect(service.getUserSubscription('missing-id')).rejects.toThrow(
        'Usuario con ID missing-id no encontrado',
      );
    });
  });

  describe('getUserSubscriptionByEmail', () => {
    it('returns isActive=true for Profesional user with null expiresAt', async () => {
      const { service, userRepo } = await buildService();
      userRepo.findOne.mockResolvedValue(
        makeUser({ subscriptionType: 'Profesional', subscriptionExpiresAt: null as any }),
      );
      const result = await service.getUserSubscriptionByEmail('user@example.com');
      expect(result.isActive).toBe(true);
      expect(result.subscriptionType).toBe('Profesional');
    });

    it('returns isActive=false for Amateur user with null expiresAt', async () => {
      const { service, userRepo } = await buildService();
      userRepo.findOne.mockResolvedValue(
        makeUser({ subscriptionType: 'Amateur', subscriptionExpiresAt: null as any }),
      );
      const result = await service.getUserSubscriptionByEmail('user@example.com');
      expect(result.isActive).toBe(false);
    });

    it('throws NotFoundException when email is not found', async () => {
      const { service, userRepo } = await buildService();
      userRepo.findOne.mockResolvedValue(null);
      await expect(
        service.getUserSubscriptionByEmail('missing@example.com'),
      ).rejects.toThrow('Usuario con email missing@example.com no encontrado');
    });

    it('both methods agree on isActive for the same Profesional user', async () => {
      const { service, userRepo } = await buildService();
      const user = makeUser({
        subscriptionType: 'Semiprofesional',
        subscriptionExpiresAt: null as any,
      });
      userRepo.findOne.mockResolvedValue(user);
      const byId = await service.getUserSubscription(user.id);
      const byEmail = await service.getUserSubscriptionByEmail(user.email);
      expect(byId.isActive).toBe(byEmail.isActive);
      expect(byId.isActive).toBe(true);
    });
  });
});

// ===========================================================================
// findAll - QueryBuilder path (Phase 2 TDD)
// ===========================================================================

function makeQueryBuilderStub(resolvedData: [User[], number]) {
  const stub = {
    select: jest.fn(),
    leftJoinAndSelect: jest.fn(),
    andWhere: jest.fn(),
    orderBy: jest.fn(),
    take: jest.fn(),
    skip: jest.fn(),
    getManyAndCount: jest.fn().mockResolvedValue(resolvedData),
  };
  stub.select.mockReturnThis();
  stub.leftJoinAndSelect.mockReturnThis();
  stub.andWhere.mockReturnThis();
  stub.orderBy.mockReturnThis();
  stub.take.mockReturnThis();
  stub.skip.mockReturnThis();
  return stub;
}

async function buildServiceWithQb(qbStub: ReturnType<typeof makeQueryBuilderStub>) {
  const userRepo = {
    ...makeUserRepoMock(),
    createQueryBuilder: jest.fn().mockReturnValue(qbStub),
  };
  const verificationRepo = { findOne: jest.fn() };
  const entityManager = { query: jest.fn().mockResolvedValue([]) } as unknown as EntityManager;
  const emailService = { sendMail: jest.fn() } as unknown as EmailService;

  const module: TestingModule = await Test.createTestingModule({
    providers: [
      UserService,
      { provide: getRepositoryToken(User), useValue: userRepo },
      { provide: getRepositoryToken(VerificationRequest), useValue: verificationRepo },
      { provide: EntityManager, useValue: entityManager },
      { provide: EmailService, useValue: emailService },
    ],
  }).compile();

  const service = module.get<UserService>(UserService);
  return { service, userRepo };
}

describe('UserService - findAll', () => {
  const users = [
    makeUser({ email: 'alice@example.com' }),
    makeUser({ email: 'john@example.com' }),
  ];

  it('(a) no fragment -> andWhere is NOT called for email', async () => {
    const qbStub = makeQueryBuilderStub([users, 2]);
    const { service } = await buildServiceWithQb(qbStub);
    await service.findAll(1, 300);
    expect(qbStub.andWhere).not.toHaveBeenCalledWith(
      expect.stringContaining('email'),
      expect.anything(),
    );
  });

  it('(b) fragment "john" -> andWhere called with LOWER LIKE predicate', async () => {
    const qbStub = makeQueryBuilderStub([users, 2]);
    const { service } = await buildServiceWithQb(qbStub);
    await service.findAll(1, 300, 'john');
    expect(qbStub.andWhere).toHaveBeenCalledWith(
      'LOWER(user.email) LIKE LOWER(:email)',
      { email: '%john%' },
    );
  });

  it('(c) uppercase fragment is forwarded as-is (DB handles case-insensitivity via LOWER())', async () => {
    const qbStub = makeQueryBuilderStub([users, 2]);
    const { service } = await buildServiceWithQb(qbStub);
    await service.findAll(1, 300, 'JOHN');
    expect(qbStub.andWhere).toHaveBeenCalledWith(
      'LOWER(user.email) LIKE LOWER(:email)',
      { email: '%JOHN%' },
    );
  });

  it('(d) empty string treated as no fragment -> andWhere NOT called for email', async () => {
    const qbStub = makeQueryBuilderStub([users, 2]);
    const { service } = await buildServiceWithQb(qbStub);
    await service.findAll(1, 300, '');
    expect(qbStub.andWhere).not.toHaveBeenCalledWith(
      expect.stringContaining('email'),
      expect.anything(),
    );
  });

  it('(e) select() is called with a list that includes subscriptionExpiresAt', async () => {
    const qbStub = makeQueryBuilderStub([users, 2]);
    const { service } = await buildServiceWithQb(qbStub);
    await service.findAll(1, 300);
    expect(qbStub.select).toHaveBeenCalledWith(
      expect.arrayContaining([expect.stringContaining('subscriptionExpiresAt')]),
    );
  });

  it('(f) orderBy("user.createdAt", "DESC") is called', async () => {
    const qbStub = makeQueryBuilderStub([users, 2]);
    const { service } = await buildServiceWithQb(qbStub);
    await service.findAll(1, 300);
    expect(qbStub.orderBy).toHaveBeenCalledWith('user.createdAt', 'DESC');
  });

  it('returns data and total from getManyAndCount', async () => {
    const qbStub = makeQueryBuilderStub([users, 2]);
    const { service } = await buildServiceWithQb(qbStub);
    const result = await service.findAll(1, 300);
    expect(result.data).toEqual(users);
    expect(result.total).toBe(2);
  });
});
