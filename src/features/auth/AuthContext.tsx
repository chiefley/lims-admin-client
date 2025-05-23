// src/features/auth/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

import authService, { User } from './authService';
import { UserLab } from './types';

// Define the shape of our authentication context
interface AuthContextType {
  user: User | null;
  userLabs: UserLab[];
  currentLab: UserLab | null;
  currentStateId: number | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasRole: (role: string) => boolean;
  switchLab: (labId: number) => boolean;
  refreshUserLabs: () => Promise<void>;
  hasLabAccess: (labId: number) => boolean;
  getEffectiveLabId: (labId?: number) => number | null;
  getEffectiveStateId: (labId?: number) => number | null;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  user: null,
  userLabs: [],
  currentLab: null,
  currentStateId: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => false,
  logout: () => {},
  hasRole: () => false,
  switchLab: () => false,
  refreshUserLabs: async () => {},
  hasLabAccess: () => false,
  getEffectiveLabId: () => null,
  getEffectiveStateId: () => null,
});

// Create the AuthProvider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userLabs, setUserLabs] = useState<UserLab[]>([]);
  const [currentLab, setCurrentLab] = useState<UserLab | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    initializeAuthState();
  }, []);

  // Initialize authentication state from localStorage
  const initializeAuthState = () => {
    try {
      // Initialize the auth service
      authService.initializeAuth();

      // Load the user from local storage
      const currentUser = authService.getUser();
      const labs = authService.getUserLabs();
      const defaultLab = authService.getDefaultLab();

      setUser(currentUser);
      setUserLabs(labs);
      setCurrentLab(defaultLab);

      console.log('Auth initialized:', {
        user: currentUser?.username,
        labCount: labs.length,
        defaultLab: defaultLab?.labName,
      });
    } catch (error) {
      console.error('Error initializing auth state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Login function
  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const success = await authService.login(username, password);

      if (success) {
        // Update state with new user data
        const newUser = authService.getUser();
        const newUserLabs = authService.getUserLabs();
        const newDefaultLab = authService.getDefaultLab();

        setUser(newUser);
        setUserLabs(newUserLabs);
        setCurrentLab(newDefaultLab);

        console.log('Login successful:', {
          user: newUser?.username,
          labCount: newUserLabs.length,
          defaultLab: newDefaultLab?.labName,
        });
      }

      return success;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  // Logout function
  const logout = () => {
    authService.logout();
    setUser(null);
    setUserLabs([]);
    setCurrentLab(null);
  };

  // Switch to a different lab
  const switchLab = (labId: number): boolean => {
    const lab = userLabs.find(l => l.labId === labId);
    if (lab) {
      setCurrentLab(lab);
      console.log('Switched to lab:', lab.labName);
      return true;
    }
    return false;
  };

  // Refresh user labs from the server
  const refreshUserLabs = async (): Promise<void> => {
    try {
      if (!user) return;

      const refreshedLabs = await authService.refreshUserLabs();
      setUserLabs(refreshedLabs);

      // Update current lab if it still exists
      if (currentLab) {
        const updatedCurrentLab = refreshedLabs.find(l => l.labId === currentLab.labId);
        setCurrentLab(updatedCurrentLab || authService.getDefaultLab());
      }

      console.log('User labs refreshed:', refreshedLabs.length);
    } catch (error) {
      console.error('Error refreshing user labs:', error);
    }
  };

  // Check if user has a specific role
  const hasRole = (role: string): boolean => {
    return authService.hasRole(role);
  };

  // Check if user has access to a specific lab
  const hasLabAccess = (labId: number): boolean => {
    return authService.hasLabAccess(labId);
  };

  // Get effective lab ID for API calls
  const getEffectiveLabId = (labId?: number): number | null => {
    if (labId && hasLabAccess(labId)) {
      return labId;
    }
    return currentLab?.labId || null;
  };

  // Get effective state ID for API calls
  const getEffectiveStateId = (labId?: number): number | null => {
    if (labId && hasLabAccess(labId)) {
      const lab = userLabs.find(l => l.labId === labId);
      return lab?.stateId || null;
    }
    return currentLab?.stateId || null;
  };

  // Create the context value object
  const value = {
    user,
    userLabs,
    currentLab,
    currentStateId: currentLab?.stateId || null,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    hasRole,
    switchLab,
    refreshUserLabs,
    hasLabAccess,
    getEffectiveLabId,
    getEffectiveStateId,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook for using the auth context
export const useAuth = () => useContext(AuthContext);

export default AuthContext;
