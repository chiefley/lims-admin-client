// src/api/endpoints/sopService.ts
import { apiClient, DEFAULT_LAB_ID } from '../config';
import appConfig from '../../config/appConfig';
import { FEATURES } from '../../config/constants';
import {
  ServiceResponse,
  PrepBatchSopSelectionRs,
  SopMaintenanceSelectors,
  PrepBatchSopRs,
  PanelRs,
} from '../../models/types';

// Base URL for SOP maintenance endpoints
const baseUrl = `${appConfig.api.baseUrl}/sopmaintenance`;
const labId = DEFAULT_LAB_ID;

/**
 * Fetches selector values for SOP maintenance dropdowns
 * @returns Promise with SopMaintenanceSelectors data
 */
export const fetchSelectors = async (): Promise<SopMaintenanceSelectors> => {
  try {
    console.log(`Fetching selectors from ${baseUrl}/FetchSelectors/${labId}`);

    // Skip API call if mock data is enabled
    if (appConfig.features.useMockData) {
      return getMockSelectors();
    }

    const response = await apiClient.get<ServiceResponse<SopMaintenanceSelectors>>(
      `/sopmaintenance/FetchSelectors/${labId}`
    );

    // Log the response for debugging
    console.log('API Response (Selectors):', response);

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

    // Return mock data if fetching fails and fallback is enabled
    if (appConfig.features.useMockDataAsFallback) {
      console.warn('Using mock selector data as fallback');
      return getMockSelectors();
    }

    throw error;
  }
};

/**
 * Fetches all prep batch SOP selections for the lab
 * @returns Promise with array of PrepBatchSopSelectionRs data
 */
export const fetchBatchSopSelections = async (): Promise<PrepBatchSopSelectionRs[]> => {
  try {
    // Skip API call if mock data is enabled
    if (appConfig.features.useMockData) {
      return getMockBatchSopSelections();
    }

    const response = await apiClient.get<ServiceResponse<PrepBatchSopSelectionRs[]>>(
      `/sopmaintenance/FetchBatchSopSelections/${labId}`
    );

    // Log the response for debugging
    console.log('API Response (Batch SOP Selections):', response);

    // Check if response has the expected structure
    if (!response.data || typeof response.data !== 'object') {
      throw new Error('Invalid response format from API');
    }

    // Check success flag
    if (response.data.success === false) {
      throw new Error(response.data.message || 'Failed to fetch prep batch SOPs');
    }

    // Ensure we have data
    if (!response.data.data) {
      throw new Error('No data returned from API');
    }

    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching prep batch SOPs:', error);

    // Return mock data if fetching fails and fallback is enabled
    if (appConfig.features.useMockDataAsFallback) {
      console.warn('Using mock batch SOP data as fallback');
      return getMockBatchSopSelections();
    }

    throw error;
  }
};

/**
 * Fetches all compounds
 * @returns Promise with array of CompoundRs data
 */
