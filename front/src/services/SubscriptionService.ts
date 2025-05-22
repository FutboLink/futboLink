import { getSubscriptionName } from '../helpers/helpersSubs';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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
 * @returns Object with subscription status and type
 */
export const checkUserSubscription = async (email: string): Promise<SubscriptionInfo> => {
  try {
    const response = await fetch(`${apiUrl}/payments/subscription/check?email=${encodeURIComponent(email)}`);
    
    if (!response.ok) {
      throw new Error(`Error checking subscription: ${response.status}`);
    }
    
    const data = await response.json();
    const subscriptionType = data.subscriptionType || 'Amateur';
    
    // If subscription type is not Amateur, it should be considered active
    const isActive = data.hasActiveSubscription || 
                    (subscriptionType !== 'Amateur' && subscriptionType !== '');
    
    return {
      hasActiveSubscription: isActive,
      subscriptionType: subscriptionType
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
 * Force refresh subscription status from server (bypassing cache)
 * @param email User's email
 * @returns Updated subscription information
 */
export const refreshUserSubscription = async (email: string): Promise<SubscriptionInfo> => {
  try {
    // Add timestamp to prevent caching
    const timestamp = new Date().getTime();
    const response = await fetch(
      `${apiUrl}/payments/subscription/check?email=${encodeURIComponent(email)}&_=${timestamp}`,
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
    
    const subscriptionType = data.subscriptionType || 'Amateur';
    
    // If subscription type is not Amateur, it should be considered active
    const isActive = data.hasActiveSubscription || 
                    (subscriptionType !== 'Amateur' && subscriptionType !== '');
    
    return {
      hasActiveSubscription: isActive,
      subscriptionType: subscriptionType
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