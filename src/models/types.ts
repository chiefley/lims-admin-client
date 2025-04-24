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

// ============ Enums ============
// These should match the C# enums in your backend code

export enum InstrumentFileParserType {
  None = 0,
  Default = 1,
  Agilent = 2,
  PerkinElmer = 3,
  Shimadzu = 4,
  ThermoFisher = 5,
  Waters = 6,
}

export enum DecimalFormatType {
  None = 0,
  Standard = 1,
  Scientific = 2,
  ReportPrecision = 3,
}

export enum SopBatchPositionType {
  Unknown = 0,
  Start = 1,
  EveryNSamples = 2,
  End = 3,
  First = 4,
  Last = 5,
}

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

export enum ControlSampleCategory {
  Unknown = 0,
  Matrix = 1,
  Method = 2,
  Standard = 3,
}

export enum ControlSampleAnalysis {
  Unknown = 0,
  Initial = 1,
  Continuing = 2,
}

export enum ControlSampleQCSource {
  Unknown = 0,
  External = 1,
  Internal = 2,
}

export enum ControlSamplePassCriteria {
  Unknown = 0,
  Recovery = 1,
  AbsoluteDifference = 2,
  RelativeDifference = 3,
}

export enum QCCondition {
  Unknown = 0,
  Pass = 1,
  Fail = 2,
}

export enum ReportPercentType {
  None = 0,
  AsIs = 1,
  WeightPercent = 2,
  MassToMassWeightPercent = 3,
  MilligramPerGram = 4,
  PartPerMillion = 5,
  PartPerBillion = 6,
}

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

export enum AggregateRollupMethodType {
  Unknown = 0,
  Average = 1,
  First = 2,
  Last = 3,
  PassOnlyFirst = 4,
  PassOnlyLast = 5,
  KeepAll = 6,
}

export enum NcComparisonType {
  Unknown = 0,
  LessThan = 1,
  LessThanOrEqual = 2,
  Equal = 3,
  NotEqual = 4,
  GreaterThanOrEqual = 5,
  GreaterThan = 6,
}

export enum DataFileLevel {
  Unknown = 0,
  File = 1,
  Sample = 2,
  Analyte = 3,
}

export enum DataFileType {
  Unknown = 0,
  CSV = 1,
  TXT = 2,
  XML = 3,
  JSON = 4,
  XLS = 5,
  XLSX = 6,
}

export enum FieldDelimiterType {
  Unknown = 0,
  Comma = 1,
  Tab = 2,
  Semicolon = 3,
  Pipe = 4,
  Space = 5,
}

export enum DataFileSampleMultiplicity {
  Unknown = 0,
  Single = 1,
  Multiple = 2,
}

export enum NavMenuKey {
  Unknown = 0,
  Main = 1,
  Admin = 2,
  Sample = 3,
  Analysis = 4,
  Report = 5,
  Support = 6,
}

export enum DayOfWeek {
  Sunday = 0,
  Monday = 1,
  Tuesday = 2,
  Wednesday = 3,
  Thursday = 4,
  Friday = 5,
  Saturday = 6,
}

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

// Analytical Batch SOP Selection Response
export interface AnalyticalBatchSopSelectionRs extends BatchSopSelectionRs {
  $type: 'AnalyticalBatchSopSelectionRs';
}

// ============ SOP Field Types - Polymorphic ============

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

// Base Single Value SOP Field
export interface SingleValueSopFieldRs extends SopFieldRs {
  $type: string;
}

// DateTime SOP Field
export interface DateTimeSopFieldRs extends Omit<SingleValueSopFieldRs, '$type'> {
  $type: 'DateTimeSopFieldRs';
  datePartOnly: boolean;
}

// Double SOP Field
export interface DoubleSopFieldRs extends Omit<SingleValueSopFieldRs, '$type'> {
  $type: 'DoubleSopFieldRs';
  minDoubleValue: number | null;
  maxDoubleValue: number | null;
  precision: number | null;
}

// Lab Asset SOP Field
export interface LabAssetSopFieldRs extends Omit<SingleValueSopFieldRs, '$type'> {
  $type: 'LabAssetSopFieldRs';
  labAssetTypeId: number | null;
}

// Instrument Type SOP Field
export interface InstrumentTypeSopFieldRs extends Omit<SingleValueSopFieldRs, '$type'> {
  $type: 'InstrumentTypeSopFieldRs';
  instrumentTypeId: number | null;
}

// SOP Enum SOP Field
export interface SopEnumSopFieldRs extends Omit<SingleValueSopFieldRs, '$type'> {
  $type: 'SopEnumSopFieldRs';
  sopEnumTypeId: number | null;
}

