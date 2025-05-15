// src/features/clients/clientService.ts
import { apiClient, DEFAULT_LAB_ID } from '../../api/config';
import { ServiceResponse } from '../shared/types/common';

import { Client, ClientLicenseType, ClientLicenseCategory } from './types';

/**
 * Fetches all clients
 * @param labId Optional lab ID, defaults to the DEFAULT_LAB_ID from config
 * @returns Promise with array of Client data
 */
export const fetchClients = async (labId: number = DEFAULT_LAB_ID): Promise<Client[]> => {
  try {
    console.log(`Calling API to fetch clients for lab ID: ${labId}`);

    // Using the correct endpoint based on other working services
    const response = await apiClient.get<ServiceResponse<Client[]>>(
      `/configurationmaintenance/FetchClientRss/${labId}`
    );

    if (!response.data || response.data.success === false) {
      console.error('API returned error or no data:', response.data);
      throw new Error(response.data?.message || 'Failed to fetch clients');
    }

    console.log(`API returned ${response.data.data?.length || 0} clients`);
    return response.data.data || [];
  } catch (error: any) {
    console.error('Error in fetchClients service call:', error.message, error.response?.status);
    throw error;
  }
};

/**
 * Saves changes to clients
 * @param clients The array of client data to save
 * @param labId Optional lab ID, defaults to the DEFAULT_LAB_ID from config
 * @returns Promise with the saved Client array
 */
export const upsertClients = async (
  clients: Client[],
  labId: number = DEFAULT_LAB_ID
): Promise<Client[]> => {
  try {
    console.log(`Saving ${clients.length} clients for lab ID: ${labId}`);

    const response = await apiClient.put<ServiceResponse<Client[]>>(
      `/configurationmaintenance/UpsertClientRss/${labId}`,
      clients
    );

    if (!response.data || response.data.success === false) {
      console.error('API returned error on save:', response.data);
      throw new Error(response.data?.message || 'Failed to save clients');
    }

    console.log(`Saved ${response.data.data?.length || 0} clients successfully`);
    return response.data.data || [];
  } catch (error: any) {
    console.error('Error in upsertClients service call:', error.message, error.response?.status);
    throw error;
  }
};

/**
 * Fetches all client license types
 * @param stateId The state ID to fetch license types for
 * @returns Promise with array of ClientLicenseType data
 */
export const fetchClientLicenseTypes = async (
  stateId: number = 2
): Promise<ClientLicenseType[]> => {
  try {
    const response = await apiClient.get<ServiceResponse<ClientLicenseType[]>>(
      `/configurationmaintenance/FetchClientLicenseTypeRss/${stateId}`
    );

    if (!response.data || response.data.success === false) {
      throw new Error(response.data?.message || 'Failed to fetch client license types');
    }

    return response.data.data || [];
  } catch (error: any) {
    console.error('Error fetching client license types:', error);
    throw error;
  }
};

/**
 * Saves changes to client license types
 * @param licenseTypes The array of license type data to save
 * @param stateId The state ID (defaults to 2)
 * @returns Promise with the saved ClientLicenseType array
 */
export const upsertClientLicenseTypes = async (
  licenseTypes: ClientLicenseType[],
  stateId: number = 2
): Promise<ClientLicenseType[]> => {
  try {
    const response = await apiClient.put<ServiceResponse<ClientLicenseType[]>>(
      `/configurationmaintenance/UpsertClientLicenseTypeRss/${stateId}`,
      licenseTypes
    );

    if (!response.data || response.data.success === false) {
      throw new Error(response.data?.message || 'Failed to save client license types');
    }

    return response.data.data || [];
  } catch (error: any) {
    console.error('Error saving client license types:', error);
    throw error;
  }
};

/**
 * Fetches all client license categories
 * @returns Promise with array of ClientLicenseCategory data
 */
export const fetchClientLicenseCategories = async (): Promise<ClientLicenseCategory[]> => {
  try {
    const response = await apiClient.get<ServiceResponse<ClientLicenseCategory[]>>(
      `/configurationmaintenance/FetchClientLicenseCategoryRss`
    );

    if (!response.data || response.data.success === false) {
      throw new Error(response.data?.message || 'Failed to fetch client license categories');
    }

    return response.data.data || [];
  } catch (error: any) {
    console.error('Error fetching client license categories:', error);
    throw error;
  }
};

/**
 * Saves changes to client license categories
 * @param licenseCategories The array of license category data to save
 * @returns Promise with the saved ClientLicenseCategory array
 */
export const upsertClientLicenseCategories = async (
  licenseCategories: ClientLicenseCategory[]
): Promise<ClientLicenseCategory[]> => {
  try {
    const response = await apiClient.put<ServiceResponse<ClientLicenseCategory[]>>(
      `/configurationmaintenance/UpsertClientLicenseCategoryRss`,
      licenseCategories
    );

    if (!response.data || response.data.success === false) {
      throw new Error(response.data?.message || 'Failed to save client license categories');
    }

    return response.data.data || [];
  } catch (error: any) {
    console.error('Error saving client license categories:', error);
    throw error;
  }
};

// Export as a default object
const clientsService = {
  fetchClients,
  upsertClients,
  fetchClientLicenseTypes,
  upsertClientLicenseTypes,
  fetchClientLicenseCategories,
  upsertClientLicenseCategories,
};

export default clientsService;
