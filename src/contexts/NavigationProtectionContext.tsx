// src/contexts/NavigationProtectionContext.tsx
import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';

import { message, Modal } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';

import { useAuth } from '../features/auth/AuthContext';

interface NavigationProtectionContextType {
  /**
   * Register a component as having unsaved changes
   * Returns an unregister function
   */
  registerUnsavedChanges: (
    componentId: string,
    saveCallback?: () => Promise<boolean>
  ) => () => void;

  /**
   * Check if there are any unsaved changes in the app
   */
  hasAnyUnsavedChanges: boolean;

  /**
   * Navigate with automatic protection
   */
  protectedNavigate: (to: string, options?: any) => void;

  /**
   * Switch lab with automatic protection
   */
  protectedSwitchLab: (labId: number) => void;

  /**
   * Get count of components with unsaved changes
   */
  unsavedChangesCount: number;

  /**
   * Force navigation without protection (for internal use)
   */
  forceNavigate: (to: string, options?: any) => void;
}

const NavigationProtectionContext = createContext<NavigationProtectionContextType>({
  registerUnsavedChanges: () => () => {},
  hasAnyUnsavedChanges: false,
  protectedNavigate: () => {},
  protectedSwitchLab: () => {},
  unsavedChangesCount: 0,
  forceNavigate: () => {},
});

interface UnsavedComponent {
  componentId: string;
  saveCallback?: () => Promise<boolean>;
}

interface NavigationProtectionProviderProps {
  children: ReactNode;
  messages?: {
    browserNavigation?: string;
    routerNavigation?: string;
    labSwitching?: string;
  };
}