// User SOP Field
export interface UserSopFieldRs extends Omit<SingleValueSopFieldRs, '$type'> {
  $type: 'UserSopFieldRs';
  applicationRoleId: number | null;
}

// Text SOP Field
export interface TextSopFieldRs extends Omit<SingleValueSopFieldRs, '$type'> {
  $type: 'TextSopFieldRs';
}

// Base Table Column SOP Field
export interface TableColumnSopFieldRs extends Omit<SopFieldRs, '$type'> {
  $type: 'TableColumnSopFieldRs';
  tableName: string;
  columnWidth: number | null;
  vmPropertyName: string;
}

// Table Column Text SOP Field
export interface TableColumnTextSopFieldRs extends Omit<TableColumnSopFieldRs, '$type'> {
  $type: 'TableColumnTextSopFieldRs';
  validationRegex: string | null;
  minLength: number | null;
  maxLength: number | null;
}

// Table Column Int SOP Field
export interface TableColumnIntSopFieldRs extends Omit<TableColumnSopFieldRs, '$type'> {
  $type: 'TableColumnIntSopFieldRs';
  minIntValue: number | null;
  maxIntValue: number | null;
}

// Table Column Double SOP Field
export interface TableColumnDoubleSopFieldRs extends Omit<TableColumnSopFieldRs, '$type'> {
  $type: 'TableColumnDoubleSopFieldRs';
  minDoubleValue: number | null;
  maxDoubleValue: number | null;
  precision: number;
}

// Table Column DateTime SOP Field
export interface TableColumnDateTimeFieldRs extends Omit<TableColumnSopFieldRs, '$type'> {
  $type: 'TableColumnDateTimeFieldRs';
  datePartOnly: boolean;
}

// Table Column SOP Enum SOP Field
export interface TableColumnSopEnumFieldRs extends Omit<TableColumnSopFieldRs, '$type'> {
  $type: 'TableColumnSopEnumFieldRs';
}

// ============ SOP Procedure Types ============

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
  sopProcedureId: number;
  batchSopId: number;
  section: string;
  procedureName: string;
  procedureItems: SopProcedureItemRs[];
}

// ============ Detailed Types for SOP Detail View ============

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

// ============ Analytical Batch SOP Types ============

// Computed Analyte Constituent Response
export interface ComputedAnalyteConstituentRs {
  computedAnalyteConstituentId: number;
  analyticalBatchSopAnalyteId: number;
  analyteId: number;
  cas?: string;
}

// Analytical Batch SOP Analyte Response
export interface AnalyticalBatchSopAnalyteRs {
  analyticalBatchSopAnalyteId: number;
  analyticalBatchSopId: number;
  analyteId: number | null;
  computed: boolean;
  computeAggregateAnalyte: boolean;
  isInternalStandard: boolean;
  warningStd: number | null;
  confidenceStd: number | null;
  testStd: number | null;
  analystDisplayOrder: number | null;
  computedAnalyteConstituentRss: ComputedAnalyteConstituentRs[];
}

// Analytical Batch Control Analyte SOP Specification Response
export interface AnalyticalBatchControlAnalyteSopSpecificationRs {
  controlSampleAnalyteSopSpecificationId: number;
  analyticalBatchSopControlSampleId: number;
  analyteId: number | null;
  expectedRecovery: number | null;
  qCType: number | null;
}

// Analytical Batch SOP Control Sample Response
export interface AnalyticalBatchSopControlSampleRs {
  analyticalBatchSopControlSampleId: number;
  analyticalBatchSopId: number;
  sopBatchPositionType: number | null;
  everyNSamples: number | null;
  controlSampleOrder: number | null;
  qCFactor1: number | null;
  qCFactor2: number | null;
  qCTargetRangeLow: number | null;
  qCTargetRangeHigh: number | null;
  historicalDays: number | null;
  controlSampleAnalyteSopSpecificationRss: AnalyticalBatchControlAnalyteSopSpecificationRs[];
}

// SOP Analysis Review Component Response
export interface SopAnalysisReviewComponentRs {
  sopAnalysisReviewComponentId: number;
  analyticalBatchSopId: number;
  componentName: string | null;
  displayName: string | null;
  parameter: string | null;
  collection: string | null;
}

// Prep Batch SOP to Analytical Batch SOP Link Response
export interface PrepBatchSopAnalyticalBatchSopRs {
  prepBatchSopAnalyticalBatchSopId: number;
  prepBatchSopId: number | null;
  analyticalBatchSopId: number | null;
  effectiveDate: string | null;
}

