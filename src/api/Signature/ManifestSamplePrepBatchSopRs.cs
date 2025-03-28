using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using NCLims.Models.NewBatch;

namespace NCLims.Business.NewBatch.Sop.Responses;

public class ManifestSamplePrepBatchSopRs
{
    // Primary Key, no display, not editable.
    [Required]
    public int ManifestSamplePrepBatchSopId { get; set; }
    // No display, not editable.
    [Required]
    public int BatchSopId { get; set; }
    // Dropdown populated with SopMaintenanceSelectors.ManifestSampleTypeItems.
    [Required]
    public int? ManifestSampleTypeId { get; set; }
    // Dropdown populated with SopMaintenanceSelectors.PanelGroupItems.
    [Required]
    public int? PanelGroupId { get; set; }
    // Display only. Not editable.
    public string Panels { get; set; }

    // ISO 8601 format is the default for System.Text.Json
    [Required]
    public DateTime? EffectiveDate { get; set; } = DateTime.MaxValue;


    public ManifestSampleTypePrepBatchSop Update(ManifestSampleTypePrepBatchSop mstb)
    {
        mstb.PanelGroupId = PanelGroupId.Value;
        mstb.PrepBatchSopId = BatchSopId;
        mstb.ManifestSampleTypeId = ManifestSampleTypeId.Value;
        mstb.EffectiveOn = EffectiveDate.Value;
        return mstb;
    }

    private ManifestSampleTypePrepBatchSop Create()
    {
        return new ManifestSampleTypePrepBatchSop();
    }

    public static void UpsertAll(List<ManifestSamplePrepBatchSopRs> responses,
        List<ManifestSampleTypePrepBatchSop> models)
    {
        foreach (var response in responses)
        {
            ManifestSampleTypePrepBatchSop? model = null;
            model = response.ManifestSamplePrepBatchSopId == 0 
                ? response.Create() 
                : models.Single(m => m.Id == response.ManifestSamplePrepBatchSopId);
            response.Update(model);
        }
    }
}