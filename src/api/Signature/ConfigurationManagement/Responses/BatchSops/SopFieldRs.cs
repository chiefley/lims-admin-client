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
public abstract class SopFieldRs
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

    public void Map(SopField model)
    {
        BatchSopId = model.BatchSopId;
        Section = model.Section;
        Name = model.Name;
        DisplayName = model.DisplayName;
        Row = model.Row;
        Column = model.Column;
        BatchPropertyName = model.BatchPropertyName;
        Required = model.Required;
        ReadOnly = model.ReadOnly;
        RequiredMessage = model.RequiredMessage;
        MinValueMessage = model.MinValueMessage;
        MaxValueMessage = model.MaxValueMessage;
        RegexMessage = model.RegexMessage;
    }

    public static SopFieldRs Create(SopField model)
    {
        SopFieldRs sopFieldRs;
        switch (model)
        {
            case DoubleSopField doubleSopField:
                sopFieldRs = DoubleSopFieldRs.CreateRs(doubleSopField);
                break;
            case InstrumentTypeSopField instrumentTypeSopField:
                sopFieldRs = InstrumentTypeSopFieldRs.CreateRs(instrumentTypeSopField);
                break;
            case LabAssetSopField labAssetSopField:
                sopFieldRs = LabAssetSopFieldRs.CreateRs(labAssetSopField);
                break;
            case DateTimeSopField dateTimeSopField:
                sopFieldRs = DateTimeSopFieldRs.CreateRs(dateTimeSopField);
                break;
            case SopEnumSopField sopEnumSopField:
                sopFieldRs = SopEnumSopFieldRs.CreateRs(sopEnumSopField);
                break;
            case TextSopField textSopField:
                sopFieldRs = TextSopFieldRs.CreateRs(textSopField);
                break;
            case UserSopField userSopField:
                sopFieldRs = UserSopFieldRs.CreateRs(userSopField);
                break;
            case TableColumnDateTimeField tableColumnDateTimeField:
                sopFieldRs = TableColumnDateTimeFieldRs.CreateRs(tableColumnDateTimeField);
                break;
            case TableColumnDoubleSopField tableColumnDoubleSopField:
                sopFieldRs = TableColumnDoubleSopFieldRs.CreateRs(tableColumnDoubleSopField);
                break;
            case TableColumnIntSopField tableColumnIntSopField:
                sopFieldRs = TableColumnIntSopFieldRs.CreateRs(tableColumnIntSopField);
                break;
            case TableColumnSopEnumField tableColumnSopEnumField:
                sopFieldRs = TableColumnSopEnumFieldRs.CreateRs(tableColumnSopEnumField);
                break;
            case TableColumnTextSopField tableColumnTextSopField:
                sopFieldRs = TableColumnTextSopFieldRs.CreateRs(tableColumnTextSopField);
                break;

            default:
                throw new ArgumentException("Unknown SopFieldType");
        }

        return sopFieldRs;
    }
}

public abstract class SingleValueSopFieldRs : SopFieldRs
{
    [JsonPropertyName("$type")]
    public override string Type => nameof(SingleValueSopFieldRs);
}

public class DateTimeSopFieldRs : SingleValueSopFieldRs
{
    [JsonPropertyName("$type")]
    public override string Type => nameof(DateTimeSopFieldRs);

    public bool DatePartOnly { get; set; }

    public static DateTimeSopFieldRs CreateRs(DateTimeSopField model)
    {
        var sopFieldRs = new DateTimeSopFieldRs
        {
            DatePartOnly = model.DatePartOnly
        };
        sopFieldRs.Map(model);
        return sopFieldRs;
    }
}

public class DoubleSopFieldRs : SingleValueSopFieldRs
{
    [JsonPropertyName("$type")]
    public override string Type => nameof(DoubleSopFieldRs);

    [Required]
    public double? MinDoubleValue { get; set; }
    [Required]
    public double? MaxDoubleValue { get; set; }
    public int? Precision { get; set; }
    public static DoubleSopFieldRs CreateRs(DoubleSopField model)
    {
        var sopFieldRs = new DoubleSopFieldRs
        {
            MaxDoubleValue = model.MinDoubleValue,
            MinDoubleValue = model.MinDoubleValue,
            Precision = model.Precision
        };
        sopFieldRs.Map(model);
        return sopFieldRs;
    }
}

public class LabAssetSopFieldRs : SingleValueSopFieldRs
{
    [JsonPropertyName("$type")]
    public override string Type => nameof(LabAssetSopFieldRs);

    // Dropdown control.  Use ConfigurationMaintenanceSelectors.LatAssetTypes.
    [Required]
    public int? LabAssetTypeId { get; set; }

    public static LabAssetSopFieldRs CreateRs(LabAssetSopField model)
    {
        var sopFieldRs = new LabAssetSopFieldRs
        {
            LabAssetTypeId = model.LabAssetTypeId
        };
        sopFieldRs.Map(model);
        return sopFieldRs;
    }
}

public class InstrumentTypeSopFieldRs : SingleValueSopFieldRs
{
    [JsonPropertyName("$type")]
    public override string Type => nameof(InstrumentTypeSopFieldRs);

    // Dropdown control.  Use ConfigurationMaintenanceSelectors.InstrumentTypes.
    [Required]
    public int? InstrumentTypeId { get; set; }

