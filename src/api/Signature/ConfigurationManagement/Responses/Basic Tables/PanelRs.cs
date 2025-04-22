using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using NCLims.Data;
using NCLims.Models;
using NCLims.Models.Enums;

namespace NCLims.Business.NewBatch.ConfigurationManagement.Responses.Basic_Tables;

public class PanelRs
{
    // Primary Key, no display.
    public int PanelId { get; set; }

    // @validation:  Must be unique.
    [Required]
    [StringLength(150)]
    public string Name { get; set; }

    [Required]
    [StringLength(10)]
    public string Slug { get; set; }

    public bool SubordinateToPanelGroup { get; set; }

    // Dropdown with nullable choice. Choices come from ConfigurationMaintenanceSelectors.PanelGroups
    public int? PanelGroupId { get; set; }

    public int SignificantDigits { get; set; }

    // Dropdown control. Choices come from ConfigurationMaintenanceSelectors.DecimalFormatTypes.
    public DecimalFormatType DecimalFormatType { get; set; }

    // Dropdown control. Choices come from ConfigurationMaintenanceSelectors.PanelTypes
    // @validation: Must be unique in the list of PanelRss.
    [Required]
    public string PanelType { get; set; }

    public bool QualitativeFirst { get; set; }

    public bool RequiresMoistureContent { get; set; }

    public bool AllowPartialAnalytes { get; set; }

    #region Copied Into new SamplePanels
    [Required]
    [StringLength(150)]
    public string PlantSop { get; set; }

    [StringLength(150)]
    public string NonPlantSop { get; set; }

    [Required]
    public double? ScaleFactor { get; set; }

    [StringLength(150)]
    public string Units { get; set; }

    [StringLength(150)]
    public string MeasuredUnits { get; set; }  // Instrument or Raw Result

    [StringLength(150)]
    public string LimitUnits { get; set; } // Allows override of Units
    #endregion

    public double? DefaultExtractionVolumeMl { get; set; }
    public double? DefaultDilution { get; set; }

    // Dropdown control. Choices come from ConfigurationMaintenanceSelectors.InstrumentTypes
    public int? InstrumentTypeId { get; set; }

    public int? CcTestPackageId { get; set; }

    [StringLength(150)]
    public string CcCategoryName { get; set; }

    // Dropdown control. Choices come from ConfigurationManagement.TestCategoryTypes. Nullable. Not required.
    public int? TestCategoryId { get; set; }

    public int SampleCount { get; set; }

    // Lab Context. No display, no edit.
    public int LabId { get; set; }

    // Defaults to true on new().
    public bool Active { get; set; } = true;

    [JsonPropertyOrder(100)]
    // List of child panel slugs
    public List<string> ChildPanels { get; set; } = new();


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
            PanelType = p.PanelType.ToString(),
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
            ChildPanels = p.ChildPanelPanels.Select(cpp => cpp.ChildPanel.Slug).ToList(),
        }).ToListAsync();

        return ret;
    }

    // Validation method
    public static ValidationResult Validate(PanelRs panel, List<PanelRs> existingPanelRss, int labId)
    {
        var validator = new PanelRsValidator(existingPanelRss, labId);
        var validationResult = validator.Validate(panel);

        var result = new ValidationResult
        {
            IsValid = validationResult.IsValid,
            Errors = validationResult.Errors.Select(e => new ValidationError
            {
                PropertyName = e.PropertyName,
                ErrorMessage = e.ErrorMessage
            }).ToList()
        };
        return result;
    }

    // Upsert method to update or insert panel and its children
    public static async Task<Panel> UpsertFromResponse(
        PanelRs response,
        List<Panel> existingPanels,
        NCLimsContext context)
    {
        if (response == null) throw new ArgumentNullException(nameof(response));
        if (existingPanels == null) throw new ArgumentNullException(nameof(existingPanels));
        if (context == null) throw new ArgumentNullException(nameof(context));

        Panel panel;

        // Find or create the panel
        if (response.PanelId <= 0)
        {
            // New panel
            panel = new Panel();
            context.Panels.Add(panel);
        }
        else
        {
            // Existing panel
            panel = existingPanels.SingleOrDefault(p => p.Id == response.PanelId)
                ?? throw new KeyNotFoundException($"Panel with ID {response.PanelId} not found");
        }

        // Update the panel properties
        panel.Name = response.Name;
        panel.Slug = response.Slug;
        panel.SubordinateToPanelGroup = response.SubordinateToPanelGroup;
        panel.PanelGroupId = response.PanelGroupId;
        panel.SignificantDigits = response.SignificantDigits;
        panel.DecimalFormatType = response.DecimalFormatType;
        panel.PanelType = Enum.Parse<Panel.PanelTypes>(response.PanelType);
        panel.QualitativeFirst = response.QualitativeFirst;
        panel.RequiresMoistureContent = response.RequiresMoistureContent;
        panel.AllowPartialAnalytes = response.AllowPartialAnalytes;
        panel.PlantSop = response.PlantSop;
        panel.NonPlantSop = response.NonPlantSop;
        panel.ScaleFactor = response.ScaleFactor ?? 1.0;
        panel.Units = response.Units;
        panel.MeasuredUnits = response.MeasuredUnits;
        panel.LimitUnits = response.LimitUnits;
        panel.DefaultExtractionVolumeMl = response.DefaultExtractionVolumeMl;
        panel.DefaultDilution = response.DefaultDilution;
        panel.InstrumentTypeId = response.InstrumentTypeId;
        panel.CcTestPackageId = response.CcTestPackageId;
        panel.CcCategoryName = response.CcCategoryName;
        panel.TestCategoryId = response.TestCategoryId;
        panel.LabId = response.LabId;
        panel.Active = response.Active;

        panel.ChildPanelPanels ??= new List<PanelPanel>();


        // Handle child panels - this requires querying all panels by slug
        await UpsertChildPanels(
            response.ChildPanels,
            panel.ChildPanelPanels.ToList(),
            panel,
            context);

        return panel;
    }

    // Special method to handle child panels from slugs
    private static async Task UpsertChildPanels(
        List<string> childPanelSlugs,
        List<PanelPanel> existingPanelPanels,
        Panel parentPanel,
        NCLimsContext context)
    {
        if (childPanelSlugs == null || !childPanelSlugs.Any()) return;

        // First, get all the panel IDs for the slugs
        var childPanels = await context.Panels
            .Where(p => childPanelSlugs.Contains(p.Slug) && p.LabId == parentPanel.LabId)
            .ToListAsync();

        // Make sure all slugs were found
        var missingPanelSlugs = childPanelSlugs.Except(childPanels.Select(p => p.Slug)).ToList();
        if (missingPanelSlugs.Any())
        {
            throw new InvalidOperationException(
                $"Could not find panels with the following slugs: {string.Join(", ", missingPanelSlugs)}");
        }

        // Remove any existing relationships that aren't in the new list
        var panelIdsToKeep = childPanels.Select(p => p.Id).ToList();
        var panelPanelsToRemove = existingPanelPanels
            .Where(pp => !panelIdsToKeep.Contains(pp.ChildPanelId))
            .ToList();

        foreach (var panelPanel in panelPanelsToRemove)
        {
            context.PanelPanels.Remove(panelPanel);
        }

        // Add new relationships
        foreach (var childPanel in childPanels)
        {
            if (!existingPanelPanels.Any(pp => pp.ChildPanelId == childPanel.Id))
            {
                var panelPanel = new PanelPanel
                {
                    ParentPanelId = parentPanel.Id,
                    ParentPanel = parentPanel,
                    ChildPanelId = childPanel.Id,
                    ChildPanel = childPanel
                };
                parentPanel.ChildPanelPanels.Add(panelPanel);
                context.PanelPanels.Add(panelPanel);
            }
        }
    }
}

