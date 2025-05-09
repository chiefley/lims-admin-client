// src/models/types/analyticalBatchSops.ts
// Type definitions for analytical batch SOPs

import {
  BatchSopRs,
  BatchSopSelectionRs,
  AnalyticalBatchControlAnalyteSopSpecificationRs,
} from '../../features/shared/types/batchSops';

/**
 * Computed Analyte Constituent Response
 */
export interface ComputedAnalyteConstituentRs {
  /** Primary Key. No display, no edit */
  computedAnalyteConstituentId: number;

  /**
   * Foreign key to parent analyte. No display, no edit
   * @validation unique-combination: AnalyticalBatchSopAnalyteId, AnalyteId
   */
  analyticalBatchSopAnalyteId: number;

  /**
   * Analyte that is a constituent of the computed analyte
   * @validation unique-combination: AnalyticalBatchSopAnalyteId, AnalyteId
   * @ui Dropdown control. Use ConfigurationMaintenanceSelectors.Compounds
   */
  analyteId: number;

  /** CAS number of the analyte (for display only) */
  cas?: string;
}

/**
 * Analytical Batch SOP Analyte Response
 */
export interface AnalyticalBatchSopAnalyteRs {
  /** Primary key, no display, no edit */
  analyticalBatchSopAnalyteId: number;

  /**
   * Foreign key to parent. No display, no edit
   * @validation unique-combination: AnalyticalBatchSopId, AnalyteId
   */
  analyticalBatchSopId: number;

  /**
   * Analyte
   * @validation Required, unique-combination: AnalyticalBatchSopId, AnalyteId
   * @ui Dropdown control. Choices come from ConfigurationMaintenanceSelectors.Compounds
   */
  analyteId: number | null;

  /** Whether this is a computed analyte (calculated from other analytes) */
  computed: boolean;

  /** Whether to compute aggregate analyte */
  computeAggregateAnalyte: boolean;

  /** Whether this is an internal standard */
  isInternalStandard: boolean;

  /** Warning standard deviation */
  warningStd: number | null;

  /** Confidence standard deviation */
  confidenceStd: number | null;

  /** Test standard deviation */
  testStd: number | null;

  /** Display order for analysts */
  analystDisplayOrder: number | null;

  /** Child constituents for computed analytes */
  computedAnalyteConstituentRss: ComputedAnalyteConstituentRs[];
}

/**
 * Analytical Batch SOP Control Sample Response
 */
export interface AnalyticalBatchSopControlSampleRs {
  /** Primary Key. No display, no edit */
  analyticalBatchSopControlSampleId: number;

  /** Foreign Key to parent. No display, no edit */
  analyticalBatchSopId: number;

  /**
   * Position type in the batch
   * @validation Required
   * @ui Dropdown control. Use ConfigurationMaintenanceSelectors.SopBatchPositionTypes
   */
  sopBatchPositionType: string | null;

  /**
   * Frequency of control samples
   * @validation Required
   */
  everyNSamples: number | null;

  /**
   * Order for control samples
   * @validation Required
   */
  controlSampleOrder: number | null;

  /** First QC factor */
  qCFactor1: number | null;

  /** Second QC factor */
  qCFactor2: number | null;

  /** Lower bound of QC target range */
  qCTargetRangeLow: number | null;

  /** Upper bound of QC target range */
  qCTargetRangeHigh: number | null;

  /** Number of historical days to consider */
  historicalDays: number | null;

  /** Collection of analyte specifications for this control sample */
  controlSampleAnalyteSopSpecificationRss: AnalyticalBatchControlAnalyteSopSpecificationRs[];
}

/**
 * SOP Analysis Review Component Response
 */
export interface SopAnalysisReviewComponentRs {
  /** Primary Key. No display, no edit */
  sopAnalysisReviewComponentId: number;

  /** Foreign Key to parent. No display, no edit */
  analyticalBatchSopId: number;

  /**
   * Component name
   * @validation Required
   * @maxLength 150
   */
  componentName: string | null;

  /**
   * Display name
   * @validation Required
   * @maxLength 150
   */
  displayName: string | null;

  /**
   * Parameter
   * @maxLength 150
   */
  parameter: string | null;

  /**
   * Collection name
   * @maxLength 150
   */
  collection: string | null;
}

/**
 * Prep Batch SOP to Analytical Batch SOP Link Response
 */
export interface PrepBatchSopAnalyticalBatchSopRs {
  /** Primary key. No display, no edit */
  prepBatchSopAnalyticalBatchSopId: number;