    public static InstrumentTypeSopFieldRs CreateRs(InstrumentTypeSopField model)
    {
        var sopFieldRs = new InstrumentTypeSopFieldRs
        {
            InstrumentTypeId = model.InstrumentTypeId
        };
        sopFieldRs.Map(model);
        return sopFieldRs;
    }
}

public class SopEnumSopFieldRs : SingleValueSopFieldRs
{
    [JsonPropertyName("$type")]
    public override string Type => nameof(SopEnumSopFieldRs);

    // Dropdown control.  Use ConfigurationMaintenanceSelectors.SopEnumTypes.
    [Required]
    public int? SopEnumTypeId { get; set; }

    public static SopEnumSopFieldRs CreateRs(SopEnumSopField model)
    {
        var sopFieldRs = new SopEnumSopFieldRs
        {
            SopEnumTypeId = model.SopEnumTypeId
        };
        sopFieldRs.Map(model);
        return sopFieldRs;
    }

}

public class UserSopFieldRs : SingleValueSopFieldRs
{
    [JsonPropertyName("$type")]
    public override string Type => nameof(UserSopFieldRs);

    // Dropdown control.  Use ConfigurationMaintenanceSelectors.UserRoles
    [Required]
    public int? ApplicationRoleId { get; set; }

    public static UserSopFieldRs CreateRs(UserSopField model)
    {
        var sopFieldRs = new UserSopFieldRs
        {
            ApplicationRoleId = model.ApplicationRoleId
        };
        sopFieldRs.Map(model);
        return sopFieldRs;
    }

}

public class TextSopFieldRs : SingleValueSopFieldRs
{
    [JsonPropertyName("$type")]
    public override string Type => nameof(TextSopFieldRs);

    public static TextSopFieldRs CreateRs(TextSopField model)
    {
        var sopFieldRs = new TextSopFieldRs
        {

        };
        sopFieldRs.Map(model);
        return sopFieldRs;
    }
}

public abstract class TableColumnSopFieldRs : SopFieldRs
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

    public TableColumnSopFieldRs MapTable(TableColumnSopField model)
    {
        TableName = model.TableName;
        ColumnWidth = model.ColumnWidth.IsNullOrEmpty() || !model.ColumnWidth.IsDigitsOnly() ? null : int.Parse(model.ColumnWidth);
        VmPropertyName = model.VmPropertyName;
        Map(model);
        return this;
    }
}

public class TableColumnTextSopFieldRs : TableColumnSopFieldRs
{
    [JsonPropertyName("$type")]
    public override string Type => nameof(TableColumnTextSopFieldRs);

    [StringLength(250)]
    public string ValidationRegex { get; set; }
    public int? MinLength { get; set; }
    public int? MaxLength { get; set; }

    public static TableColumnTextSopFieldRs CreateRs(TableColumnTextSopField model)
    {
        var sopFieldRs = new TableColumnTextSopFieldRs
        {
            ValidationRegex = model.ValidationRegex,
            MinLength = model.MinLength,
            MaxLength = model.MaxLength,
        };
        sopFieldRs.MapTable(model);
        return sopFieldRs;
    }
}

public class TableColumnIntSopFieldRs : TableColumnSopFieldRs
{
    [JsonPropertyName("$type")]
    public override string Type => nameof(TableColumnIntSopFieldRs);

    public int? MinIntValue { get; set; }
    public int? MaxIntValue { get; set; }

    public static TableColumnIntSopFieldRs CreateRs(TableColumnIntSopField model)
    {
        var sopFieldRs = new TableColumnIntSopFieldRs
        {
            MaxIntValue = model.MaxIntValue,
            MinIntValue = model.MinIntValue
        };
        sopFieldRs.MapTable(model);
        return sopFieldRs;
    }
}

public class TableColumnDoubleSopFieldRs : TableColumnSopFieldRs
{
    [JsonPropertyName("$type")]
    public override string Type => nameof(TableColumnDoubleSopFieldRs);

    public double? MinDoubleValue { get; set; }
    public double? MaxDoubleValue { get; set; }
    public int Precision { get; set; }

    public static TableColumnDoubleSopFieldRs CreateRs(TableColumnDoubleSopField model)
    {
        var sopFieldRs = new TableColumnDoubleSopFieldRs
        {
            MaxDoubleValue = model.MaxDoubleValue,
            MinDoubleValue = model.MinDoubleValue,
            Precision = model.Precision
        };
        sopFieldRs.MapTable(model);
        return sopFieldRs;
    }
}

public class TableColumnDateTimeFieldRs : TableColumnSopFieldRs
{
    [JsonPropertyName("$type")]
    public override string Type => nameof(TableColumnDateTimeFieldRs);

    public bool DatePartOnly { get; set; }

    public static TableColumnDateTimeFieldRs CreateRs(TableColumnDateTimeField model)
    {
        var sopFieldRs = new TableColumnDateTimeFieldRs
        {
            DatePartOnly = model.DatePartOnly
        };
        sopFieldRs.MapTable(model);
        return sopFieldRs;
    }
}

public class TableColumnSopEnumFieldRs : TableColumnSopFieldRs
{
    [JsonPropertyName("$type")]
    public override string Type => nameof(TableColumnSopEnumFieldRs);

    public static TableColumnSopEnumFieldRs CreateRs(TableColumnSopEnumField model)
    {
        var sopFieldRs = new TableColumnSopEnumFieldRs
        {
        };
        sopFieldRs.MapTable(model);
        return sopFieldRs;
    }
}