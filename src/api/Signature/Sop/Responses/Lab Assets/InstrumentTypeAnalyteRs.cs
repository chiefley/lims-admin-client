using System.ComponentModel.DataAnnotations;

namespace NCLims.Business.NewBatch.Sop.Responses.Lab_Assets;

public class InstrumentTypeAnalyteRs
{
    // Foreign key.  No display, no edit.
    public int InstrumentTypeId { get; set; }
    [Required]
    [StringLength(150)]
    public string AnalyteAlias { get; set; }
    // Dropdown control.  Use SopMaintenanceSelectors.Compounds
    [Required]
    public int? AnalyteId { get; set; }
}