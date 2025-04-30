using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using NCLims.Business.NewBatch.ConfigurationManagement.Responses.BatchSops;
using NCLims.Models.DTOs;
using NCLims.Models.NewBatch;
using NCLims.Models.NewBatch.Analytical;

namespace NCLims.Business.NewBatch.ConfigurationManagement.Responses.AnalyticalBatchSops;

public partial class AnalyticalBatchSopRs : BatchSopRs
{
    // Primary Key.  No display, no edit.
    public int BatchSopId { get; set; }

    // Dropdown control.  Choices come from ConfigurationMaintenanceSelectors.InstrumentTypes
    public int? InstrumentTypeId { get; set; }
    public bool SuppressLoqsForComputedAnalytes { get; set; }
    public bool RequiresMoistureCorrection { get; set; }

    public bool RequiresServingAndContainerResults { get; set; }

    // Dropdown control.   Choices come from ConfigurationMaintenanceSelectors.ReportPercentTypes
    [Required] public ReportPercentType? ReportPercentType { get; set; }
    [Required] public double? ConcentrationScaleFactor { get; set; }
    [Required] public double? PercentScaleFactor { get; set; }

    [Required] [StringLength(50)] public string? MeasuredUnits { get; set; }
    [Required] [StringLength(50)] public string? ReportingUnits { get; set; }

    public bool RsaUseNominalValues { get; set; }

    // Required if RsaUseNominalValues = true
    public double? RsaNominalSampleWeightG { get; set; }

    // Required if RsaUseNominalValues = true
    public double? RsaNominalExtractionVolumeL { get; set; }

    // Dropdown control.   Choices come from ConfigurationMaintenanceSelectors.AnalysisMethodTypes
    [Required] public ManifestSampleAnalysisMethodType AnalysisMethodType { get; set; }

    // Dropdown control.   Choices come from ConfigurationMaintenanceSelectors.AggregateRollupMethodTypes
    [Required] public AggregateRollupMethodType AggregateRollupMethodType { get; set; }

    // Dropdown control.   Choices come from ConfigurationMaintenanceSelectors.ComparisonTypes
    [Required] public NcComparisonType LLoqComparisonType { get; set; }

    // Dropdown control.   Choices come from ConfigurationMaintenanceSelectors.ComparisonTypes
    [Required] public NcComparisonType ULoqComparisonType { get; set; }

    // Dropdown control.   Choices come from ConfigurationMaintenanceSelectors.ComparisonTypes
    [Required] public NcComparisonType ActionLimitComparisonType { get; set; }
    public bool RollupRsd { get; set; }
    public bool AllowPartialAnalyteResults { get; set; }

    public int BatchCount { get; set; }

    [JsonPropertyOrder(110)] // Ensure this appears after primitive properties

    public List<AnalyticalBatchSopControlSampleRs> AnalyticalBatchSopControlSampleRss { get; set; } = [];

    [JsonPropertyOrder(120)] // Ensure this appears after primitive properties
    public List<AnalyticalBatchSopAnalyteRs> AnalyticalBatchSopAnalytesRss { get; set; } = [];

    [JsonPropertyOrder(130)] // Ensure this appears after primitive properties
    public List<SopAnalysisReviewComponentRs> SopAnalysisReviewComponentRss { get; set; } = [];

    [JsonPropertyOrder(140)] // Ensure this appears after primitive properties
    public List<PrepBatchSopAnalyticalBatchSopRs> PrepBatchSopAnalyticalBatchSopRss { get; set; } = [];

    public override string Type => nameof(AnalyticalBatchSopRs);

}