// Full Analytical Batch SOP Response
export interface AnalyticalBatchSopRs {
  batchSopId: number;
  name: string;
  sop: string;
  version: string;
  sopGroup: string;
  labId: number;
  significantDigits: number | null;
  decimalFormatType: number | null;
  instrumentTypeId: number | null;
  suppressLoqsForComputedAnalytes: boolean;
  requiresMoistureCorrection: boolean;
  requiresServingAndContainerResults: boolean;
  reportPercentType: number | null;
  concentrationScaleFactor: number | null;
  percentScaleFactor: number | null;
  measuredUnits: string | null;
  reportingUnits: string | null;
  rsaUseNominalValues: boolean;
  rsaNominalSampleWeightG: number | null;
  rsaNominalExtractionVolumeL: number | null;
  analysisMethodType: number | null;
  aggregateRollupMethodType: number | null;
  lLoqComparisonType: number | null;
  uLoqComparisonType: number | null;
  actionLimitComparisonType: number | null;
  rollupRsd: boolean;
  allPartialAnalyteResults: boolean;
  batchCount: number;
  analyticalBatchSopControlSampleRss: AnalyticalBatchSopControlSampleRs[];
  analyticalBatchSopAnalytesRss: AnalyticalBatchSopAnalyteRs[];
  sopAnalysisReviewComponentRss: SopAnalysisReviewComponentRs[];
  prepBatchSopAnalyticalBatchSopRss: PrepBatchSopAnalyticalBatchSopRs[];
  sopProcedures: SopProcedureRs[];
  sopFields: SopFieldRs[];
  $type?: string;
}

// ============ CompoundRs interface based on the C# model ============
export interface CompoundRs {
  analyteId: number;
  cas: string;
  name: string;
  ccCompoundName: string | null;
  active?: boolean;
}

// ============ Prep Batch SOP Control Sample ============
export interface PrepBatchSopControlSampleRs {
  prepBatchSopControlSampleId: number;
  prepBatchSopId: number;
  sopBatchPositionType: SopBatchPositionType | null;
  controlSampleOrder: number | null;
  qCFactor1: number | null;
  qCFactor2: number | null;
  qCTargetRangeLow: number | null;
  qCTargetRangeHigh: number | null;
  historicalDays: number | null;
  controlSampleType: ControlSampleType | null;
  description: string;
  category: ControlSampleCategory | null;
  analysisType: ControlSampleAnalysis | null;
  qCSource: ControlSampleQCSource | null;
  passCriteria: ControlSamplePassCriteria | null;
  qCCondition: QCCondition | null;
}

// ============ Basic Tables Types ============

// CC Sample Category Response
export interface CcSampleCategoryRs {
  ccSampleCategoryId: number;
  name: string;
  defaultCcSampleProductionMethodId: number | null;
  ccSampleTypeRss: CcSampleTypeRs[];
}

// CC Sample Type Response
export interface CcSampleTypeRs {
  ccSampleTypeId: number;
  categoryId: number;
  name: string;
}

// DB Enum Response
export interface DBEnumRs {
  dbEnumId: number;
  name: string;
  enum: string;
  labId: number;
}

// File Parser Field Response
export interface FileParserFieldRs {
  fileParserFieldId: number;
  fieldName: string | null;
  required: boolean | null;
  fileVersionSignal: boolean | null;
  bindingProperty: string | null;
  minimum: string | null;
  maximum: string | null;
  defaultValue: string | null;
  notApplicableSignal: string | null;
  useDefaultIfNoParse: boolean | null;
  regexFormat: string | null;
  dataFileLevel: string | null;
  sectionOrTableName: string;
  $type: string;
}

// Single Value Parser Field Response
export interface SingleValueParserFieldRs extends FileParserFieldRs {
  $type: 'SingleValueParserFieldRs';
}

// Table Value Parser Field Response
export interface TableValueParserFieldRs extends SingleValueParserFieldRs {
  columnIndex: number | null;
  $type: 'TableValueParserFieldRs';
}

// File Parser Response
export interface FileParserRs {
  fileParserId: number;
  version: string;
  fileType: string | null;
  fieldDelimiter: string | null;
  sampleMultiplicity: string | null;
  instrumentTypeId: number | null;
  fileParserFieldRss: FileParserFieldRs[];
}

// Item Category Response
export interface ItemCategoryRs {
  itemCategoryId: number;
  itemTypeId: number;
  name: string | null;
  description: string | null;
  suppressQfQn: boolean;
  stateId: number;
  ccSampleTypeId: number | null;
  suppressLimits: boolean;
  active: boolean;
}

// Item Type Response
export interface ItemTypeRs {
  itemTypeId: number;
  name: string;
  stateId: number | null;
  reportPercent: boolean | null;
  active: boolean;
  itemCategories: ItemCategoryRs[];
}