export const fetchCompounds = async () => {
  try {
    console.log(`Fetching compounds from ${baseUrl}/FetchCompoundRss`);

    // Skip API call if mock data is enabled
    if (appConfig.features.useMockData) {
      return getMockCompounds();
    }

    const response = await apiClient.get<ServiceResponse<any[]>>(
      `/sopmaintenance/FetchCompoundRss`
    );

    // Log the response for debugging
    console.log('API Response (Compounds):', response);

    // Check if response has the expected structure
    if (!response.data || typeof response.data !== 'object') {
      throw new Error('Invalid response format from API');
    }

    // Check success flag
    if (response.data.success === false) {
      throw new Error(response.data.message || 'Failed to fetch compounds');
    }

    // Ensure we have data
    if (!response.data.data) {
      throw new Error('No data returned from API');
    }

    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching compounds:', error);

    // Return mock data if fetching fails and fallback is enabled
    if (appConfig.features.useMockDataAsFallback) {
      console.warn('Using mock compound data as fallback');
      return getMockCompounds();
    }

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

    // Skip API call if mock data is enabled
    if (appConfig.features.useMockData) {
      return getMockPanels();
    }

    const response = await apiClient.get<ServiceResponse<PanelRs[]>>(
      `/sopmaintenance/FetchPanelRss/${labId}`
    );

    // Log the response for debugging
    console.log('API Response (Panels):', response);

    // Check if response has the expected structure
    if (!response.data || typeof response.data !== 'object') {
      throw new Error('Invalid response format from API');
    }

    // Check success flag
    if (response.data.success === false) {
      throw new Error(response.data.message || 'Failed to fetch panels');
    }

    // Ensure we have data
    if (!response.data.data) {
      throw new Error('No data returned from API');
    }

    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching panels:', error);

    // Return mock data if fetching fails and fallback is enabled
    if (appConfig.features.useMockDataAsFallback) {
      console.warn('Using mock panel data as fallback');
      return getMockPanels();
    }

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
    console.log(
      `Fetching SOP detail for ID ${prepBatchSopId} from ${baseUrl}/FetchPrepBatchSopRs/${prepBatchSopId}`
    );

    // Skip API call if mock data is enabled
    if (appConfig.features.useMockData) {
      return getMockPrepBatchSopDetail(prepBatchSopId);
    }

    // Don't specify the return type here to allow for different response formats
    const response = await apiClient.get(`/sopmaintenance/FetchPrepBatchSopRs/${prepBatchSopId}`);

    // Log the raw response for debugging
    console.log('Raw API Response (SOP Detail):', response);

    // Check if response has the expected structure
    if (!response.data || typeof response.data !== 'object') {
      console.error('Invalid API response format:', response.data);
      throw new Error('Invalid response format from API');
    }

    // Check if the data looks like a PrepBatchSopRs object directly
    const dataAsAny = response.data as any;
    if (dataAsAny.batchSopId !== undefined) {
      // The response appears to be the PrepBatchSopRs object directly
      return dataAsAny as PrepBatchSopRs;
    }

    // Check if it's wrapped in a ServiceResponse
    if ('success' in dataAsAny) {
      // It's a ServiceResponse format
      if (dataAsAny.success === false) {
        console.error('API returned success: false');
        throw new Error(dataAsAny.message || 'Failed to fetch prep batch SOP details');
      }

      // Return the data property if it exists
      if (dataAsAny.data) {
        return dataAsAny.data as PrepBatchSopRs;
      }
    }

    console.error('No valid data structure found in API response:', response.data);
    throw new Error('Could not extract data from API response');
  } catch (error: any) {
    console.error('Error fetching prep batch SOP details:', error);

    // Return mock data if fetching fails and fallback is enabled
    if (appConfig.features.useMockDataAsFallback) {
      console.warn('Using mock SOP detail data as fallback');
      return getMockPrepBatchSopDetail(prepBatchSopId);
    }

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

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // In a real implementation, we would make a request like:
    // const response = await apiClient.put(`/sopmaintenance/UpdatePrepBatchSop`, data);
    // return response.data.data;

    // Validate procedure data
    if (data.sopProcedures) {
      data.sopProcedures.forEach(procedure => {
        // Ensure the procedure is linked to the correct SOP
        procedure.batchSopId = data.batchSopId;

        // Sort procedure items by their order property
        if (procedure.procedureItems) {
          procedure.procedureItems.sort((a, b) => a.order - b.order);

          // Ensure each procedure item is linked to its parent procedure
          procedure.procedureItems.forEach(item => {
            item.sopProcedureId = procedure.sopProcedureId;
          });
        }
      });
    }

    // Simulating a successful response
    return data;
  } catch (error: any) {
    console.error('Error saving prep batch SOP:', error);
    throw error;
  }
};

/**
 * Saves a panel
 * @param panel The panel data to save
 * @returns Promise with the saved PanelRs
 */
