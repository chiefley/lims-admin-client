// src/models/types/prepBatchSops.ts
// Type definitions for prep batch SOPs

import {
  BatchSopRs,
  BatchSopSelectionRs,
  PrepBatchControlSampleAnalyteSopSpecificationRs,
} from '../../../../models/types/batchSops';

/**
 * Manifest Sample Prep Batch SOP Response
 */
export interface ManifestSamplePrepBatchSopRs {
  /**
   * Primary Key, no display, not editable
   * @validation Required
   */
  manifestSamplePrepBatchSopId: number;

  /**
   * No display, not editable
   * @validation Required
   */
  batchSopId: number;

  /**
   * Sample type
   * @validation Required
   * @ui Dropdown populated with ConfigurationMaintenanceSelectors.ManifestSampleTypeItems
   */
  manifestSampleTypeId: number | null;

  /**
   * Panel group
   * @validation Required
   * @ui Dropdown populated with ConfigurationMaintenanceSelectors.PanelGroupItems
   */
  panelGroupId: number | null;

  /**
   * List of panels
   * @ui Display only. Not editable
   */
  panels: string;

  /**
   * Date when the configuration becomes effective
   * @validation Required
   * @ui ISO 8601 format is the default for System.Text.Json
   * @default DateTime.MaxValue
   */
  effectiveDate: string | null;
}

/**
 * Prep Batch SOP Control Sample Response
 */
export interface PrepBatchSopControlSampleRs {
  /** Primary Key. No display */
  prepBatchSopControlSampleId: number;

  /** Foreign Key to parent. No display */
  prepBatchSopId?: number;

  /**
   * Position in the batch
   * @validation Required
   * @ui Dropdown control. Use ConfigurationMaintenanceSelectors.SopBatchPositionTypes
   */
  sopBatchPositionType: string | null;

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

  /**
   * Type of control sample
   * @validation Required
   * @ui Dropdown control. Use ConfigurationMaintenanceSelectors.ControlSampleTypes
   */
  controlSampleType: string | null;

  /**
   * Description of the control sample
   * @maxLength 250
   */
  description: string;

  /**
   * Category of control sample
   * @validation Required
   * @ui Dropdown control. Use ConfigurationMaintenanceSelectors.ControlSampleCategories
   */
  category: string | null;

  /**
   * Type of analysis
   * @validation Required
   * @ui Dropdown control. Use ConfigurationMaintenanceSelectors.ControlSampleAnalyses
   */
  analysisType: string | null;

  /**
   * Source of QC sample
   * @validation Required
   * @ui Dropdown control. Use ConfigurationMaintenanceSelectors.ControlSampleQCSources
   */
  qCSource: string | null;

  /**
   * Pass criteria for control sample
   * @validation Required
   * @ui Dropdown control. Use ConfigurationMaintenanceSelectors.ControlSamplePassCriteria
   */
  passCriteria: string | null;

  /**
   * QC condition
   * @validation Required
   * @ui Dropdown control. Use ConfigurationMaintenanceSelectors.ControlSampleConditions
   */
  qCCondition: string | null;
}

/**
 * Prep Batch SOP Duplicate Control Sample Response
 */
export interface PrepBatchSopDupControlSampleRs extends PrepBatchSopControlSampleRs {
  /** Partner control sample ID */
  partnerSopControlSampleId: number | null;
}

/**
 * Prep Batch SOP Selection Response
 */
export interface PrepBatchSopSelectionRs extends BatchSopSelectionRs {
  /** Collection of sample configurations */
  manifestSamplePrepBatchSopRss?: ManifestSamplePrepBatchSopRs[];

  /**
   * Type discriminator
   * @internal Used by API for polymorphic deserialization
   */
  $type: string;
}

/**
 * Prep Batch SOP Response
 */
export interface PrepBatchSopRs extends BatchSopRs {
  /**
   * Maximum number of samples per batch
   * @validation Required
   */
  maxSamplesPerBatch: number | null;

  /**
   * Default dilution factor
   * @validation Required
   */
  defaultDilution: number | null;

  /**
   * Default extraction volume in milliliters
   * @validation Required
   */
  defaultExtractionVolumeMl: number | null;

  /**
   * Default injection volume in microliters
   * @validation Required
   */
  defaultInjectionVolumeUl: number | null;

  /**
   * Maximum sample weight in grams
   * @validation Required
   */
  maxWeightG: number | null;

  /**
   * Minimum sample weight in grams
   * @validation Required
   */
  minWeightG: number | null;

  /** Collection of sample type configurations for this SOP */
  manifestSamplePrepBatchSopRss: ManifestSamplePrepBatchSopRs[];

  /** Collection of control samples for this SOP */
  prepBatchSopControlSamples: PrepBatchSopControlSampleRs[];
}
