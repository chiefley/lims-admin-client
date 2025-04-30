// src/models/types/basicTables.ts
// Type definitions for basic configuration tables

import {
  DataFileLevel,
  FieldDelimiterType,
  DataFileSampleMultiplicity,
  DayOfWeek,
  NavMenuKey,
} from './common';

/**
 * Compound/Analyte definition
 */
export interface CompoundRs {
  /** Primary Key, no display */
  analyteId: number;

  /**
   * CAS Registry Number or custom identifier
   * @validation Required, must be unique
   * @maxLength 50
   */
  cas: string;

  /**
   * Name of the compound
   * @validation Required
   * @maxLength 150
   */
  name: string;

  /**
   * Alternate name for the compound in the CC system
   * @maxLength 150
   */
  ccCompoundName: string | null;

  /**
   * Whether the compound is active
   * @default true (for new records)
   */
  active?: boolean;
}

/**
 * CC Sample Type
 */
export interface CcSampleTypeRs {
  /** Primary Key. No display, no edit */
  ccSampleTypeId: number;

  /** Foreign key to parent category. No display, no edit */
  categoryId: number;

  /**
   * Name of the sample type
   * @validation Required
   * @maxLength 150
   */
  name: string;
}

/**
 * CC Sample Category
 */
export interface CcSampleCategoryRs {
  /** Primary Key. No display, no edit */
  ccSampleCategoryId: number;

  /**
   * Name of the category
   * @validation Required
   * @maxLength 50
   */
  name: string;

  /**
   * Default production method for samples in this category
   * @validation Required
   */
  defaultCcSampleProductionMethodId: number | null;

  /** Collection of sample types in this category */
  ccSampleTypeRss: CcSampleTypeRs[];
}

/**
 * Database Enum
 */
export interface DBEnumRs {
  /** Primary key, no display, no edit */
  dbEnumId: number;

  /**
   * Name of the enum value
   * @validation Required, unique constraint (Name, Enum, LabId)
   * @maxLength 150
   */
  name: string;

  /**
   * Enum type
   * @validation Required, unique constraint (Name, Enum, LabId)
   * @ui Combobox control. Choices come from ConfigurationMaintenanceSelectors.DBEnumTypes
   * @maxLength 150
   */
  enum: string;

  /**
   * Lab Context. No display, no edit
   * @validation Part of unique constraint (Name, Enum, LabId)
   */
  labId: number;
}

/**
 * Table Value Parser Field
 */
export interface TableValueParserFieldRs extends SingleValueParserFieldRs {
  /**
   * Index of the column in the table
   * @validation Required
   */
  columnIndex: number | null;

  /**
   * Type discriminator
   * @internal Used by API for polymorphic deserialization
   */
  $type: 'TableValueParserFieldRs';
}

/**
 * Single Value Parser Field
 */
export interface SingleValueParserFieldRs extends FileParserFieldRs {
  /**
   * Type discriminator
   * @internal Used by API for polymorphic deserialization
   */
  $type: 'SingleValueParserFieldRs';
}

/**
 * File Parser Field base class
 */
export interface FileParserFieldRs {
  /** Primary key. No display, no edit */
  fileParserFieldId: number;

  /**
   * Name of the field
   * @validation Required, uniqueness constraint(FieldName)
   * @maxLength 50
   */
  fieldName: string | null;

  /**
   * Whether the field is required
   * @validation Required
   */
  required: boolean | null;

  /**
   * Whether this field contains the file version
   * @validation Required
   */
  fileVersionSignal: boolean | null;

  /**
   * Property name to bind the field value to
   * @validation Required
   * @maxLength 50
   */
  bindingProperty: string | null;

  /**
   * Minimum value for validation
   * @maxLength 50
   */
  minimum: string | null;

  /**
   * Maximum value for validation
   * @maxLength 50
   */
  maximum: string | null;

  /**
   * Default value if none is provided
   * @maxLength 50
   */
  defaultValue: string | null;

  /**
   * Value that indicates "not applicable"
   * @maxLength 50
   */
  notApplicableSignal: string | null;

  /** Whether to use the default value if parsing fails */
  useDefaultIfNoParse: boolean | null;

  /**
   * Regular expression for validation
   * @maxLength 250
   */
  regexFormat: string | null;

  /**
   * Level in the data file hierarchy
   * @validation Required
   * @ui Dropdown control. Choices come from ConfigurationMaintenanceSelectors.DataFileLevels
   */
  dataFileLevel: string | null;

  /**
   * Name of the section or table where this field is found
   * @validation Required
   * @maxLength 50
   */
  sectionOrTableName: string | null;

  /**
   * Type discriminator
   * @internal Used by API for polymorphic deserialization
   */
  $type: string;
}

/**
 * File Parser
 */
export interface FileParserRs {
  /** Primary key. No display, no edit */
  fileParserId: number;

  /**
   * Version of the parser
   * @validation Required
   * @maxLength 50
   */
  version: string | null;

