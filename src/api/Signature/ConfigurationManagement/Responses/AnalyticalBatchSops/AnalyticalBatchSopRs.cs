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

public class AnalyticalBatchSopRs : BatchSopRs
{
    // Primary Key.  No display, no edit.
    public int BatchSopId { get; set; }
    // Dropdown control.  Choices come from ConfigurationMaintenanceSelectors.InstrumentTypes
    public int? InstrumentTypeId { get; set; }
    public bool SuppressLoqsForComputedAnalytes { get; set; }
    public bool RequiresMoistureCorrection { get; set; }
    public bool RequiresServingAndContainerResults { get; set; }
    // Dropdown control.   Choices come from ConfigurationMaintenanceSelectors.ReportPercentTypes
    [Required]
    public ReportPercentType? ReportPercentType { get; set; }
    [Required]
    public double? ConcentrationScaleFactor { get; set; }
    [Required]
    public double? PercentScaleFactor { get; set; }

    [Required]
    [StringLength(50)]
    public string? MeasuredUnits { get; set; }
    [Required]
    [StringLength(50)]
    public string? ReportingUnits { get; set; }

    public bool RsaUseNominalValues { get; set; }
    // Required if RsaUseNominalValues = true
    public double? RsaNominalSampleWeightG { get; set; }
    // Required if RsaUseNominalValues = true
    public double? RsaNominalExtractionVolumeL { get; set; }

    // Dropdown control.   Choices come from ConfigurationMaintenanceSelectors.AnalysisMethodTypes
    [Required]
    public ManifestSampleAnalysisMethodType AnalysisMethodType { get; set; }
    // Dropdown control.   Choices come from ConfigurationMaintenanceSelectors.AggregateRollupMethodTypes
    [Required]
    public AggregateRollupMethodType AggregateRollupMethodType { get; set; }
    // Dropdown control.   Choices come from ConfigurationMaintenanceSelectors.ComparisonTypes
    [Required]
    public NcComparisonType LLoqComparisonType { get; set; }
    // Dropdown control.   Choices come from ConfigurationMaintenanceSelectors.ComparisonTypes
    [Required]
    public NcComparisonType ULoqComparisonType { get; set; }
    // Dropdown control.   Choices come from ConfigurationMaintenanceSelectors.ComparisonTypes
    [Required]
    public NcComparisonType ActionLimitComparisonType { get; set; }
    public bool RollupRsd { get; set; }
    public bool AllowPartialAnalyteResults { get; set; }

    public int BatchCount { get; set; }

    [JsonPropertyOrder(110)]  // Ensure this appears after primitive properties

    public List<AnalyticalBatchSopControlSampleRs> AnalyticalBatchSopControlSampleRss { get; set; } = [];

    [JsonPropertyOrder(120)] // Ensure this appears after primitive properties
    public List<AnalyticalBatchSopAnalyteRs> AnalyticalBatchSopAnalytesRss { get; set; } = [];

    [JsonPropertyOrder(130)] // Ensure this appears after primitive properties
    public List<SopAnalysisReviewComponentRs> SopAnalysisReviewComponentRss { get; set; } = [];

    [JsonPropertyOrder(140)] // Ensure this appears after primitive properties
    public List<PrepBatchSopAnalyticalBatchSopRs> PrepBatchSopAnalyticalBatchSopRss { get; set; } = [];

    public override string Type => nameof(AnalyticalBatchSopRs);

