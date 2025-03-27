public class PrepBatchSopSelectionRs : BatchSopSelectionRs
{
    [JsonPropertyOrder(100)]  // Ensure this appears after primitive properties
    public List<ManifestSamplePrepBatchSopRs> ManifestSamplePrepBatchSopRss { get; set; } = [];

    public override string Type => nameof(PrepBatchSopSelectionRs);
}