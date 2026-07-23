import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from '../user/entities/user.entity';
import { EmailService } from '../Mailing/email.service';
import { SubscriptionSchedulingService } from './subscription-scheduling.service';

// T0.1 — smoke test: el módulo/servicio se instancia sin error (no hay RED de
// lógica en esta tarea, es registro de infraestructura). La lógica de los
// @Cron se testea en Fase 3/4 sobre este mismo servicio.
describe('SubscriptionSchedulingService (T0.1 — smoke)', () => {
  it('is defined and instantiable via Nest DI', async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionSchedulingService,
        { provide: getRepositoryToken(User), useValue: { find: jest.fn() } },
        { provide: EmailService, useValue: { sendMail: jest.fn() } },
        ConfigService,
      ],
    }).compile();

    const service = module.get<SubscriptionSchedulingService>(SubscriptionSchedulingService);
    expect(service).toBeDefined();
  });
});
