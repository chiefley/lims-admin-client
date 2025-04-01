using System.Collections.Generic;
using Microsoft.AspNetCore.Identity;
using NCLims.Models.DTOs;

namespace NCLims.Business.NewBatch.Sop.Responses;

public class SopMaintenanceSelectors
{
    public List<DropDownItem> ManifestSampleTypeItems { get; set; } = [];
    public List<DropDownItem> PanelGroupItems { get; set; } = [];
    public List<DropDownItem> LabAssetTypes { get; set; } = [];
    public List<DropDownItem> SopEnumTypes { get; set; } = [];
    public List<DropDownItem> InstrumentTypes { get; set; } = [];
    public List<DropDownItem> UserRoles { get; set; } = [];
    public List<DropDownItem> DecimalFormatTypes { get; set; }
}