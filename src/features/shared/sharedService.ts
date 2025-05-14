// src/features/shared/sharedService.ts
import { apiClient, DEFAULT_LAB_ID } from '../../api/config';

import { ConfigurationMaintenanceSelectors } from './types/common';

/**
 * Fetches all selectors for dropdowns
 * @returns Promise with selectors data
 */
export const fetchSelectors = async (): Promise<ConfigurationMaintenanceSelectors> => {
  try {
    const response = await apiClient.get(
      `/configurationmaintenance/FetchSelectors/${DEFAULT_LAB_ID}`
    );

    if (!response.data || response.data.success === false) {
      throw new Error(response.data?.message || 'Failed to fetch selectors');
    }

    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching selectors:', error);
    throw error;
  }
};

// Export as a default object
const sharedService = {
  fetchSelectors,
};

export default sharedService;
