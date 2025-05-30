using System;
using System.ComponentModel.DataAnnotations;
using NCLims.Business.NewBatch.ConfigurationManagement.Responses.BatchSops;

namespace NCLims.Business.NewBatch.ConfigurationManagement.Responses.ReagentPrepLogBatchSops;

public partial class ReagentPrepLogBatchSopRs : BatchSopRs
{
    public int ReagentPrepLogBatchSopId { get; set; }
    [Required]
    public int? LabAssetTypeId { get; set; }
    [Required]
    public int? ExpiryDays { get; set; }
    [Required]
    public DateTime? EffectiveOn { get; set; }
}
