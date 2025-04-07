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
} from '../../models/types';

// Base URL for SOP maintenance endpoints
const baseUrl = `${appConfig.api.baseUrl}/sopmaintenance`;
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
      `/sopmaintenance/FetchInstrumentTypeRss/${labId}`
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

/**
 * Saves changes to an instrument type
 * @param data The instrument type data to save
 * @returns Promise with the saved InstrumentTypeRs
 */
export const saveInstrumentType = async (data: InstrumentTypeRs): Promise<InstrumentTypeRs> => {
  try {
    // This is a placeholder for the actual API call
    console.log('Saving instrument type:', data);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // In a real implementation, we would make a request like:
    // const response = await apiClient.put(`/sopmaintenance/UpdateInstrumentType`, data);
    // return response.data.data;

    // Simulating a successful response
    return data;
  } catch (error: any) {
    console.error('Error saving instrument type:', error);
    throw error;
  }
};

/**
 * Saves changes to an instrument
 * @param data The instrument data to save
 * @returns Promise with the saved InstrumentRs
 */
export const saveInstrument = async (data: InstrumentRs): Promise<InstrumentRs> => {
  try {
    // This is a placeholder for the actual API call
    console.log('Saving instrument:', data);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // In a real implementation, we would make a request like:
    // const response = await apiClient.put(`/sopmaintenance/UpdateInstrument`, data);
    // return response.data.data;

    // Simulating a successful response
    return data;
  } catch (error: any) {
    console.error('Error saving instrument:', error);
    throw error;
  }
};

/**
 * Mock data for instrument types when the API is unavailable
 */
function getMockInstrumentTypes(): InstrumentTypeRs[] {
  return [
    {
      instrumentTypeId: 1,
      name: 'HPLC',
      measurementType: 'Chromatography',
      dataFolder: '/data/hplc',
      peakAreaSaturationThreshold: 1000000,
      instrumentFileParser: InstrumentFileParserType.Agilent,
      instrumentRss: [
        {
          instrumentId: 101,
          instrumentTypeId: 1,
          name: 'HPLC-1',
          lastPM: new Date('2023-12-15'),
          nextPm: new Date('2024-06-15'),
          outOfService: false,
          instrumentPeripherals: [],
        },
        {
          instrumentId: 102,
          instrumentTypeId: 1,
          name: 'HPLC-2',
          lastPM: new Date('2024-01-10'),
          nextPm: new Date('2024-07-10'),
          outOfService: true,
          instrumentPeripherals: [],
        },
      ],
      instrumentTypeAnalyteRss: [],
    },
    {
      instrumentTypeId: 2,
      name: 'GCMS',
      measurementType: 'Mass Spectrometry',
      dataFolder: '/data/gcms',
      peakAreaSaturationThreshold: 500000,
      instrumentFileParser: InstrumentFileParserType.ThermoFisher,
      instrumentRss: [
        {
          instrumentId: 201,
          instrumentTypeId: 2,
          name: 'GCMS-A',
          lastPM: new Date('2024-02-20'),
          nextPm: new Date('2024-08-20'),
          outOfService: false,
          instrumentPeripherals: [],
        },
      ],
      instrumentTypeAnalyteRss: [],
    },
    {
      instrumentTypeId: 3,
      name: 'ICP-MS',
      measurementType: 'Elemental Analysis',
      dataFolder: '/data/icpms',
      peakAreaSaturationThreshold: 750000,
      instrumentFileParser: InstrumentFileParserType.PerkinElmer,
      instrumentRss: [
        {
          instrumentId: 301,
          instrumentTypeId: 3,
          name: 'ICP-MS-1',
          lastPM: new Date('2023-11-05'),
          nextPm: new Date('2024-05-05'),
          outOfService: false,
          instrumentPeripherals: [],
        },
        {
          instrumentId: 302,
          instrumentTypeId: 3,
          name: 'ICP-MS-2',
          lastPM: new Date('2024-03-15'),
          nextPm: new Date('2024-09-15'),
          outOfService: false,
          instrumentPeripherals: [],
        },
      ],
      instrumentTypeAnalyteRss: [],
    },
  ];
}

export default {
  fetchInstrumentTypes,
  saveInstrumentType,
  saveInstrument,
};
