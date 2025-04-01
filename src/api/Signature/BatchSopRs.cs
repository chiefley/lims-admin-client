using NCLims.Models.Enums;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace NCLims.Business.NewBatch.Sop.Responses;

[JsonPolymorphic]
[JsonDerivedType(typeof(PrepBatchSopRs), nameof(PrepBatchSopRs))]
[JsonDerivedType(typeof(AnalyticalBatchSopRs), nameof(AnalyticalBatchSopRs))]
public class BatchSopRs
{
    // Primary Key, no display, not editable.
    [Required]
    // Primary Key, no display, not editable.
    public int BatchSopId { get; set; }

    // Not Editable
    [Required]
    [StringLength(150)]
    public string Name { get; set; }

    // Not Editable
    [Required]
    [StringLength(50)]
    public string Sop { get; set; }

    // Not Editable
    [Required]
    [StringLength(10)]
    public string Version { get; set; }

    [Required]
    [StringLength(50)]
    public string SopGroup { get; set; }

    // No display, not editable.
    [Required]
    public int LabId { get; set; }

    [JsonPropertyName("$type")]
    public virtual string Type => GetType().Name;

    // Editable
    [Required]
    public int? SignificantDigits { get; set; }

    // DropDown control.  Use SopMaintenanceSelectors.DecimalFormatType for the choices.
    [Required]
    public DecimalFormatType? DecimalFormatType { get; set; }

    [JsonPropertyOrder(100)]  // Ensure this appears after primitive properties

    public ICollection<SopFieldRs> SopFields { get; set; } = [];
    [JsonPropertyOrder(101)]  // Ensure this appears after primitive properties
    public ICollection<SopProcedureRs> SopProcedures { get; set; } = [];
}

