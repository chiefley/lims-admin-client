using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace NCLims.Business.NewBatch.ConfigurationManagement.Responses.BatchSops;

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
}

public partial class DateTimeSopFieldRs : SingleValueSopFieldRs
{
    public bool DatePartOnly { get; set; }
}

public partial class DoubleSopFieldRs : SingleValueSopFieldRs
{
    [Required]
    public double? MinDoubleValue { get; set; }
    [Required]
    public double? MaxDoubleValue { get; set; }
    public int? Precision { get; set; }
}

public partial class LabAssetSopFieldRs : SingleValueSopFieldRs
{
    // Dropdown control.  Use ConfigurationMaintenanceSelectors.LatAssetTypes.
    [Required]
    public int? LabAssetTypeId { get; set; }
}

public partial class InstrumentTypeSopFieldRs : SingleValueSopFieldRs
{
    // Dropdown control.  Use ConfigurationMaintenanceSelectors.InstrumentTypes.
    [Required]
    public int? InstrumentTypeId { get; set; }
}

public partial class SopEnumSopFieldRs : SingleValueSopFieldRs
{
    // Dropdown control.  Use ConfigurationMaintenanceSelectors.SopEnumTypes.
    [Required]
    public int? SopEnumTypeId { get; set; }

}

public partial class UserSopFieldRs : SingleValueSopFieldRs
{
    // Dropdown control.  Use ConfigurationMaintenanceSelectors.UserRoles
    [Required]
    public int? ApplicationRoleId { get; set; }
}

public partial class TextSopFieldRs : SingleValueSopFieldRs
{
}

public abstract partial class TableColumnSopFieldRs : SopFieldRs
{
    [Required]
    [StringLength(50)]
    public string TableName { get; set; }
    [StringLength(50)]
    public string? ColumnWidth { get; set; }
    [StringLength(250)]
    public string? VmPropertyName { get; set; }

}

public partial class TableColumnTextSopFieldRs : TableColumnSopFieldRs
{
    [StringLength(250)]
    public string ValidationRegex { get; set; }
    public int? MinLength { get; set; }
    public int? MaxLength { get; set; }
}

public partial class TableColumnIntSopFieldRs : TableColumnSopFieldRs
{
    public int? MinIntValue { get; set; }
    public int? MaxIntValue { get; set; }
}

public partial class TableColumnDoubleSopFieldRs : TableColumnSopFieldRs
{
    public double? MinDoubleValue { get; set; }
    public double? MaxDoubleValue { get; set; }
    public int Precision { get; set; }
}

public partial class TableColumnDateTimeFieldRs : TableColumnSopFieldRs
{
    public bool DatePartOnly { get; set; }
}

public partial class TableColumnSopEnumFieldRs : TableColumnSopFieldRs
{
}