// src/contexts/NavigationProtectionContext.tsx
import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';

import { message, Modal } from 'antd';
import { useNavigate } from 'react-router-dom';

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
}

const NavigationProtectionContext = createContext<NavigationProtectionContextType>({
  registerUnsavedChanges: () => () => {},
  hasAnyUnsavedChanges: false,
  protectedNavigate: () => {},
  protectedSwitchLab: () => {},
  unsavedChangesCount: 0,
});

interface UnsavedComponent {
  componentId: string;
  saveCallback?: () => Promise<boolean>;
}

interface NavigationProtectionProviderProps {
  children: ReactNode;
  /**
   * Custom messages for different navigation types
   */
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
  const navigate = useNavigate();
  const { currentLab, switchLab: originalSwitchLab, userLabs } = useAuth();

  const isNavigatingRef = useRef(false);
  const currentLabIdRef = useRef(currentLab?.labId);

  const hasAnyUnsavedChanges = unsavedComponents.size > 0;

  // Browser navigation protection
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (hasAnyUnsavedChanges && !isNavigatingRef.current) {
        event.preventDefault();
        event.returnValue = browserNavigation;
        return browserNavigation;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasAnyUnsavedChanges, browserNavigation]);

  // Note: useBlocker requires data router, so we'll handle navigation protection differently
  // Browser back/forward navigation will be caught by beforeunload
  // Menu/link navigation will be handled by replacing links with protectedNavigate

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

    interface ActionButton {
      label: string;
      action: () => Promise<void> | void;
    }

    const actions: ActionButton[] = [];

    // Add save option if any component can save
    if (componentsWithSave.length > 0) {
      actions.push({
        label: 'Save & Continue',
        action: async () => {
          let allSaved = true;
          for (const component of componentsWithSave) {
            if (component.saveCallback) {
              const saved = await component.saveCallback();
              if (!saved) {
                allSaved = false;
                break;
              }
            }
          }
          if (allSaved) {
            setUnsavedComponents(new Map());
            onProceed();
          }
        },
      });
    }

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
        <>
          <CancelBtn />
          {actions.map((action, index) => (
            <button
              key={index}
              className="ant-btn ant-btn-primary"
              onClick={action.action}
              style={{ marginLeft: 8 }}
            >
              {action.label}
            </button>
          ))}
          <OkBtn />
        </>
      ),
    });
  };

  /**
   * Protected lab switching function - exposed for components to use
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
    setUnsavedComponents(prev => {
      const newMap = new Map(prev);
      newMap.set(componentId, { componentId, saveCallback });
      return newMap;
    });

    // Return unregister function
    return () => {
      setUnsavedComponents(prev => {
        const newMap = new Map(prev);
        newMap.delete(componentId);
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
        isNavigatingRef.current = true;
        navigate(to, options);
        setTimeout(() => {
          isNavigatingRef.current = false;
        }, 100);
      },
      () => {} // Do nothing on cancel
    );
  };

  const value = {
    registerUnsavedChanges,
    hasAnyUnsavedChanges,
    protectedNavigate,
    protectedSwitchLab, // Add this to the context
    unsavedChangesCount: unsavedComponents.size,
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
 * This is the ONLY thing pages need to add!
 */
export const useUnsavedChanges = (
  hasChanges: boolean,
  saveCallback?: () => Promise<boolean>,
  componentName?: string
) => {
  const { registerUnsavedChanges } = useNavigationProtection();
  const componentId = useRef(componentName || `component_${Date.now()}_${Math.random()}`);

  useEffect(() => {
    if (hasChanges) {
      return registerUnsavedChanges(componentId.current, saveCallback);
    }
    return () => {}; // No-op unregister function
  }, [hasChanges, saveCallback, registerUnsavedChanges]);
};

/**
 * Enhanced LabSelector component that uses protection
 */
export const ProtectedLabSelector: React.FC<{
  style?: React.CSSProperties;
  showRefreshButton?: boolean;
  size?: 'small' | 'middle' | 'large';
}> = ({ style, showRefreshButton = true, size = 'middle' }) => {
  const { currentLab, userLabs, isLoading } = useAuth();
  const { hasAnyUnsavedChanges } = useNavigationProtection();

  // Your existing LabSelector UI code here, but use protectedSwitchLab
  // (Implementation details would go here)

  return null; // Placeholder
};
