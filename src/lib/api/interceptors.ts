import { ApiError } from '../errors';

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
}

export const apiInterceptors = {
  request: async (config: RequestInit): Promise<RequestInit> => {
    // Ajouter les headers par défaut
    return {
      ...config,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
    };
  },

  response: async <T>(response: Response): Promise<ApiResponse<T>> => {
    try {
      if (!response.ok) {
        throw new ApiError(
          response.statusText,
          'API_ERROR',
          response.status
        );
      }

      const data = await response.json();
      return {
        data,
        status: response.status,
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        'Une erreur est survenue',
        'API_ERROR',
        response.status
      );
    }
  },
};

export async function fetchWithInterceptors<T>(
  url: string,
  config: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const interceptedConfig = await apiInterceptors.request(config);
    const response = await fetch(url, interceptedConfig);
    return await apiInterceptors.response<T>(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Une erreur est survenue', 'API_ERROR');
  }
}