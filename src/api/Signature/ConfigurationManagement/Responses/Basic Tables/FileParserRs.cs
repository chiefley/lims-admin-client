using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace NCLims.Business.NewBatch.ConfigurationManagement.Responses.Basic_Tables;

public partial class FileParserRs
{
    // Primary key.  No display, no edit.
    public int FileParserId { get; set; }
    [Required]
    [StringLength(50)] 
    public string? Version { get; set; }

    // ComboBox component. Choices come from ConfigurationMaintenanceSelectors.DataFileTypes
    [Required]
    public string? FileType { get; set; }
    // ComboBox component. Choices come from ConfigurationMaintenanceSelectors.FieldDelimiterTypes
    [Required]
    public string? FieldDelimiter { get; set; }

    // ComboBox component. Choices come from ConfigurationMaintenanceSelectors.DataFileSampleMultiplicities
    [Required]
    public string? SampleMultiplicity { get; set; }

    // ComboBox component. Choices come from ConfigurationMaintenanceSelectors.InstrumentTypes
    [Required]
    public int? InstrumentTypeId { get; set; }

    [JsonPropertyOrder(100)]
    public List<FileParserFieldRs> FileParserFieldRss { get; set; } = [];

}