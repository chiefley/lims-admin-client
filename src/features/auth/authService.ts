// src/features/auth/authService.ts
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
  expires: string;
  // Removed userId since it's not needed - the server gets this from the token
}

export interface User {
  username: string;
  roles: string[];
  // Removed userId since we don't need it for API calls
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
      console.log('🚀 Starting login process for:', username);

      // Create API endpoint by combining base URL with auth endpoint
      const apiUrl = `${appConfig.api.baseUrl}/auth/login`;

      console.log('🌐 Making login request to:', apiUrl);

      // Make a direct request to the authentication endpoint
      const response = await axios.post<LoginResponse>(apiUrl, { username, password });

      console.log('✅ Login response received:', {
        hasToken: !!response.data?.token,
        username: response.data?.username,
        roles: response.data?.roles,
      });

      // Debug: Log the entire response to see what fields are actually available
      console.log('🔍 Full login response data:', response.data);

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

        console.log('💾 User data stored, now fetching labs using authenticated token');

        // After successful login, fetch user labs using the authenticated token
        try {
          await this.fetchAndStoreUserLabs();
          console.log('✅ User labs fetched and stored successfully');
        } catch (labError: any) {
          console.error('❌ Failed to fetch user labs during login:', labError);
          // Don't fail the login if lab fetching fails, but let's investigate why

          // Check if it's a network issue or API issue
          if (labError.response) {
            console.error('Lab fetch API error details:', {
              status: labError.response.status,
              statusText: labError.response.statusText,
              data: labError.response.data,
            });
          } else if (labError.request) {
            console.error('Lab fetch network error:', labError.request);
          } else {
            console.error('Lab fetch unknown error:', labError.message);
          }
        }

        return true;
      }

      console.log('❌ Login failed: No token in response');
      return false;
    } catch (error: any) {
      console.error('❌ Login failed with error:', error);

      // More detailed error logging
      if (error.response) {
        console.error('Login API error details:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
        });
      }

      return false;
    }
  }

  /**
   * Fetch user labs for the currently authenticated user
   * @returns Promise with array of UserLab data
   */
  async fetchUserLabs(): Promise<UserLab[]> {
    try {
      console.log('🌐 Making API call to fetch user labs for authenticated user');

      const endpoint = `/configurationmaintenance/FetchUserLabRss`;
      console.log('📡 API endpoint:', endpoint);

      const response = await apiClient.get<ServiceResponse<UserLab[]>>(endpoint);

      console.log('📥 Raw API response:', {
        hasData: !!response.data,
        success: response.data?.success,
        dataLength: response.data?.data?.length,
        message: response.data?.message,
      });

      if (!response.data || response.data.success === false) {
        const errorMessage = response.data?.message || 'Failed to fetch user labs';
        console.error('API returned error:', errorMessage);
        throw new Error(errorMessage);
      }

      const userLabs = response.data.data || [];
      console.log('✅ Successfully parsed user labs:', userLabs.length);

      return userLabs;
    } catch (error: any) {
      console.error('❌ Error in fetchUserLabs service call:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        responseData: error.response?.data,
      });
      throw error;
    }
  }

  /**
   * Fetch user labs and store them in localStorage
   */
  private async fetchAndStoreUserLabs(): Promise<void> {
    try {
      console.log('🔍 Fetching labs for authenticated user');

      const userLabs = await this.fetchUserLabs();

      console.log('📋 User labs fetched:', {
        count: userLabs.length,
        labs: userLabs.map(lab => ({
          id: lab.labId,
          name: lab.labName,
          isDefault: lab.isDefaultLab,
        })),
      });

      localStorage.setItem(this.userLabsKey, JSON.stringify(userLabs));

      console.log('💾 User labs stored in localStorage');

      // Log default lab info
      const defaultLab = userLabs.find(lab => lab.isDefaultLab);
      if (defaultLab) {
        console.log('🎯 Default lab found:', defaultLab.labName);
      } else {
        console.warn('⚠️ No default lab found in user labs');
      }
    } catch (error) {
      console.error('❌ Failed to fetch and store user labs:', error);
      // Clear any existing lab data on error
      localStorage.removeItem(this.userLabsKey);
      throw error; // Re-throw to let caller handle
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
        const labs = JSON.parse(labsJson) as UserLab[];
        console.log('📖 Retrieved user labs from storage:', labs.length);
        return labs;
      }
    } catch (error) {
      console.error('Error parsing user labs from localStorage:', error);
    }
    console.log('📖 No user labs found in storage');
    return [];
  }

  /**
   * Get the user's default lab
   * @returns The default UserLab or null if none found
   */
  getDefaultLab(): UserLab | null {
    const userLabs = this.getUserLabs();
    const defaultLab = userLabs.find(lab => lab.isDefaultLab) || null;

    if (defaultLab) {
      console.log('🎯 Default lab retrieved:', defaultLab.labName);
    } else {
      console.log('⚠️ No default lab found');
    }

    return defaultLab;
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

    console.log('🔄 Refreshing user labs for user:', user.username);
    const userLabs = await this.fetchUserLabs();
    localStorage.setItem(this.userLabsKey, JSON.stringify(userLabs));
    console.log('✅ User labs refreshed successfully');
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
    console.log('🚪 Logging out user');
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    localStorage.removeItem(this.userLabsKey);

    // Remove authorization header from future requests
    delete apiClient.defaults.headers.common['Authorization'];
    console.log('✅ User logged out successfully');
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
      try {
        const user = JSON.parse(userJson) as User;
        console.log('👤 Retrieved user from storage:', user.username);
        return user;
      } catch (error) {
        console.error('Error parsing user from localStorage:', error);
        return null;
      }
    }
    console.log('👤 No user found in storage');
    return null;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const hasToken = this.getToken() !== null;
    console.log('🔐 Authentication check:', hasToken);
    return hasToken;
  }

  /**
   * Check if user has a specific role
   */
  hasRole(role: string): boolean {
    const user = this.getUser();
    const hasRole = user !== null && user.roles.includes(role);
    console.log(`🔒 Role check for '${role}':`, hasRole);
    return hasRole;
  }

  /**
   * Initialize auth state from localStorage when the app loads
   */
  initializeAuth(): void {
    console.log('🚀 Initializing auth service...');

    const token = this.getToken();
    if (token) {
      console.log('✅ Token found, setting up API client');
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Optionally refresh user labs on app initialization
      const user = this.getUser();
      if (user) {
        console.log('🔄 Refreshing labs during initialization for user:', user.username);
        // Refresh labs in background, but don't block app initialization
        this.fetchAndStoreUserLabs().catch(error => {
          console.warn('⚠️ Failed to refresh user labs during initialization:', error);
        });
      }
    } else {
      console.log('ℹ️ No token found during initialization');
    }
  }
}

// Export a singleton instance
export const authService = new AuthService();
export default authService;
