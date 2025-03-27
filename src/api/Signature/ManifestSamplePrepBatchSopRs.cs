public class ManifestSamplePrepBatchSopRs
{
    // Primary Key, no display, not editable.
    [Required]
    public int ManifestSamplePrepBatchSopId { get; set; }
    // No display, not editable.
    [Required]
    public int BatchSopId { get; set; }
    // Dropdown populated with SopMaintenanceSelectors.ManifestSampleTypeItems.
    [Required]
    public int ManifestSampleTypeId { get; set; }
    // Dropdown populated with SopMaintenanceSelectors.PanelGroupItems.
    [Required]
    public int PanelGroupId { get; set; }
    // Display only. Not editable.
    public string Panels { get; set; }

    // ISO 8601 format is the default for System.Text.Json
    [Required]
    public DateTime EffectiveDate { get; set; } = DateTime.MaxValue;
}