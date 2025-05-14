// src/models/types/common.ts
// Common type definitions used across modules

/**
 * Represents a validation error returned from the API
 */
export interface ValidationError {
  propertyName: string;
  errorMessage: string;
}

/**
 * Generic service response wrapper matching ServiceResponse<T> from the C# backend
 */
export interface ServiceResponse<T> {
  success: boolean;
  message: string;
  data: T;
  validationErrors: ValidationError[];
}

/**
 * Dropdown item for selection controls, matching C# DropDownItem
 */
export interface DropDownItem {
  id: number;
  label: string;
}

/**
 * Validation result containing validation errors
 */
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Configuration selectors provided by the API for populating dropdowns and other selection controls
 */
export interface ConfigurationMaintenanceSelectors {
  manifestSampleTypeItems: DropDownItem[];
  panelGroupItems: DropDownItem[];
  labAssetTypes: DropDownItem[];
  sopEnumTypes: DropDownItem[];
  instrumentTypes: DropDownItem[];
  userRoles: DropDownItem[];
  decimalFormatTypes: DropDownItem[];
  sopBatchPositionTypes: DropDownItem[];
  controlSampleTypes: DropDownItem[];
  controlSampleCategories: DropDownItem[];
  controlSampleAnalyses: DropDownItem[];
  controlSampleQCSources: DropDownItem[];
  controlSamplePassCriteria: DropDownItem[];
  qCConditions: DropDownItem[];
  compounds: DropDownItem[];
  panelGroups: DropDownItem[];
  panelTypes: DropDownItem[];
  testCategoryTypes: DropDownItem[];
  instrumentFileParserTypes: DropDownItem[];
  durableLabAssets: DropDownItem[];
  analysisMethodTypes: DropDownItem[];
  reportPercentTypes: DropDownItem[];
  comparisonTypes: DropDownItem[];
  aggregateRollupMethodTypes: DropDownItem[];
  prepBatchSops: DropDownItem[];
  analyticalBatchSops: DropDownItem[];
  peripheralTypes: DropDownItem[];
  dbEnumTypes: DropDownItem[];
  ccSampleTypes: DropDownItem[];
  dataFileLevels: DropDownItem[];
  dataFileTypes: DropDownItem[];
  fieldDelimeterTypes: DropDownItem[];
  dataFileSampleMultiplicities: DropDownItem[];
  navMenuKeys: DropDownItem[];
  dayOfWeeks: DropDownItem[];
  clientLicenseCategories: DropDownItem[];
  clientLicenseTypes: DropDownItem[];
}
