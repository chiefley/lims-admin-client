// src/features/auth/useLabContext.ts
import { useAuth } from './AuthContext';

/**
 * Custom hook for accessing lab context information in a convenient format
 * This hook provides easy access to the current lab and state context for API calls
 */
export const useLabContext = () => {
  const {
    user,
    currentLab,
    currentStateId,
    userLabs,
    getEffectiveLabId,
    getEffectiveStateId,
    hasLabAccess,
    switchLab,
    isAuthenticated,
  } = useAuth();

  /**
   * Get context parameters for API calls
   * @param specificLabId Optional specific lab ID to use instead of current lab
   * @returns Object with labId and stateId for API calls
   */
  const getContextParams = (specificLabId?: number) => {
    const labId = getEffectiveLabId(specificLabId);
    const stateId = getEffectiveStateId(specificLabId);

    return {
      labId,
      stateId,
      isValid: labId !== null && stateId !== null,
    };
  };

  /**
   * Build API endpoint URL with lab context
   * @param baseEndpoint The base API endpoint
   * @param specificLabId Optional specific lab ID
   * @returns Complete endpoint URL with lab context
   */
  const buildApiEndpoint = (baseEndpoint: string, specificLabId?: number): string => {
    const { labId } = getContextParams(specificLabId);

    if (labId === null) {
      throw new Error('No lab context available for API call');
    }

    // Remove leading slash if present to avoid double slashes
    const cleanEndpoint = baseEndpoint.startsWith('/') ? baseEndpoint.slice(1) : baseEndpoint;

    return `/${cleanEndpoint}/${labId}`;
  };

  /**
   * Validate that we have proper context for API operations
   * @param specificLabId Optional specific lab ID to validate
   * @returns Boolean indicating if context is valid
   */
  const validateContext = (specificLabId?: number): boolean => {
    if (!isAuthenticated || !user) {
      console.error('User not authenticated');
      return false;
    }

    const { isValid, labId, stateId } = getContextParams(specificLabId);

    if (!isValid) {
      console.error('Invalid lab context:', { labId, stateId });
      return false;
    }

    return true;
  };

  /**
   * Get a summary of the current context for debugging
   */
  const getContextSummary = () => {
    return {
      user: user?.username || 'Not authenticated',
      currentLab: currentLab?.labName || 'No lab selected',
      currentLabId: currentLab?.labId || null,
      currentStateId: currentStateId,
      availableLabs: userLabs.length,
      isAuthenticated,
      isContextValid: validateContext(),
    };
  };

  return {
    // Context data
    user,
    currentLab,
    currentStateId,
    userLabs,
    isAuthenticated,

    // Context utilities
    getContextParams,
    buildApiEndpoint,
    validateContext,
    getContextSummary,
    hasLabAccess,
    switchLab,

    // Convenience properties
    currentLabId: currentLab?.labId || null,
    currentLabName: currentLab?.labName || null,
    currentStateAbbr: currentLab?.stateAbbreviation || null,
    hasValidContext: validateContext(),
  };
};

export default useLabContext;
