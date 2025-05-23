// src/services/authService.ts
import axios from 'axios';

import { apiClient } from '../../api/client';
import appConfig from '../../config/appConfig';

// Define types for authentication
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken?: string;
  username: string;
  roles: string[];
  expires: string;
}

export interface User {
  username: string;
  roles: string[];
}

/**
 * Authentication service for handling login, logout, and token management
 */
class AuthService {
  private tokenKey = 'auth_token';
  private userKey = 'user_info';

  /**
   * Attempt to login with username and password
   */
  async login(username: string, password: string): Promise<boolean> {
    try {
      // Create API endpoint by combining base URL with auth endpoint
      const apiUrl = `${appConfig.api.baseUrl}/auth/login`;

      // Make a direct request to the authentication endpoint
      const response = await axios.post<LoginResponse>(apiUrl, { username, password });

      if (response.data && response.data.token) {
        // Store the token and user info in localStorage
        localStorage.setItem(this.tokenKey, response.data.token);

        const userData: User = {
          username: response.data.username,
          roles: response.data.roles,
        };

        localStorage.setItem(this.userKey, JSON.stringify(userData));

        // Configure axios to use the token for future requests
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;

        return true;
      }

      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  }

  /**
   * Log the user out by removing stored tokens
   */
  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);

    // Remove authorization header from future requests
    delete apiClient.defaults.headers.common['Authorization'];
  }

  /**
   * Get the current authentication token
   */
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * Get the current authenticated user
   */
  getUser(): User | null {
    const userJson = localStorage.getItem(this.userKey);
    if (userJson) {
      return JSON.parse(userJson) as User;
    }
    return null;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }

  /**
   * Check if user has a specific role
   */
  hasRole(role: string): boolean {
    const user = this.getUser();
    return user !== null && user.roles.includes(role);
  }

  /**
   * Initialize auth state from localStorage when the app loads
   */
  initializeAuth(): void {
    const token = this.getToken();
    if (token) {
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }
}

// Export a singleton instance
export const authService = new AuthService();
export default authService;
