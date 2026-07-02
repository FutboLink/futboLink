import { getSubscriptionName } from '../helpers/helpersSubs';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface SubscriptionInfo {
  hasActiveSubscription: boolean;
  subscriptionType?: string;
  expiresAt?: string | null;
}

export interface CancelSubscriptionResult {
  success: boolean;
  message: string;
}

export interface SyncSubscriptionResult {
  success: boolean;
  message: string;
  subscriptionInfo?: SubscriptionInfo;
  pendingSubscriptionType?: string;
}

/**
 * Checks if a user has an active subscription
 * @param email User's email
 * @returns Object with subscription status and type
 */
export const checkUserSubscription = async (email: string): Promise<SubscriptionInfo> => {
  try {
    console.log(`Verificando suscripción para: ${email}`);
    const response = await fetch(`${apiUrl}/user/subscription/check?email=${encodeURIComponent(email)}`);
    
    if (!response.ok) {
      console.error(`Error verificando suscripción: ${response.status}`);
      throw new Error(`Error checking subscription: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Datos de suscripción recibidos:', data);
    
    const result = {
      hasActiveSubscription: data.isActive === true,
      subscriptionType: data.subscriptionType || 'Amateur',
      expiresAt: data.expiresAt ?? null,
    };
    
    console.log(`Resultado de verificación de suscripción: activa=${result.hasActiveSubscription}, tipo=${result.subscriptionType}`);
    return result;
  } catch (error) {
    console.error('Error verificando suscripción:', error);
    return {
      hasActiveSubscription: false,
      subscriptionType: 'Amateur'
    };
  }
};

/**
 * Force refresh subscription status from server (bypassing cache)
 * @param email User's email
 * @returns Updated subscription information
 */
export const refreshUserSubscription = async (email: string): Promise<SubscriptionInfo> => {
  try {
    // Add timestamp to prevent caching
    const timestamp = new Date().getTime();
    const response = await fetch(
      `${apiUrl}/user/subscription/check?email=${encodeURIComponent(email)}&_=${timestamp}`,
      {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`Error refreshing subscription: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Refreshed subscription data:', data);
    
    return {
      hasActiveSubscription: data.isActive === true,
      subscriptionType: data.subscriptionType || 'Amateur'
    };
  } catch (error) {
    console.error('Error refreshing subscription:', error);
    return {
      hasActiveSubscription: false,
      subscriptionType: 'Amateur'
    };
  }
};

/**
 * Activate user subscription via a confirmed Stripe session.
 * Sends the session_id to PUT /user/subscription/activate (authenticated).
 * The backend validates payment_status === 'paid' server-side and derives
 * the email + plan from the Payment record — NOT from client input.
 *
 * @param sessionId Stripe checkout session ID (from URL ?session_id=...)
 * @param token JWT bearer token from UserContext
 * @param email User email (used only to refresh subscription info afterwards)
 * @returns Success status
 */
export const updateUserSubscription = async (
  sessionId: string,
  token: string,
  email: string,
): Promise<SyncSubscriptionResult> => {
  try {
    const response = await fetch(`${apiUrl}/user/subscription/activate`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ sessionId }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error ${response.status}: No se pudo activar la suscripción`);
    }

    // Refresh subscription info from server to reflect the updated plan
    const subInfo = await refreshUserSubscription(email);

    return {
      success: true,
      message: 'Suscripción activada correctamente',
      subscriptionInfo: subInfo,
    };
  } catch (error: any) {
    console.error('Error activating subscription:', error);
    return {
      success: false,
      message: error.message || 'Error al activar la suscripción. Por favor, intenta de nuevo más tarde.',
    };
  }
};

/**
 * Force synchronize subscription status with database
 * @param email User's email
 * @returns Result of the synchronization
 */
export const forceSyncSubscription = async (email: string): Promise<SyncSubscriptionResult> => {
  try {
    const response = await fetch(`${apiUrl}/user/subscription/check?email=${encodeURIComponent(email)}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Error ${response.status}: No se pudo sincronizar la suscripción`);
    }
    
    const data = await response.json();
    
    const subscriptionInfo = {
      hasActiveSubscription: data.isActive === true,
      subscriptionType: data.subscriptionType || 'Amateur'
    };
    
    // Update the local storage with the new subscription info
    clearSubscriptionCache();
    localStorage.setItem('subscriptionInfo', JSON.stringify(subscriptionInfo));
    
    return {
      success: true,
      message: 'Suscripción sincronizada correctamente',
      subscriptionInfo
    };
  } catch (error: any) {
    console.error('Error syncing subscription:', error);
    return {
      success: false,
      message: error.message || 'Error al sincronizar la suscripción. Por favor, intenta de nuevo más tarde.'
    };
  }
};

/**
 * Gets the subscription name based on price ID
 * @param priceId Stripe price ID
 * @returns Subscription name
 */
export const getSubscriptionTypeFromPriceId = (priceId: string): string => {
  return getSubscriptionName(priceId);
};

/**
 * Clears the cached subscription data from localStorage
 */
export const clearSubscriptionCache = (): void => {
  try {
    localStorage.removeItem('subscriptionInfo');
    console.log('Subscription cache cleared');
  } catch (error) {
    console.error('Error clearing subscription cache:', error);
  }
};

/**
 * Cancels a user's subscription
 * @param email User's email
 * @returns Object with success status and message
 */
export const cancelUserSubscription = async (email: string): Promise<CancelSubscriptionResult> => {
  try {
    // En lugar de cancelar en Stripe, simplemente actualizamos a Amateur en nuestra base de datos
    const response = await fetch(`${apiUrl}/user/subscription/update-by-email`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, subscriptionType: 'Amateur' }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Error ${response.status}: No se pudo cancelar la suscripción`);
    }
    
    // Clear the cache on successful cancellation
    clearSubscriptionCache();
    
    return {
      success: true,
      message: 'Suscripción cancelada exitosamente.'
    };
  } catch (error: any) {
    console.error('Error canceling subscription:', error);
    return {
      success: false,
      message: error.message || 'Error al cancelar la suscripción. Por favor, intenta de nuevo más tarde.'
    };
  }
}; 