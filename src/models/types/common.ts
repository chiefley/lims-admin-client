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
}

// ============ Enums ============
// These match the C# enums in the backend code

/**
 * Types of file parsers for different instrument manufacturers
 */
export enum InstrumentFileParserType {
  None = 0,
  Default = 1,
  Agilent = 2,
  PerkinElmer = 3,
  Shimadzu = 4,
  ThermoFisher = 5,
  Waters = 6,
}

/**
 * Decimal format types for numeric display
 */
export enum DecimalFormatType {
  None = 0,
  Standard = 1,
  Scientific = 2,
  ReportPrecision = 3,
}

/**
 * Position types for samples in a batch
 */
export enum SopBatchPositionType {
  Unknown = 0,
  Start = 1,
  EveryNSamples = 2,
  End = 3,
  First = 4,
  Last = 5,
}

/**
 * Types of control samples
 */
export enum ControlSampleType {
  Unknown = 0,
  Blank = 1,
  QC = 2,
  Duplicate = 3,
  Spike = 4,
  StandardAddition = 5,
  Calibration = 6,
  CalibrationVerification = 7,
}

/**
 * Categories of control samples
 */
export enum ControlSampleCategory {
  Unknown = 0,
  Matrix = 1,
  Method = 2,
  Standard = 3,
}

/**
 * Types of control sample analysis
 */
export enum ControlSampleAnalysis {
  Unknown = 0,
  Initial = 1,
  Continuing = 2,
}

/**
 * Sources of quality control samples
 */
export enum ControlSampleQCSource {
  Unknown = 0,
  External = 1,
  Internal = 2,
}

/**
 * Criteria for control sample pass/fail
 */
export enum ControlSamplePassCriteria {
  Unknown = 0,
  Recovery = 1,
  AbsoluteDifference = 2,
  RelativeDifference = 3,
}

/**
 * Quality control condition (pass/fail)
 */
export enum QCCondition {
  Unknown = 0,
  Pass = 1,
  Fail = 2,
}

/**
 * Types of percentage reporting
 */
export enum ReportPercentType {
  None = 0,
  AsIs = 1,
  WeightPercent = 2,
  MassToMassWeightPercent = 3,
  MilligramPerGram = 4,
  PartPerMillion = 5,
  PartPerBillion = 6,
}

/**
 * Analysis method types
 */
export enum ManifestSampleAnalysisMethodType {
  Unknown = 0,
  GCMS = 1,
  LCMS = 2,
  ICPMS = 3,
  FTIR = 4,
  Conventional = 5,
  GC = 6,
  HPLC = 7,
  UHPLC = 8,
}

/**
 * Method types for aggregating rollup data
 */
export enum AggregateRollupMethodType {
  Unknown = 0,
  Average = 1,
  First = 2,
  Last = 3,
  PassOnlyFirst = 4,
  PassOnlyLast = 5,
  KeepAll = 6,
}

/**
 * Comparison operators for validation
 */
export enum NcComparisonType {
  Unknown = 0,
  LessThan = 1,
  LessThanOrEqual = 2,
  Equal = 3,
  NotEqual = 4,
  GreaterThanOrEqual = 5,
  GreaterThan = 6,
}

/**
 * Level in data file hierarchy
 */
export enum DataFileLevel {
  Unknown = 0,
  File = 1,
  Sample = 2,
  Analyte = 3,
}

/**
 * Types of data files
 */
export enum DataFileType {
  Unknown = 0,
  CSV = 1,
  TXT = 2,
  XML = 3,
  JSON = 4,
  XLS = 5,
  XLSX = 6,
}

/**
 * Types of field delimiters in text files
 */
export enum FieldDelimiterType {
  Unknown = 0,
  Comma = 1,
  Tab = 2,
  Semicolon = 3,
  Pipe = 4,
  Space = 5,
}

/**
 * Sample multiplicity in data files
 */
export enum DataFileSampleMultiplicity {
  Unknown = 0,
  Single = 1,
  Multiple = 2,
}

/**
 * Navigation menu keys
 */
export enum NavMenuKey {
  Unknown = 0,
  Main = 1,
  Admin = 2,
  Sample = 3,
  Analysis = 4,
  Report = 5,
  Support = 6,
}

/**
 * Days of the week
 */
export enum DayOfWeek {
  Sunday = 0,
  Monday = 1,
  Tuesday = 2,
  Wednesday = 3,
  Thursday = 4,
  Friday = 5,
  Saturday = 6,
}
