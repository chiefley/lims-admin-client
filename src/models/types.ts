// src/models/types.ts

export interface ValidationError {
  propertyName: string;
  errorMessage: string;
}

// Basic response structure matching ServiceResponse<T> from your C# code
export interface ServiceResponse<T> {
  success: boolean;
  message: string;
  data: T;
  validationErrors: ValidationError[];
}

// Dropdown item matching your C# DropDownItem
export interface DropDownItem {
  id: number;
  label: string;
}

// SOP Maintenance selectors
export interface SopMaintenanceSelectors {
  manifestSampleTypeItems: DropDownItem[];
  panelGroupItems: DropDownItem[];
  labAssetTypes: DropDownItem[];
  sopEnumTypes: DropDownItem[];
  instrumentTypes: DropDownItem[];
  userRoles: DropDownItem[];
  decimalFormatTypes: DropDownItem[];
}

// ============ Base Types ============

// Batch SOP Selection Base Response
export interface BatchSopSelectionRs {
  batchSopId: number;
  name: string;
  sop: string;
  version: string;
  sopGroup: string;
  labId: number;
  batchCount: number;
  $type: string;
}

// Manifest Sample Prep Batch SOP Response
export interface ManifestSamplePrepBatchSopRs {
  manifestSamplePrepBatchSopId: number;
  batchSopId: number;
  manifestSampleTypeId: number | null;
  panelGroupId: number | null;
  panels: string;
  effectiveDate: string | null;
}

// Prep Batch SOP Selection Response
export interface PrepBatchSopSelectionRs extends BatchSopSelectionRs {
  manifestSamplePrepBatchSopRss: ManifestSamplePrepBatchSopRs[];
  $type: 'PrepBatchSopSelectionRs';
}

// ============ Detailed Types for SOP Detail View ============

// SOP Procedure Item Response
export interface SopProcedureItemRs {
  sopProcedurItemId: number;
  sopProcedureId: number;
  order: number;
  itemNumber: string | null;
  text: string;
  indentLevel: number;
}

// SOP Procedure Response
export interface SopProcedureRs {
  batchSopId: number;
  sopProcedureId: number;
  section: string;
  procedureName: string;
  procedureItems: SopProcedureItemRs[];
}

// Base SOP Field Response
export interface SopFieldRs {
  sopFieldId: number;
  batchSopId: number;
  section: string | null;
  name: string | null;
  displayName: string | null;
  row: number;
  column: number;
  batchPropertyName: string | null;
  required: boolean;
  readOnly: boolean;
  requiredMessage: string | null;
  minValueMessage: string | null;
  maxValueMessage: string | null;
  regexMessage: string | null;
  $type: string;
}

// DateTime SOP Field Response
export interface DateTimeSopFieldRs {
  sopFieldId: number;
  batchSopId: number;
  section: string | null;
  name: string | null;
  displayName: string | null;
  row: number;
  column: number;
  batchPropertyName: string | null;
  required: boolean;
  readOnly: boolean;
  requiredMessage: string | null;
  minValueMessage: string | null;
  maxValueMessage: string | null;
  regexMessage: string | null;
  $type: 'DateTimeSopFieldRs';
  datePartOnly: boolean;
}

// Double SOP Field Response
export interface DoubleSopFieldRs {
  sopFieldId: number;
  batchSopId: number;
  section: string | null;
  name: string | null;
  displayName: string | null;
  row: number;
  column: number;
  batchPropertyName: string | null;
  required: boolean;
  readOnly: boolean;
  requiredMessage: string | null;
  minValueMessage: string | null;
  maxValueMessage: string | null;
  regexMessage: string | null;
  $type: 'DoubleSopFieldRs';
  minDoubleValue: number | null;
  maxDoubleValue: number | null;
  precision: number | null;
}

// LabAsset SOP Field Response
export interface LabAssetSopFieldRs {
  sopFieldId: number;
  batchSopId: number;
  section: string | null;
  name: string | null;
  displayName: string | null;
  row: number;
  column: number;
  batchPropertyName: string | null;
  required: boolean;
  readOnly: boolean;
  requiredMessage: string | null;
  minValueMessage: string | null;
  maxValueMessage: string | null;
  regexMessage: string | null;
  $type: 'LabAssetSopFieldRs';
  labAssetTypeId: number | null;
}

// InstrumentType SOP Field Response
export interface InstrumentTypeSopFieldRs {
  sopFieldId: number;
  batchSopId: number;
  section: string | null;
  name: string | null;
  displayName: string | null;
  row: number;
  column: number;
  batchPropertyName: string | null;
  required: boolean;
  readOnly: boolean;
  requiredMessage: string | null;
  minValueMessage: string | null;
  maxValueMessage: string | null;
  regexMessage: string | null;
  $type: 'InstrumentTypeSopFieldRs';
  instrumentTypeId: number | null;
}

// SopEnum SOP Field Response
export interface SopEnumSopFieldRs {
  sopFieldId: number;
  batchSopId: number;
  section: string | null;
  name: string | null;
  displayName: string | null;
  row: number;
  column: number;
  batchPropertyName: string | null;
  required: boolean;
  readOnly: boolean;
  requiredMessage: string | null;
  minValueMessage: string | null;
  maxValueMessage: string | null;
  regexMessage: string | null;
  $type: 'SopEnumSopFieldRs';
  sopEnumTypeId: number | null;
}

