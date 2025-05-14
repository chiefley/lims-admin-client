// src/features/labAssets/labAssetsService.ts
import { apiClient, DEFAULT_LAB_ID } from '../../api/config';
import { ServiceResponse } from '../shared/types/common';

import { InstrumentTypeRs } from './types';

/**
 * Fetches all instrument types for the lab
 * @returns Promise with array of InstrumentTypeRs data
 */
export const fetchInstrumentTypes = async (): Promise<InstrumentTypeRs[]> => {
  try {
    const response = await apiClient.get<ServiceResponse<InstrumentTypeRs[]>>(
      `/configurationmaintenance/FetchInstrumentTypeRss/${DEFAULT_LAB_ID}`
    );

    if (!response.data || response.data.success === false) {
      throw new Error(response.data?.message || 'Failed to fetch instrument types');
    }

    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching instrument types:', error);
    throw error;
  }
};

/**
 * Saves changes to instrument types
 * @param instrumentTypes The array of instrument type data to save
 * @returns Promise with the saved InstrumentTypeRs[]
 */
export const upsertInstrumentTypes = async (
  instrumentTypes: InstrumentTypeRs[]
): Promise<InstrumentTypeRs[]> => {
  try {
    // Ensure each instrument type has a labId property
    const instrumentTypesWithLabId = instrumentTypes.map(instrumentType => ({
      ...instrumentType,
      labId: DEFAULT_LAB_ID, // Use the default lab ID from configuration
    }));

    const response = await apiClient.put<ServiceResponse<InstrumentTypeRs[]>>(
      `/configurationmaintenance/UpsertInstrumentTypeRss/${DEFAULT_LAB_ID}`,
      instrumentTypesWithLabId
    );

    if (!response.data || response.data.success === false) {
      throw new Error(response.data?.message || 'Failed to save instrument types');
    }

    return response.data.data;
  } catch (error: any) {
    console.error('Error saving instrument types:', error);
    throw error;
  }
};

// Export as a default object
const labAssetsService = {
  fetchInstrumentTypes,
  upsertInstrumentTypes,
};

export default labAssetsService;
