import type { User } from '../../modules/user/entities/user.entity';
import type { SubscriptionPlan } from '../entities/payment.entity';

/**
 * Contrato de lo que StripeService necesita de UserService.
 *
 * POR QUÉ EXISTE: `UserService` y `StripeService` se inyectan mutuamente. El
 * `forwardRef()` arregla el orden de resolución de DI de Nest, pero NO evita que
 * TS/SWC emitan una referencia SÍNCRONA a la clase concreta en `design:paramtypes`,
 * que se evalúa durante la carga del módulo: eso deadlockea el `require()` circular
 * en runtime con `ReferenceError: Cannot access 'UserService' before initialization`.
 *
 * Tipar el parámetro inyectado con esta interfaz (que no existe en runtime) hace que
 * la metadata emita `Object` en vez de la clase, y rompe el ciclo sin perder tipado
 * — a diferencia de tipar como `any`, que es lo que se hizo del lado de UserService.
 *
 * Es una interfaz, NO una clase: si algún día se convierte en clase abstracta o token
 * con valor en runtime, el deadlock vuelve.
 */
export interface UserServicePort {
  findOneByEmail(email: string): Promise<User | null>;

  updateUserSubscriptionWithExpiration(
    userId: string,
    subscriptionType: string | SubscriptionPlan,
    expirationDate: Date,
  ): Promise<User>;

  markUserAsVerifiedPublic(userId: string): Promise<boolean>;

  setUserVerificationLevelPublic(
    userId: string,
    level: 'SEMIPROFESSIONAL' | 'PROFESSIONAL' | 'AMATEUR',
  ): Promise<boolean>;
}
