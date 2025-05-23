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
      console.log('🚀 AuthContext: Initializing auth state...');

      // Initialize the auth service
      authService.initializeAuth();

      // Load the user from local storage
      const currentUser = authService.getUser();
      const labs = authService.getUserLabs();
      const defaultLab = authService.getDefaultLab();

      console.log('📊 AuthContext: Auth state loaded:', {
        hasUser: !!currentUser,
        username: currentUser?.username,
        labCount: labs.length,
        defaultLabName: defaultLab?.labName,
        defaultLabId: defaultLab?.labId,
      });

      setUser(currentUser);
      setUserLabs(labs);
      setCurrentLab(defaultLab);

      // Additional debugging
      if (currentUser && labs.length === 0) {
        console.warn('⚠️ AuthContext: User is authenticated but no labs are available');

        // Try to fetch labs if we have a user but no labs
        if (currentUser.userId) {
          console.log('🔄 AuthContext: Attempting to fetch labs during initialization...');
          authService
            .refreshUserLabs()
            .then(newLabs => {
              console.log('✅ AuthContext: Labs fetched during initialization');
              // Update the state with newly fetched labs
              const newDefaultLab = authService.getDefaultLab();
              console.log('📊 AuthContext: Updating state with fetched labs:', {
                labCount: newLabs.length,
                defaultLab: newDefaultLab?.labName,
              });
              setUserLabs(newLabs);
              setCurrentLab(newDefaultLab);
            })
            .catch(error => {
              console.error('❌ AuthContext: Failed to fetch labs during initialization:', error);
            });
        }
      }
    } catch (error) {
      console.error('❌ AuthContext: Error initializing auth state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Login function
  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      console.log('🚀 AuthContext: Starting login for:', username);

      const success = await authService.login(username, password);

      if (success) {
        console.log('✅ AuthContext: AuthService login successful, updating context state...');

        // Update state with new user data
        const newUser = authService.getUser();
        const newUserLabs = authService.getUserLabs();
        const newDefaultLab = authService.getDefaultLab();

        console.log('📊 AuthContext: Updating context with:', {
          username: newUser?.username,
          labCount: newUserLabs.length,
          defaultLabName: newDefaultLab?.labName,
          defaultLabId: newDefaultLab?.labId,
        });

        setUser(newUser);
        setUserLabs(newUserLabs);
        setCurrentLab(newDefaultLab);

        // Verify the state was set correctly
        console.log('✅ AuthContext: Context state updated successfully');

        // If we still don't have labs, there might be an issue
        if (newUserLabs.length === 0) {
          console.warn(
            '⚠️ AuthContext: No labs available after login - this might be normal or indicate an issue'
          );
        }
      } else {
        console.log('❌ AuthContext: AuthService login failed');
      }

      return success;
    } catch (error) {
      console.error('❌ AuthContext: Login error:', error);
      return false;
    }
  };

  // Logout function
  const logout = () => {
    console.log('🚪 AuthContext: Logging out user');
    authService.logout();
    setUser(null);
    setUserLabs([]);
    setCurrentLab(null);
    console.log('✅ AuthContext: User logged out, state cleared');
  };

  // Switch to a different lab
  const switchLab = (labId: number): boolean => {
    console.log('🔄 AuthContext: Attempting to switch to lab ID:', labId);

    const lab = userLabs.find(l => l.labId === labId);
    if (lab) {
      setCurrentLab(lab);
      console.log('✅ AuthContext: Switched to lab:', lab.labName);
      return true;
    }

    console.error('❌ AuthContext: Lab not found for ID:', labId);
    return false;
  };

  // Refresh user labs from the server
  const refreshUserLabs = async (): Promise<void> => {
    try {
      console.log('🔄 AuthContext: Refreshing user labs...');

      if (!user) {
        console.warn('⚠️ AuthContext: Cannot refresh labs - no user authenticated');
        return;
      }

      const refreshedLabs = await authService.refreshUserLabs();
      console.log(
        '📊 AuthContext: Labs refreshed, updating state with:',
        refreshedLabs.length,
        'labs'
      );

      setUserLabs(refreshedLabs);

      // Update current lab if it still exists
      if (currentLab) {
        const updatedCurrentLab = refreshedLabs.find(l => l.labId === currentLab.labId);
        if (updatedCurrentLab) {
          setCurrentLab(updatedCurrentLab);
          console.log('✅ AuthContext: Current lab updated');
        } else {
          const newDefaultLab = authService.getDefaultLab();
          setCurrentLab(newDefaultLab);
          console.log(
            '⚠️ AuthContext: Current lab no longer exists, switched to default:',
            newDefaultLab?.labName
          );
        }
      }

      console.log('✅ AuthContext: User labs refresh completed');
    } catch (error) {
      console.error('❌ AuthContext: Error refreshing user labs:', error);
    }
  };

  // Check if user has a specific role
  const hasRole = (role: string): boolean => {
    const result = authService.hasRole(role);
    console.log(`🔒 AuthContext: Role check for '${role}':`, result);
    return result;
  };

  // Check if user has access to a specific lab
  const hasLabAccess = (labId: number): boolean => {
    const result = authService.hasLabAccess(labId);
    console.log(`🏢 AuthContext: Lab access check for ID ${labId}:`, result);
    return result;
  };

  // Get effective lab ID for API calls
  const getEffectiveLabId = (labId?: number): number | null => {
    if (labId && hasLabAccess(labId)) {
      console.log('🎯 AuthContext: Using specific lab ID:', labId);
      return labId;
    }

    const effectiveId = currentLab?.labId || null;
    console.log('🎯 AuthContext: Using current lab ID:', effectiveId);
    return effectiveId;
  };

  // Get effective state ID for API calls
  const getEffectiveStateId = (labId?: number): number | null => {
    if (labId && hasLabAccess(labId)) {
      const lab = userLabs.find(l => l.labId === labId);
      const stateId = lab?.stateId || null;
      console.log('🗺️ AuthContext: Using specific lab state ID:', stateId);
      return stateId;
    }

    const effectiveStateId = currentLab?.stateId || null;
    console.log('🗺️ AuthContext: Using current lab state ID:', effectiveStateId);
    return effectiveStateId;
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

  // Log context state changes for debugging
  useEffect(() => {
    console.log('📊 AuthContext: State changed:', {
      hasUser: !!user,
      username: user?.username,
      labCount: userLabs.length,
      currentLabName: currentLab?.labName,
      isAuthenticated: !!user,
      isLoading,
    });
  }, [user, userLabs, currentLab, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook for using the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
