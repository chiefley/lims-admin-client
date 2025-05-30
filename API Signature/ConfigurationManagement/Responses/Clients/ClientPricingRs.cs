namespace NCLims.Business.NewBatch.ConfigurationManagement.Responses.Clients;

public partial class ClientPricingRs
{
    // Primary Key.  No Display, no edit.
    public int ClientPricingId { get; set; }
    // @validation: Uniqueness Constraint(PanelId, ClientId)
    public int ClientId { get; set; }
    // Dropdown Control.  Selections come from ConfigurationManagementSelectors.Panel
    // @validation: Uniqueness Constraint(PanelId, ClientId)
    public int PanelId { get; set; }
    public int? Value { get; set; }
    public bool IsPercent { get; set; }
}