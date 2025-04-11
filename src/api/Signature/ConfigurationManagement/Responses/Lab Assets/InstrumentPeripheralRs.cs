using System.ComponentModel.DataAnnotations;

namespace NCLims.Business.NewBatch.ConfigurationManagement.Responses.Lab_Assets;

public class InstrumentPeripheralRs
{
    // Primary Key.   No display, no edit
    public int InstrumentPeripheralId { get; set; }
    // Foreign key to parent.  No display, no edit.
    public int InstrumentId { get; set; }
    // Dropdown control.  Choices come from ConfigurationMaintenanceSelectors.DurableLabAssets
    [Required]
    public int? DurableLabAssetId { get; set; }

    [Required]
    [StringLength(250)]
    public int? PeripheralType { get; set; }
}