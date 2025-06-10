export const updateUserSubscription = async (userId: string, subscriptionStatus: boolean) => {
  try {
    console.log('Running updateUserSubscription fetch with:', userId, subscriptionStatus);
    
    const subscriptionType = subscriptionStatus ? 'Premium' : 'Amateur';
    
    // Calculate expiration date - 30 days from now if Premium
    const subscriptionExpiresAt = subscriptionStatus 
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() 
      : null;

    // Log what we're about to send
    console.log('Sending request to update subscription with:', {
      userId,
      subscriptionType,
      subscriptionExpiresAt
    });
    
    // Make sure we're using the correct API endpoint
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const endpoint = `${API_URL}/user/update-subscription/${userId}`;
    console.log('API endpoint:', endpoint);
    
    const response = await fetch(endpoint, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        subscriptionType,
        subscriptionExpiresAt
      }),
    });

    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error response:', errorData);
      throw new Error(errorData.message || 'Error al actualizar la suscripción');
    }

    const result = await response.json();
    console.log('Success response:', result);
    return result;
  } catch (error) {
    console.error('Error updating subscription:', error);
    throw error;
  }
}; 