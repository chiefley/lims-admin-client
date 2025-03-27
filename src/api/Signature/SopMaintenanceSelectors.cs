public class SopMaintenanceSelectors
{
    public List<DropDownItem> ManifestSampleTypeItems { get; set; } = [];
    public List<DropDownItem> PanelGroupItems { get; set; } = [];
}

public class DropDownItem
{
    public int? Id { get; set; }
    public string Label { get; set; }
}
