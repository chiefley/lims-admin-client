using System.ComponentModel.DataAnnotations;

namespace NCLims.Business.NewBatch.ConfigurationManagement.Responses.Clients;

public partial class ClientStateLicenseRs
{
    // Primary key.  No display, no edit
    public int ClientStateLicenseId { get; set; }
    [Required]
    [StringLength(150)] 
    public string? Name { get; set; }
    // @validation: Uniqueness constraint(LicenseNumber)
    [Required]
    [StringLength(150)]
    public string LicenseNumber { get; set; }
    // Dropdown control.  Values come from ConfigurationManagementSelectors.ClientLicenseTypes
    [Required]
    public int ClientLicenseTypeId { get; set; }
  
    public int? CcLicenseId { get; set; }
    public bool Active { get; set; } = true;
}