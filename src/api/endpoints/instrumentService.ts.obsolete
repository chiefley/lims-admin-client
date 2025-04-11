// src/api/endpoints/instrumentService.ts
import { apiClient, DEFAULT_LAB_ID } from '../config';
import appConfig from '../../config/appConfig';
import {
  ServiceResponse,
  InstrumentTypeRs,
  InstrumentRs,
  InstrumentPeripheralRs,
  InstrumentTypeAnalyteRs,
  InstrumentFileParserType,
  ConfigurationMaintenanceSelectors, // Updated from SopMaintenanceSelectors
} from '../../models/types';

// Base URL for configuration maintenance endpoints - updated from sopMaintenance
const baseUrl = `${appConfig.api.baseUrl}/configurationmaintenance`;
const labId = DEFAULT_LAB_ID;

/**
 * Fetches all instrument types for the lab
 * @returns Promise with array of InstrumentTypeRs data
 */
export const fetchInstrumentTypes = async (): Promise<InstrumentTypeRs[]> => {
  try {
    console.log(`Fetching instrument types from ${baseUrl}/FetchInstrumentTypeRss/${labId}`);

    // Skip API call if mock data is enabled
    if (appConfig.features.useMockData) {
      return getMockInstrumentTypes();
    }

    const response = await apiClient.get<ServiceResponse<InstrumentTypeRs[]>>(
      `/configurationmaintenance/FetchInstrumentTypeRss/${labId}` // Updated from sopMaintenance
    );

    // Check if response has the expected structure
    if (!response.data || typeof response.data !== 'object') {
      throw new Error('Invalid response format from API');
    }

    // Check success flag
    if (response.data.success === false) {
      throw new Error(response.data.message || 'Failed to fetch instrument types');
    }

    // Ensure we have data
    if (!response.data.data) {
      throw new Error('No data returned from API');
    }

    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching instrument types:', error);

    // Return mock data if fetching fails and fallback is enabled
    if (appConfig.features.useMockDataAsFallback) {
      console.warn('Using mock instrument types data as fallback');
      return getMockInstrumentTypes();
    }

    throw error;
  }
};

// Rest of the file stays the same
// ...

export default {
  fetchInstrumentTypes,
  saveInstrumentType,
  saveInstrument,
};
