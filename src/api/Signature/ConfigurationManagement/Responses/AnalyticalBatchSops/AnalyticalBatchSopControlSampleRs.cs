using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using NCLims.Business.NewBatch.ConfigurationManagement.Responses.BatchSops;
using NCLims.Models.NewBatch;

namespace NCLims.Business.NewBatch.ConfigurationManagement.Responses.AnalyticalBatchSops;

public class AnalyticalBatchSopControlSampleRs
{
    // Primary Key.  No display, no edit.
    public int AnalyticalBatchSopControlSampleId { get; set; }
    // Foreign Key to parent.  No display, no edit.
    public int AnalyticalBatchSopId { get; set; }
    // Dropdown control. Use ConfigurationMaintenanceSelectors.SopBatchPositionTypes
    [Required]
    public SopBatchPositionType? SopBatchPositionType { get; set; }
    [Required]
    public int? EveryNSamples { get; set; }
    [Required]
    public int? ControlSampleOrder { get; set; }
    public int? QCFactor1 { get; set; }
    public int? QCFactor2 { get; set; }
    public int? QCTargetRangeLow { get; set; }
    public int? QCTargetRangeHigh { get; set; }
    public int? HistoricalDays { get; set; }

    [JsonPropertyOrder(100)]  // Ensure this appears after primitive properties
    public List<AnalyticalBatchControlAnalyteSopSpecificationRs>
        ControlSampleAnalyteSopSpecificationRss
    { get; set; } = [];
}