export const savePanel = async (panel: PanelRs): Promise<PanelRs> => {
  try {
    // This is a placeholder for the actual API call
    console.log('Saving panel:', panel);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // In a real implementation, we would make a request like:
    // const response = await apiClient.put(`/sopmaintenance/UpdatePanel`, panel);
    // return response.data.data;

    // Simulating a successful response
    return panel;
  } catch (error: any) {
    console.error('Error saving panel:', error);
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

/**
 * Mock data for selectors when the API is unavailable
 */
function getMockSelectors(): SopMaintenanceSelectors {
  return {
    manifestSampleTypeItems: [
      { id: 1, label: 'Soil' },
      { id: 2, label: 'Water' },
      { id: 3, label: 'Plant Tissue' },
      { id: 4, label: 'Oil' },
    ],
    panelGroupItems: [
      { id: 1, label: 'Metals' },
      { id: 2, label: 'Pesticides' },
      { id: 3, label: 'Nutrients' },
      { id: 4, label: 'Microbial' },
    ],
    labAssetTypes: [
      { id: 1, label: 'Instrument' },
      { id: 2, label: 'Container' },
      { id: 3, label: 'Equipment' },
    ],
    sopEnumTypes: [
      { id: 1, label: 'Extraction Method' },
      { id: 2, label: 'Analysis Method' },
    ],
    instrumentTypes: [
      { id: 1, label: 'HPLC' },
      { id: 2, label: 'GCMS' },
      { id: 3, label: 'ICP-MS' },
    ],
    userRoles: [
      { id: 1, label: 'Lab Technician' },
      { id: 2, label: 'Analyst' },
      { id: 3, label: 'Lab Manager' },
    ],
    decimalFormatTypes: [
      { id: 1, label: 'Standard' },
      { id: 2, label: 'Scientific' },
      { id: 3, label: 'Fixed Decimal' },
    ],
    sopBatchPositionTypes: [
      { id: 1, label: 'Beginning' },
      { id: 2, label: 'Middle' },
      { id: 3, label: 'End' },
    ],
    controlSampleTypes: [
      { id: 1, label: 'Blank' },
      { id: 2, label: 'Spike' },
      { id: 3, label: 'Duplicate' },
    ],
    controlSampleCategories: [
      { id: 1, label: 'Quality Control' },
      { id: 2, label: 'Method Validation' },
    ],
    controlSampleAnalyses: [
      { id: 1, label: 'Full Analysis' },
      { id: 2, label: 'Partial Analysis' },
    ],
    controlSampleQCSources: [
      { id: 1, label: 'Internal' },
      { id: 2, label: 'External' },
    ],
    controlSamplePassCriteria: [
      { id: 1, label: 'Recovery Range' },
      { id: 2, label: 'Statistical Control' },
    ],
    qCConditions: [
      { id: 1, label: 'Normal' },
      { id: 2, label: 'Warning' },
      { id: 3, label: 'Action' },
    ],
    compounds: [
      { id: 1, label: 'Benzene' },
      { id: 2, label: 'Toluene' },
      { id: 3, label: 'Xylene' },
    ],
    panelGroups: [
      { id: 1, label: 'Metals' },
      { id: 2, label: 'Pesticides' },
      { id: 3, label: 'Nutrients' },
      { id: 4, label: 'Microbial' },
    ],
    panelTypes: [
      { id: 1, label: 'Quantitative' },
      { id: 2, label: 'Qualitative' },
    ],
    testCategoryTypes: [
      { id: 1, label: 'Potency' },
      { id: 2, label: 'Contamination' },
      { id: 3, label: 'Microbial' },
    ],
  };
}

/**
 * Mock data for batch SOP selections when the API is unavailable
 */
function getMockBatchSopSelections(): PrepBatchSopSelectionRs[] {
  return [
    {
      batchSopId: 1,
      name: 'Soil Sample Preparation',
      sop: 'PREP-001',
      version: '1.0',
      sopGroup: 'Sample Preparation',
      labId: 1001,
      batchCount: 5,
      $type: 'PrepBatchSopSelectionRs',
      manifestSamplePrepBatchSopRss: [],
    },
    {
      batchSopId: 2,
      name: 'Water Sample Preparation',
      sop: 'PREP-002',
      version: '2.1',
      sopGroup: 'Sample Preparation',
      labId: 1001,
      batchCount: 0,
      $type: 'PrepBatchSopSelectionRs',
      manifestSamplePrepBatchSopRss: [],
    },
    {
      batchSopId: 3,
      name: 'Plant Tissue Preparation',
      sop: 'PREP-003',
      version: '1.5',
      sopGroup: 'Sample Preparation',
      labId: 1001,
      batchCount: 2,
      $type: 'PrepBatchSopSelectionRs',
      manifestSamplePrepBatchSopRss: [],
    },
  ];
}

/**
 * Mock data for compounds when the API is unavailable
 */
function getMockCompounds() {
  return [
    { analyteId: 1, cas: '71-43-2', name: 'Benzene', ccCompoundName: 'Benzol' },
    { analyteId: 2, cas: '108-88-3', name: 'Toluene', ccCompoundName: 'Methylbenzene' },
    { analyteId: 3, cas: '1330-20-7', name: 'Xylene', ccCompoundName: 'Dimethylbenzene' },
    { analyteId: 4, cas: '67-66-3', name: 'Chloroform', ccCompoundName: 'Trichloromethane' },
    { analyteId: 5, cas: '75-09-2', name: 'Methylene Chloride', ccCompoundName: 'Dichloromethane' },
    { analyteId: 6, cas: '67-64-1', name: 'Acetone', ccCompoundName: 'Propanone' },
    { analyteId: 7, cas: '64-17-5', name: 'Ethanol', ccCompoundName: 'Ethyl Alcohol' },
    { analyteId: 8, cas: '67-56-1', name: 'Methanol', ccCompoundName: 'Methyl Alcohol' },
    { analyteId: 9, cas: '141-78-6', name: 'Ethyl Acetate', ccCompoundName: 'Ethyl Ethanoate' },
    { analyteId: 10, cas: '67-63-0', name: 'Isopropanol', ccCompoundName: '2-Propanol' },
  ];
}

/**
 * Mock data for panels when the API is unavailable
 */
function getMockPanels(): PanelRs[] {
  return [
    {
      panelId: 1,
      name: 'Metals Panel',
      slug: 'MTLS',
      subordinateToPanelGroup: true,
      panelGroupId: 1,
      significantDigits: 3,
      decimalFormatType: 1,
      panelType: 'Quantitative',
      qualitativeFirst: false,
      requiresMoistureContent: true,
      allowPartialAnalytes: false,
      plantSop: 'PLANT-SOP-001',
      nonPlantSop: 'NONPLANT-SOP-001',
      scaleFactor: 1.0,
      units: 'mg/kg',
      measuredUnits: 'mg/L',
      limitUnits: 'mg/kg',
      defaultExtractionVolumeMl: 10.0,
      defaultDilution: 1.0,
      instrumentTypeId: 3,
      ccTestPackageId: 101,
      ccCategoryName: 'Metals',
      testCategoryId: 1,
      sampleCount: 128,
      childPanels: ['HMTLS', 'LEAD'],
    },
    {
      panelId: 2,
      name: 'Heavy Metals Panel',
      slug: 'HMTLS',
      subordinateToPanelGroup: true,
      panelGroupId: 1,
      significantDigits: 3,
      decimalFormatType: 1,
      panelType: 'Quantitative',
      qualitativeFirst: false,
      requiresMoistureContent: true,
      allowPartialAnalytes: false,
      plantSop: 'PLANT-SOP-002',
      nonPlantSop: 'NONPLANT-SOP-002',
      scaleFactor: 1.0,
      units: 'mg/kg',
      measuredUnits: 'mg/L',
      limitUnits: 'mg/kg',
      defaultExtractionVolumeMl: 10.0,
      defaultDilution: 1.0,
      instrumentTypeId: 3,
      ccTestPackageId: 102,
      ccCategoryName: 'Heavy Metals',
      testCategoryId: 1,
      sampleCount: 94,
      childPanels: ['LEAD'],
    },
    {
      panelId: 3,
      name: 'Lead Panel',
      slug: 'LEAD',
      subordinateToPanelGroup: true,
      panelGroupId: 1,
      significantDigits: 3,
      decimalFormatType: 1,
      panelType: 'Quantitative',
      qualitativeFirst: false,
      requiresMoistureContent: true,
      allowPartialAnalytes: false,
      plantSop: 'PLANT-SOP-003',
      nonPlantSop: 'NONPLANT-SOP-003',
      scaleFactor: 1.0,
      units: 'mg/kg',
      measuredUnits: 'mg/L',
      limitUnits: 'mg/kg',
      defaultExtractionVolumeMl: 10.0,
      defaultDilution: 1.0,
      instrumentTypeId: 3,
      ccTestPackageId: 103,
      ccCategoryName: 'Lead',
      testCategoryId: 1,
      sampleCount: 87,
      childPanels: [],
    },
    {
      panelId: 4,
      name: 'Pesticides Panel',
      slug: 'PEST',
      subordinateToPanelGroup: true,
      panelGroupId: 2,
      significantDigits: 2,
      decimalFormatType: 1,
      panelType: 'Quantitative',
      qualitativeFirst: true,
      requiresMoistureContent: false,
      allowPartialAnalytes: true,
      plantSop: 'PLANT-SOP-004',
      nonPlantSop: 'NONPLANT-SOP-004',
      scaleFactor: 0.5,
      units: 'mg/kg',
      measuredUnits: 'mg/L',
      limitUnits: 'mg/kg',
      defaultExtractionVolumeMl: 15.0,
      defaultDilution: 2.0,
      instrumentTypeId: 2,
      ccTestPackageId: 201,
      ccCategoryName: 'Pesticides',
      testCategoryId: 2,
      sampleCount: 112,
      childPanels: [],
    },
    {
      panelId: 5,
      name: 'Microbial Panel',
      slug: 'MICRO',
      subordinateToPanelGroup: true,
      panelGroupId: 4,
      significantDigits: 0,
      decimalFormatType: 1,
      panelType: 'Qualitative',
      qualitativeFirst: true,
      requiresMoistureContent: false,
      allowPartialAnalytes: true,
      plantSop: 'PLANT-SOP-005',
      nonPlantSop: 'NONPLANT-SOP-005',
      scaleFactor: 1.0,
      units: 'CFU/g',
      measuredUnits: 'CFU/g',
      limitUnits: 'CFU/g',
      defaultExtractionVolumeMl: 100.0,
      defaultDilution: 10.0,
      instrumentTypeId: 1,
      ccTestPackageId: 301,
      ccCategoryName: 'Microbial',
      testCategoryId: 3,
      sampleCount: 65,
      childPanels: [],
    },
  ];
}

/**
 * Mock data for a specific prep batch SOP detail when the API is unavailable
 */
function getMockPrepBatchSopDetail(sopId: number): PrepBatchSopRs {
  // Base SOP details
  const sop: PrepBatchSopRs = {
    batchSopId: sopId,
    labId: 1001,
    name: `Mock SOP ${sopId}`,
    sop: `PREP-00${sopId}`,
    version: '1.0',
    sopGroup: 'Sample Preparation',
    significantDigits: 3,
    decimalFormatType: 1,
    maxSamplesPerBatch: 20,
    defaultDilution: 1.0,
    defaultExtractionVolumeMl: 10.0,
    defaultInjectionVolumeUl: 5.0,
    maxWeightG: 5.0,
    minWeightG: 0.5,
    manifestSamplePrepBatchSopRss: [
      {
        manifestSamplePrepBatchSopId: 101,
        batchSopId: sopId,
        manifestSampleTypeId: 1,
        panelGroupId: 1,
        panels: 'Metals, Heavy Metals',
        effectiveDate: new Date().toISOString(),
      },
      {
        manifestSamplePrepBatchSopId: 102,
        batchSopId: sopId,
        manifestSampleTypeId: 2,
        panelGroupId: 2,
        panels: 'Pesticides, Herbicides',
        effectiveDate: new Date().toISOString(),
      },
    ],
    sopFields: [],
    sopProcedures: [
      {
        batchSopId: sopId,
        sopProcedureId: 201,
        section: 'Preparation',
        procedureName: 'Sample Weighing',
        procedureItems: [
          {
            sopProcedurItemId: 301,
            sopProcedureId: 201,
            order: 1,
            itemNumber: '1',
            text: 'Clean all equipment with solvent.',
            indentLevel: 0,
          },
          {
            sopProcedurItemId: 302,
            sopProcedureId: 201,
            order: 2,
            itemNumber: '2',
            text: 'Weigh the sample container.',
            indentLevel: 0,
          },
          {
            sopProcedurItemId: 303,
            sopProcedureId: 201,
            order: 3,
            itemNumber: '3',
            text: 'Add sample to container and record weight.',
            indentLevel: 0,
          },
        ],
      },
    ],
    $type: 'PrepBatchSopRs',
  };

  return sop;
}

export default {
  fetchSelectors,
  fetchBatchSopSelections,
  fetchPrepBatchSopDetail,
  fetchCompounds,
  savePrepBatchSop,
  savePrepBatchSopSelection,
  fetchPanels,
  savePanel,
};
