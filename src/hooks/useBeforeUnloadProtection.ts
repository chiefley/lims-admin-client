// src/hooks/useBeforeUnloadProtection.ts
import { useEffect, useRef } from 'react';

interface UseBeforeUnloadProtectionOptions {
  /**
   * Whether to enable the protection
   */
  enabled: boolean;

  /**
   * Custom message to show (browsers may ignore this and show their own message)
   */
  message?: string;

  /**
   * Optional save callback that will be called before unload
   */
  onBeforeUnload?: () => void;
}

/**
 * Hook that protects against browser navigation (refresh, close tab, back button, etc.)
 * when there are unsaved changes in a component.
 *
 * This is simpler than complex state tracking and catches all navigation scenarios.
 */
export const useBeforeUnloadProtection = (options: UseBeforeUnloadProtectionOptions) => {
  const {
    enabled,
    message = 'You have unsaved changes. Are you sure you want to leave?',
    onBeforeUnload,
  } = options;
  const enabledRef = useRef(enabled);

  // Update ref when enabled changes
  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      // Check current state, not the state from when effect was created
      if (!enabledRef.current) return;

      // Call the callback if provided
      if (onBeforeUnload) {
        try {
          onBeforeUnload();
        } catch (error) {
          console.error('Error in onBeforeUnload callback:', error);
        }
      }

      // Set the return value to show browser's confirmation dialog
      event.preventDefault();
      event.returnValue = message;
      return message;
    };

    // Add the event listener
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [message, onBeforeUnload]); // Note: we don't include 'enabled' here since we use the ref
};

export default useBeforeUnloadProtection;
