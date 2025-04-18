using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using NCLims.Models;
using NCLims.Models.Enums;

namespace NCLims.Business.NewBatch.ConfigurationManagement.Responses.Basic_Tables;

public class PanelRs
{
    public int PanelId { get; set; }
    // @validation: Unique Constraint(Name, LabId)
    [Required]
    [StringLength(150)]
    public string Name { get; set; }
    [Required]
    [StringLength(10)]
    public string? Slug { get; set; }
    public bool SubordinateToPanelGroup { get; set; }
    // Dropdown with nullable choice.   Choices come from ConfigurationMaintenanceSelectors.PanelGroups
    public int? PanelGroupId { get; set; }
    public int SignificantDigits { get; set; }
    // Dropdown control.  Choices come from ConfigurationMaintenanceSelectors.DecimalFormatTypes.
    public DecimalFormatType? DecimalFormatType { get; set; }
    // Dropdown control. Choices come from ConfigurationMaintenanceSelectors.PanelTypes
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
    // Dropdown control.  Choices come from ConfigurationMaintenanceSelectors.InstrumentTypes
    public int? InstrumentTypeId { get; set; }
    public int? CcTestPackageId { get; set; }
    [StringLength(150)]
    public string CcCategoryName { get; set; }
    // Dropdown control.   Choices come from ConfigurationManagement.TestCategoryTypes. Nullable. Not required.
    public int? TestCategoryId { get; set; }
    public int SampleCount { get; set; }

    // Lab Context.  No display, no edit.
    public int LabId { get; set; }

    // Defaults to true on new().
    public bool Active { get; set; } = true;

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
            LabId = p.LabId,
            Active = p.Active,
            ChildPanels = p.ChildPanelPanels.Select(cpp => cpp.ChildPanel.Name).ToList()
        }).ToListAsync();
        return ret;
    }
}