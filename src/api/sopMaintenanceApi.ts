// src/api/sopMaintenanceApi.ts

import axios from 'axios';
import { ServiceResponse, SopMaintenanceSelectors, PrepBatchSopSelectionRs } from '../models/types';
import appConfig from '../config/appConfig';

const API_BASE_URL = `${appConfig.api.baseUrl}${appConfig.api.endpoints.sopMaintenance.base}`;
const LAB_ID = appConfig.api.defaultLabId;

const sopMaintenanceApi = {
  /**
   * Fetches selector data for dropdown controls
   */
  fetchSelectors: async (): Promise<SopMaintenanceSelectors> => {
    try {
      const url = `${API_BASE_URL}${appConfig.api.endpoints.sopMaintenance.fetchSelectors}/${LAB_ID}`;
      console.log(`Making GET request to: ${url}`);

      // If mock data flag is enabled in config, return mock data
      if (appConfig.features.useMockData) {
        console.log('Using mock selector data for development');
        return {
          manifestSampleTypeItems: [
            { id: 1, label: 'Blood' },
            { id: 2, label: 'Urine' },
            { id: 3, label: 'Tissue' },
          ],
          panelGroupItems: [
            { id: 1, label: 'Basic' },
            { id: 2, label: 'Comprehensive' },
            { id: 3, label: 'Specialized' },
          ],
        };
      }

      const response = await axios.get<ServiceResponse<SopMaintenanceSelectors>>(url);

      console.log('Selectors API response:', response);

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch selectors');
      }
    } catch (error) {
      console.error('Error fetching selectors:', error);
      if (axios.isAxiosError(error)) {
        console.error('Axios error details:', error.response?.data || error.message);
      }
      throw error;
    }
  },

  /**
   * Fetches batch SOP selections
   */
  fetchBatchSopSelections: async (): Promise<PrepBatchSopSelectionRs[]> => {
    try {
      // Build the URL based on the config
      const url = `${API_BASE_URL}${appConfig.api.endpoints.sopMaintenance.fetchBatchSopSelections}/${LAB_ID}`;
      console.log('Requesting batch SOPs from URL:', url);

      // If mock data flag is enabled in config, return mock data
      if (appConfig.features.useMockData) {
        console.log('Using mock batch SOP data for development');
        return [
          {
            batchSopId: 1,
            name: 'Sample Preparation SOP',
            sop: 'SP001',
            version: '1.0',
            sopGroup: 'Preparation',
            labId: 1001,
            manifestSamplePrepBatchSopRss: [
              {
                manifestSamplePrepBatchSopId: 1,
                batchSopId: 1,
                manifestSampleTypeId: 1,
                panelGroupId: 2,
                panels: 'Panel A, Panel B',
                effectiveDate: '2023-01-01',
              },
            ],
            $type: 'PrepBatchSopSelectionRs',
          },
          {
            batchSopId: 2,
            name: 'Quality Control SOP',
            sop: 'QC002',
            version: '2.1',
            sopGroup: 'Quality',
            labId: 1001,
            manifestSamplePrepBatchSopRss: [
              {
                manifestSamplePrepBatchSopId: 2,
                batchSopId: 2,
                manifestSampleTypeId: 2,
                panelGroupId: 1,
                panels: 'Panel C',
                effectiveDate: '2023-02-15',
              },
              {
                manifestSamplePrepBatchSopId: 3,
                batchSopId: 2,
                manifestSampleTypeId: 3,
                panelGroupId: 3,
                panels: 'Panel D, Panel E',
                effectiveDate: '2023-03-01',
              },
            ],
            $type: 'PrepBatchSopSelectionRs',
          },
        ];
      }

      const response = await axios.get<ServiceResponse<PrepBatchSopSelectionRs[]>>(url);

      console.log('Batch SOP API response:', response);

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch batch SOP selections');
      }
    } catch (error) {
      console.error('Error fetching batch SOP selections:', error);
      if (axios.isAxiosError(error)) {
        console.error('Axios error details:', error.response?.data || error.message);
      }
      throw error;
    }
  },
};

export default sopMaintenanceApi;
