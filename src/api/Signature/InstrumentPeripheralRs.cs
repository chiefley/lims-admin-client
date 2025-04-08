using NCLims.Models.NewBatch.LabAssets;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NCLims.Business.NewBatch.Sop.Responses;

public class InstrumentPeripheralRs
{
    // Primary Key.   No display, no edit
    public int InstrumentPeripheralId { get; set; }
    // Foreign key to parent.  No display, no edit.
    public int InstrumentId { get; set; }
    // Dropdown control.  Choices come from SopMaintenanceSelectors.DurableLabAssets
    [Required]
    public int? DurableLabAssetId { get; set; }

    [Required]
    [StringLength(250)]
    public int? PeripheralType { get; set; }
}