// Validator for PanelRs
public class PanelRsValidator : AbstractValidator<PanelRs>
{
    private readonly List<PanelRs> _existingPanelRss;
    private readonly int _labId;

    public PanelRsValidator()
    {
    }

    public PanelRsValidator(List<PanelRs>existingPanelRss, int labId)
    {
        _existingPanelRss = existingPanelRss;
        _labId = labId;

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required")
            .MaximumLength(150).WithMessage("Name cannot exceed 150 characters");

        RuleFor(x => x.Slug)
            .NotEmpty().WithMessage("Slug is required")
            .MaximumLength(10).WithMessage("Slug cannot exceed 10 characters");

        RuleFor(x => x.SignificantDigits)
            .GreaterThanOrEqualTo(0).WithMessage("Significant digits must be 0 or greater");

        RuleFor(x => x.PlantSop)
            .MaximumLength(150).WithMessage("Plant SOP cannot exceed 150 characters");

        RuleFor(x => x.NonPlantSop)
            .MaximumLength(150).WithMessage("Non-Plant SOP cannot exceed 150 characters");

        RuleFor(x => x.LimitUnits)
            .MaximumLength(150).WithMessage("Limit Units cannot exceed 150 characters");

        RuleFor(x => x.Units)
            .MaximumLength(150).WithMessage("Units cannot exceed 150 characters");

        RuleFor(x => x.MeasuredUnits)
            .MaximumLength(150).WithMessage("Non-Plant cannot exceed 150 characters");

        RuleFor(x => x.ScaleFactor)
            .NotNull().WithMessage("Scale factor is required");

        RuleFor(x => x.LabId)
            .Equal(_labId).WithMessage($"Lab ID must equal {_labId}");

        RuleFor(x => x)
            .Must((panelRs, _) => !HasUniqueName(panelRs, _existingPanelRss))
            .WithMessage("Panel names must be unique.");

        RuleFor(x => x)
            .Must((panelRs, _) => !HasUniqueSlug(panelRs, _existingPanelRss))
            .WithMessage("Panel slugs must be unique (except for POT).");
    }

    private bool HasUniqueName(PanelRs panelRs, IEnumerable<PanelRs> existingPanelRss)
    {
        return existingPanelRss.Any(x =>
            x.Name == panelRs.Name &&
            // Don't flag the item as a duplicate of itself when updating
            // For new items without IDs this won't matter
            !ReferenceEquals(x, panelRs));
    }

    private bool HasUniqueSlug(PanelRs panelRs, IEnumerable<PanelRs> existingPanelRss)
    {
        return existingPanelRss.Any(x =>
            x.Name == panelRs.Slug &&
            x.Name != "POT" && // Sadly there are two POT panels
            // Don't flag the item as a duplicate of itself when updating
            // For new items without IDs this won't matter
            !ReferenceEquals(x, panelRs));
    }
}