  /**
   * Prep batch SOP
   * @validation Required
   * @ui DropDown control. Choices come from ConfigurationMaintenanceSelectors.PrepBatchSops
   */
  prepBatchSopId: number | null;

  /**
   * Analytical batch SOP
   * @validation Required
   * @ui DropDown control. Choices come from ConfigurationMaintenanceSelectors.AnalyticalBatchSops
   */
  analyticalBatchSopId: number | null;

  /**
   * Effective date for the link
   * @validation Required
   * @ui Display Date only
   * @default DateTime.MaxValue
   */
  effectiveDate: string | null;
}

/**
 * Analytical Batch SOP Selection Response
 */
export interface AnalyticalBatchSopSelectionRs extends BatchSopSelectionRs {
  /**
   * Type discriminator
   * @internal Used by API for polymorphic deserialization
   */
  $type: string;
}

/**
 * Full Analytical Batch SOP Response
 */
export interface AnalyticalBatchSopRs extends BatchSopRs {
  /** Duplicate of primary key from base class */
  batchSopId: number;

  /**
   * Instrument type
   * @ui Dropdown control. Choices come from ConfigurationMaintenanceSelectors.InstrumentTypes
   */
  instrumentTypeId: number | null;

  /** Whether to suppress LoQs for computed analytes */
  suppressLoqsForComputedAnalytes: boolean;

  /** Whether moisture correction is required */
  requiresMoistureCorrection: boolean;

  /** Whether serving and container results are required */
  requiresServingAndContainerResults: boolean;

  /**
   * Type of percentage to report
   * @validation Required
   * @ui Dropdown control. Choices come from ConfigurationMaintenanceSelectors.ReportPercentTypes
   */
  reportPercentType: string | null;

  /**
   * Factor to scale concentration results
   * @validation Required
   */
  concentrationScaleFactor: number | null;

  /**
   * Factor to scale percentage results
   * @validation Required
   */
  percentScaleFactor: number | null;

  /**
   * Units used for measurements
   * @validation Required
   * @maxLength 50
   */
  measuredUnits: string | null;

  /**
   * Units used for reporting
   * @validation Required
   * @maxLength 50
   */
  reportingUnits: string | null;

  /** Whether to use nominal values for RSA calculations */
  rsaUseNominalValues: boolean;

  /**
   * Nominal sample weight in grams for RSA
   * @validation Required if RsaUseNominalValues = true
   */
  rsaNominalSampleWeightG: number | null;

  /**
   * Nominal extraction volume in liters for RSA
   * @validation Required if RsaUseNominalValues = true
   */
  rsaNominalExtractionVolumeL: number | null;

  /**
   * Analysis method type
   * @validation Required
   * @ui Dropdown control. Choices come from ConfigurationMaintenanceSelectors.AnalysisMethodTypes
   */
  analysisMethodType: string | null;

  /**
   * Method for aggregating rollup results
   * @validation Required
   * @ui Dropdown control. Choices come from ConfigurationMaintenanceSelectors.AggregateRollupMethodTypes
   */
  aggregateRollupMethodType: string | null;

  /**
   * Comparison type for Lower Limit of Quantification
   * @validation Required
   * @ui Dropdown control. Choices come from ConfigurationMaintenanceSelectors.ComparisonTypes
   */
  lLoqComparisonType: string | null;

  /**
   * Comparison type for Upper Limit of Quantification
   * @validation Required
   * @ui Dropdown control. Choices come from ConfigurationMaintenanceSelectors.ComparisonTypes
   */
  uLoqComparisonType: string | null;

  /**
   * Comparison type for action limits
   * @validation Required
   * @ui Dropdown control. Choices come from ConfigurationMaintenanceSelectors.ComparisonTypes
   */
  actionLimitComparisonType: string | null;

  /** Whether to roll up Relative Standard Deviation */
  rollupRsd: boolean;

  /** Whether to allow partial analyte results */
  allowPartialAnalyteResults: boolean;

  /** Number of batches using this SOP */
  batchCount: number;

  /** Control samples configured for this SOP */
  analyticalBatchSopControlSampleRss: AnalyticalBatchSopControlSampleRs[];

  /** Analytes configured for this SOP */
  analyticalBatchSopAnalytesRss: AnalyticalBatchSopAnalyteRs[];

  /** Analysis review components */
  sopAnalysisReviewComponentRss: SopAnalysisReviewComponentRs[];

  /** Links to prep batch SOPs */
  prepBatchSopAnalyticalBatchSopRss: PrepBatchSopAnalyticalBatchSopRs[];
}