    public static async Task<List<AnalyticalBatchSopRs>> FetchAnalyticalBatchSopRss(IQueryable<AnalyticalBatchSop> query, SelectorVm analytes)
    {
        var ret = await query.Select(absop => new AnalyticalBatchSopRs
        {
            BatchSopId = absop.Id,
            Name = absop.Name,
            Sop = absop.Sop,
            Version = absop.Version,
            SopGroup = absop.SopGroup,
            LabId = absop.LabId,
            SignificantDigits = absop.SignificantDigits,
            InstrumentTypeId = absop.InstrumentTypeId,
            ActionLimitComparisonType = absop.ActionLimitComparisonType,
            AggregateRollupMethodType = absop.AggregateRollupMethodType,
            AllowPartialAnalyteResults = absop.AllowPartialAnalyteResults,
            AnalysisMethodType = absop.AnalysisMethodType,
            BatchCount = absop.AnalyticalBatches.Count,
            ConcentrationScaleFactor = absop.ConcentrationScaleFactor,
            LLoqComparisonType = absop.LLoqComparisonType,
            MeasuredUnits = absop.MeasuredUnits,
            PercentScaleFactor = absop.PercentScaleFactor,
            ReportPercentType = absop.ReportPercentType,
            ReportingUnits = absop.ReportingUnits,
            RequiresServingAndContainerResults = absop.RequiresServingAndContainerResults,
            RequiresMoistureCorrection = absop.RequiresMoistureCorrection,
            RollupRsd = absop.RollupRsd,
            RsaNominalExtractionVolumeL = absop.RsaNominalExtractionVolumeL,
            RsaNominalSampleWeightG = absop.RsaNominalSampleWeightG,
            RsaUseNominalValues = absop.RsaUseNominalValues,
            SuppressLoqsForComputedAnalytes = absop.SuppressLoqsForComputedAnalytes,
            ULoqComparisonType = absop.ULoqComparisonType,
            AnalyticalBatchSopAnalytesRss = absop.AnalyticalBatchSopAnalytes.Select(an => new AnalyticalBatchSopAnalyteRs
            {
                AnalyteId = an.AnalyteId,
                AnalystDisplayOrder = an.AnalystDisplayOrder,
                AnalyticalBatchSopAnalyteId = an.Id,
                AnalyticalBatchSopId = an.AnalyticalBatchSopId,
                ComputeAggregateAnalyte = an.ComputeAggregateAnalyte,
                Computed = an.Computed,
                ConfidenceStd = an.ConfidenceStd,
                IsInternalStandard = an.IsInternalStandard,
                TestStd = an.TestStd,
                WarningStd = an.WarningStd,
                ComputedAnalyteConstituentRss = an.ComputedAnalyteConstituents.Select(cac => new ComputedAnalyteConstituentRs
                {
                    Cas = cac.Cas,
                    AnalyticalBatchSopAnalyteId = cac.AnalyticalBatchSopAnalyteId,
                    ComputedAnalyteConstituentId = cac.Id
                }).ToList(),
            }).ToList(),
            AnalyticalBatchSopControlSampleRss = absop.AnalyticalBatchSopControlSamples.Select(cs => new AnalyticalBatchSopControlSampleRs
            {
                ControlSampleOrder = cs.ControlSampleOrder,
                QCFactor2 = cs.QCFactor2,
                QCTargetRangeLow = cs.QCTargetRangeLow,
                HistoricalDays = cs.HistoricalDays,
                AnalyticalBatchSopId = cs.AnalyticalBatchSopId,
                QCFactor1 = cs.QCFactor1,
                QCTargetRangeHigh = cs.QCTargetRangeHigh,
                AnalyticalBatchSopControlSampleId = cs.Id,
                EveryNSamples = cs.EveryNSamples,
                SopBatchPositionType = cs.SopBatchPositionType,
                ControlSampleAnalyteSopSpecificationRss = cs.ControlSampleAnalyteSopSpecifications.Select(css => new AnalyticalBatchControlAnalyteSopSpecificationRs
                {
                    AnalyteId = css.AnalyteId,
                    AnalyticalBatchSopControlSampleId = css.AnalyticalBatchSopControlSampleId,
                    ControlSampleAnalyteSopSpecificationId = css.Id,
                    ExpectedRecovery = css.ExpectedRecovery,
                    QCType = css.QCType
                }).ToList()
            }).ToList(),
            SopAnalysisReviewComponentRss = absop.SopAnalysisReviewComponents.Select(src => new SopAnalysisReviewComponentRs
            {
                AnalyticalBatchSopId = src.AnalyticalBatchSopId,
                Collection = src.Collection,
                ComponentName = src.ComponentName,
                DisplayName = src.DisplayName,
                Parameter = src.Parameter,
                SopAnalysisReviewComponentId = src.Id
            }).ToList(),
            PrepBatchSopAnalyticalBatchSopRss = absop.PrepBatchSopAnalyticalBatchSops.Select(sop => new PrepBatchSopAnalyticalBatchSopRs
            {
                PrepBatchSopAnalyticalBatchSopId = sop.Id,
                PrepBatchSopId = sop.PrepBatchSopId,
                AnalyticalBatchSopId = sop.AnalyticalBatchSopId
            }).ToList(),
            SopProcedures = absop.SopProcedures.Select(pro => new SopProcedureRs
            {
                Section = pro.Section,
                ProcedureName = pro.ProcedureName,
                BatchSopId = pro.BatchSopId,
                SopProcedureId = pro.Id,
                ProcedureItems = pro.SopProcedureItems.Select(pi => new SopProcedureItemRs
                {
                    IndentLevel = pi.IndentLevel,
                    ItemNumber = pi.ItemNumber,
                    Order = pi.Order,
                    SopProcedureId = pi.SopProcedureId,
                    SopProcedurItemId = pi.Id,
                    Text = pi.Text
                }).ToList(),
            }).ToList(),
        }).ToListAsync();

        var computedAnalyteConstituents = ret
            .SelectMany(r => r.AnalyticalBatchSopAnalytesRss).SelectMany(an => an.ComputedAnalyteConstituentRss)
            .ToList();

        foreach (var cac in computedAnalyteConstituents)
            cac.AnalyteId = analytes.Value(cac.Cas) ?? -1;

        return ret;
    }
}