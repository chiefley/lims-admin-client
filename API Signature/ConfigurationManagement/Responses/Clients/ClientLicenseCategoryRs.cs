using System.ComponentModel.DataAnnotations;

namespace NCLims.Business.NewBatch.ConfigurationManagement.Responses.Clients;

public partial class ClientLicenseCategoryRs
{
    // Primary Key.  No display, no edit.
    public int ClientLicenseCategoryId { get; set; }
    // @validation: Uniqueness constraint(Name).
    [Required]
    [StringLength(150)] 
    public string? Name { get; set; }
    [StringLength(250)] 
    public string? Description { get; set; }
    public bool Active { get; set; } = true;
}

