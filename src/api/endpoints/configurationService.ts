// src/api/endpoints/sopService.ts (to be renamed to configurationService.ts)
import { apiClient, DEFAULT_LAB_ID } from '../config';
import appConfig from '../../config/appConfig';
import {
  ServiceResponse,
  ConfigurationMaintenanceSelectors, // Renamed from SopMaintenanceSelectors
  PrepBatchSopSelectionRs,
  AnalyticalBatchSopSelectionRs,
  PrepBatchSopRs,
  AnalyticalBatchSopRs,
  CompoundRs,
  PanelRs,
} from '../../models/types';

// Updated base URL for configuration maintenance endpoints
const baseUrl = `${appConfig.api.baseUrl}/configurationmaintenance`;
const labId = DEFAULT_LAB_ID;

/**
 * Fetches all selectors for dropdowns
 * @returns Promise with selectors data
 */
export const fetchSelectors = async (): Promise<ConfigurationMaintenanceSelectors> => {
  try {
    console.log(`Fetching selectors from ${baseUrl}/FetchSelectors/${labId}`);

    const response = await apiClient.get<ServiceResponse<ConfigurationMaintenanceSelectors>>(
      `/configurationmaintenance/FetchSelectors/${labId}`
    );

    // Check if response has the expected structure
    if (!response.data || typeof response.data !== 'object') {
      throw new Error('Invalid response format from API');
    }

    // Check success flag
    if (response.data.success === false) {
      throw new Error(response.data.message || 'Failed to fetch selectors');
    }

    // Ensure we have data
    if (!response.data.data) {
      throw new Error('No data returned from API');
    }

    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching selectors:', error);
    throw error;
  }
};

/**
 * Fetches all prep batch SOP selections
 * @returns Promise with array of PrepBatchSopSelectionRs data
 */
export const fetchBatchSopSelections = async (): Promise<PrepBatchSopSelectionRs[]> => {
  try {
    console.log(`Fetching batch SOP selections from ${baseUrl}/FetchBatchSopSelections/${labId}`);

    const response = await apiClient.get<ServiceResponse<PrepBatchSopSelectionRs[]>>(
      `/configurationmaintenance/FetchBatchSopSelections/${labId}`
    );

    // Check response structure and success
    if (!response.data || response.data.success === false) {
      throw new Error(response.data?.message || 'Failed to fetch batch SOP selections');
    }

    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching batch SOP selections:', error);
    throw error;
  }
};

/**
 * Fetches all analytical batch SOP selections
 * @returns Promise with array of AnalyticalBatchSopSelectionRs data
 */
export const fetchAnalyticalBatchSopSelections = async (): Promise<
  AnalyticalBatchSopSelectionRs[]
> => {
  try {
    console.log(
      `Fetching analytical batch SOP selections from ${baseUrl}/FetchAnalyticalBatchSopSelections/${labId}`
    );

    const response = await apiClient.get<ServiceResponse<AnalyticalBatchSopSelectionRs[]>>(
      `/configurationmaintenance/FetchAnalyticalBatchSopSelections/${labId}`
    );

    // Check response structure and success
    if (!response.data || response.data.success === false) {
      throw new Error(response.data?.message || 'Failed to fetch analytical batch SOP selections');
    }

    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching analytical batch SOP selections:', error);
    throw error;
  }
};

/**
 * Fetches a specific prep batch SOP detail
 * @param prepBatchSopId ID of the prep batch SOP to fetch
 * @returns Promise with PrepBatchSopRs data
 */
export const fetchPrepBatchSopDetail = async (prepBatchSopId: number): Promise<PrepBatchSopRs> => {
  try {
    console.log(
      `Fetching prep batch SOP detail from ${baseUrl}/FetchPrepBatchSopRs/${prepBatchSopId}`
    );

    const response = await apiClient.get<ServiceResponse<PrepBatchSopRs>>(
      `/configurationmaintenance/FetchPrepBatchSopRs/${prepBatchSopId}`
    );

    // Check response structure and success
    if (!response.data || response.data.success === false) {
      throw new Error(response.data?.message || 'Failed to fetch prep batch SOP detail');
    }

    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching prep batch SOP detail:', error);
    throw error;
  }
};

/**
 * Fetches a specific analytical batch SOP detail
 * @param analyticalBatchSopId ID of the analytical batch SOP to fetch
 * @returns Promise with AnalyticalBatchSopRs data
 */
export const fetchAnalyticalBatchSopRs = async (
  analyticalBatchSopId: number
): Promise<AnalyticalBatchSopRs> => {
  try {
    console.log(
      `Fetching analytical batch SOP detail from ${baseUrl}/FetchAnalyticalBatchSopRs/${analyticalBatchSopId}`
    );

    const response = await apiClient.get<ServiceResponse<AnalyticalBatchSopRs>>(
      `/configurationmaintenance/FetchAnalyticalBatchSopRs/${analyticalBatchSopId}`
    );

    // Check response structure and success
    if (!response.data || response.data.success === false) {
      throw new Error(response.data?.message || 'Failed to fetch analytical batch SOP detail');
    }

    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching analytical batch SOP detail:', error);
    throw error;
  }
};

