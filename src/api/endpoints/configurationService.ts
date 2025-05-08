// src/api/endpoints/configurationService.ts
import appConfig from '../../config/appConfig';
import {
  CompoundRs,
  PanelRs,
  DBEnumRs,
  CcSampleCategoryRs,
  FileParserRs,
  ItemTypeRs,
  NavMenuItemRs,
  NeededByRs,
  PanelGroupRs,
  PotencyCategoryRs,
  TestCategoryRs,
} from '../../features/basicTables';
import {
  ServiceResponse,
  ConfigurationMaintenanceSelectors,
  PrepBatchSopSelectionRs,
  AnalyticalBatchSopSelectionRs,
  PrepBatchSopRs,
  AnalyticalBatchSopRs,
  InstrumentTypeRs,
} from '../../models/types';
import { apiClient, DEFAULT_LAB_ID } from '../config';

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
 * Saves changes to panels (actually uses upsert)
 * @param panels The panels array to save
 * @returns Promise with the updated PanelRs array
 */
export const savePanels = async (panels: PanelRs[]): Promise<PanelRs[]> => {
  try {
    const response = await apiClient.put<ServiceResponse<PanelRs[]>>(
      `/configurationmaintenance/UpsertPanelRss/${DEFAULT_LAB_ID}`,
      panels
    );

    if (!response.data || response.data.success === false) {
      throw new Error(response.data?.message || 'Failed to save panels');
    }

    return response.data.data;
  } catch (error: any) {
    console.error('Error saving panels:', error);
    throw error;
  }
};

/**
 * Fetches all database enums for the lab
 * @returns Promise with array of DBEnumRs data
 */
export const fetchDBEnums = async (): Promise<DBEnumRs[]> => {
  try {
    const response = await apiClient.get<ServiceResponse<DBEnumRs[]>>(
      `/configurationmaintenance/FetchDBEnumRss/${DEFAULT_LAB_ID}`
    );

    if (!response.data || response.data.success === false) {
      throw new Error(response.data?.message || 'Failed to fetch DB enums');
    }

    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching DB enums:', error);
    throw error;
  }
};

/**
 * Saves changes to database enums
 * @param dbEnums The array of DB enum data to save
 * @returns Promise with the saved DBEnumRs array
 */
export const upsertDBEnums = async (dbEnums: DBEnumRs[]): Promise<DBEnumRs[]> => {
  try {
    const response = await apiClient.put<ServiceResponse<DBEnumRs[]>>(
      `/configurationmaintenance/UpsertDBEnumRss/${DEFAULT_LAB_ID}`,
      dbEnums
    );

    if (!response.data || response.data.success === false) {
      throw new Error(response.data?.message || 'Failed to save DB enums');
    }

    return response.data.data;
  } catch (error: any) {
    console.error('Error saving DB enums:', error);
    throw error;
  }
};

/**
 * Fetches all CC sample categories
 * @returns Promise with array of CcSampleCategoryRs data
 */
export const fetchCcSampleCategories = async (): Promise<CcSampleCategoryRs[]> => {
  try {
    const response = await apiClient.get<ServiceResponse<CcSampleCategoryRs[]>>(
      `/configurationmaintenance/FetchCcSampleCategoryRss/${DEFAULT_LAB_ID}`
    );

    if (!response.data || response.data.success === false) {
      throw new Error(response.data?.message || 'Failed to fetch CC sample categories');
    }

    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching CC sample categories:', error);
    throw error;
  }
};

/**
 * Saves changes to CC sample categories
 * @param ccSampleCategories The array of CC sample category data to save
 * @returns Promise with the saved CcSampleCategoryRs array
 */
export const upsertCcSampleCategories = async (
  ccSampleCategories: CcSampleCategoryRs[]
): Promise<CcSampleCategoryRs[]> => {
  try {
    const response = await apiClient.put<ServiceResponse<CcSampleCategoryRs[]>>(
      `/configurationmaintenance/UpsertCcSampleCategoryRss/${DEFAULT_LAB_ID}`,
      ccSampleCategories
    );

    if (!response.data || response.data.success === false) {
      throw new Error(response.data?.message || 'Failed to save CC sample categories');
    }

    return response.data.data;
  } catch (error: any) {
    console.error('Error saving CC sample categories:', error);
    throw error;
  }
};

/**
 * Fetches all file parsers
 * @returns Promise with array of FileParserRs data
 */
export const fetchFileParsers = async (): Promise<FileParserRs[]> => {
  try {
    const response = await apiClient.get<ServiceResponse<FileParserRs[]>>(
      `/configurationmaintenance/FetchFileParserRss`
    );

    if (!response.data || response.data.success === false) {
      throw new Error(response.data?.message || 'Failed to fetch file parsers');
    }

    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching file parsers:', error);
    throw error;
  }
};