export const NavigationProtectionProvider: React.FC<NavigationProtectionProviderProps> = ({
  children,
  messages = {},
}) => {
  const {
    browserNavigation = 'You have unsaved changes. Are you sure you want to leave?',
    routerNavigation = 'You have unsaved changes. Are you sure you want to navigate away?',
    labSwitching = 'You have unsaved changes. Are you sure you want to switch laboratories?',
  } = messages;

  const [unsavedComponents, setUnsavedComponents] = useState<Map<string, UnsavedComponent>>(
    new Map()
  );
  const [isNavigating, setIsNavigating] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { currentLab, switchLab: originalSwitchLab, userLabs } = useAuth();

  const currentLabIdRef = useRef(currentLab?.labId);
  const hasAnyUnsavedChanges = unsavedComponents.size > 0;

  // Browser navigation protection (refresh, close tab, etc.)
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (hasAnyUnsavedChanges && !isNavigating) {
        event.preventDefault();
        event.returnValue = browserNavigation;
        return browserNavigation;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasAnyUnsavedChanges, browserNavigation, isNavigating]);

  // History navigation protection (back button, etc.)
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (hasAnyUnsavedChanges && !isNavigating) {
        // Prevent the navigation
        event.preventDefault();

        // Push the current state back to keep user on current page
        window.history.pushState(null, '', location.pathname + location.search);

        // Show confirmation dialog
        handleNavigationAttempt(
          () => {
            setIsNavigating(true);
            // Allow the navigation by going back
            window.history.back();
            setTimeout(() => setIsNavigating(false), 100);
          },
          () => {
            // User cancelled - do nothing, we've already restored the state
          }
        );
      }
    };

    // Push current state to enable our popstate handler
    window.history.pushState(null, '', location.pathname + location.search);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [hasAnyUnsavedChanges, isNavigating, location]);

  // Monitor lab changes and clear unsaved changes when lab switches
  useEffect(() => {
    const newLabId = currentLab?.labId;
    const oldLabId = currentLabIdRef.current;

    if (newLabId !== oldLabId && oldLabId !== undefined) {
      console.log('🔄 Lab context changed, clearing all unsaved changes');
      setUnsavedComponents(new Map());
      message.info('Lab context changed - unsaved changes cleared');
    }

    currentLabIdRef.current = newLabId;
  }, [currentLab?.labId]);

  /**
   * Handle navigation attempts with confirmation
   */
  const handleNavigationAttempt = (
    onProceed: () => void,
    onCancel: () => void,
    customMessage?: string
  ) => {
    const componentsWithSave = Array.from(unsavedComponents.values()).filter(c => c.saveCallback);

    const handleSaveAndContinue = async () => {
      let allSaved = true;
      for (const component of componentsWithSave) {
        if (component.saveCallback) {
          try {
            const saved = await component.saveCallback();
            if (!saved) {
              allSaved = false;
              break;
            }
          } catch (error) {
            console.error('Save failed:', error);
            message.error('Failed to save changes');
            allSaved = false;
            break;
          }
        }
      }
      if (allSaved) {
        setUnsavedComponents(new Map());
        onProceed();
      }
    };

    Modal.confirm({
      title: 'Unsaved Changes',
      content: customMessage || routerNavigation,
      okText: 'Leave Without Saving',
      okType: 'danger',
      cancelText: 'Stay',
      onOk: () => {
        setUnsavedComponents(new Map());
        onProceed();
      },
      onCancel: onCancel,
      footer: (_, { OkBtn, CancelBtn }) => (
        <div style={{ textAlign: 'right' }}>
          <CancelBtn />
          {componentsWithSave.length > 0 && (
            <button
              className="ant-btn ant-btn-primary"
              onClick={handleSaveAndContinue}
              style={{ marginLeft: 8, marginRight: 8 }}
            >
              Save & Continue
            </button>
          )}
          <OkBtn />
        </div>
      ),
    });
  };

  /**
   * Protected lab switching function
   */
  const protectedSwitchLab = (labId: number) => {
    if (!hasAnyUnsavedChanges) {
      const success = originalSwitchLab(labId);
      if (success) {
        const selectedLab = userLabs.find(lab => lab.labId === labId);
        message.success(`Switched to ${selectedLab?.labName}`);
      }
      return;
    }

    handleNavigationAttempt(
      () => {
        const success = originalSwitchLab(labId);
        if (success) {
          const selectedLab = userLabs.find(lab => lab.labId === labId);
          message.success(`Switched to ${selectedLab?.labName}`);
        }
      },
      () => {}, // Do nothing on cancel
      labSwitching
    );
  };

  /**
   * Register a component as having unsaved changes
   */
  const registerUnsavedChanges = (componentId: string, saveCallback?: () => Promise<boolean>) => {
    console.log('📝 Registering unsaved changes for:', componentId);
    setUnsavedComponents(prev => {
      const newMap = new Map(prev);
      newMap.set(componentId, { componentId, saveCallback });
      console.log('📊 Total components with unsaved changes:', newMap.size);
      return newMap;
    });

    // Return unregister function
    return () => {
      console.log('🧹 Unregistering unsaved changes for:', componentId);
      setUnsavedComponents(prev => {
        const newMap = new Map(prev);
        newMap.delete(componentId);
        console.log('📊 Total components with unsaved changes:', newMap.size);
        return newMap;
      });
    };
  };

  /**
   * Protected navigation function
   */
  const protectedNavigate = (to: string, options?: any) => {
    if (!hasAnyUnsavedChanges) {
      navigate(to, options);
      return;
    }

    handleNavigationAttempt(
      () => {
        setIsNavigating(true);
        navigate(to, options);
        setTimeout(() => setIsNavigating(false), 100);
      },
      () => {} // Do nothing on cancel
    );
  };

  /**
   * Force navigation without protection (for internal use)
   */
  const forceNavigate = (to: string, options?: any) => {
    setIsNavigating(true);
    navigate(to, options);
    setTimeout(() => setIsNavigating(false), 100);
  };

  const value = {
    registerUnsavedChanges,
    hasAnyUnsavedChanges,
    protectedNavigate,
    protectedSwitchLab,
    unsavedChangesCount: unsavedComponents.size,
    forceNavigate,
  };

  return (
    <NavigationProtectionContext.Provider value={value}>
      {children}
    </NavigationProtectionContext.Provider>
  );
};

/**
 * Hook for using navigation protection
 */
export const useNavigationProtection = () => {
  const context = useContext(NavigationProtectionContext);
  if (!context) {
    throw new Error('useNavigationProtection must be used within NavigationProtectionProvider');
  }
  return context;
};

/**
 * Simple hook for pages to register unsaved changes
 */
export const useUnsavedChanges = (
  hasChanges: boolean,
  saveCallback?: () => Promise<boolean>,
  componentName?: string
) => {
  const { registerUnsavedChanges } = useNavigationProtection();
  const componentId = useRef(componentName || `component_${Date.now()}_${Math.random()}`);

  useEffect(() => {
    console.log('🔍 useUnsavedChanges effect triggered:', {
      componentId: componentId.current,
      hasChanges,
      hasSaveCallback: !!saveCallback,
    });

    if (hasChanges) {
      const unregister = registerUnsavedChanges(componentId.current, saveCallback);
      return unregister;
    }
    return () => {}; // No-op unregister function
  }, [hasChanges, saveCallback, registerUnsavedChanges]);

  // Debug info
  useEffect(() => {
    console.log('📊 Component change status:', {
      componentId: componentId.current,
      hasChanges,
    });
  }, [hasChanges]);
};
