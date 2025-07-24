import { toast } from 'react-hot-toast';

export interface VerificationRequest {
  id: string;
  playerId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  message?: string;
  adminComments?: string;
  processedBy?: string;
  createdAt: string;
  updatedAt: string;
  player?: {
    id: string;
    name: string;
    lastname: string;
    email: string;
  };
  admin?: {
    id: string;
    name: string;
    lastname: string;
  };
}

export interface CreateVerificationRequestDto {
  message?: string;
}

export interface UpdateVerificationRequestDto {
  status: 'APPROVED' | 'REJECTED';
  adminComments?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Solicita verificación de perfil
 */
export const requestVerification = async (
  playerId: string,
  data: CreateVerificationRequestDto,
  token: string
): Promise<VerificationRequest> => {
  try {
    console.log('Solicitando verificación de perfil para:', playerId);
    
    const response = await fetch(`${API_URL}/user/${playerId}/verification-request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || `Error ${response.status}: ${response.statusText}`;
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log('Solicitud de verificación creada:', result);
    return result;
  } catch (error) {
    console.error('Error al solicitar verificación:', error);
    throw error;
  }
};

/**
 * Obtiene las solicitudes de verificación de un jugador
 */
export const getPlayerVerificationRequests = async (
  playerId: string,
  token: string
): Promise<VerificationRequest[]> => {
  try {
    const response = await fetch(`${API_URL}/user/${playerId}/verification-requests`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Error al obtener solicitudes: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error al obtener solicitudes de verificación:', error);
    throw error;
  }
};

/**
 * Obtiene todas las solicitudes de verificación pendientes (solo admins)
 */
export const getPendingVerificationRequests = async (
  token: string
): Promise<VerificationRequest[]> => {
  try {
    const response = await fetch(`${API_URL}/user/verification-requests/pending`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Error al obtener solicitudes pendientes: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error al obtener solicitudes pendientes:', error);
    throw error;
  }
};

/**
 * Obtiene todas las solicitudes de verificación (solo admins)
 */
export const getAllVerificationRequests = async (
  token: string
): Promise<VerificationRequest[]> => {
  try {
    const response = await fetch(`${API_URL}/user/verification-requests/all`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Error al obtener todas las solicitudes: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error al obtener todas las solicitudes:', error);
    throw error;
  }
};

/**
 * Procesa una solicitud de verificación (solo admins)
 */
export const processVerificationRequest = async (
  requestId: string,
  data: UpdateVerificationRequestDto,
  token: string
): Promise<VerificationRequest> => {
  try {
    const response = await fetch(`${API_URL}/user/verification-request/${requestId}/process`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || `Error ${response.status}: ${response.statusText}`;
      throw new Error(errorMessage);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error al procesar solicitud de verificación:', error);
    throw error;
  }
};

/**
 * Verifica si un usuario puede solicitar verificación
 */
export const canRequestVerification = (
  isVerified: boolean,
  subscriptionType: string,
  hasActiveSubscription: boolean
): { canRequest: boolean; reason?: string } => {
  console.log('canRequestVerification called with:', { isVerified, subscriptionType, hasActiveSubscription });
  
  if (isVerified) {
    console.log('User already verified, cannot request verification');
    return { canRequest: false, reason: 'Tu perfil ya está verificado' };
  }

  // Allow all users to request verification regardless of subscription status
  console.log('User can request verification');
  return { canRequest: true };
};

/**
 * Muestra mensajes de toast para diferentes estados de verificación
 */
export const showVerificationToast = {
  success: (message: string) => {
    toast.success(message, {
      duration: 4000,
      position: 'top-right',
    });
  },
  
  error: (message: string) => {
    toast.error(message, {
      duration: 5000,
      position: 'top-right',
    });
  },
  
  loading: (message: string) => {
    return toast.loading(message, {
      position: 'top-right',
    });
  },
}; 