using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace NCLims.Business.NewBatch.ConfigurationManagement.Responses.Clients;

public partial class ClientRs
{
    // Primary Key. No display, no edit.
    public int ClientId { get; set; }
    // @ validation: Uniqueness constraint(Name).
    [Required, StringLength(150)]
    public string? Name { get; set; }
    // @ validation: Uniqueness constraint(DbaName) if not null.
    [StringLength(150)]
    public string? DbaName { get; set; }
    [StringLength(150)]
    public string? Address1 { get; set; }
    [StringLength(150)]
    public string? Address2 { get; set; }
    public int? CcClientId { get; set; }
    public int? CcPrimaryAddressId { get; set; }
    [StringLength(150)]
    public string? City { get; set; }
    [StringLength(150)]
    public string? ContactFirstName { get; set; }
    [StringLength(150)]
    public string? ContactLastName { get; set; }
    
    [StringLength(150)]
    public string? Email { get; set; }
    [StringLength(150)]
    public string? Phone { get; set; }
    [MaxLength(10)]
    public string? PostalCode { get; set; }
    [StringLength(150)]
    public string? LimsClientApiID { get; set; }
    [StringLength(150)]
    public string? LimsClientApiKey { get; set; }
    public bool Active { get; set; } = true;
    [JsonPropertyOrder(100)]
    public List<ClientStateLicenseRs> ClientStateLicenseRss { get; set; } = [];
    [JsonPropertyOrder(101)]
    public List<ClientPricingRs> ClientPricingRss { get; set; } = [];

}