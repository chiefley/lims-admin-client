// src/api/endpoints/auth.ts
import { apiClient } from '../../api/client';

import { LoginResponse, LoginRequest } from './authService';

/**
 * Auth API service for handling authentication related API calls
 */
export const authApi = {
  /**
   * Login user with username and password
   * @param credentials - User credentials
   * @returns Promise with login response
   */
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
    return response.data;
  },

  /**
   * Get the current user's profile information
   * @returns Promise with user profile data
   */
  getCurrentUser: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  /**
   * Validate a token to check if it's still valid
   * @returns Promise with token validation result
   */
  validateToken: async () => {
    const response = await apiClient.post('/auth/validate-token');
    return response.data;
  },

  /**
   * Refresh an expired token using a refresh token
   * @param refreshToken - The refresh token
   * @returns Promise with new tokens
   */
  refreshToken: async (refreshToken: string) => {
    const response = await apiClient.post('/auth/refresh-token', { refreshToken });
    return response.data;
  },
};

export default authApi;
