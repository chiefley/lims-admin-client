using System.ComponentModel.DataAnnotations;

namespace NCLims.Business.NewBatch.ConfigurationManagement.Responses.Basic_Tables;

public partial class TestCategoryRs
{
    // Primary Key.  No display, no edit.
    public int TestCategoryId { get; set; }

    // @validation unique constraint(Name, StateId)
    [Required]
    [StringLength(50)]
    public string? Name { get; set; }
    [StringLength(250)]
    public string? Description { get; set; }

    // @validation unique constraint(Name, StateId)
    // Lab context.  Set to 1001 on new()
    // No display, no edit.
    public int StateId { get; set; }
    public int? CcTestPackageId { get; set; }

    // Default to true on new()
    public bool Active { get; set; } = true;
}