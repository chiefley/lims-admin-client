using System.ComponentModel.DataAnnotations;

namespace NCLims.Business.NewBatch.ConfigurationManagement.Responses.Basic_Tables;

public partial class PanelGroupRs
{
    // Primary key.  No display, no edit.
    public int PanelGroupId { get; set; }

    // @validation uniqueness constraint(Name, LabId)
    [Required]
    [StringLength(150)]
    public string? Name { get; set; }

    // @validation uniqueness constraint(Name, LabId)
    // Lab Context.  Set to context.LabId on new()
    [Required]
    public int LabId { get; set; }

    [Required]
    public bool Active { get; set; }
}