using System.Collections.Generic;
using NCLims.Models.NewBatch.Analytical;
using NCLims.Models.NewBatch;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json.Serialization;

namespace NCLims.Business.NewBatch.Sop.Responses;

public class PrepBatchSopControlSampleRs
{
    // Primary Key.   No display.
    public int PrepBatchSopControlSampleId { get; set; }
    // Foreign Key to parent.  No display.
    public int PrepBatchSopId { get; set; }

    // Dropdown control.  Use SopMaintenanceSelectors.SopBatchPositionTypes
    [Required]
    public SopBatchPositionType? SopBatchPositionType { get; set; }
    [Required]
    public int? ControlSampleOrder { get; set; }
    public int? QCFactor1 { get; set; }
    public int? QCFactor2 { get; set; }
    public int? QCTargetRangeLow { get; set; }
    public int? QCTargetRangeHigh { get; set; }
    public int? HistoricalDays { get; set; }
    // Dropdown control.  Use SopMaintenanceSelectors.ControlSampleTypes
    [Required]
    public ControlSampleType? ControlSampleType { get; set; }
    [StringLength(250)]
    public string Description { get; set; }
    // Dropdown control.  Use SopMaintenanceSelectors.ControlSampleCategories
    [Required] 
    public ControlSampleCategory? Category { get; set; }
    // Dropdown control.  Use SopMaintenanceSelectors.ControlSampleAnalyses
    [Required] public ControlSampleAnalysis? AnalysisType { get; set; }
    // Dropdown control.  Use SopMaintenanceSelectors.ControlSampleQCSources.
    [Required] public ControlSampleQCSource? QCSource { get; set; }
    // Dropdown control.  Use SopMaintenanceSelectors.ControlSamplePassCriteria
    [Required] public ControlSamplePassCriteria? PassCriteria { get; set; }
    // Dropdown control.  Use SopMaintenanceSelectors.ControlSampleConditions
    [Required] public QCCondition? QCCondition { get; set; }

    public static async Task<List<PrepBatchSopControlSampleRs>> FetchPrepBatchSopControlSampleRss(
        IQueryable<PrepBatchSopControlSample> query)
    {
        var ret = await query.Select(pbsop => new PrepBatchSopControlSampleRs
        {
            PrepBatchSopControlSampleId = pbsop.Id,
            PrepBatchSopId = pbsop.PrepBatchSopId,
            AnalysisType = pbsop.ControlSampleSpecification.AnalysisType,
            Category = pbsop.ControlSampleSpecification.Category,
            ControlSampleOrder = pbsop.ControlSampleOrder,
            ControlSampleType = pbsop.ControlSampleSpecification.ControlSampleType,
            Description = pbsop.ControlSampleSpecification.Description,
            HistoricalDays = pbsop.HistoricalDays,
            PassCriteria = pbsop.ControlSampleSpecification.PassCriteria,
            QCCondition = pbsop.ControlSampleSpecification.QCCondition,
            QCFactor1 = pbsop.QCFactor1,
            QCFactor2 = pbsop.QCFactor2,
            QCSource = pbsop.ControlSampleSpecification.QCSource,
            QCTargetRangeHigh = pbsop.QCTargetRangeHigh,
            QCTargetRangeLow = pbsop.QCTargetRangeLow
        }).ToListAsync();

        return ret;
    }
}
