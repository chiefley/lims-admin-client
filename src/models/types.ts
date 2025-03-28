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
  id: number; // Updated to be non-nullable to match C# changes
  label: string;
}

// SOP Maintenance selectors
export interface SopMaintenanceSelectors {
  manifestSampleTypeItems: DropDownItem[];
  panelGroupItems: DropDownItem[];
}

// Batch SOP Selection Response types
export interface BatchSopSelectionRs {
  batchSopId: number;
  name: string;
  sop: string;
  version: string;
  sopGroup: string;
  labId: number;
  $type: string;
}

export interface ManifestSamplePrepBatchSopRs {
  manifestSamplePrepBatchSopId: number;
  batchSopId: number;
  manifestSampleTypeId: number | null; // Updated to be nullable
  panelGroupId: number | null; // Updated to be nullable
  panels: string;
  effectiveDate: string | null; // Updated to be nullable
}

export interface PrepBatchSopSelectionRs extends BatchSopSelectionRs {
  manifestSamplePrepBatchSopRss: ManifestSamplePrepBatchSopRs[];
  $type: 'PrepBatchSopSelectionRs';
}

// Other types you may need based on your API
export interface AnalyticalBatchSopSelectionRs extends BatchSopSelectionRs {
  // Add specific properties if needed
}
