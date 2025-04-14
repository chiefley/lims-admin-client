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
}

// ============ CompoundRs interface based on the C# model ============
export interface CompoundRs {
  analyteId: number;
  cas: string;
  name: string;
  ccCompoundName: string | null;
  active?: boolean;
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
}

// ============ Instrument Types ============

// Instrument Peripheral Response
export interface InstrumentPeripheralRs {
  instrumentPeripheralId: number;
  instrumentId: number;
  durableLabAssetId: number | null;
  peripheralType: string | null;
  active?: boolean;
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

// Instrument Type Analyte Response
export interface InstrumentTypeAnalyteRs {
  instrumentTypeAnalyteId?: number;
  instrumentTypeId: number;
  analyteId: number;
  analyteAlias: string;
  analyteName?: string;
  active?: boolean;
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
  instrumentRss: InstrumentRs[];
  instrumentTypeAnalyteRss: InstrumentTypeAnalyteRs[];
}
