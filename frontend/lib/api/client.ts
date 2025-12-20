/**
 * API Client for communicating with the NestJS backend
 * Handles authentication, request formatting, and error handling
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public errors?: string[]
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Base fetch wrapper with error handling
 */
async function fetcher<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle error response from backend
      // Prioritize specific error message over generic message
      const errorMessage = data.error || data.message?.[0] || data.message || 'An error occurred';
      throw new ApiError(
        errorMessage,
        response.status,
        Array.isArray(data.message) ? data.message : [data.message]
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    // Network or other errors
    throw new ApiError(
      error instanceof Error ? error.message : 'Network error',
      0
    );
  }
}

/**
 * API client methods
 */
export const apiClient = {
  /**
   * GET request
   */
  get: async <T>(endpoint: string, token?: string): Promise<T> => {
    return fetcher<T>(endpoint, {
      method: 'GET',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },

  /**
   * POST request
   */
  post: async <T>(
    endpoint: string,
    data?: any,
    token?: string
  ): Promise<T> => {
    return fetcher<T>(endpoint, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  /**
   * PUT request
   */
  put: async <T>(
    endpoint: string,
    data?: any,
    token?: string
  ): Promise<T> => {
    return fetcher<T>(endpoint, {
      method: 'PUT',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  /**
   * DELETE request
   */
  delete: async <T>(endpoint: string, token?: string): Promise<T> => {
    return fetcher<T>(endpoint, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },
};
