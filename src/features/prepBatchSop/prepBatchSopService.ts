// src/features/prepBatchSop/prepBatchSopService.ts
import { apiClient, DEFAULT_LAB_ID } from '../../api/config';
import { ServiceResponse } from '../shared/types/common';

import { PrepBatchSopRs, PrepBatchSopSelectionRs } from './types';

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

// Export as a default object
const prepBatchSopService = {
  fetchBatchSopSelections,
  fetchPrepBatchSopDetail,
  savePrepBatchSop,
};

export default prepBatchSopService;
