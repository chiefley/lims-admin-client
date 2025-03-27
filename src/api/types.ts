// src/api/types.ts

// Basic response structure matching ServiceResponse<T> from your C# code
export interface ServiceResponse<T> {
  success: boolean;
  message: string;
  data: T;
  validationErrors: ValidationError[];
}

export interface ValidationError {
  propertyName: string;
  errorMessage: string;
}

// Dropdown item matching your C# DropDownItem
export interface DropDownItem {
  id: number | null;
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

export interface PrepBatchSopSelectionRs extends BatchSopSelectionRs {
  manifestSamplePrepBatchSopRss: ManifestSamplePrepBatchSopRs[];
}

export interface ManifestSamplePrepBatchSopRs {
  manifestSamplePrepBatchSopId: number;
  batchSopId: number;
  manifestSampleTypeId: number;
  panelGroupId: number;
  panels: string;
  effectiveDate: string;
}

// Other types you may need based on your API
export interface AnalyticalBatchSopSelectionRs extends BatchSopSelectionRs {
  // Add specific properties if needed
}