/**
 * Saves changes to file parsers
 * @param fileParsers The array of file parser data to save
 * @returns Promise with the saved FileParserRs array
 */
export const upsertFileParsers = async (fileParsers: FileParserRs[]): Promise<FileParserRs[]> => {
  try {
    const response = await apiClient.put<ServiceResponse<FileParserRs[]>>(
      `/configurationmaintenance/UpsertFileParserRss`,
      fileParsers
    );

    if (!response.data || response.data.success === false) {
      throw new Error(response.data?.message || 'Failed to save file parsers');
    }

    return response.data.data;
  } catch (error: any) {
    console.error('Error saving file parsers:', error);
    throw error;
  }
};

/**
 * Fetches all item types for the given state
 * @param stateId The state ID to fetch item types for
 * @returns Promise with array of ItemTypeRs data
 */
export const fetchItemTypes = async (stateId: number = 2): Promise<ItemTypeRs[]> => {
  try {
    const response = await apiClient.get<ServiceResponse<ItemTypeRs[]>>(
      `/configurationmaintenance/FetchItemTypeRss/${stateId}`
    );

    if (!response.data || response.data.success === false) {
      throw new Error(response.data?.message || 'Failed to fetch item types');
    }

    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching item types:', error);
    throw error;
  }
};

/**
 * Saves changes to item types
 * @param itemTypes The array of item type data to save
 * @param stateId The state ID (defaults to lab state)
 * @returns Promise with the saved ItemTypeRs array
 */
export const upsertItemTypes = async (
  itemTypes: ItemTypeRs[],
  stateId: number = 2
): Promise<ItemTypeRs[]> => {
  try {
    const response = await apiClient.put<ServiceResponse<ItemTypeRs[]>>(
      `/configurationmaintenance/UpsertItemTypeRss/${stateId}`,
      itemTypes
    );

    if (!response.data || response.data.success === false) {
      throw new Error(response.data?.message || 'Failed to save item types');
    }

    return response.data.data;
  } catch (error: any) {
    console.error('Error saving item types:', error);
    throw error;
  }
};

/**
 * Fetches all navigation menu items for the lab
 * @returns Promise with array of NavMenuItemRs data
 */
export const fetchNavMenuItems = async (): Promise<NavMenuItemRs[]> => {
  try {
    const response = await apiClient.get<ServiceResponse<NavMenuItemRs[]>>(
      `/configurationmaintenance/FetchNavMenuItemRss/${DEFAULT_LAB_ID}`
    );

    if (!response.data || response.data.success === false) {
      throw new Error(response.data?.message || 'Failed to fetch navigation menu items');
    }

    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching navigation menu items:', error);
    throw error;
  }
};

/**
 * Saves changes to navigation menu items
 * @param navMenuItems The array of navigation menu item data to save
 * @returns Promise with the saved NavMenuItemRs array
 */
export const upsertNavMenuItems = async (
  navMenuItems: NavMenuItemRs[]
): Promise<NavMenuItemRs[]> => {
  try {
    const response = await apiClient.put<ServiceResponse<NavMenuItemRs[]>>(
      `/configurationmaintenance/UpsertNavMenuItemRss/${DEFAULT_LAB_ID}`,
      navMenuItems
    );

    if (!response.data || response.data.success === false) {
      throw new Error(response.data?.message || 'Failed to save navigation menu items');
    }

    return response.data.data;
  } catch (error: any) {
    console.error('Error saving navigation menu items:', error);
    throw error;
  }
};

/**
 * Fetches all needed by configurations for the lab
 * @returns Promise with array of NeededByRs data
 */
export const fetchNeededByConfigurations = async (): Promise<NeededByRs[]> => {
  try {
    const response = await apiClient.get<ServiceResponse<NeededByRs[]>>(
      `/configurationmaintenance/FetchNeededByRss/${DEFAULT_LAB_ID}`
    );

    if (!response.data || response.data.success === false) {
      throw new Error(response.data?.message || 'Failed to fetch needed by configurations');
    }

    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching needed by configurations:', error);
    throw error;
  }
};

/**
 * Saves changes to needed by configurations
 * @param neededByConfigs The array of needed by configuration data to save
 * @returns Promise with the saved NeededByRs array
 */
export const upsertNeededByConfigurations = async (
  neededByConfigs: NeededByRs[]
): Promise<NeededByRs[]> => {
  try {
    const response = await apiClient.put<ServiceResponse<NeededByRs[]>>(
      `/configurationmaintenance/UpsertNeededByRss/${DEFAULT_LAB_ID}`,
      neededByConfigs
    );

    if (!response.data || response.data.success === false) {
      throw new Error(response.data?.message || 'Failed to save needed by configurations');
    }

    return response.data.data;
  } catch (error: any) {
    console.error('Error saving needed by configurations:', error);
    throw error;
  }
};

