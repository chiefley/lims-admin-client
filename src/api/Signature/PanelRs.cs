using System.Collections.Generic;
using NCLims.Models.Enums;
using NCLims.Models;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace NCLims.Business.NewBatch.Sop.Responses;

public class PanelRs
{
    public int PanelId { get; set; }
    // @validation: Must be unique in the list of PanelRss.
    [Required]
    [StringLength(150)]
    public string Name { get; set; }
    // @validation: Must be unique in the list of PanelRss.
    [Required]
    [StringLength(10)]
    public string? Slug { get; set; }
    public bool SubordinateToPanelGroup { get; set; }
    // Dropdown with nullable choice.   Choices come from SopMaintenanceSelectors.PanelGroups
    public int? PanelGroupId { get; set; }
    public int SignificantDigits { get; set; }
    // Dropdown control.  Choices come from SopMaintenance.DecimalFormatTypes.
    public DecimalFormatType? DecimalFormatType { get; set; }
    // Dropdown control. Choices come from SopMaintenance.PanelTypes
    // @validation: Must be unique in the list of PanelRss.
    [Required]
    [StringLength(150)]
    public Panel.PanelTypes PanelType { get; set; }
    public bool QualitativeFirst { get; set; }
    public bool RequiresMoistureContent { get; set; }
    public bool AllowPartialAnalytes { get; set; }

    #region Copied Into new SamplePanels
   
    [Required]
    [StringLength(150)]
    public string PlantSop { get; set; }
    [Required]
    [StringLength(150)]
    public string NonPlantSop { get; set; }
    [Required]
    public double? ScaleFactor { get; set; }
    [Required]
    [StringLength(150)]
    public string? Units { get; set; }
    [StringLength(150)]
    public string? MeasuredUnits { get; set; }  // Instrument or Raw Result
    [StringLength(150)]
    public string LimitUnits { get; set; } // Allows override of Units
    #endregion

    public double? DefaultExtractionVolumeMl { get; set; }
    public double? DefaultDilution { get; set; }
    // Dropdown control.  Choices come from SopMaintenanceSelectors.InstrumentTypes
    public int? InstrumentTypeId { get; set; }
    public int? CcTestPackageId { get; set; }
    [StringLength(150)]
    public string CcCategoryName { get; set; }
    public int? TestCategoryId { get; set; }
    public int SampleCount { get; set; }

    // Dropdown control.  Choices come from the panel slugs in the list of panels.
    public List<string> ChildPanels { get; set; }

    public static async Task<List<PanelRs>> FetchPanelRss(IQueryable<Panel> query)
    {
        var ret = await query.Select(p => new PanelRs
        {
            Name = p.Name,
            AllowPartialAnalytes = p.AllowPartialAnalytes,
            CcCategoryName = p.CcCategoryName,
            CcTestPackageId = p.CcTestPackageId,
            PanelGroupId = p.PanelGroupId,
            DecimalFormatType = p.DecimalFormatType,
            DefaultDilution = p.DefaultDilution,
            DefaultExtractionVolumeMl = p.DefaultExtractionVolumeMl,
            InstrumentTypeId = p.InstrumentTypeId,
            LimitUnits = p.LimitUnits,
            MeasuredUnits = p.MeasuredUnits,
            PanelId = p.Id,
            SignificantDigits = p.SignificantDigits,
            PanelType = p.PanelType,
            NonPlantSop = p.NonPlantSop,
            PlantSop = p.PlantSop,
            QualitativeFirst = p.QualitativeFirst,
            RequiresMoistureContent = p.RequiresMoistureContent,
            SampleCount = p.SamplePanels.Count,
            ScaleFactor = p.ScaleFactor,
            Slug = p.Slug,
            SubordinateToPanelGroup = p.SubordinateToPanelGroup,
            TestCategoryId = p.TestCategoryId,
            Units = p.Units,
            ChildPanels = p.ChildPanelPanels.Select(cpp => cpp.ChildPanel.Name).ToList()
        }).ToListAsync();
        return ret;
    }
}