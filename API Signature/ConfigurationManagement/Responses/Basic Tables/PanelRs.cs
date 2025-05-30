using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using NCLims.Business.NewBatch.ConfigurationManagement.Responses.Clients;

namespace NCLims.Business.NewBatch.ConfigurationManagement.Responses.Basic_Tables;

public partial class PanelRs
{
    // Primary Key, no display.
    public int PanelId { get; set; }

    // @validation:  Must be unique.
    [Required]
    [StringLength(150)]
    public string Name { get; set; }

    [Required]
    [StringLength(10)]
    public string Slug { get; set; }

    public bool SubordinateToPanelGroup { get; set; }

    // Dropdown with nullable choice. Choices come from ConfigurationMaintenanceSelectors.PanelGroups
    public int? PanelGroupId { get; set; }

    public int SignificantDigits { get; set; }

    // Dropdown control. Choices come from ConfigurationMaintenanceSelectors.DecimalFormatTypes.
    public string? DecimalFormatType { get; set; }

    // Dropdown control. Choices come from ConfigurationMaintenanceSelectors.PanelTypes
    // @validation: Must be unique in the list of PanelRss.
    [Required]
    public string? PanelType { get; set; }

    public bool QualitativeFirst { get; set; }

    public bool RequiresMoistureContent { get; set; }

    public bool AllowPartialAnalytes { get; set; }

    #region Copied Into new SamplePanels
    [Required]
    [StringLength(150)]
    public string PlantSop { get; set; }

    [StringLength(150)]
    public string NonPlantSop { get; set; }

    [Required]
    public double? ScaleFactor { get; set; }

    [StringLength(150)]
    public string Units { get; set; }

    [StringLength(150)]
    public string MeasuredUnits { get; set; }  // Instrument or Raw Result

    [StringLength(150)]
    public string LimitUnits { get; set; } // Allows override of Units
    #endregion

    public double? DefaultExtractionVolumeMl { get; set; }
    public double? DefaultDilution { get; set; }

    // Dropdown control. Choices come from ConfigurationMaintenanceSelectors.InstrumentTypes
    public int? InstrumentTypeId { get; set; }

    public int? CcTestPackageId { get; set; }

    [StringLength(150)]
    public string CcCategoryName { get; set; }

    // Dropdown control. Choices come from ConfigurationManagement.TestCategoryTypes. Nullable. Not required.
    public int? TestCategoryId { get; set; }

    public int SampleCount { get; set; }

    // Lab Context. No display, no edit.
    public int LabId { get; set; }

    // Defaults to true on new().
    public bool Active { get; set; } = true;

    // Panel Pricing Section
    // Decimal(7,2)
    public decimal? Price { get; set; }
    public double? MinSampleSize { get; set; }

    [JsonPropertyOrder(100)]
    // List of child panel slugs
    public List<string> ChildPanels { get; set; } = [];

    [JsonPropertyOrder(101)]
    public List<ClientPricingRs> ClientPricingRss { get; set; } = [];

}


