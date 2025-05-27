// src/hooks/useChangeTracking.ts
import { useState } from 'react';

import { useUnsavedChanges } from '../contexts/NavigationProtectionContext';

export const useChangeTracking = <T>(currentData: T, onLoad?: () => void) => {
  const [originalData, setOriginalData] = useState<T>(currentData);

  const hasChanges = JSON.stringify(originalData) !== JSON.stringify(currentData);

  useUnsavedChanges(hasChanges);

  return {
    hasChanges,
    markAsSaved: () => setOriginalData(currentData),
    resetToOriginal: () => (currentData = originalData),
  };
};