  /**
   * Type of file to parse
   * @validation Required
   * @ui ComboBox component. Choices come from ConfigurationMaintenanceSelectors.DataFileTypes
   */
  fileType: string | null;

  /**
   * Field delimiter for text files
   * @validation Required
   * @ui ComboBox component. Choices come from ConfigurationMaintenanceSelectors.FieldDelimiterTypes
   */
  fieldDelimiter: string | null;

  /**
   * Whether a file contains one or multiple samples
   * @validation Required
   * @ui ComboBox component. Choices come from ConfigurationMaintenanceSelectors.DataFileSampleMultiplicities
   */
  sampleMultiplicity: string | null;

  /**
   * Type of instrument that produces files this parser handles
   * @validation Required
   * @ui ComboBox component. Choices come from ConfigurationMaintenanceSelectors.InstrumentTypes
   */
  instrumentTypeId: number | null;

  /** Collection of fields this parser handles */
  fileParserFieldRss: FileParserFieldRs[];
}

/**
 * Item Category
 */
export interface ItemCategoryRs {
  /** Primary Key. No display, no edit */
  itemCategoryId: number;

  /**
   * Name of the category
   * @validation Required
   * @maxLength 150
   */
  name: string | null;

  /**
   * Description of the category
   * @maxLength 250
   */
  description: string | null;

  /** Foreign key to parent item type */
  itemTypeId: number;

  /**
   * Whether to suppress QF/QN
   * @default false
   */
  suppressQfQn: boolean;

  /**
   * State context
   * @deprecated The stateid should only be in the ItemType
   */
  stateId: number;

  /**
   * CC Sample Type
   * @ui Dropdown control. Choices come from ConfigurationMaintenanceSelectors.CCSampleTypes
   * @validation Nullable, not required
   */
  ccSampleTypeId: number | null;

  /**
   * Whether to suppress limits
   * @default false
   */
  suppressLimits: boolean;

  /**
   * Whether the category is active
   * @default true
   */
  active: boolean;
}

/**
 * Item Type
 */
export interface ItemTypeRs {
  /** Primary Key. No display, no edit */
  itemTypeId: number;

  /**
   * Name of the item type
   * @validation Required
   * @maxLength 250
   */
  name: string;

  /**
   * State context
   * @validation Required
   * @default 2
   */
  stateId: number | null;

  /**
   * Whether to report as a percentage
   * @validation Required
   */
  reportPercent: boolean | null;

  /**
   * Whether the item type is active
   * @default true
   */
  active: boolean;

  /** Collection of categories in this item type */
  itemCategories: ItemCategoryRs[];
}

/**
 * Navigation Menu Item
 *
 * This is a deletable table. Rows can be hard-deleted in the UI.
 */
export interface NavMenuItemRs {
  /** Primary key. No display, no edit */
  navMenuItemId: number;

  /** Foreign Key to parent. No display, no edit */
  parentNavMenuItemId: number | null;

  /**
   * Menu key
   * @validation Required
   * @ui Combobox control. Choices come from ConfigurationMaintenanceSelectors.NavMenuKeys
   */
  menuKey: string | null;

  /**
   * Display name
   * @validation Required, unique constraint(Name, LabId)
   * @maxLength 50
   */
  name: string | null;

  /**
   * URL slug
   * @validation Required, unique constraint(Slug, LabId)
   * @maxLength 50
   */
  slug: string | null;

  /**
   * URL for navigation
   * @maxLength 250
   */
  url: string | null;

  /**
   * URL query arguments
   * @maxLength 250
   */
  urlArgs: string | null;

  /**
   * Icon name/code
   * @maxLength 500
   */
  icon: string | null;

  /**
   * Display order
   * @validation Required
   */
  order: number | null;

  /**
   * Special processing method name
   * @maxLength 250
   */
  specialProcessingMethod: string | null;

  /**
   * Arguments for special processing
   * @maxLength 500
   */
  specialProcessingArgs: string | null;

  /**
   * Page title
   * @validation Required
   * @maxLength 250
   */
  pageTitle: string | null;

  /**
   * Lab context
   * @validation Required, part of unique constraints
   */
  labId: number;

  /** Child menu items */
  childItems: NavMenuItemRs[];
}

/**
 * Needed By Configuration
 */
export interface NeededByRs {
  /** Primary Key. No display, no edit */
  neededById: number;

  /**
   * Test category
   * @validation Required
   * @ui Dropdown control. Choices come from ConfigurationMaintenanceSelectors.TestCategoryTypes
   */
  testCategoryId: number | null;

  /** Whether microbiology tests are selected */
  microSelected: boolean | null;

  /**
   * Day of week when samples are received
   * @validation Required
   * @maxLength 10
   * @ui DropDown control. Choices come from ConfigurationMaintenanceSelectors.DayOfWeeks
   */
  receivedDow: string | null;

  /**
   * Day of week when results are needed
   * @validation Required
   * @maxLength 10
   * @ui DropDown control. Choices come from ConfigurationMaintenanceSelectors.DayOfWeeks
   */
  neededByDow: string | null;

