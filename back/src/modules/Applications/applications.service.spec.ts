import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ForbiddenException } from '@nestjs/common';
import { ApplicationService } from './applications.service';
import { Application } from './entities/applications.entity';
import { User } from '../user/entities/user.entity';
import { Job } from '../Jobs/entities/jobs.entity';
import { StripeService } from '../../payments/services/stripe.service';
import { UserService } from '../user/user.service';
import { NotificationsService } from '../Notifications/notifications.service';
import { UserType } from '../user/roles.enum';

function makePlayer(overrides: Partial<User> = {}): User {
  return {
    id: 'player-1',
    email: 'player@example.com',
    role: UserType.PLAYER,
    name: 'Juan',
    lastname: 'Perez',
    isVerified: false,
    ...overrides,
  } as User;
}

async function buildService(getUserSubscriptionByEmailImpl: (...args: any[]) => any) {
  const applicationRepository = {
    findOne: jest.fn().mockResolvedValue(null),
    create: jest.fn((data) => data),
    save: jest.fn(async (a: any) => ({ id: 'app-1', ...a })),
    find: jest.fn(),
  };
  const userRepository = { findOne: jest.fn() };
  const jobRepository = {
    findOne: jest
      .fn()
      .mockResolvedValue({ id: 'job-1', title: 'Delantero', recruiter: { id: 'recruiter-1' } }),
  };
  const stripeService = {};
  const userService = {
    getUserSubscriptionByEmail: jest.fn(getUserSubscriptionByEmailImpl),
    getUserSubscription: jest.fn(getUserSubscriptionByEmailImpl),
    updateUserSubscriptionByEmail: jest.fn(),
  };
  const notificationsService = { create: jest.fn() };

  const module: TestingModule = await Test.createTestingModule({
    providers: [
      ApplicationService,
      { provide: getRepositoryToken(Application), useValue: applicationRepository },
      { provide: getRepositoryToken(User), useValue: userRepository },
      { provide: getRepositoryToken(Job), useValue: jobRepository },
      { provide: StripeService, useValue: stripeService },
      { provide: UserService, useValue: userService },
      { provide: NotificationsService, useValue: notificationsService },
    ],
  }).compile();

  const service = module.get<ApplicationService>(ApplicationService);
  return { service, applicationRepository, userRepository, jobRepository, userService };
}

describe('ApplicationService.apply — subscription gate coherent with expiry (D1, T2.4)', () => {
  it('allows a player with an active paid tier (future expiresAt) to apply', async () => {
    const player = makePlayer();
    const { service, userRepository } = await buildService(() => ({
      subscriptionType: 'Profesional',
      isActive: true,
      expiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000),
    }));
    userRepository.findOne.mockResolvedValue(player);

    await expect(service.apply('player-1', 'job-1', 'hola')).resolves.toBeDefined();
  });

  it('rejects a player whose subscription expired but was not yet downgraded by the cron (closes the <24h window — D1)', async () => {
    const player = makePlayer();
    const { service, userRepository } = await buildService(() => ({
      subscriptionType: 'Profesional', // still paid tier in DB, cron has not run yet
      isActive: true,
      expiresAt: new Date(Date.now() - 2 * 3600 * 1000), // expired 2h ago
    }));
    userRepository.findOne.mockResolvedValue(player);

    await expect(service.apply('player-1', 'job-1', 'hola')).rejects.toThrow(ForbiddenException);
  });

  it('rejects a player already downgraded to Amateur by the cron', async () => {
    const player = makePlayer();
    const { service, userRepository } = await buildService(() => ({
      subscriptionType: 'Amateur',
      isActive: false,
      expiresAt: new Date(Date.now() - 5 * 24 * 3600 * 1000),
    }));
    userRepository.findOne.mockResolvedValue(player);

    await expect(service.apply('player-1', 'job-1', 'hola')).rejects.toThrow(ForbiddenException);
  });

  it('rejects a player who never paid (subscriptionType Amateur, expiresAt null)', async () => {
    const player = makePlayer();
    const { service, userRepository } = await buildService(() => ({
      subscriptionType: 'Amateur',
      isActive: false,
      expiresAt: null,
    }));
    userRepository.findOne.mockResolvedValue(player);

    await expect(service.apply('player-1', 'job-1', 'hola')).rejects.toThrow(ForbiddenException);
  });

  it('does not read or write isVerified as part of the gate decision', async () => {
    const player = makePlayer({ isVerified: false });
    const { service, userRepository } = await buildService(() => ({
      subscriptionType: 'Profesional',
      isActive: true,
      expiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000),
    }));
    userRepository.findOne.mockResolvedValue(player);

    const result = await service.apply('player-1', 'job-1', 'hola');
    expect(result).toBeDefined();
    // isVerified must remain exactly as it was on the player object — the gate
    // never touches it (invariant carried over from the June fix).
    expect(player.isVerified).toBe(false);
  });
});
