using System.Text.Json.Serialization;

namespace NCLims.Business.NewBatch.Sop.Responses.AnalyticalBatchSops;

public class ComputedAnalyteConstituentRs
{
    // Primary Key.  No display, no edit.
    public int ComputedAnalyteConstituentId { get; set; }
    // Foreign key to parent.  No display, no edit.
    // @validation: unique-combination: AnalyticalBatchSopAnalyteId, AnalyteId
    public int AnalyticalBatchSopAnalyteId { get; set; }
    // Dropdown control.  Use SopMaintenanceSelectors.Compounds.
    // @validation: unique-combination: AnalyticalBatchSopAnalyteId, AnalyteId
    public int AnalyteId { get; set; }
    [JsonIgnore]
    public string? Cas { get; set; }
}