namespace NCLims.Business.NewBatch.ConfigurationManagement.Responses.Basic_Tables;

public class PricingRs
{
    // Primary Key. No display, no edit.
    public int PricingId { get; set; }
    public int? PanelId { get; set; }
    public int SortOrder { get; set; }
    public decimal Price { get; set; }
    public double MinSampleSize { get; set; }
    public bool Active { get; set; } = true;
}