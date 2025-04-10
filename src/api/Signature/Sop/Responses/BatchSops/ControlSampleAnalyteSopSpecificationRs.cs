using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace NCLims.Business.NewBatch.Sop.Responses.BatchSops;

[JsonPolymorphic(TypeDiscriminatorPropertyName = "$type")]
[JsonDerivedType(typeof(PrepBatchControlSampleAnalyteSopSpecificationRs), typeDiscriminator: nameof(PrepBatchControlSampleAnalyteSopSpecificationRs))]
[JsonDerivedType(typeof(AnalyticalBatchControlAnalyteSopSpecificationRs), typeDiscriminator: nameof(AnalyticalBatchControlAnalyteSopSpecificationRs))]

public abstract class ControlSampleAnalyteSopSpecificationRs
{
    // Primary Key.  No display, no edit.
    public int ControlSampleAnalyteSopSpecificationId { get; set; }
    // Dropdown control.  Use SopMaintenanceSelectors.Compounds
    [Required]
    public int? AnalyteId { get; set; }
    public double? ExpectedRecovery { get; set; }
    public int? QCType { get; set; }
}

public class PrepBatchControlSampleAnalyteSopSpecificationRs : ControlSampleAnalyteSopSpecificationRs
{
    // Foreign Key.  No display, no edit
    public int PrepBatchSopControlSampleId { get; set; }
}

public class AnalyticalBatchControlAnalyteSopSpecificationRs : ControlSampleAnalyteSopSpecificationRs
{
    // Foreign Key.  No display, no edit
    public int AnalyticalBatchSopControlSampleId { get; set; }
}
