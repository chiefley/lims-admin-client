public class InstrumentTypeRs
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
    // Dropdown control.  Choices come from SopMaintenanceSelectors.InstrumentFileParserTypes.
    [Required]
    public InstrumentFileParserType? InstrumentFileParser { get; set; }

    public List<InstrumentRs> InstrumentRss { get; set; } = [];
    public List<InstrumentTypeAnalyteRs> InstrumentTypeAnalyteRss { get; set; } = [];
}
