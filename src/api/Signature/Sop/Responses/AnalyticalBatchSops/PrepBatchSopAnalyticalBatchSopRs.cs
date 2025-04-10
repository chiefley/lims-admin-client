using System;
using System.ComponentModel.DataAnnotations;

namespace NCLims.Business.NewBatch.Sop.Responses.AnalyticalBatchSops;

public class PrepBatchSopAnalyticalBatchSopRs
{
    // Primary key.  No display, no edit.
    public int PrepBatchSopAnalyticalBatchSopId { get; set; }

    // DropDown control.  Choices come from SopMaintenanceSelectors.PrepBatchSops.
    [Required]
    public int? PrepBatchSopId { get; set; }

    // DropDown control.  Choices come from SopMaintenanceSelectors.AnalyticalBatchSops.
    [Required] 
    public int? AnalyticalBatchSopId { get; set; }

    // Display Date only.
    [Required]
    public DateTime? EffectiveDate { get; set; } = DateTime.MaxValue;
}