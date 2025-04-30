using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace NCLims.Business.NewBatch.ConfigurationManagement.Responses.BatchSops;

[JsonPolymorphic(TypeDiscriminatorPropertyName = "$type")]
[JsonDerivedType(typeof(PrepBatchControlSampleAnalyteSopSpecificationRs), typeDiscriminator: nameof(PrepBatchControlSampleAnalyteSopSpecificationRs))]
[JsonDerivedType(typeof(AnalyticalBatchControlAnalyteSopSpecificationRs), typeDiscriminator: nameof(AnalyticalBatchControlAnalyteSopSpecificationRs))]

public abstract partial class ControlSampleAnalyteSopSpecificationRs
{
    // Primary Key.  No display, no edit.
    public int ControlSampleAnalyteSopSpecificationId { get; set; }
    // Dropdown control.  Use ConfigurationMaintenanceSelectors.Compounds
    [Required]
    public int? AnalyteId { get; set; }
    public double? ExpectedRecovery { get; set; }
    public int? QCType { get; set; }
}

public partial class PrepBatchControlSampleAnalyteSopSpecificationRs : ControlSampleAnalyteSopSpecificationRs
{
    // Foreign Key.  No display, no edit
    public int PrepBatchSopControlSampleId { get; set; }
}

public partial class AnalyticalBatchControlAnalyteSopSpecificationRs : ControlSampleAnalyteSopSpecificationRs
{
    // Foreign Key.  No display, no edit
    public int AnalyticalBatchSopControlSampleId { get; set; }
}
