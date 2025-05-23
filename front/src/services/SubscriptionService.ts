import { getSubscriptionName } from '../helpers/helpersSubs';

// En desarrollo, usa la API local; en producción usa la URL configurada
const apiUrl = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:3001' 
  : process.env.NEXT_PUBLIC_API_URL || 'https://futbolink.onrender.com';

console.log('API URL being used:', apiUrl);

export interface SubscriptionInfo {
  hasActiveSubscription: boolean;
  subscriptionType?: string;
}

export interface CancelSubscriptionResult {
  success: boolean;
  message: string;
}

/**
 * Checks if a user has an active subscription
 * @param email User's email
 * @returns Object with subscription status and type (amateur, semiprofesional, profesional)
 */
export const checkUserSubscription = async (email: string): Promise<SubscriptionInfo> => {
  try {
    const response = await fetch(`${apiUrl}/payments/subscription/check?email=${encodeURIComponent(email)}`);
    
    if (!response.ok) {
      throw new Error(`Error checking subscription: ${response.status}`);
    }
    
    const data = await response.json();
    
    // IMPORTANT: Trust the server's hasActiveSubscription flag
    // Do not override it based on subscription type
    return {
      hasActiveSubscription: data.hasActiveSubscription === true,
      subscriptionType: data.subscriptionType || 'Amateur'
    };
  } catch (error) {
    console.error('Error checking subscription:', error);
    return {
      hasActiveSubscription: false,
      subscriptionType: 'Amateur'
    };
  }
};

/**
 * Clears the subscription info from localStorage
 */
export const clearSubscriptionCache = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('subscriptionInfo');
    console.log('Subscription cache cleared');
  }
};

/**
 * Force refresh subscription status from server (bypassing cache)
 * @param email User's email
 * @returns Updated subscription information
 */
export const refreshUserSubscription = async (email: string): Promise<SubscriptionInfo> => {
  try {
    console.log(`Refreshing subscription for: ${email}`);
    
    // Verificar si estamos en la página de éxito de pago
    const isInPaymentSuccessPage = 
      typeof window !== 'undefined' && 
      window.location.pathname.includes('/payment/success');
    
    // Si estamos en la página de éxito de pago, obtener el plan de la URL
    let planFromUrl = '';
    if (isInPaymentSuccessPage && typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      planFromUrl = urlParams.get('plan') || 'Semiprofesional';
      console.log(`Detected payment success page with plan: ${planFromUrl}`);
    }
    
    // Add timestamp to prevent caching
    const timestamp = new Date().getTime();
    
    // Use AbortController to set a timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
    
    // Configuración básica de fetch que funciona en todos los entornos
    const response = await fetch(
      `${apiUrl}/payments/subscription/check?email=${encodeURIComponent(email)}&_=${timestamp}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      }
    );
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`Error refreshing subscription: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Refreshed subscription data:', data);
    
    // Si estamos en la página de éxito de pago, forzar el plan de la URL
    if (isInPaymentSuccessPage && planFromUrl) {
      console.log(`Overriding subscription type to: ${planFromUrl} from URL parameter`);
      return {
        hasActiveSubscription: true,
        subscriptionType: planFromUrl
      };
    }
    
    // Caso normal: confiar en los datos del servidor
    return {
      hasActiveSubscription: data.hasActiveSubscription === true,
      subscriptionType: data.subscriptionType || 'Amateur'
    };
  } catch (error) {
    console.error('Error refreshing subscription:', error);
    
    // Verificar si estamos en la página de éxito de pago
    const isInPaymentSuccessPage = 
      typeof window !== 'undefined' && 
      window.location.pathname.includes('/payment/success');
    
    // Si estamos en la página de éxito de pago, obtener el plan de la URL
    if (isInPaymentSuccessPage && typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const planFromUrl = urlParams.get('plan') || 'Semiprofesional';
      console.log(`Error occurred but in payment success page. Using plan from URL: ${planFromUrl}`);
      
      return {
        hasActiveSubscription: true,
        subscriptionType: planFromUrl
      };
    }
    
    // Solo devolver datos simulados si estamos explícitamente en contexto de pago exitoso
    // Verificar si estamos en la URL de éxito de pago
    if (process.env.NODE_ENV === 'development' && 
        typeof window !== 'undefined' && 
        window.location.pathname.includes('/payment/success')) {
      console.log('DEV MODE payment success page: Returning simulated subscription state');
      
      // Obtener la información del usuario para determinar si es un usuario nuevo o existente
      const storedUser = localStorage.getItem('user');
      const isExistingUser = storedUser && JSON.parse(storedUser).id;
      
      // Solo simular suscripción premium si es un usuario existente
      if (isExistingUser) {
        return {
          hasActiveSubscription: true,
          subscriptionType: 'Semiprofesional'
        };
      }
    }
    
    // Default para usuarios nuevos y cualquier otro contexto: Amateur sin suscripción activa
    return {
      hasActiveSubscription: false,
      subscriptionType: 'Amateur'
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
 * Cancels a user's subscription
 * @param email User's email
 * @returns Object with success status and message
 */
export const cancelUserSubscription = async (email: string): Promise<CancelSubscriptionResult> => {
  try {
    const response = await fetch(`${apiUrl}/payments/subscription/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Error ${response.status}: No se pudo cancelar la suscripción`);
    }
    
    const result = await response.json();
    
    // Clear the cache on successful cancellation
    if (result.success) {
      clearSubscriptionCache();
    }
    
    return result;
  } catch (error: any) {
    console.error('Error canceling subscription:', error);
    return {
      success: false,
      message: error.message || 'Error al cancelar la suscripción. Por favor, intenta de nuevo más tarde.'
    };
  }
}; 