/**
 * Fetches all panel groups for the lab
 * @returns Promise with array of PanelGroupRs data
 */
export const fetchPanelGroups = async (): Promise<PanelGroupRs[]> => {
  try {
    const response = await apiClient.get<ServiceResponse<PanelGroupRs[]>>(
      `/configurationmaintenance/FetchPanelGroupRss/${DEFAULT_LAB_ID}`
    );

    if (!response.data || response.data.success === false) {
      throw new Error(response.data?.message || 'Failed to fetch panel groups');
    }

    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching panel groups:', error);
    throw error;
  }
};

/**
 * Saves changes to panel groups
 * @param panelGroups The array of panel group data to save
 * @returns Promise with the saved PanelGroupRs array
 */
export const upsertPanelGroups = async (panelGroups: PanelGroupRs[]): Promise<PanelGroupRs[]> => {
  try {
    const response = await apiClient.put<ServiceResponse<PanelGroupRs[]>>(
      `/configurationmaintenance/UpsertPanelGroupRss/${DEFAULT_LAB_ID}`,
      panelGroups
    );

    if (!response.data || response.data.success === false) {
      throw new Error(response.data?.message || 'Failed to save panel groups');
    }

    return response.data.data;
  } catch (error: any) {
    console.error('Error saving panel groups:', error);
    throw error;
  }
};

/**
 * Fetches all potency categories for the given state
 * @param stateId The state ID to fetch potency categories for
 * @returns Promise with array of PotencyCategoryRs data
 */
export const fetchPotencyCategories = async (stateId: number = 2): Promise<PotencyCategoryRs[]> => {
  try {
    const response = await apiClient.get<ServiceResponse<PotencyCategoryRs[]>>(
      `/configurationmaintenance/FetchPotencyCategoryRss/${stateId}`
    );

    if (!response.data || response.data.success === false) {
      throw new Error(response.data?.message || 'Failed to fetch potency categories');
    }

    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching potency categories:', error);
    throw error;
  }
};

/**
 * Saves changes to potency categories
 * @param potencyCategories The array of potency category data to save
 * @returns Promise with the saved PotencyCategoryRs array
 */
export const upsertPotencyCategories = async (
  potencyCategories: PotencyCategoryRs[]
): Promise<PotencyCategoryRs[]> => {
  try {
    const response = await apiClient.put<ServiceResponse<PotencyCategoryRs[]>>(
      `/configurationmaintenance/UpsertPotencyCategoryRss/${DEFAULT_LAB_ID}`,
      potencyCategories
    );

    if (!response.data || response.data.success === false) {
      throw new Error(response.data?.message || 'Failed to save potency categories');
    }

    return response.data.data;
  } catch (error: any) {
    console.error('Error saving potency categories:', error);
    throw error;
  }
};

/**
 * Fetches all test categories for the given state
 * @param stateId The state ID to fetch test categories for
 * @returns Promise with array of TestCategoryRs data
 */
export const fetchTestCategories = async (stateId: number = 2): Promise<TestCategoryRs[]> => {
  try {
    const response = await apiClient.get<ServiceResponse<TestCategoryRs[]>>(
      `/configurationmaintenance/FetchTestCategoryRss/${stateId}`
    );

    if (!response.data || response.data.success === false) {
      throw new Error(response.data?.message || 'Failed to fetch test categories');
    }

    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching test categories:', error);
    throw error;
  }
};

/**
 * Saves changes to test categories
 * @param testCategories The array of test category data to save
 * @returns Promise with the saved TestCategoryRs array
 */
export const upsertTestCategories = async (
  testCategories: TestCategoryRs[]
): Promise<TestCategoryRs[]> => {
  try {
    const response = await apiClient.put<ServiceResponse<TestCategoryRs[]>>(
      `/configurationmaintenance/UpsertTestCategoryRss/${DEFAULT_LAB_ID}`,
      testCategories
    );

    if (!response.data || response.data.success === false) {
      throw new Error(response.data?.message || 'Failed to save test categories');
    }

    return response.data.data;
  } catch (error: any) {
    console.error('Error saving test categories:', error);
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
  savePanels,
  fetchDBEnums,
  upsertDBEnums,
  fetchCcSampleCategories,
  upsertCcSampleCategories,
  fetchFileParsers,
  upsertFileParsers,
  fetchItemTypes,
  upsertItemTypes,
  fetchNavMenuItems,
  upsertNavMenuItems,
  fetchNeededByConfigurations,
  upsertNeededByConfigurations,
  fetchPanelGroups,
  upsertPanelGroups,
  fetchPotencyCategories,
  upsertPotencyCategories,
  fetchTestCategories,
  upsertTestCategories,
};

export default configurationService;
