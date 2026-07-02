import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ForbiddenException } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const supertest = require('supertest') as typeof import('supertest');
import * as jwt from 'jsonwebtoken';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { AuthGuard } from '../auth/auth.guard';

const TEST_JWT_SECRET = 'test-secret-key-for-jest';
const VALID_UUID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

function makeUserService() {
  return {
    findAll: jest.fn().mockResolvedValue({ data: [], total: 0, page: 1, limit: 300, totalPages: 0 }),
    updateUserSubscription: jest.fn().mockResolvedValue({ id: VALID_UUID, subscriptionType: 'Profesional' }),
    updateUserSubscriptionWithExpiration: jest.fn().mockResolvedValue({ id: VALID_UUID, subscriptionType: 'Profesional' }),
    updateUserSubscriptionByEmail: jest.fn().mockResolvedValue({ id: VALID_UUID, subscriptionType: 'Profesional' }),
    activateSubscription: jest.fn().mockResolvedValue({ id: VALID_UUID, subscriptionType: 'Profesional' }),
    remediateSubscriptionVerification: jest.fn().mockResolvedValue({
      candidates: [],
      applied: false,
      affectedCount: 0,
      dryRun: true,
    }),
  };
}

function makeToken(payload: object): string {
  return jwt.sign(payload, TEST_JWT_SECRET, { expiresIn: '1h' });
}

async function buildHttpApp(overrideService?: Partial<ReturnType<typeof makeUserService>>): Promise<{ app: INestApplication; mockUserService: ReturnType<typeof makeUserService> }> {
  const mockUserService = { ...makeUserService(), ...overrideService };

  // Override JWT_SECRET for AuthGuard
  process.env.JWT_SECRET = TEST_JWT_SECRET;

  const module: TestingModule = await Test.createTestingModule({
    controllers: [UserController],
    providers: [
      { provide: UserService, useValue: mockUserService },
    ],
  }).compile();

  const app = module.createNestApplication();
  await app.init();
  return { app, mockUserService };
}

describe('UserController — findAll', () => {
  it('forwards the email query param as the third argument to userService.findAll', async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: UserService, useValue: makeUserService() }],
    }).compile();
    const controller = module.get<UserController>(UserController);
    const mockUserService = module.get<UserService>(UserService) as any;
    await controller.findAll('1', '20', 'alice');
    expect(mockUserService.findAll).toHaveBeenCalledWith(1, 20, 'alice');
  });

  it('calls userService.findAll without email when param is omitted', async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: UserService, useValue: makeUserService() }],
    }).compile();
    const controller = module.get<UserController>(UserController);
    const mockUserService = module.get<UserService>(UserService) as any;
    await controller.findAll('1', '20', undefined);
    expect(mockUserService.findAll).toHaveBeenCalledWith(1, 20, undefined);
  });
});

// ===========================================================================
// Phase 2 Task 2.1 — Guards RED tests: existing subscription endpoints
// ===========================================================================

describe('UserController — subscription endpoint guards (Fase 2, Task 2.1)', () => {
  let app: INestApplication;
  let mockUserService: ReturnType<typeof makeUserService>;

  beforeAll(async () => {
    ({ app, mockUserService } = await buildHttpApp());
  });

  afterAll(async () => {
    await app.close();
  });

  it('B.1.a: PUT /:id/subscription sin token -> 401', async () => {
    await supertest(app.getHttpServer())
      .put(`/user/${VALID_UUID}/subscription`)
      .send({ subscriptionType: 'Profesional' })
      .expect(401);
  });

  it('B.2.a: PUT /update-subscription/:id sin token -> 401', async () => {
    await supertest(app.getHttpServer())
      .put(`/user/update-subscription/${VALID_UUID}`)
      .send({ subscriptionType: 'Profesional' })
      .expect(401);
  });

  it('B.2.b: PUT /update-subscription/:id con token no-admin -> 403', async () => {
    const token = makeToken({ id: 'user-1', role: 'PLAYER' });
    await supertest(app.getHttpServer())
      .put(`/user/update-subscription/${VALID_UUID}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ subscriptionType: 'Profesional' })
      .expect(403);
  });

  it('B.2.c: PUT /update-subscription/:id con token admin -> 200', async () => {
    const token = makeToken({ id: 'admin-1', role: 'ADMIN' });
    await supertest(app.getHttpServer())
      .put(`/user/update-subscription/${VALID_UUID}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ subscriptionType: 'Profesional' })
      .expect(200);
  });
});

