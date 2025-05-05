// src/models/types/batchSops.ts
// Type definitions for common batch SOP related entities

/**
 * Base Batch SOP Selection Response
 */
export interface BatchSopSelectionRs {
  /**
   * Primary Key, no display, not editable
   * @validation Required
   */
  batchSopId: number;

  /**
   * Name of the SOP
   * @validation Required, unique-combination: Name, Sop, Version
   * @maxLength 150
   */
  name: string;

  /**
   * SOP identifier
   * @validation Required, unique-combination: Name, Sop, Version
   * @maxLength 50
   */
  sop: string;

  /**
   * Version of the SOP
   * @validation Required, unique-combination: Name, Sop, Version
   * @maxLength 10
   */
  version: string;

  /**
   * SOP group
   * @validation Required
   * @maxLength 50
   */
  sopGroup: string;

  /**
   * Number of batches using this SOP
   * @ui Display only. Not editable
   */
  batchCount: number;

  /**
   * Laboratory context
   * @validation Required
   * @ui No display, not editable
   */
  labId: number;

  /**
   * Type discriminator
   * @internal Used by API for polymorphic deserialization
   */
  $type: string;
}

/**
 * SOP Enum Type Response
 */
export interface SopEnumTypeRs {
  /**
   * SOP Enum Type ID
   * @ui Dropdown control: Use ConfigurationMaintenanceSelectors.SopEnumTypes
   */
  sopEnumTypeId: number;
}

/**
 * SOP Procedure Item Response
 */
export interface SopProcedureItemRs {
  /** Primary Key. No display, no edit */
  sopProcedurItemId: number;

  /** Foreign Key to parent. No display, no edit */
  sopProcedureId: number;

  /**
   * Display order
   * @validation Required
   * @default 0
   * @ui Sortable
   */
  order: number;

  /**
   * Item number or identifier
   * @maxLength 50
   */
  itemNumber: string | null;

  /**
   * Text content of the procedure step
   * @maxLength 500
   */
  text: string;

  /**
   * Indentation level
   * @default 0
   */
  indentLevel: number;
}

/**
 * SOP Procedure Response
 */
export interface SopProcedureRs {
  /** Primary Key. No display, no edit */
  sopProcedureId: number;

  /**
   * Foreign Key to parent SOP. No display, no edit
   * @validation unique-combination: BatchSopId, Section, ProcedureName
   */
  batchSopId: number;

  /**
   * Section identifier
   * @validation Required, unique-combination: BatchSopId, Section, ProcedureName
   * @maxLength 50
   */
  section: string;

  /**
   * Name of the procedure
   * @validation Required, unique-combination: BatchSopId, Section, ProcedureName
   * @maxLength 50
   */
  procedureName: string;

  /** Collection of procedure steps */
  procedureItems: SopProcedureItemRs[];
}

/**
 * Base SOP Field Response
 */
export interface SopFieldRs {
  /** Primary key. No display, no edit */
  sopFieldId: number;

  /**
   * Foreign key to parent SOP. No display, no edit
   * @validation unique-combination: BatchSopId, Section, Name
   */
  batchSopId: number;

  /**
   * Section identifier
   * @validation Required, unique-combination: BatchSopId, Section, Name
   * @maxLength 150
   */
  section: string | null;

  /**
   * Field name
   * @validation Required, unique-combination: BatchSopId, Section, Name
   * @maxLength 150
   */
  name: string | null;

  /**
   * Display name
   * @validation Required
   * @maxLength 150
   */
  displayName: string | null;

  /**
   * Row position in form
   * @ui Sortable
   */
  row: number;

  /** Column position in form */
  column: number;

  /**
   * Property name on the batch object
   * @maxLength 150
   */
  batchPropertyName: string | null;

  /** Whether the field is required */
  required: boolean;

  /** Whether the field is read-only */
  readOnly: boolean;

  /**
   * Message for required field validation
   * @maxLength 150
   */
  requiredMessage: string | null;

  /**
   * Message for minimum value validation
   * @maxLength 150
   */
  minValueMessage: string | null;

  /**
   * Message for maximum value validation
   * @maxLength 150
   */
  maxValueMessage: string | null;

  /**
   * Message for regex validation
   * @maxLength 150
   */
  regexMessage: string | null;

  /**
   * Type discriminator
   * @internal Used by API for polymorphic deserialization
   */
  $type: string;
}

/**
 * Base Single Value SOP Field
 */
export interface SingleValueSopFieldRs extends SopFieldRs {
  // No additional properties for base SingleValueSopFieldRs
}

/**
 * DateTime SOP Field
 */
export interface DateTimeSopFieldRs extends SingleValueSopFieldRs {
  /** Whether to display only the date part (no time) */
  datePartOnly: boolean;
}

/**
 * Double SOP Field
 */
export interface DoubleSopFieldRs extends SingleValueSopFieldRs {
  /**
   * Minimum value
   * @validation Required
   */
  minDoubleValue: number | null;

  /**
   * Maximum value
   * @validation Required
   */
  maxDoubleValue: number | null;

  /** Number of decimal places */
  precision: number | null;
}

/**
 * Lab Asset SOP Field
 */
export interface LabAssetSopFieldRs extends SingleValueSopFieldRs {
  /**
   * Lab asset type
   * @validation Required
   * @ui Dropdown control. Use ConfigurationMaintenanceSelectors.LatAssetTypes
   */
  labAssetTypeId: number | null;
}

/**
 * Instrument Type SOP Field
 */
