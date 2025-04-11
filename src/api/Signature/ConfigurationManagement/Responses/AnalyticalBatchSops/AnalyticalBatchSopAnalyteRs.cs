using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace NCLims.Business.NewBatch.ConfigurationManagement.Responses.AnalyticalBatchSops;

public class AnalyticalBatchSopAnalyteRs
{
    // Primary key, no display, no edit
    public int AnalyticalBatchSopAnalyteId { get; set; }

    // @validation: unique-combination: AnalyticalBatchSopId, AnalyteId
    // Foreign key to parent.  No display, no edit.
    public int AnalyticalBatchSopId { get; set; }

    // @validation: unique-combination: AnalyticalBatchSopId, AnalyteId
    // Dropdown control.  Choices come from ConfigurationMaintenanceSelectors.Compounds.
    [Required] 
    public int? AnalyteId { get; set; }
    public bool Computed { get; set; }
    [StringLength(4096)] public bool ComputeAggregateAnalyte { get; set; }
    public bool IsInternalStandard { get; set; }
    public int? WarningStd { get; set; }
    public int? ConfidenceStd { get; set; }
    public int? TestStd { get; set; }
    public int? AnalystDisplayOrder { get; set; }
    [JsonPropertyOrder(100)]  // Ensure this appears after primitive properties
    public List<ComputedAnalyteConstituentRs> ComputedAnalyteConstituentRss { get; set; } = [];
}