// User SOP Field Response
export interface UserSopFieldRs {
  sopFieldId: number;
  batchSopId: number;
  section: string | null;
  name: string | null;
  displayName: string | null;
  row: number;
  column: number;
  batchPropertyName: string | null;
  required: boolean;
  readOnly: boolean;
  requiredMessage: string | null;
  minValueMessage: string | null;
  maxValueMessage: string | null;
  regexMessage: string | null;
  $type: 'UserSopFieldRs';
  applicationRoleId: number | null;
}

// Text SOP Field Response
export interface TextSopFieldRs {
  sopFieldId: number;
  batchSopId: number;
  section: string | null;
  name: string | null;
  displayName: string | null;
  row: number;
  column: number;
  batchPropertyName: string | null;
  required: boolean;
  readOnly: boolean;
  requiredMessage: string | null;
  minValueMessage: string | null;
  maxValueMessage: string | null;
  regexMessage: string | null;
  $type: 'TextSopFieldRs';
}

// Table Column Text SOP Field Response
export interface TableColumnTextSopFieldRs {
  sopFieldId: number;
  batchSopId: number;
  section: string | null;
  name: string | null;
  displayName: string | null;
  row: number;
  column: number;
  batchPropertyName: string | null;
  required: boolean;
  readOnly: boolean;
  requiredMessage: string | null;
  minValueMessage: string | null;
  maxValueMessage: string | null;
  regexMessage: string | null;
  $type: 'TableColumnTextSopFieldRs';
  tableName: string;
  columnWidth: number | null;
  vmPropertyName: string;
  validationRegex: string | null;
  minLength: number | null;
  maxLength: number | null;
}

// Table Column Int SOP Field Response
export interface TableColumnIntSopFieldRs {
  sopFieldId: number;
  batchSopId: number;
  section: string | null;
  name: string | null;
  displayName: string | null;
  row: number;
  column: number;
  batchPropertyName: string | null;
  required: boolean;
  readOnly: boolean;
  requiredMessage: string | null;
  minValueMessage: string | null;
  maxValueMessage: string | null;
  regexMessage: string | null;
  $type: 'TableColumnIntSopFieldRs';
  tableName: string;
  columnWidth: number | null;
  vmPropertyName: string;
  minIntValue: number | null;
  maxIntValue: number | null;
}

// Table Column Double SOP Field Response
export interface TableColumnDoubleSopFieldRs {
  sopFieldId: number;
  batchSopId: number;
  section: string | null;
  name: string | null;
  displayName: string | null;
  row: number;
  column: number;
  batchPropertyName: string | null;
  required: boolean;
  readOnly: boolean;
  requiredMessage: string | null;
  minValueMessage: string | null;
  maxValueMessage: string | null;
  regexMessage: string | null;
  $type: 'TableColumnDoubleSopFieldRs';
  tableName: string;
  columnWidth: number | null;
  vmPropertyName: string;
  minDoubleValue: number | null;
  maxDoubleValue: number | null;
  precision: number;
}

// Table Column DateTime Field Response
export interface TableColumnDateTimeFieldRs {
  sopFieldId: number;
  batchSopId: number;
  section: string | null;
  name: string | null;
  displayName: string | null;
  row: number;
  column: number;
  batchPropertyName: string | null;
  required: boolean;
  readOnly: boolean;
  requiredMessage: string | null;
  minValueMessage: string | null;
  maxValueMessage: string | null;
  regexMessage: string | null;
  $type: 'TableColumnDateTimeFieldRs';
  tableName: string;
  columnWidth: number | null;
  vmPropertyName: string;
  datePartOnly: boolean;
}

// Table Column SopEnum Field Response
export interface TableColumnSopEnumFieldRs {
  sopFieldId: number;
  batchSopId: number;
  section: string | null;
  name: string | null;
  displayName: string | null;
  row: number;
  column: number;
  batchPropertyName: string | null;
  required: boolean;
  readOnly: boolean;
  requiredMessage: string | null;
  minValueMessage: string | null;
  maxValueMessage: string | null;
  regexMessage: string | null;
  $type: 'TableColumnSopEnumFieldRs';
  tableName: string;
  columnWidth: number | null;
  vmPropertyName: string;
}

// Detailed Prep Batch SOP Response
export interface PrepBatchSopRs {
  batchSopId: number;
  labId: number;
  name: string;
  sop: string;
  version: string;
  sopGroup: string;
  significantDigits: number | null;
  decimalFormatType: number | null;
  maxSamplesPerBatch: number | null;
  defaultDilution: number | null;
  defaultExtractionVolumeMl: number | null;
  defaultInjectionVolumeUl: number | null;
  maxWeightG: number | null;
  minWeightG: number | null;
  manifestSamplePrepBatchSopRss: ManifestSamplePrepBatchSopRs[];
  sopFields: SopFieldRs[];
  sopProcedures: SopProcedureRs[];
  $type: string;
}

// Other types you may need based on your API
export interface AnalyticalBatchSopSelectionRs extends BatchSopSelectionRs {
  // Add specific properties if needed
  $type: 'AnalyticalBatchSopSelectionRs';
}
