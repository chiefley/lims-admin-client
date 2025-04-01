using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using NCLims.Models.NewBatch;

namespace NCLims.Business.NewBatch.Sop.Responses;

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

    public override string Type => nameof(PrepBatchSopSelectionRs);

    public static async Task<List<PrepBatchSopRs>> PrepBatchSopRss(IQueryable<PrepBatchSop> query)
    {
        var ret = await query.Select(pbsop => new PrepBatchSopRs
        {
            BatchSopId = pbsop.Id,
            LabId = pbsop.LabId,
            Name = pbsop.Name,
            Sop = pbsop.Sop,
            Version = pbsop.Version,
            SopGroup = pbsop.SopGroup,
            DefaultDilution = pbsop.DefaultDilution,
            DefaultExtractionVolumeMl = pbsop.DefaultExtractionVolumeMl,
            DefaultInjectionVolumeUl = pbsop.DefaultInjectionVolumeUl,
            MaxSamplesPerBatch = pbsop.MaxSamplesPerBatch,
            MaxWeightG = pbsop.MaxWeightG,
            MinWeightG = pbsop.MinWeightG,
            ManifestSamplePrepBatchSopRss = pbsop.ManifestSampleTypePrepBatchSop
                .Select(mstb => new ManifestSamplePrepBatchSopRs
                {
                    ManifestSamplePrepBatchSopId = mstb.Id,
                    BatchSopId = mstb.PrepBatchSopId,
                    EffectiveDate = mstb.EffectiveOn,
                    ManifestSampleTypeId = mstb.ManifestSampleTypeId,
                    PanelGroupId = mstb.PanelGroupId,
                    Panels = string.Join(", ", mstb.PanelGroup.Panels.Select(p => p.Name))
                }).ToList(),
            SopProcedures = pbsop.SopProcedures
                .Select(p => new SopProcedureRs()
                {
                    SopProcedureId = p.Id,
                    BatchSopId = pbsop.Id,
                    ProcedureName = p.ProcedureName,
                    Section = p.Section,
                    ProcedureItems = p.SopProcedureItems
                        .Select(pi => new SopProcedureItemRs
                        {
                            SopProcedureId = p.Id,
                            SopProcedurItemId = pi.Id,
                            IndentLevel = pi.IndentLevel,
                            ItemNumber = pi.ItemNumber,
                            Order = pi.Order,
                            Text = pi.Text
                        }).ToList(),
                }).ToList()
        }).ToListAsync();
        return ret;
    }

}