export interface InstrumentTypeSopFieldRs extends SingleValueSopFieldRs {
  /**
   * Instrument type
   * @validation Required
   * @ui Dropdown control. Use ConfigurationMaintenanceSelectors.InstrumentTypes
   */
  instrumentTypeId: number | null;
}

/**
 * SOP Enum SOP Field
 */
export interface SopEnumSopFieldRs extends SingleValueSopFieldRs {
  /**
   * SOP enum type
   * @validation Required
   * @ui Dropdown control. Use ConfigurationMaintenanceSelectors.SopEnumTypes
   */
  sopEnumTypeId: number | null;
}

/**
 * User SOP Field
 */
export interface UserSopFieldRs extends SingleValueSopFieldRs {
  /**
   * Application role
   * @validation Required
   * @ui Dropdown control. Use ConfigurationMaintenanceSelectors.UserRoles
   */
  applicationRoleId: number | null;
}

/**
 * Text SOP Field
 */
export interface TextSopFieldRs extends SingleValueSopFieldRs {
  // No additional properties for TextSopFieldRs
}

/**
 * Base Table Column SOP Field
 */
export interface TableColumnSopFieldRs extends SopFieldRs {
  /**
   * Name of the table
   * @validation Required
   * @maxLength 50
   */
  tableName: string;

  /**
   * Width of the column
   * @validation Required
   */
  columnWidth: string | null;

  /**
   * Property name in the view model
   * @validation Required
   * @maxLength 250
   */
  vmPropertyName: string | null;
}

/**
 * Table Column Text SOP Field
 */
export interface TableColumnTextSopFieldRs extends TableColumnSopFieldRs {
  /**
   * Regular expression for validation
   * @maxLength 250
   */
  validationRegex: string;

  /** Minimum length for validation */
  minLength: number | null;

  /** Maximum length for validation */
  maxLength: number | null;
}

/**
 * Table Column Int SOP Field
 */
export interface TableColumnIntSopFieldRs extends TableColumnSopFieldRs {
  /** Minimum value for validation */
  minIntValue: number | null;

  /** Maximum value for validation */
  maxIntValue: number | null;
}

/**
 * Table Column Double SOP Field
 */
export interface TableColumnDoubleSopFieldRs extends TableColumnSopFieldRs {
  /** Minimum value for validation */
  minDoubleValue: number | null;

  /** Maximum value for validation */
  maxDoubleValue: number | null;

  /** Number of decimal places */
  precision: number;
}

/**
 * Table Column DateTime SOP Field
 */
export interface TableColumnDateTimeFieldRs extends TableColumnSopFieldRs {
  /** Whether to display only the date part (no time) */
  datePartOnly: boolean;
}

/**
 * Table Column SOP Enum SOP Field
 */
export interface TableColumnSopEnumFieldRs extends TableColumnSopFieldRs {
  // No additional properties for TableColumnSopEnumFieldRs
}

/**
 * Base Control Sample Analyte SOP Specification
 */
export interface ControlSampleAnalyteSopSpecificationRs {
  /** Primary Key. No display, no edit */
  controlSampleAnalyteSopSpecificationId: number;

  /**
   * Analyte
   * @validation Required
   * @ui Dropdown control. Use ConfigurationMaintenanceSelectors.Compounds
   */
  analyteId: number | null;

  /** Expected recovery percentage */
  expectedRecovery: number | null;

  /** QC type */
  qCType: number | null;

  /**
   * Type discriminator
   * @internal Used by API for polymorphic deserialization
   */
  $type: string;
}

/**
 * Prep Batch Control Sample Analyte SOP Specification
 */
export interface PrepBatchControlSampleAnalyteSopSpecificationRs
  extends ControlSampleAnalyteSopSpecificationRs {
  /** Foreign Key. No display, no edit */
  prepBatchSopControlSampleId: number;
}

/**
 * Analytical Batch Control Analyte SOP Specification
 */
export interface AnalyticalBatchControlAnalyteSopSpecificationRs
  extends ControlSampleAnalyteSopSpecificationRs {
  /** Foreign Key. No display, no edit */
  analyticalBatchSopControlSampleId: number;
}

/**
 * Base Batch SOP Response
 */
export interface BatchSopRs {
  /**
   * Primary Key, no display, not editable
   * @validation Required
   */
  batchSopId: number;

  /**
   * Name of the SOP
   * @validation Required
   * @maxLength 150
   * @ui Not Editable
   */
  name: string;

  /**
   * SOP identifier
   * @validation Required, unique constraint(Sop, Version, LabId)
   * @maxLength 50
   */
  sop: string;

  /**
   * Version of the SOP
   * @validation Required, unique constraint(Sop, Version, LabId)
   * @maxLength 10
   */
  version: string;

  /**
   * SOP group
   * @validation Required
   * @maxLength 50
   */
  sopGroup: string;

  /**
   * Laboratory context
   * @validation Required, unique constraint(Sop, Version, LabId)
   * @ui No display, not editable
   */
  labId: number;

  /**
   * Type discriminator
   * @internal Used by API for polymorphic deserialization
   */
  $type: string;

  /**
   * Number of significant digits for display
   * @validation Required, Editable
   */
  significantDigits: number | null;

  /**
   * Decimal format type
   * @validation Required
   * @ui DropDown control. Use ConfigurationMaintenanceSelectors.DecimalFormatType for the choices
   */
  decimalFormatType: string | null;

  /** SOP fields */
  sopFields: SopFieldRs[];

  /** SOP procedures */
  sopProcedures: SopProcedureRs[];
}