// Nav Menu Item Response
export interface NavMenuItemRs {
  navMenuItemId: number;
  parentNavMenuItemId: number | null;
  menuKey: string | null;
  name: string | null;
  slug: string | null;
  url: string | null;
  urlArgs: string | null;
  icon: string | null;
  order: number | null;
  specialProcessingMethod: string | null;
  specialProcessingArgs: string | null;
  pageTitle: string | null;
  labId: number;
  childItems: NavMenuItemRs[];
}

// Needed By Response
export interface NeededByRs {
  neededById: number;
  testCategoryId: number | null;
  microSelected: boolean | null;
  receivedDow: string | null;
  neededByDow: string | null;
  neededByTime: string | null;
  labId: number;
}

// Panel Group Response
export interface PanelGroupRs {
  panelGroupId: number;
  name: string | null;
  labId: number;
  active: boolean;
}

// PanelRs interface based on the C# model
export interface PanelRs {
  panelId: number;
  name: string;
  slug: string;
  subordinateToPanelGroup: boolean;
  panelGroupId: number | null;
  significantDigits: number;
  decimalFormatType: number | null;
  panelType: string;
  qualitativeFirst: boolean;
  requiresMoistureContent: boolean;
  allowPartialAnalytes: boolean;
  plantSop: string;
  nonPlantSop: string;
  scaleFactor: number | null;
  units: string | null;
  measuredUnits: string | null;
  limitUnits: string;
  defaultExtractionVolumeMl: number | null;
  defaultDilution: number | null;
  instrumentTypeId: number | null;
  ccTestPackageId: number | null;
  ccCategoryName: string | null;
  testCategoryId: number | null;
  sampleCount: number;
  childPanels: string[];
  active?: boolean;
  labId?: number;
}

// Potency Category Response
export interface PotencyCategoryRs {
  potencyCategoryId: number;
  name: string | null;
  description: string | null;
  stateId: number | null;
}

// Test Category Response
export interface TestCategoryRs {
  testCategoryId: number;
  name: string | null;
  description: string | null;
  stateId: number;
  ccTestPackageId: number | null;
  active: boolean;
}

// Control Sample Analyte SOP Specification Response
export interface ControlSampleAnalyteSopSpecificationRs {
  controlSampleAnalyteSopSpecificationId: number;
  analyteId: number | null;
  expectedRecovery: number | null;
  qCType: number | null;
  $type: string;
}

// Prep Batch Control Sample Analyte SOP Specification Response
export interface PrepBatchControlSampleAnalyteSopSpecificationRs
  extends ControlSampleAnalyteSopSpecificationRs {
  prepBatchSopControlSampleId: number;
  $type: 'PrepBatchControlSampleAnalyteSopSpecificationRs';
}

// ============ Instrument Types ============

// Instrument Peripheral Response - EXCEPTION TO STANDARD PATTERN
// Hard deletable, no Active flag
export interface InstrumentPeripheralRs {
  instrumentPeripheralId: number;
  instrumentId: number;
  durableLabAssetId: number | null;

  /**
   * Peripheral Type is a string field that should be presented to the user as a combobox.
   * The combobox should show predefined values from ConfigurationMaintenanceSelectors.peripheralTypes,
   * but also allow the user to enter their own custom values.
   */
  peripheralType: string | null;
  // No active flag per backend exception
}

// Instrument Response
export interface InstrumentRs {
  instrumentId: number;
  instrumentTypeId: number;
  name: string | null;
  lastPM?: Date | string | null;
  nextPm?: Date | string | null;
  outOfService: boolean;
  active?: boolean;
  instrumentPeripherals: InstrumentPeripheralRs[];
}

// Instrument Type Analyte Response - EXCEPTION TO STANDARD PATTERN
// Hard deletable, no Active flag, uses composite key
export interface InstrumentTypeAnalyteRs {
  instrumentTypeId: number;
  analyteId: number | null;
  analyteAlias: string;
  analyteName?: string; // For UI display only
  // No active flag per backend exception
}

// Instrument Type Response
export interface InstrumentTypeRs {
  instrumentTypeId: number;
  name: string | null;
  measurementType: string;
  dataFolder: string;
  peakAreaSaturationThreshold: number | null;
  instrumentFileParser: InstrumentFileParserType | null;
  active?: boolean;
  labId: number; // Added as required by the backend
  instrumentRss: InstrumentRs[];
  instrumentTypeAnalyteRss: InstrumentTypeAnalyteRs[];
}

// SOP Enum Type Response
export interface SopEnumTypeRs {
  sopEnumTypeId: number;
}

// Validation Result
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}
