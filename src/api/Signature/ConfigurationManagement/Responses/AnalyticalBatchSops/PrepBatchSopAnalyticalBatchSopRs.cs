using System;
using System.ComponentModel.DataAnnotations;

namespace NCLims.Business.NewBatch.ConfigurationManagement.Responses.AnalyticalBatchSops;

public partial class PrepBatchSopAnalyticalBatchSopRs
{
    // Primary key.  No display, no edit.
    public int PrepBatchSopAnalyticalBatchSopId { get; set; }

    // DropDown control.  Choices come from ConfigurationMaintenanceSelectors.PrepBatchSops.
    [Required]
    public int? PrepBatchSopId { get; set; }

    // DropDown control.  Choices come from ConfigurationMaintenanceSelectors.AnalyticalBatchSops.
    [Required] 
    public int? AnalyticalBatchSopId { get; set; }

    // Display Date only.
    [Required]
    public DateTime? EffectiveDate { get; set; } = DateTime.MaxValue;
}