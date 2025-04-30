using System;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using Microsoft.IdentityModel.Tokens;
using NCLims.Models.NewBatch;
using NCLims.Utilities;

namespace NCLims.Business.NewBatch.ConfigurationManagement.Responses.BatchSops;

[JsonPolymorphic(TypeDiscriminatorPropertyName = "$type")]
[JsonDerivedType(typeof(DateTimeSopFieldRs), typeDiscriminator: nameof(DateTimeSopFieldRs))]
[JsonDerivedType(typeof(DoubleSopFieldRs), typeDiscriminator: nameof(DoubleSopFieldRs))]
[JsonDerivedType(typeof(LabAssetSopFieldRs), typeDiscriminator: nameof(LabAssetSopFieldRs))]
[JsonDerivedType(typeof(InstrumentTypeSopFieldRs), typeDiscriminator: nameof(InstrumentTypeSopFieldRs))]
[JsonDerivedType(typeof(SopEnumSopFieldRs), typeDiscriminator: nameof(SopEnumSopFieldRs))]
[JsonDerivedType(typeof(UserSopFieldRs), typeDiscriminator: nameof(UserSopFieldRs))]
[JsonDerivedType(typeof(TextSopFieldRs), typeDiscriminator: nameof(TextSopFieldRs))]
[JsonDerivedType(typeof(TableColumnTextSopFieldRs), typeDiscriminator: nameof(TableColumnTextSopFieldRs))]
[JsonDerivedType(typeof(TableColumnIntSopFieldRs), typeDiscriminator: nameof(TableColumnIntSopFieldRs))]
[JsonDerivedType(typeof(TableColumnDoubleSopFieldRs), typeDiscriminator: nameof(TableColumnDoubleSopFieldRs))]
[JsonDerivedType(typeof(TableColumnDateTimeFieldRs), typeDiscriminator: nameof(TableColumnDateTimeFieldRs))]
[JsonDerivedType(typeof(TableColumnSopEnumFieldRs), typeDiscriminator: nameof(TableColumnSopEnumFieldRs))]
public abstract partial class SopFieldRs
{
    // Type discriminator property
    [JsonPropertyName("$type")]
    public virtual string Type { get; }

    // Primary key.  No display, no edit.
    public int SopFieldId { get; set; }
    // Foreign key to parent.  No display, no edit.
    // @validation: unique-combination: BatchSopId, Section, Name
    public int BatchSopId { get; set; }
    [Required]
    [StringLength(150)]
    // @validation: unique-combination: BatchSopId, Section, Name
    public string? Section { get; set; }
    [Required]
    [StringLength(150)]
    // @validation: unique-combination: BatchSopId, Section, Name
    public string? Name { get; set; }
    [Required]
    [StringLength(150)]
    public string? DisplayName { get; set; }
    // Sortable
    public int Row { get; set; }
    public int Column { get; set; }
    [StringLength(150)]
    public string? BatchPropertyName { get; set; }
    public bool Required { get; set; }
    public bool ReadOnly { get; set; }
    [StringLength(150)]
    public string? RequiredMessage { get; set; }
    [StringLength(150)]
    public string? MinValueMessage { get; set; }
    [StringLength(150)]
    public string? MaxValueMessage { get; set; }
    [StringLength(150)]
    public string? RegexMessage { get; set; }

}

public abstract partial class SingleValueSopFieldRs : SopFieldRs
{
    [JsonPropertyName("$type")]
    public override string Type => nameof(SingleValueSopFieldRs);
}

public partial class DateTimeSopFieldRs : SingleValueSopFieldRs
{
    [JsonPropertyName("$type")]
    public override string Type => nameof(DateTimeSopFieldRs);

    public bool DatePartOnly { get; set; }

}

public partial class DoubleSopFieldRs : SingleValueSopFieldRs
{
    [JsonPropertyName("$type")]
    public override string Type => nameof(DoubleSopFieldRs);

    [Required]
    public double? MinDoubleValue { get; set; }
    [Required]
    public double? MaxDoubleValue { get; set; }
    public int? Precision { get; set; }
}

public partial class LabAssetSopFieldRs : SingleValueSopFieldRs
{
    [JsonPropertyName("$type")]
    public override string Type => nameof(LabAssetSopFieldRs);

    // Dropdown control.  Use ConfigurationMaintenanceSelectors.LatAssetTypes.
    [Required]
    public int? LabAssetTypeId { get; set; }
}

public partial class InstrumentTypeSopFieldRs : SingleValueSopFieldRs
{
    [JsonPropertyName("$type")]
    public override string Type => nameof(InstrumentTypeSopFieldRs);

    // Dropdown control.  Use ConfigurationMaintenanceSelectors.InstrumentTypes.
    [Required]
    public int? InstrumentTypeId { get; set; }
}

public partial class SopEnumSopFieldRs : SingleValueSopFieldRs
{
    [JsonPropertyName("$type")]
    public override string Type => nameof(SopEnumSopFieldRs);

    // Dropdown control.  Use ConfigurationMaintenanceSelectors.SopEnumTypes.
    [Required]
    public int? SopEnumTypeId { get; set; }

}

public partial class UserSopFieldRs : SingleValueSopFieldRs
{
    [JsonPropertyName("$type")]
    public override string Type => nameof(UserSopFieldRs);

    // Dropdown control.  Use ConfigurationMaintenanceSelectors.UserRoles
    [Required]
    public int? ApplicationRoleId { get; set; }
}

public partial class TextSopFieldRs : SingleValueSopFieldRs
{
    [JsonPropertyName("$type")]
    public override string Type => nameof(TextSopFieldRs);

}

public abstract partial class TableColumnSopFieldRs : SopFieldRs
{
    [JsonPropertyName("$type")]
    public override string Type => nameof(TableColumnSopFieldRs);

    [Required]
    [StringLength(50)]
    public string TableName { get; set; }
    [Required]
    public int? ColumnWidth { get; set; }
    [Required]
    [StringLength(250)]
    public string VmPropertyName { get; set; }

}

public partial class TableColumnTextSopFieldRs : TableColumnSopFieldRs
{
    [JsonPropertyName("$type")]
    public override string Type => nameof(TableColumnTextSopFieldRs);

    [StringLength(250)]
    public string ValidationRegex { get; set; }
    public int? MinLength { get; set; }
    public int? MaxLength { get; set; }
}

public partial class TableColumnIntSopFieldRs : TableColumnSopFieldRs
{
    [JsonPropertyName("$type")]
    public override string Type => nameof(TableColumnIntSopFieldRs);

    public int? MinIntValue { get; set; }
    public int? MaxIntValue { get; set; }
}

public partial class TableColumnDoubleSopFieldRs : TableColumnSopFieldRs
{
    [JsonPropertyName("$type")]
    public override string Type => nameof(TableColumnDoubleSopFieldRs);

    public double? MinDoubleValue { get; set; }
    public double? MaxDoubleValue { get; set; }
    public int Precision { get; set; }
}

public partial class TableColumnDateTimeFieldRs : TableColumnSopFieldRs
{
    [JsonPropertyName("$type")]
    public override string Type => nameof(TableColumnDateTimeFieldRs);

    public bool DatePartOnly { get; set; }
}

public partial class TableColumnSopEnumFieldRs : TableColumnSopFieldRs
{
    [JsonPropertyName("$type")]
    public override string Type => nameof(TableColumnSopEnumFieldRs);
}