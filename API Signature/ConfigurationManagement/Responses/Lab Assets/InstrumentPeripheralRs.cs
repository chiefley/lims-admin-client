using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using FluentValidation;
using NCLims.Data;
using System.Linq;
using System.Threading.Tasks;
using NCLims.Models;

namespace NCLims.Business.NewBatch.ConfigurationManagement.Responses.Lab_Assets;

/// EXCEPTION TO STANDARD PATTERN:
// 1. This Response object uses a unique constraint (InstrumentId, Peripheral Type) i
//
// 2. HARD DELETE IMPLEMENTATION: Unlike most other configuration objects that use soft delete
//    with an Active flag, this entity supports permanent deletion.
//    
// 3. CLIENT IMPLEMENTATION REQUIREMENTS:
//    - UI should display delete controls for these items
//    - No "Active" filtering should be applied (no Active property exists)
//    - Client should confirm with users that deletion is permanent
//    - When items are removed from the list on client side, they will be permanently deleted in database
//
// 4. Data flow: When making updates, any records in the database that are not included in the
//    submitted collection will be permanently removed.

public partial class InstrumentPeripheralRs
{
    // Primary Key.   No display, no edit
    public int InstrumentPeripheralId { get; set; }

    // @validation: unique constraint on InstrumentId and Peripheral Type.
    // Foreign key to parent.  No display, no edit.
    public int InstrumentId { get; set; }

    // Dropdown control.  Choices come from ConfigurationMaintenanceSelectors.DurableLabAssets
    [Required] public int? DurableLabAssetId { get; set; }

    // @validation: unique constraint on InstrumentId and Peripheral Type.
    // Combobox control.  Choices come from ConfigurationMaintenanceSelectors.PeripheralTypes.  But
    // as a combobox, the user can enter something that is not one of the choices.
    [StringLength(250)] public string? PeripheralType { get; set; }

}
