using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace NCLims.Business.NewBatch.ConfigurationManagement.Responses.Basic_Tables;

[JsonPolymorphic]
[JsonDerivedType(typeof(SingleValueParserFieldRs), nameof(SingleValueParserFieldRs))]
[JsonDerivedType(typeof(TableValueParserFieldRs), nameof(TableValueParserFieldRs))]
public  abstract partial class FileParserFieldRs
{
    // Primary key.  No display, no edit.
    public int FileParserFieldId { get; set; }
    // @validation.  Uniqueness constraint(FieldName).
    [Required]
    [StringLength(50)]
    public string? FieldName { get; set; }
    [Required]
    public bool? Required { get; set; }
    [Required]
    public bool? FileVersionSignal { get; set; }
    [Required]
    [StringLength(50)]
    public string? BindingProperty { get; set; }
    [StringLength(50)]
    public string? Minimum { get; set; }
    [StringLength(50)]
    public string? Maximum { get; set; }
    [StringLength(50)]
    public string? DefaultValue { get; set; }
    [StringLength(50)]
    public string? NotApplicableSignal { get; set; }
    public bool? UseDefaultIfNoParse { get; set; }
    [StringLength(250)]
    public string? RegexFormat { get; set; }
    // Dropdown control.  Choices come from ConfigurationMaintenanceSelectors.DataFileLevels
    [Required]
    public string? DataFileLevel { get; set; }
    [Required]
    [StringLength(50)]
    public string? SectionOrTableName { get; set; }

    [JsonPropertyName("$type")]
    public virtual string Type => GetType().Name;
}

public partial class SingleValueParserFieldRs : FileParserFieldRs
{
    [JsonPropertyName("$type")]
    public override string Type => GetType().Name;
}

public partial class TableValueParserFieldRs : SingleValueParserFieldRs
{
    [Required]
    public int? ColumnIndex { get; set; }
    [JsonPropertyName("$type")]
    public override string Type => GetType().Name;
}