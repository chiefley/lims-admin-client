using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using NCLims.Business.NewBatch.ConfigurationManagement.Responses.AnalyticalBatchSops;
using NCLims.Business.NewBatch.ConfigurationManagement.Responses.PrepBatchSops;
using NCLims.Models.Enums;

namespace NCLims.Business.NewBatch.ConfigurationManagement.Responses.BatchSops;

[JsonPolymorphic]
[JsonDerivedType(typeof(PrepBatchSopRs), nameof(PrepBatchSopRs))]
[JsonDerivedType(typeof(AnalyticalBatchSopRs), nameof(AnalyticalBatchSopRs))]
public partial class BatchSopRs
{
    // Primary Key, no display, not editable.
    [Required]
    // Primary Key, no display, not editable.
    public int BatchSopId { get; set; }

    // Not Editable
    [Required]
    [StringLength(150)]
    public string Name { get; set; }

    // @validation.  Unique constraint(Sop, Version, LabId)
    [Required]
    [StringLength(50)]
    public string Sop { get; set; }

    // @validation.  Unique constraint(Sop, Version, LabId)
    [Required]
    [StringLength(10)]
    public string Version { get; set; }

    [Required]
    [StringLength(50)]
    public string SopGroup { get; set; }

    // @validation.  Unique constraint(Sop, Version, LabId)
    // No display, not editable.
    [Required]
    public int LabId { get; set; }

    // Editable
    [Required]
    public int? SignificantDigits { get; set; }

    // DropDown control.  Use ConfigurationMaintenanceSelectors.DecimalFormatType for the choices.
    [Required]
    public string? DecimalFormatType { get; set; }

    [JsonPropertyOrder(100)]  // Ensure this appears after primitive properties

    public ICollection<SopFieldRs> SopFields { get; set; } = [];
    [JsonPropertyOrder(101)]  // Ensure this appears after primitive properties
    public ICollection<SopProcedureRs> SopProcedures { get; set; } = [];
}

