using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using NCLims.Models.NewBatch;

namespace NCLims.Business.NewBatch.ConfigurationManagement.Responses.Basic_Tables;

public class FileParserRs
{
    // Primary key.  No display, no edit.
    public int FileParserId { get; set; }
    [Required]
    [StringLength(50)] 
    public string Version { get; set; }

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

    public static async Task<List<FileParserRs>> FetchFileParserRss(IQueryable<FileParser> query)
    {
        var fileParsers = await query
            .Include(fp => fp.Fields)
            .ToListAsync();

        List<FileParserRs> ret = [];

        foreach (var parser in fileParsers)
        {
            var fileParserFs = new FileParserRs
            {
                InstrumentTypeId = parser.InstrumentTypeId,
                FieldDelimiter = parser.FieldDelimiter.ToString(),
                FileParserId = parser.Id,
                FileType = parser.FileType.ToString(),
                SampleMultiplicity = parser.SampleMultiplicity.ToString(),
                Version = parser.Version
            };

            ret.Add(fileParserFs);

            foreach (var field in parser.Fields)
            {
                var fileParserFieldRs = field is SingleValueParserField
                    ? new SingleValueParserFieldRs()
                    : new TableValueParserFieldRs {ColumnIndex = ((TableValueParserField)field).ColumnIndex};

                fileParserFieldRs.Required = field.Required;
                fileParserFieldRs.BindingProperty = field.BindingProperty;
                fileParserFieldRs.DataFileLevel = field.DataFileLevel.ToString();
                fileParserFieldRs.DefaultValue = field.DefaultValue;
                fileParserFieldRs.FieldName = field.FieldName;
                fileParserFieldRs.FileParserFieldId = field.Id;
                fileParserFieldRs.FileVersionSignal = field.FileVersionSignal;
                fileParserFieldRs.Maximum = field.Maximum;
                fileParserFieldRs.Minimum = field.Minimum;
                fileParserFieldRs.NotApplicableSignal = field.NotApplicableSignal;
                fileParserFieldRs.SectionOrTableName = field.SectionOrTableName;
                fileParserFieldRs.RegexFormat = field.RegexFormat;
                fileParserFieldRs.UseDefaultIfNoParse = field.UseDefaultIfNoParse;
            }
        }

        return ret;
    }
}