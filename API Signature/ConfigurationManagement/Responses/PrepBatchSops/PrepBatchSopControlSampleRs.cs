using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using NCLims.Models.NewBatch;
using NCLims.Models.NewBatch.Analytical;

namespace NCLims.Business.NewBatch.ConfigurationManagement.Responses.PrepBatchSops;

[JsonDerivedType(typeof(PrepBatchSopControlSampleRs), typeDiscriminator: nameof(PrepBatchSopControlSampleRs))]
[JsonDerivedType(typeof(PrepBatchSopDupControlSampleRs), typeDiscriminator: nameof(PrepBatchSopDupControlSampleRs))]
public partial class PrepBatchSopControlSampleRs
{
    // Primary Key.   No display.
    public int PrepBatchSopControlSampleId { get; set; }

    // Dropdown control.  Use ConfigurationMaintenanceSelectors.SopBatchPositionTypes
    [Required]
    public string? SopBatchPositionType { get; set; }
    [Required]
    public int? ControlSampleOrder { get; set; }
    public int? QCFactor1 { get; set; }
    public int? QCFactor2 { get; set; }
    public int? QCTargetRangeLow { get; set; }
    public int? QCTargetRangeHigh { get; set; }
    public int? HistoricalDays { get; set; }
    // Dropdown control.  Use ConfigurationMaintenanceSelectors.ControlSampleTypes
    [Required]
    public string? ControlSampleType { get; set; }
    [StringLength(250)]
    public string Description { get; set; }
    // Dropdown control.  Use ConfigurationMaintenanceSelectors.ControlSampleCategories
    [Required]
    public string? Category { get; set; }
    // Dropdown control.  Use ConfigurationMaintenanceSelectors.ControlSampleAnalyses
    [Required] public string? AnalysisType { get; set; }
    // Dropdown control.  Use ConfigurationMaintenanceSelectors.ControlSampleQCSources.
    [Required] public string? QCSource { get; set; }
    // Dropdown control.  Use ConfigurationMaintenanceSelectors.ControlSamplePassCriteria
    [Required] public string? PassCriteria { get; set; }
    // Dropdown control.  Use ConfigurationMaintenanceSelectors.ControlSampleConditions
    [Required] public string? QCCondition { get; set; }
}

public partial class PrepBatchSopDupControlSampleRs : PrepBatchSopControlSampleRs
{
    public int? PartnerSopControlSampleId { get; set; }
}
