// src/api/endpoints/sopService.ts
import { apiClient, DEFAULT_LAB_ID } from '../config';
import { ServiceResponse, SopMaintenanceSelectors, PrepBatchSopSelectionRs } from '../types';

const SOP_MAINTENANCE_URL = '/sopmaintenance';

// Fetch selectors for dropdowns
export const fetchSelectors = async (
  labId: number = DEFAULT_LAB_ID
): Promise<SopMaintenanceSelectors> => {
  try {
    const response = await apiClient.get<ServiceResponse<SopMaintenanceSelectors>>(
      `${SOP_MAINTENANCE_URL}/FetchSelectors/${labId}`
    );
    return response.data.data;
  } catch (error) {
    console.error('Error fetching selectors:', error);
    throw error;
  }
};

// Fetch batch SOP selections
export const fetchBatchSopSelections = async (
  labId: number = DEFAULT_LAB_ID
): Promise<PrepBatchSopSelectionRs[]> => {
  try {
    const response = await apiClient.get<ServiceResponse<PrepBatchSopSelectionRs[]>>(
      `${SOP_MAINTENANCE_URL}/FetchBatchSopSelections/${labId}`
    );
    return response.data.data;
  } catch (error) {
    console.error('Error fetching batch SOP selections:', error);
    throw error;
  }
};

// Create a new batch SOP
export const createBatchSop = async (
  batchSop: Partial<PrepBatchSopSelectionRs>
): Promise<PrepBatchSopSelectionRs> => {
  try {
    const response = await apiClient.post<ServiceResponse<PrepBatchSopSelectionRs>>(
      `${SOP_MAINTENANCE_URL}/CreateBatchSop`,
      batchSop
    );
    return response.data.data;
  } catch (error) {
    console.error('Error creating batch SOP:', error);
    throw error;
  }
};

// Update an existing batch SOP
export const updateBatchSop = async (
  batchSop: PrepBatchSopSelectionRs
): Promise<PrepBatchSopSelectionRs> => {
  try {
    const response = await apiClient.put<ServiceResponse<PrepBatchSopSelectionRs>>(
      `${SOP_MAINTENANCE_URL}/UpdateBatchSop/${batchSop.batchSopId}`,
      batchSop
    );
    return response.data.data;
  } catch (error) {
    console.error('Error updating batch SOP:', error);
    throw error;
  }
};

// Delete a batch SOP
export const deleteBatchSop = async (batchSopId: number): Promise<boolean> => {
  try {
    const response = await apiClient.delete<ServiceResponse<boolean>>(
      `${SOP_MAINTENANCE_URL}/DeleteBatchSop/${batchSopId}`
    );
    return response.data.data;
  } catch (error) {
    console.error('Error deleting batch SOP:', error);
    throw error;
  }
};
