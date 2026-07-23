import { ConfigService } from '@nestjs/config';
import { EmailService } from './email.service';

/**
 * Fase 4 — Email de renovación (Domain C, T4.1).
 * Se espía `sendWithResend`/`getDefaultFrom` (métodos privados existentes,
 * ya cubiertos por el resto de los métodos públicos de este servicio) para
 * no depender de la red/Resend real.
 */
function buildService() {
  const configService = {
    get: jest.fn((key: string) => {
      if (key === 'RESEND_API_KEY') return 'test-resend-key';
      if (key === 'MAIL_FROM') return 'noreply@futbolink.net';
      return undefined;
    }),
  };
  const service = new EmailService(configService as unknown as ConfigService);
  return service;
}

describe('EmailService.sendSubscriptionRenewalReminder (T4.1)', () => {
  it('arma el HTML y llama sendWithResend + getDefaultFrom("FutboLink") con los params correctos', async () => {
    const service = buildService();
    const sendWithResendSpy = jest
      .spyOn(service as any, 'sendWithResend')
      .mockResolvedValue(undefined);
    const getDefaultFromSpy = jest.spyOn(service as any, 'getDefaultFrom');

    const expiresAt = new Date('2026-07-25T12:00:00.000Z');

    await service.sendSubscriptionRenewalReminder({
      to: 'jugador@test.com',
      name: 'Juan',
      plan: 'Profesional',
      expiresAt,
      renewUrl: 'https://futbolink.vercel.app/Subs',
    });

    expect(getDefaultFromSpy).toHaveBeenCalledWith('FutboLink');
    expect(sendWithResendSpy).toHaveBeenCalledTimes(1);

    const callArg = sendWithResendSpy.mock.calls[0][0] as {
      to: string;
      subject: string;
      html: string;
      from?: string;
    };
    expect(callArg.to).toBe('jugador@test.com');
    expect(callArg.subject).toEqual(expect.stringContaining('Profesional'));
    expect(callArg.html).toEqual(expect.stringContaining('Juan'));
    expect(callArg.html).toEqual(expect.stringContaining('Profesional'));
    expect(callArg.html).toContain('https://futbolink.vercel.app/Subs');
  });

  it('funciona sin `name` (fallback a saludo genérico, sin crashear)', async () => {
    const service = buildService();
    const sendWithResendSpy = jest
      .spyOn(service as any, 'sendWithResend')
      .mockResolvedValue(undefined);

    await service.sendSubscriptionRenewalReminder({
      to: 'jugador2@test.com',
      plan: 'Semiprofesional',
      expiresAt: new Date('2026-07-25T12:00:00.000Z'),
      renewUrl: 'https://futbolink.vercel.app/Subs',
    });

    expect(sendWithResendSpy).toHaveBeenCalledTimes(1);
  });
});
