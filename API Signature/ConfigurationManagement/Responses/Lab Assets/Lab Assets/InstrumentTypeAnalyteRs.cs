using System.ComponentModel.DataAnnotations;

namespace NCLims.Business.NewBatch.ConfigurationManagement.Responses.Lab_Assets;


/// EXCEPTION TO STANDARD PATTERN:
// 1. This Response object uses a composite key (InstrumentTypeId, AnalyteAlias) instead of a 
//    single primary key ID field. The database structure reflects this with a complex key.
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

public partial class InstrumentTypeAnalyteRs
{
    // UNIQUENESS CONSTRAINT:
    // The combination of InstrumentTypeId and AnalyteAlias must be unique.

    // Foreign key to parent.  No display, no edit.
    public int InstrumentTypeId { get; set; }

    // Dropdown control.  Use ConfigurationMaintenanceSelectors.Compounds
    // UNIQUENESS CONSTRAINT:
    // The combination of InstrumentTypeId and AnalyteAlias must be unique.
    [Required] public int? AnalyteId { get; set; }
    [Required] [StringLength(150)] public string AnalyteAlias { get; set; }
}
    
