import axios from 'axios';
import appConfig from '../../config/appConfig';
import {
  ServiceResponse,
  PrepBatchSopSelectionRs,
  SopMaintenanceSelectors,
} from '../../models/types';

// Base URL for SOP maintenance endpoints
const baseUrl = `${appConfig.api.baseUrl}${appConfig.api.endpoints.sopMaintenance.base}`;
const labId = appConfig.api.defaultLabId;

/**
 * Fetches selector values for SOP maintenance dropdowns
 * @returns Promise with SopMaintenanceSelectors data
 */
export const fetchSelectors = async (): Promise<SopMaintenanceSelectors> => {
  try {
    const response = await axios.get<ServiceResponse<SopMaintenanceSelectors>>(
      `${baseUrl}/FetchSelectors/${labId}`
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch selectors');
    }

    return response.data.data;
  } catch (error) {
    console.error('Error fetching selectors:', error);
    throw error;
  }
};

/**
 * Fetches all prep batch SOP selections for the lab
 * @returns Promise with array of PrepBatchSopSelectionRs data
 */
export const fetchBatchSopSelections = async (): Promise<PrepBatchSopSelectionRs[]> => {
  try {
    const response = await axios.get<ServiceResponse<PrepBatchSopSelectionRs[]>>(
      `${baseUrl}/FetchBatchSopSelections/${labId}`
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch prep batch SOPs');
    }

    return response.data.data;
  } catch (error) {
    console.error('Error fetching prep batch SOPs:', error);
    throw error;
  }
};

/**
 * Planned for future implementation
 * Saves a prep batch SOP selection
 */
export const savePrepBatchSopSelection = async (data: PrepBatchSopSelectionRs) => {
  // Implementation for saving prep batch SOP will be added here
  console.log('Saving prep batch SOP:', data);
  // This is a placeholder for future implementation
};

export default {
  fetchSelectors,
  fetchBatchSopSelections,
  savePrepBatchSopSelection,
};
