using NCLims.Models;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NCLims.Business.NewBatch.ConfigurationManagement.Responses.Clients;

public partial class ClientLicenseTypeRs
{
    // Primary Key.  No display, no edit.
    public int ClientLicenseTypeId { get; set; }
    // @validation:  Unique Constraint(Name, StateId).
    [Required]
    [StringLength(150)]
    public string? Name { get; set; }
    [StringLength(250)]
    public string? Description { get; set; }
    [StringLength(150)]
    public string? LicenseFormat { get; set; }
    // No display, no edit.
    // Set to StateId from context on new()
    // @validation:  Unique Constraint(Name, StateId).
    public int StateId { get; set; }
    // Dropdown control.  Value comes from ConfigurationManagementSelectors.ClientLicenseCategories.
    [Required]
    public int? ClientLicenseCategoryId { get; set; }
    public bool Active { get; set; } = true;
}