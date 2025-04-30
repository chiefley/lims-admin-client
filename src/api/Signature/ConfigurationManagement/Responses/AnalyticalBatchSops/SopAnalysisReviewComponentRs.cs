using System.ComponentModel.DataAnnotations;

namespace NCLims.Business.NewBatch.ConfigurationManagement.Responses.AnalyticalBatchSops;

public partial class SopAnalysisReviewComponentRs
{
    // Primary Key.  No display, no edit.
    public int SopAnalysisReviewComponentId { get; set; }
    // Foreign Key to parent.  No display, no edit.
    public int AnalyticalBatchSopId { get; set; }
    [Required]
    [StringLength(150)]
    public string? ComponentName { get; set; }
    [StringLength(150)]
    [Required]
    public string? DisplayName { get; set; }
    [StringLength(150)]
    public string? Parameter { get; set; }
    [StringLength(150)]
    public string? Collection { get; set; }
}