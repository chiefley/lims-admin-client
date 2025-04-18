// src/api/endpoints/configurationService.ts
import { apiClient, DEFAULT_LAB_ID } from '../config';
import appConfig from '../../config/appConfig';
import {
  ServiceResponse,
  ConfigurationMaintenanceSelectors,
  PrepBatchSopSelectionRs,
  AnalyticalBatchSopSelectionRs,
  PrepBatchSopRs,
  AnalyticalBatchSopRs,
  CompoundRs,
  PanelRs,
  InstrumentTypeRs,
} from '../../models/types';

// Base URL for configuration maintenance endpoints
const baseUrl = `${appConfig.api.baseUrl}/configurationmaintenance`;

/**
 * Fetches all selectors for dropdowns
 * @returns Promise with selectors data
 */
export const fetchSelectors = async (): Promise<ConfigurationMaintenanceSelectors> => {
  try {
    const response = await apiClient.get<ServiceResponse<ConfigurationMaintenanceSelectors>>(
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

/**
 * Fetches all prep batch SOP selections
 * @returns Promise with array of PrepBatchSopSelectionRs data
 */
export const fetchBatchSopSelections = async (): Promise<PrepBatchSopSelectionRs[]> => {
  try {
    const response = await apiClient.get<ServiceResponse<PrepBatchSopSelectionRs[]>>(
      `/configurationmaintenance/FetchBatchSopSelections/${DEFAULT_LAB_ID}`
    );

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
    const response = await apiClient.get<ServiceResponse<AnalyticalBatchSopSelectionRs[]>>(
      `/configurationmaintenance/FetchAnalyticalBatchSopSelections/${DEFAULT_LAB_ID}`
    );

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
    const response = await apiClient.get<ServiceResponse<PrepBatchSopRs>>(
      `/configurationmaintenance/FetchPrepBatchSopRs/${prepBatchSopId}`
    );

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
    const response = await apiClient.get<ServiceResponse<AnalyticalBatchSopRs>>(
      `/configurationmaintenance/FetchAnalyticalBatchSopRs/${analyticalBatchSopId}`
    );

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
    const response = await apiClient.get<ServiceResponse<CompoundRs[]>>(
      `/configurationmaintenance/FetchCompoundRss`
    );

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
 * Saves changes to compounds
 * @param compounds The array of compound data to save
 * @returns Promise with the saved CompoundRs array
 */
export const upsertCompoundRss = async (compounds: CompoundRs[]): Promise<CompoundRs[]> => {
  try {
    const response = await apiClient.put<ServiceResponse<CompoundRs[]>>(
      `/configurationmaintenance/UpsertCompoundRss/${DEFAULT_LAB_ID}`,
      compounds
    );

    if (!response.data || response.data.success === false) {
      throw new Error(response.data?.message || 'Failed to save compounds');
    }

    return response.data.data;
  } catch (error: any) {
    console.error('Error saving compounds:', error);
    throw error;
  }
};

/**
 * Fetches all panels for the lab
 * @returns Promise with array of PanelRs data
 */
export const fetchPanels = async (): Promise<PanelRs[]> => {
  try {
    const response = await apiClient.get<ServiceResponse<PanelRs[]>>(
      `/configurationmaintenance/FetchPanelRss/${DEFAULT_LAB_ID}`
    );

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

/**
 * Saves changes to a prep batch SOP
 * @param prepBatchSop The prep batch SOP data to save
 * @returns Promise with the saved PrepBatchSopRs
 */
export const savePrepBatchSop = async (prepBatchSop: PrepBatchSopRs): Promise<PrepBatchSopRs> => {
  try {
    const response = await apiClient.put<ServiceResponse<PrepBatchSopRs>>(
      `/configurationmaintenance/SavePrepBatchSop`,
      prepBatchSop
    );

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
    const response = await apiClient.put<ServiceResponse<AnalyticalBatchSopRs>>(
      `/configurationmaintenance/SaveAnalyticalBatchSop`,
      analyticalBatchSop
    );

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
 * Saves changes to a panel
 * @param panel The panel data to save
 * @returns Promise with the saved PanelRs
 */
export const savePanel = async (panel: PanelRs): Promise<PanelRs> => {
  try {
    const response = await apiClient.put<ServiceResponse<PanelRs>>(
      `/configurationmaintenance/SavePanel`,
      panel
    );

    if (!response.data || response.data.success === false) {
      throw new Error(response.data?.message || 'Failed to save panel');
    }

    return response.data.data;
  } catch (error: any) {
    console.error('Error saving panel:', error);
    throw error;
  }
};

// Export all functions as a default object
const configurationService = {
  fetchSelectors,
  fetchBatchSopSelections,
  fetchAnalyticalBatchSopSelections,
  fetchPrepBatchSopDetail,
  fetchAnalyticalBatchSopRs,
  fetchCompounds,
  upsertCompoundRss,
  fetchPanels,
  fetchInstrumentTypes,
  upsertInstrumentTypes,
  savePrepBatchSop,
  saveAnalyticalBatchSop,
  savePanel,
};

export default configurationService;
