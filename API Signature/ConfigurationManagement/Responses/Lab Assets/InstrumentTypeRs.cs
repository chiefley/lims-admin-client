using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using NCLims.Data;
using NCLims.Models;
using NCLims.Models.Enums;

namespace NCLims.Business.NewBatch.ConfigurationManagement.Responses.Lab_Assets;

public partial class InstrumentTypeRs
{
    // Primary Key.  No display, no edit
    public int InstrumentTypeId { get; set; }
    // @validation:  Unique in the list.
    [Required]
    [StringLength(150)]
    public string? Name { get; set; }
    [Required]
    [StringLength(150)]
    public string MeasurementType { get; set; }
    [Required]
    [StringLength(250)]
    public string DataFolder { get; set; }
    public int? PeakAreaSaturationThreshold { get; set; }
    // Dropdown control.  Choices come from ConfigurationMaintenanceSelectors.InstrumentFileParserTypes.
    [Required]
    public string? InstrumentFileParser { get; set; }

    // Defaults to true on new.
    public bool Active { get; set; } = true;

    public int LabId { get; set; }

    [JsonPropertyOrder(100)]
    public List<InstrumentRs> InstrumentRss { get; set; } = [];
    [JsonPropertyOrder(101)]
    public List<InstrumentTypeAnalyteRs> InstrumentTypeAnalyteRss { get; set; } = [];

}
