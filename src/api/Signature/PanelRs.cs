public class PanelRs
{
    public int PanelId { get; set; }
    // @validation: Must be unique in the list of PanelRss.
    [Required]
    [StringLength(150)]
    public string Name { get; set; }
    // @validation: Must be unique in the list of PanelRss.
    [Required]
    [StringLength(10)]
    public string? Slug { get; set; }
    public bool SubordinateToPanelGroup { get; set; }
    // Dropdown with nullable choice.   Choices come from SopMaintenanceSelectors.PanelGroups
    public int? PanelGroupId { get; set; }
    public int SignificantDigits { get; set; }
    // Dropdown control.  Choices come from SopMaintenance.DecimalFormatTypes.
    public DecimalFormatType? DecimalFormatType { get; set; }
    // Dropdown control. Choices come from SopMaintenance.PanelTypes
    // @validation: Must be unique in the list of PanelRss.
    [Required]
    [StringLength(150)]
    public Panel.PanelTypes PanelType { get; set; }
    public bool QualitativeFirst { get; set; }
    public bool RequiresMoistureContent { get; set; }
    public bool AllowPartialAnalytes { get; set; }

    #region Copied Into new SamplePanels
   
    [Required]
    [StringLength(150)]
    public string PlantSop { get; set; }
    [Required]
    [StringLength(150)]
    public string NonPlantSop { get; set; }
    [Required]
    public double? ScaleFactor { get; set; }
    [Required]
    [StringLength(150)]
    public string? Units { get; set; }
    [StringLength(150)]
    public string? MeasuredUnits { get; set; }  // Instrument or Raw Result
    [StringLength(150)]
    public string LimitUnits { get; set; } // Allows override of Units
    #endregion

    public double? DefaultExtractionVolumeMl { get; set; }
    public double? DefaultDilution { get; set; }
    // Dropdown control.  Choices come from SopMaintenanceSelectors.InstrumentTypes
    public int? InstrumentTypeId { get; set; }
    public int? CcTestPackageId { get; set; }
    [StringLength(150)]
    public string CcCategoryName { get; set; }
    public int? TestCategoryId { get; set; }
    public int SampleCount { get; set; }

    // Dropdown control.  Choices come from the panel slugs in the list of panels.
    public List<string> ChildPanels { get; set; }
}