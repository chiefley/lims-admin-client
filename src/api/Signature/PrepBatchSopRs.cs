public class PrepBatchSopRs : BatchSopRs
{
    [Required]
    public int? MaxSamplesPerBatch { get; set; }
    [Required]
    public double? DefaultDilution { get; set; }
    [Required]
    public double? DefaultExtractionVolumeMl { get; set; }
    [Required]
    public double? DefaultInjectionVolumeUl { get; set; }
    [Required]
    public double? MaxWeightG { get; set; }
    [Required]
    public double? MinWeightG { get; set; }

    [JsonPropertyOrder(110)]  // Ensure this appears after primitive properties
    public List<ManifestSamplePrepBatchSopRs> ManifestSamplePrepBatchSopRss { get; set; } = [];

    [JsonPropertyOrder(120)] 
    public List<PrepBatchSopControlSampleRs> PrepBatchSopControlSamples { get; set; } = [];

    public override string Type => nameof(PrepBatchSopSelectionRs);
}
