using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using NCLims.Business.NewBatch.ConfigurationManagement.Responses.AnalyticalBatchSops;
using NCLims.Business.NewBatch.ConfigurationManagement.Responses.PrepBatchSops;

namespace NCLims.Business.NewBatch.ConfigurationManagement.Responses.BatchSops;

[JsonPolymorphic]
[JsonDerivedType(typeof(PrepBatchSopSelectionRs), nameof(PrepBatchSopSelectionRs))]
[JsonDerivedType(typeof(AnalyticalBatchSopSelectionRs), nameof(AnalyticalBatchSopSelectionRs))]
public abstract partial class BatchSopSelectionRs
{
    // Primary Key, no display, not editable.
    [Required]
    public int BatchSopId { get; set; }

    // @validation: unique-combination: Name, Sop, Version
    [Required]
    [StringLength(150)]
    public string Name { get; set; }

    // @validation: unique-combination: Name, Sop, Version
    [Required]
    [StringLength(50)]
    public string Sop { get; set; }

    // @validation: unique-combination: Name, Sop, Version
    [Required]
    [StringLength(10)]
    public string Version { get; set; }

    [Required]
    [StringLength(50)]
    public string SopGroup { get; set; }

    // Display only.  Not editable.
    public int BatchCount { get; set; }

    // No display, not editable.
    [Required]
    public int LabId { get; set; }

    [JsonPropertyName("$type")]
    public virtual string Type => GetType().Name;
}