// ===========================================================================
// Phase 2 Task 2.2 — New activate endpoint RED tests
// ===========================================================================

describe('UserController — PUT /subscription/activate (Fase 2, Task 2.2)', () => {
  let app: INestApplication;
  let mockUserService: ReturnType<typeof makeUserService>;

  beforeAll(async () => {
    ({ app, mockUserService } = await buildHttpApp());
  });

  afterAll(async () => {
    await app.close();
  });

  it('B.1.b: activate sin token -> 401', async () => {
    await supertest(app.getHttpServer())
      .put('/user/subscription/activate')
      .send({ sessionId: 'cs_test_abc123' })
      .expect(401);
  });

  it('B.1.b variant: activate con token, sesion no pagada -> 403', async () => {
    const token = makeToken({ id: 'user-1', role: 'PLAYER' });
    mockUserService.activateSubscription = jest
      .fn()
      .mockRejectedValue(new ForbiddenException('Session not paid'));

    await supertest(app.getHttpServer())
      .put('/user/subscription/activate')
      .set('Authorization', `Bearer ${token}`)
      .send({ sessionId: 'cs_test_unpaid' })
      .expect(403);
  });

  it('B.1.c: activate con token y sesion pagada -> 200 + subscriptionType actualizado', async () => {
    const token = makeToken({ id: 'user-1', role: 'PLAYER' });
    mockUserService.activateSubscription = jest.fn().mockResolvedValue({
      id: VALID_UUID,
      subscriptionType: 'Profesional',
      isVerified: false,
    });

    const res = await supertest(app.getHttpServer())
      .put('/user/subscription/activate')
      .set('Authorization', `Bearer ${token}`)
      .send({ sessionId: 'cs_test_paid_session' })
      .expect(200);

    expect(res.body.subscriptionType).toBe('Profesional');
  });
});

// ===========================================================================
// Phase 4 Task 4.1 — RED tests: POST /user/admin/remediate-subscription-verification
// ===========================================================================

describe('UserController — POST /admin/remediate-subscription-verification (Fase 4, Task 4.1)', () => {
  let app: INestApplication;
  let mockUserService: ReturnType<typeof makeUserService>;

  beforeAll(async () => {
    const remediateResult = {
      candidates: [{ id: 'cand-1', email: 'cand@example.com', verificationLevel: 'SEMIPROFESSIONAL' }],
      applied: false,
      affectedCount: 0,
      dryRun: true,
    };
    ({ app, mockUserService } = await buildHttpApp({
      remediateSubscriptionVerification: jest.fn().mockResolvedValue(remediateResult),
    } as any));
  });

  afterAll(async () => {
    await app.close();
  });

  it('D4.a: POST /admin/remediate-subscription-verification sin token -> 401', async () => {
    await supertest(app.getHttpServer())
      .post('/user/admin/remediate-subscription-verification')
      .expect(401);
  });

  it('D4.b: POST /admin/remediate-subscription-verification con token no-admin -> 403', async () => {
    const token = makeToken({ id: 'user-1', role: 'PLAYER' });
    await supertest(app.getHttpServer())
      .post('/user/admin/remediate-subscription-verification')
      .set('Authorization', `Bearer ${token}`)
      .expect(403);
  });

  it('D4.c: POST /admin/remediate-subscription-verification admin + dryRun=true (default) -> 200 con candidates', async () => {
    const token = makeToken({ id: 'admin-1', role: 'ADMIN' });
    const res = await supertest(app.getHttpServer())
      .post('/user/admin/remediate-subscription-verification')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.dryRun).toBe(true);
    expect(Array.isArray(res.body.candidates)).toBe(true);
  });

  it('D4.d: POST /admin/remediate-subscription-verification admin + ?dryRun=false -> applied=true', async () => {
    const token = makeToken({ id: 'admin-1', role: 'ADMIN' });
    (mockUserService as any).remediateSubscriptionVerification = jest.fn().mockResolvedValue({
      candidates: [],
      applied: true,
      affectedCount: 0,
      dryRun: false,
    });

    const res = await supertest(app.getHttpServer())
      .post('/user/admin/remediate-subscription-verification?dryRun=false')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.applied).toBe(true);
    expect(res.body.dryRun).toBe(false);
  });
});