/**
 * Fetches all compounds
 * @returns Promise with array of CompoundRs data
 */
export const fetchCompounds = async (): Promise<CompoundRs[]> => {
  try {
    console.log(`Fetching compounds from ${baseUrl}/FetchCompoundRss`);

    const response = await apiClient.get<ServiceResponse<CompoundRs[]>>(
      `/configurationmaintenance/FetchCompoundRss`
    );

    // Check response structure and success
    if (!response.data || response.data.success === false) {
      throw new Error(response.data?.message || 'Failed to fetch compounds');
    }

    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching compounds:', error);
    throw error;
  }
};

/**
 * Fetches all panels for the lab
 * @returns Promise with array of PanelRs data
 */
export const fetchPanels = async (): Promise<PanelRs[]> => {
  try {
    console.log(`Fetching panels from ${baseUrl}/FetchPanelRss/${labId}`);

    const response = await apiClient.get<ServiceResponse<PanelRs[]>>(
      `/configurationmaintenance/FetchPanelRss/${labId}`
    );

    // Check response structure and success
    if (!response.data || response.data.success === false) {
      throw new Error(response.data?.message || 'Failed to fetch panels');
    }

    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching panels:', error);
    throw error;
  }
};

/**
 * Saves changes to a prep batch SOP
 * @param prepBatchSop The prep batch SOP data to save
 * @returns Promise with the saved PrepBatchSopRs
 */
export const savePrepBatchSop = async (prepBatchSop: PrepBatchSopRs): Promise<PrepBatchSopRs> => {
  try {
    console.log(`Saving prep batch SOP to ${baseUrl}/SavePrepBatchSop`);

    const response = await apiClient.put<ServiceResponse<PrepBatchSopRs>>(
      `/configurationmaintenance/SavePrepBatchSop`,
      prepBatchSop
    );

    // Check response structure and success
    if (!response.data || response.data.success === false) {
      throw new Error(response.data?.message || 'Failed to save prep batch SOP');
    }

    return response.data.data;
  } catch (error: any) {
    console.error('Error saving prep batch SOP:', error);
    throw error;
  }
};

/**
 * Saves changes to an analytical batch SOP
 * @param analyticalBatchSop The analytical batch SOP data to save
 * @returns Promise with the saved AnalyticalBatchSopRs
 */
export const saveAnalyticalBatchSop = async (
  analyticalBatchSop: AnalyticalBatchSopRs
): Promise<AnalyticalBatchSopRs> => {
  try {
    console.log(`Saving analytical batch SOP to ${baseUrl}/SaveAnalyticalBatchSop`);

    const response = await apiClient.put<ServiceResponse<AnalyticalBatchSopRs>>(
      `/configurationmaintenance/SaveAnalyticalBatchSop`,
      analyticalBatchSop
    );

    // Check response structure and success
    if (!response.data || response.data.success === false) {
      throw new Error(response.data?.message || 'Failed to save analytical batch SOP');
    }

    return response.data.data;
  } catch (error: any) {
    console.error('Error saving analytical batch SOP:', error);
    throw error;
  }
};

/**
 * Saves changes to a prep batch SOP selection
 * @param prepBatchSopSelection The prep batch SOP selection data to save
 * @returns Promise with the saved PrepBatchSopSelectionRs
 */
export const savePrepBatchSopSelection = async (
  prepBatchSopSelection: PrepBatchSopSelectionRs
): Promise<PrepBatchSopSelectionRs> => {
  try {
    console.log(`Saving prep batch SOP selection to ${baseUrl}/SavePrepBatchSopSelection`);

    const response = await apiClient.put<ServiceResponse<PrepBatchSopSelectionRs>>(
      `/configurationmaintenance/SavePrepBatchSopSelection`,
      prepBatchSopSelection
    );

    // Check response structure and success
    if (!response.data || response.data.success === false) {
      throw new Error(response.data?.message || 'Failed to save prep batch SOP selection');
    }

    return response.data.data;
  } catch (error: any) {
    console.error('Error saving prep batch SOP selection:', error);
    throw error;
  }
};

/**
 * Saves changes to a panel
 * @param panel The panel data to save
 * @returns Promise with the saved PanelRs
 */
export const savePanel = async (panel: PanelRs): Promise<PanelRs> => {
  try {
    console.log(`Saving panel to ${baseUrl}/SavePanel`);

    const response = await apiClient.put<ServiceResponse<PanelRs>>(
      `/configurationmaintenance/SavePanel`,
      panel
    );

    // Check response structure and success
    if (!response.data || response.data.success === false) {
      throw new Error(response.data?.message || 'Failed to save panel');
    }

    return response.data.data;
  } catch (error: any) {
    console.error('Error saving panel:', error);
    throw error;
  }
};

// Export all functions individually and also as a default object
export default {
  fetchSelectors,
  fetchBatchSopSelections,
  fetchAnalyticalBatchSopSelections,
  fetchPrepBatchSopDetail,
  fetchAnalyticalBatchSopRs,
  fetchCompounds,
  fetchPanels,
  savePrepBatchSop,
  saveAnalyticalBatchSop,
  savePrepBatchSopSelection,
  savePanel,
};
