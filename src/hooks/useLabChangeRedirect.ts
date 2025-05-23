// src/hooks/useLabChangeRedirect.ts
import { useEffect, useRef } from 'react';

import { message } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '../features/auth/AuthContext';

interface UseLabChangeRedirectOptions {
  /**
   * Whether to redirect on lab changes
   * Set to false for pages that should handle lab changes differently (like Dashboard)
   * @default true
   */
  enableRedirect?: boolean;

  /**
   * Path to redirect to when lab changes
   * @default '/' (Dashboard)
   */
  redirectPath?: string;

  /**
   * Whether to show a notification message when redirecting
   * @default true
   */
  showMessage?: boolean;

  /**
   * Custom message to show when redirecting
   */
  customMessage?: string;

  /**
   * Routes that should be excluded from redirect
   * These pages can handle lab changes on their own
   */
  excludeRoutes?: string[];
}

/**
 * Hook that automatically redirects to dashboard when lab context changes
 * This ensures users don't stay on lab-specific admin pages with wrong context
 */
export const useLabChangeRedirect = (options: UseLabChangeRedirectOptions = {}) => {
  const {
    enableRedirect = true,
    redirectPath = '/',
    showMessage = true,
    customMessage,
    excludeRoutes = ['/login', '/unauthorized', '/debug/lab-context', '/'],
  } = options;

  const { currentLab } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Keep track of the previous lab ID to detect changes
  const previousLabId = useRef<number | null>(currentLab?.labId || null);
  const isInitialMount = useRef(true);

  useEffect(() => {
    // Skip on initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      previousLabId.current = currentLab?.labId || null;
      return;
    }

    // Skip if redirect is disabled
    if (!enableRedirect) {
      previousLabId.current = currentLab?.labId || null;
      return;
    }

    // Skip if current route is in exclude list
    const isExcludedRoute = excludeRoutes.some(
      route => location.pathname === route || location.pathname.startsWith(route)
    );

    if (isExcludedRoute) {
      previousLabId.current = currentLab?.labId || null;
      return;
    }

    const currentLabId = currentLab?.labId || null;
    const oldLabId = previousLabId.current;

    // Check if lab actually changed (and both are not null)
    if (currentLabId !== oldLabId && oldLabId !== null && currentLabId !== null) {
      console.log('🔄 Lab context changed - redirecting to dashboard:', {
        from: oldLabId,
        to: currentLabId,
        fromPage: location.pathname,
        redirectingTo: redirectPath,
      });

      handleLabChangeRedirect(currentLabId, oldLabId);
    }

    // Update the ref for next comparison
    previousLabId.current = currentLabId;
  }, [currentLab?.labId, location.pathname, enableRedirect, redirectPath, excludeRoutes]);

  const handleLabChangeRedirect = (newLabId: number, oldLabId: number) => {
    const newLabName = currentLab?.labName || `Lab ${newLabId}`;

    // Show notification message
    if (showMessage) {
      const messageText =
        customMessage || `Lab context changed to "${newLabName}". Redirecting to dashboard...`;

      message.info({
        content: messageText,
        duration: 3,
        key: 'lab-change-redirect', // Prevent multiple messages
      });
    }

    // Small delay to let the message show, then redirect
    setTimeout(() => {
      navigate(redirectPath, { replace: true });
    }, 500);
  };

  return {
    currentLabId: currentLab?.labId || null,
    currentLabName: currentLab?.labName || null,
    isRedirectEnabled: enableRedirect,
  };
};

export default useLabChangeRedirect;
