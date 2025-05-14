// src/features/analyticalBatchSop/analyticalBatchSopService.ts
import { apiClient, DEFAULT_LAB_ID } from '../../api/config';
import { ServiceResponse } from '../shared/types/common';

import { AnalyticalBatchSopRs, AnalyticalBatchSopSelectionRs } from './types';

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
 * Fetches a specific analytical batch SOP detail
 * @param analyticalBatchSopId ID of the analytical batch SOP to fetch
 * @returns Promise with AnalyticalBatchSopRs data
 */
export const fetchAnalyticalBatchSopDetail = async (
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

// Export as a default object
const analyticalBatchSopService = {
  fetchAnalyticalBatchSopSelections,
  fetchAnalyticalBatchSopDetail,
  saveAnalyticalBatchSop,
};

export default analyticalBatchSopService;
