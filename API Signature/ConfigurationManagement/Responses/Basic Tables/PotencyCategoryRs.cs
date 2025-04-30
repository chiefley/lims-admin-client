using System.ComponentModel.DataAnnotations;

namespace NCLims.Business.NewBatch.ConfigurationManagement.Responses.Basic_Tables;

/// <summary>
/// Response class for PotencyCategory entities
/// HARD DELETE IMPLEMENTATION: This entity supports permanent deletion
/// </summary>
public partial class PotencyCategoryRs
{
    // Primary Key. No display, no edit.
    public int PotencyCategoryId { get; set; }

    // @validation unique constraint(Name, StateId)
    [Required]
    [StringLength(150)]
    public string Name { get; set; }

    [StringLength(250)]
    public string Description { get; set; }

    // @validation unique constraint(Name, StateId)
    // Part of Lab Context. Set to StateId on new()
    [Required]
    public int StateId { get; set; }
}