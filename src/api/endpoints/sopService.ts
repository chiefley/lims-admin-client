// src/api/endpoints/sopService.ts
import { apiClient } from '../config';
import appConfig from '../../config/appConfig';
import {
  ServiceResponse,
  PrepBatchSopSelectionRs,
  SopMaintenanceSelectors,
  PrepBatchSopRs,
} from '../../models/types';

// Base URL for SOP maintenance endpoints
const baseUrl = `${appConfig.api.baseUrl}/sopmaintenance`;
const labId = appConfig.api.defaultLabId;

/**
 * Fetches selector values for SOP maintenance dropdowns
 * @returns Promise with SopMaintenanceSelectors data
 */
export const fetchSelectors = async (): Promise<SopMaintenanceSelectors> => {
  try {
    const response = await apiClient.get<ServiceResponse<SopMaintenanceSelectors>>(
      `${baseUrl}/FetchSelectors/${labId}`
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch selectors');
    }

    return response.data.data;
  } catch (error: any) {
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
    const response = await apiClient.get<ServiceResponse<PrepBatchSopSelectionRs[]>>(
      `${baseUrl}/FetchBatchSopSelections/${labId}`
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch prep batch SOPs');
    }

    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching prep batch SOPs:', error);
    throw error;
  }
};

/**
 * Fetches detailed information for a specific prep batch SOP
 * @param prepBatchSopId The ID of the prep batch SOP to fetch
 * @returns Promise with PrepBatchSopRs data
 */
export const fetchPrepBatchSopDetail = async (prepBatchSopId: number): Promise<PrepBatchSopRs> => {
  try {
    const response = await apiClient.get<ServiceResponse<PrepBatchSopRs>>(
      `${baseUrl}/FetchPrepBatchSopRs/${prepBatchSopId}`
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch prep batch SOP details');
    }

    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching prep batch SOP details:', error);
    throw error;
  }
};

/**
 * Saves changes to a prep batch SOP
 * @param data The prep batch SOP data to save
 * @returns Promise with the saved PrepBatchSopRs
 */
export const savePrepBatchSop = async (data: PrepBatchSopRs): Promise<PrepBatchSopRs> => {
  try {
    // This is a placeholder for the actual API call
    // In a real implementation, you would make a POST/PUT request to save the data
    console.log('Saving prep batch SOP:', data);

    // Simulating a successful response
    return data;
  } catch (error: any) {
    console.error('Error saving prep batch SOP:', error);
    throw error;
  }
};

/**
 * Saves a prep batch SOP selection (from the list view)
 * @param data The prep batch SOP selection data to save
 * @returns Promise with the saved PrepBatchSopSelectionRs
 */
export const savePrepBatchSopSelection = async (
  data: PrepBatchSopSelectionRs
): Promise<PrepBatchSopSelectionRs> => {
  try {
    // This is a placeholder for the actual API call
    console.log('Saving prep batch SOP selection:', data);

    // Simulating a successful response
    return data;
  } catch (error: any) {
    console.error('Error saving prep batch SOP selection:', error);
    throw error;
  }
};

export default {
  fetchSelectors,
  fetchBatchSopSelections,
  fetchPrepBatchSopDetail,
  savePrepBatchSop,
  savePrepBatchSopSelection,
};
