// src/api/endpoints/configurationService.ts
import { InstrumentTypeRs } from '../../features/labAssets/types';
import { ServiceResponse } from '../../features/shared/types/common';
import { apiClient, DEFAULT_LAB_ID } from '../config';

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
    // Ensure each instrument type has a labId property set to match the API expectation
    const instrumentTypesWithLabId = instrumentTypes.map(instrumentType => ({
      ...instrumentType,
      // @ts-ignore - Add labId even though it's not in the interface
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

// Export all functions as a default object
const configurationService = {
  fetchInstrumentTypes,
  upsertInstrumentTypes,
};

export default configurationService;
