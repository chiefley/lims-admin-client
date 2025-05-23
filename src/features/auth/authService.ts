// src/services/authService.ts
import axios from 'axios';

import { apiClient } from '../../api/client';
import appConfig from '../../config/appConfig';
import { ServiceResponse } from '../shared/types/common';

import { UserLab, UserWithLabs } from './types';

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
  userId: number; // Added userId to match the API response
  expires: string;
}

export interface User {
  username: string;
  roles: string[];
  userId: number; // Added userId to support lab fetching
}

/**
 * Authentication service for handling login, logout, and token management
 */
class AuthService {
  private tokenKey = 'auth_token';
  private userKey = 'user_info';
  private userLabsKey = 'user_labs';

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
          userId: response.data.userId,
        };

        localStorage.setItem(this.userKey, JSON.stringify(userData));

        // Configure axios to use the token for future requests
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;

        // After successful login, fetch user labs
        try {
          await this.fetchAndStoreUserLabs(response.data.userId);
        } catch (labError) {
          console.warn('Failed to fetch user labs during login:', labError);
          // Don't fail the login if lab fetching fails
        }

        return true;
      }

      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  }

  /**
   * Fetch user labs for a specific user
   * @param userId The user ID to fetch labs for
   * @returns Promise with array of UserLab data
   */
  async fetchUserLabs(userId: number): Promise<UserLab[]> {
    try {
      console.log(`Fetching user labs for user ID: ${userId}`);

      const response = await apiClient.get<ServiceResponse<UserLab[]>>(
        `/configurationmaintenance/FetchUserLabRss/${userId}`
      );

      if (!response.data || response.data.success === false) {
        console.error('API returned error or no data:', response.data);
        throw new Error(response.data?.message || 'Failed to fetch user labs');
      }

      console.log(`API returned ${response.data.data?.length || 0} user labs`);
      return response.data.data || [];
    } catch (error: any) {
      console.error('Error in fetchUserLabs service call:', error.message, error.response?.status);
      throw error;
    }
  }

  /**
   * Fetch user labs and store them in localStorage
   * @param userId The user ID to fetch labs for
   */
  private async fetchAndStoreUserLabs(userId: number): Promise<void> {
    try {
      const userLabs = await this.fetchUserLabs(userId);
      localStorage.setItem(this.userLabsKey, JSON.stringify(userLabs));
    } catch (error) {
      console.error('Failed to fetch and store user labs:', error);
      // Clear any existing lab data on error
      localStorage.removeItem(this.userLabsKey);
    }
  }

  /**
   * Get the stored user labs from localStorage
   * @returns Array of UserLab objects or empty array
   */
  getUserLabs(): UserLab[] {
    try {
      const labsJson = localStorage.getItem(this.userLabsKey);
      if (labsJson) {
        return JSON.parse(labsJson) as UserLab[];
      }
    } catch (error) {
      console.error('Error parsing user labs from localStorage:', error);
    }
    return [];
  }

  /**
   * Get the user's default lab
   * @returns The default UserLab or null if none found
   */
  getDefaultLab(): UserLab | null {
    const userLabs = this.getUserLabs();
    return userLabs.find(lab => lab.isDefaultLab) || null;
  }

  /**
   * Get the current user with lab information
   * @returns UserWithLabs object or null
   */
  getUserWithLabs(): UserWithLabs | null {
    const user = this.getUser();
    if (!user) {
      return null;
    }

    const userLabs = this.getUserLabs();
    const defaultLab = this.getDefaultLab();

    return {
      username: user.username,
      roles: user.roles,
      userLabs: userLabs,
      defaultLab: defaultLab || undefined,
    };
  }

  /**
   * Refresh user labs data
   * @returns Promise that resolves when labs are refreshed
   */
  async refreshUserLabs(): Promise<UserLab[]> {
    const user = this.getUser();
    if (!user) {
      throw new Error('No authenticated user found');
    }

    const userLabs = await this.fetchUserLabs(user.userId);
    localStorage.setItem(this.userLabsKey, JSON.stringify(userLabs));
    return userLabs;
  }

  /**
   * Check if user has access to a specific lab
   * @param labId The lab ID to check
   * @returns Boolean indicating if user has access to the lab
   */
  hasLabAccess(labId: number): boolean {
    const userLabs = this.getUserLabs();
    return userLabs.some(lab => lab.labId === labId);
  }

  /**
   * Get the effective lab ID to use for API calls
   * If no specific lab is provided, use the default lab
   * @param labId Optional specific lab ID
   * @returns Lab ID to use or null if none available
   */
  getEffectiveLabId(labId?: number): number | null {
    if (labId && this.hasLabAccess(labId)) {
      return labId;
    }

    const defaultLab = this.getDefaultLab();
    return defaultLab ? defaultLab.labId : null;
  }

  /**
   * Get the effective state ID to use for API calls
   * If no specific lab is provided, use the default lab's state
   * If a specific lab is provided, get that lab's state
   * @param labId Optional specific lab ID to get state for
   * @returns State ID to use or null if none available
   */
  getEffectiveStateId(labId?: number): number | null {
    // If a specific lab ID is provided, find that lab's state
    if (labId) {
      const userLabs = this.getUserLabs();
      const specificLab = userLabs.find(lab => lab.labId === labId);
      if (specificLab && this.hasLabAccess(labId)) {
        return specificLab.stateId;
      }
    }

    // Fall back to default lab's state
    const defaultLab = this.getDefaultLab();
    return defaultLab ? defaultLab.stateId : null;
  }

  /**
   * Get state ID for a specific lab
   * @param labId The lab ID to get state for
   * @returns State ID for the lab or null if lab not found/accessible
   */
  getStateIdForLab(labId: number): number | null {
    if (!this.hasLabAccess(labId)) {
      return null;
    }

    const userLabs = this.getUserLabs();
    const lab = userLabs.find(lab => lab.labId === labId);
    return lab ? lab.stateId : null;
  }

  /**
   * Log the user out by removing stored tokens
   */
  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    localStorage.removeItem(this.userLabsKey);

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

      // Optionally refresh user labs on app initialization
      const user = this.getUser();
      if (user && user.userId) {
        // Refresh labs in background, but don't block app initialization
        this.fetchAndStoreUserLabs(user.userId).catch(error => {
          console.warn('Failed to refresh user labs during initialization:', error);
        });
      }
    }
  }
}

// Export a singleton instance
export const authService = new AuthService();
export default authService;
