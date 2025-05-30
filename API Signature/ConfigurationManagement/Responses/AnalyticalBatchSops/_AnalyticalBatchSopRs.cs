using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using NCLims.Business.NewBatch.ConfigurationManagement.Responses.BatchSops;
using NCLims.Models.DTOs;
using NCLims.Models.NewBatch;

namespace NCLims.Business.NewBatch.ConfigurationManagement.Responses.AnalyticalBatchSops;

public partial class AnalyticalBatchSopRs : BatchSopRs
{
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
            ActionLimitComparisonType = absop.ActionLimitComparisonType.ToString(),
            AggregateRollupMethodType = absop.AggregateRollupMethodType.ToString(),
            AllowPartialAnalyteResults = absop.AllowPartialAnalyteResults,
            AnalysisMethodType = absop.AnalysisMethodType.ToString(),
            BatchCount = absop.AnalyticalBatches.Count,
            ConcentrationScaleFactor = absop.ConcentrationScaleFactor,
            LLoqComparisonType = absop.LLoqComparisonType.ToString(),
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
            ULoqComparisonType = absop.ULoqComparisonType.ToString(),
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
                SopBatchPositionType = cs.SopBatchPositionType.ToString(),
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