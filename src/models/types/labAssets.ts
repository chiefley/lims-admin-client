// src/models/types/labAssets.ts
// Type definitions for laboratory assets and instruments

/**
 * Instrument Peripheral
 *
 * EXCEPTION TO STANDARD PATTERN:
 * 1. This entity uses a unique constraint (InstrumentId, PeripheralType)
 * 2. HARD DELETE IMPLEMENTATION: Unlike most other configuration objects that use soft delete
 *    with an Active flag, this entity supports permanent deletion
 * 3. CLIENT IMPLEMENTATION REQUIREMENTS:
 *    - UI should display delete controls for these items
 *    - No "Active" filtering should be applied (no Active property exists)
 *    - Client should confirm with users that deletion is permanent
 *    - When items are removed from the list on client side, they will be permanently deleted in database
 */
export interface InstrumentPeripheralRs {
  /** Primary Key. No display, no edit */
  instrumentPeripheralId: number;

  /**
   * Foreign key to parent. No display, no edit.
   * @validation unique constraint on InstrumentId and PeripheralType
   */
  instrumentId: number;

  /**
   * Lab asset assigned as a peripheral
   * @validation Required
   * @ui Dropdown control. Choices come from ConfigurationMaintenanceSelectors.DurableLabAssets
   */
  durableLabAssetId: number | null;

  /**
   * Type of peripheral
   * @validation unique constraint on InstrumentId and PeripheralType
   * @ui Combobox control. Choices come from ConfigurationMaintenanceSelectors.PeripheralTypes.
   *     As a combobox, the user can enter something that is not one of the choices.
   * @maxLength 250
   */
  peripheralType: string | null;

  // No active flag per backend exception
}

/**
 * Laboratory instrument
 */
export interface InstrumentRs {
  /** Primary Key. No display, no edit */
  instrumentId: number;

  /** Foreign key to parent. No display, no edit */
  instrumentTypeId: number;

  /**
   * Name of the instrument
   * @validation Required, unique for all Names
   * @maxLength 150
   */
  name: string | null;

  /**
   * Last preventative maintenance date
   * @ui Date part only
   */
  lastPM?: Date | string | null;

  /**
   * Next preventative maintenance date
   * @ui Date part only
   */
  nextPm?: Date | string | null;

  /** Whether the instrument is out of service */
  outOfService: boolean;

  /**
   * Whether the instrument is active
   * @default true (for new records)
   */
  active?: boolean;

  /** Collection of peripherals associated with this instrument */
  instrumentPeripheralRss: InstrumentPeripheralRs[];
}

/**
 * Instrument Type Analyte
 *
 * EXCEPTION TO STANDARD PATTERN:
 * 1. This entity uses a composite key (InstrumentTypeId, AnalyteAlias) instead of a
 *    single primary key ID field
 * 2. HARD DELETE IMPLEMENTATION: Unlike most other configuration objects that use soft delete
 *    with an Active flag, this entity supports permanent deletion
 * 3. CLIENT IMPLEMENTATION REQUIREMENTS:
 *    - UI should display delete controls for these items
 *    - No "Active" filtering should be applied (no Active property exists)
 *    - Client should confirm with users that deletion is permanent
 *    - When items are removed from the list on client side, they will be permanently deleted in database
 */
export interface InstrumentTypeAnalyteRs {
  /**
   * Foreign key to parent instrument type
   * @ui No display, no edit.
   */
  instrumentTypeId: number;

  /**
   * Foreign key to analyte
   * @validation Required, unique constraint with instrumentTypeId and analyteAlias
   * @ui Dropdown control. Use ConfigurationMaintenanceSelectors.Compounds
   */
  analyteId: number | null;

  /**
   * Alias name for the analyte specific to this instrument type
   * @validation Required
   * @maxLength 150
   */
  analyteAlias: string;

  /** Display name of the analyte (UI only, not persisted) */
  analyteName?: string;

  // No active flag per backend exception
}

/**
 * Instrument Type
 */
export interface InstrumentTypeRs {
  /** Primary Key. No display, no edit */
  instrumentTypeId: number;

  /**
   * Name of the instrument type
   * @validation Required, unique in the list
   * @maxLength 150
   */
  name: string | null;

  /**
   * Type of measurement performed by this instrument
   * @validation Required
   * @maxLength 150
   */
  measurementType: string;

  /**
   * Folder path where instrument data is stored
   * @validation Required
   * @maxLength 250
   */
  dataFolder: string;

  /** Threshold for peak area saturation */
  peakAreaSaturationThreshold: number | null;

  /**
   * Type of file parser used for instrument data files
   * @validation Required
   * @ui Dropdown control. Choices come from ConfigurationMaintenanceSelectors.InstrumentFileParserTypes
   */
  instrumentFileParser: string | null;

  /**
   * Whether the instrument type is active
   * @default true (for new records)
   */
  active?: boolean;

  /**
   * Laboratory context
   * @validation Required for API calls
   */
  labId: number;

  /** Collection of instruments of this type */
  instrumentRss: InstrumentRs[];

  /** Collection of analytes associated with this instrument type */
  instrumentTypeAnalyteRss: InstrumentTypeAnalyteRs[];
}