  /**
   * Time of day when results are needed
   * @validation Required, format must be H:mm or HH:mm
   * @maxLength 5
   */
  neededByTime: string | null;

  /**
   * Lab Context
   * @ui Set to Lab Context LabId on new()
   */
  labId: number;
}

/**
 * Panel with associated analytes and configurations
 */
export interface PanelRs {
  /** Primary Key, no display */
  panelId: number;

  /**
   * Name of the panel
   * @validation Required, must be unique
   * @maxLength 150
   */
  name: string;

  /**
   * Short identifier for the panel
   * @validation Required
   * @maxLength 10
   */
  slug: string;

  /** Whether this panel is subordinate to its panel group */
  subordinateToPanelGroup: boolean;

  /**
   * Parent panel group
   * @ui Dropdown with nullable choice. Choices come from ConfigurationMaintenanceSelectors.PanelGroups
   */
  panelGroupId: number | null;

  /** Number of significant digits to display */
  significantDigits: number;

  /**
   * Format for decimal values
   * @ui Dropdown control. Choices come from ConfigurationMaintenanceSelectors.DecimalFormatTypes
   */
  decimalFormatType: number | null;

  /**
   * Type of panel (Quantitative/Qualitative)
   * @validation Required, must be unique in the list of PanelRss
   * @ui Dropdown control. Choices come from ConfigurationMaintenanceSelectors.PanelTypes
   */
  panelType: string;

  /** Whether qualitative analysis is performed first */
  qualitativeFirst: boolean;

  /** Whether moisture content measurement is required */
  requiresMoistureContent: boolean;

  /** Whether partial analyte results are allowed */
  allowPartialAnalytes: boolean;

  /**
   * SOP for plant samples
   * @validation Required
   * @maxLength 150
   */
  plantSop: string;

  /**
   * SOP for non-plant samples
   * @maxLength 150
   */
  nonPlantSop: string;

  /**
   * Factor to scale results by
   * @validation Required
   */
  scaleFactor: number | null;

  /**
   * Units for results
   * @maxLength 150
   */
  units: string | null;

  /**
   * Units for measurements
   * @maxLength 150
   */
  measuredUnits: string | null;

  /**
   * Units for limits
   * @maxLength 150
   */
  limitUnits: string;

  /** Default extraction volume in milliliters */
  defaultExtractionVolumeMl: number | null;

  /** Default dilution factor */
  defaultDilution: number | null;

  /**
   * Instrument type for this panel
   * @ui Dropdown control. Choices come from ConfigurationMaintenanceSelectors.InstrumentTypes
   */
  instrumentTypeId: number | null;

  /** CC test package ID */
  ccTestPackageId: number | null;

  /**
   * Name of the CC category
   * @maxLength 150
   */
  ccCategoryName: string | null;

  /**
   * Test category
   * @ui Dropdown control. Choices come from ConfigurationManagement.TestCategoryTypes
   * @validation Nullable, not required
   */
  testCategoryId: number | null;

  /** Number of samples using this panel */
  sampleCount: number;

  /** Collection of child panel slugs */
  childPanels: string[];

  /**
   * Whether the panel is active
   * @default true
   */
  active?: boolean;

  /**
   * Lab context
   * @validation Required for API calls
   */
  labId?: number;
}

/**
 * Panel Group
 */
export interface PanelGroupRs {
  /** Primary key. No display, no edit */
  panelGroupId: number;

  /**
   * Name of the panel group
   * @validation Required, uniqueness constraint(Name, LabId)
   * @maxLength 150
   */
  name: string | null;

  /**
   * Lab Context
   * @validation Required, uniqueness constraint(Name, LabId)
   * @ui Set to context.LabId on new()
   */
  labId: number;

  /**
   * Whether the panel group is active
   * @validation Required
   */
  active: boolean;
}

/**
 * Potency Category
 *
 * HARD DELETE IMPLEMENTATION: This entity supports permanent deletion
 */
export interface PotencyCategoryRs {
  /** Primary Key. No display, no edit */
  potencyCategoryId: number;

  /**
   * Name of the potency category
   * @validation Required, unique constraint(Name, StateId)
   * @maxLength 150
   */
  name: string;

  /**
   * Description of the potency category
   * @maxLength 250
   */
  description: string;

  /**
   * State context
   * @validation Required, unique constraint(Name, StateId)
   * @ui Part of Lab Context. Set to StateId on new()
   */
  stateId: number;
}

/**
 * Test Category
 */
export interface TestCategoryRs {
  /** Primary Key. No display, no edit */
  testCategoryId: number;

  /**
   * Name of the test category
   * @validation Required
   * @maxLength 50
   */
  name: string | null;

  /**
   * Description of the test category
   * @maxLength 250
   */
  description: string | null;

  /**
   * State context
   * @ui Lab context. Set to 1001 on new()
   * @validation No display, no edit
   */
  stateId: number;

  /** CC test package ID */
  ccTestPackageId: number | null;

  /**
   * Whether the test category is active
   * @default true
   */
  active: boolean;
}
