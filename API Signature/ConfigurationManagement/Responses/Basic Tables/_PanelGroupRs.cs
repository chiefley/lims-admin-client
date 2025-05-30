using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using NCLims.Data;
using NCLims.Models;

namespace NCLims.Business.NewBatch.ConfigurationManagement.Responses.Basic_Tables;

public partial class PanelGroupRs
{
    public static async Task<List<PanelGroupRs>> FetchPanelGroupRss(IQueryable<PanelGroup> query)
    {
        var ret = await query.Select(q => new PanelGroupRs
        {
            Name = q.Name,
            LabId = q.LabId,
            Active = q.Active,
            PanelGroupId = q.Id
        }).ToListAsync();

        return ret;
    }

    // Validation method
    public static ValidationResult Validate(PanelGroupRs panelGroup, List<PanelGroupRs> existingPanelGroups, int labId)
    {
        var validator = new PanelGroupRsValidator(existingPanelGroups, labId);
        var validationResult = validator.Validate(panelGroup);

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

    // Upsert method to update or insert panel group
    public static async Task<PanelGroup> UpsertFromResponse(
        PanelGroupRs response,
        List<PanelGroup> existingPanelGroups,
        NCLimsContext context)
    {
        if (response == null) throw new ArgumentNullException(nameof(response));
        if (existingPanelGroups == null) throw new ArgumentNullException(nameof(existingPanelGroups));
        if (context == null) throw new ArgumentNullException(nameof(context));

        PanelGroup panelGroup;

        // Find or create the panel group
        if (response.PanelGroupId <= 0)
        {
            // New panel group
            panelGroup = new PanelGroup();
            context.PanelGroups.Add(panelGroup);
        }
        else
        {
            // Existing panel group
            panelGroup = existingPanelGroups.SingleOrDefault(p => p.Id == response.PanelGroupId)
                ?? throw new KeyNotFoundException($"PanelGroup with ID {response.PanelGroupId} not found");
        }

        // Update the panel group properties
        panelGroup.Name = response.Name ?? throw new InvalidOperationException("Panel group name cannot be null");
        panelGroup.LabId = response.LabId;
        panelGroup.Active = response.Active;

        return panelGroup;
    }
}

// Validator for PanelGroupRs
public class PanelGroupRsValidator : AbstractValidator<PanelGroupRs>
{
    private readonly List<PanelGroupRs> _existingPanelGroups;
    private readonly int _labId;

    public PanelGroupRsValidator()
    {
    }

    public PanelGroupRsValidator(List<PanelGroupRs> existingPanelGroups, int labId)
    {
        _existingPanelGroups = existingPanelGroups;
        _labId = labId;

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required")
            .MaximumLength(150).WithMessage("Name cannot exceed 150 characters");

        RuleFor(x => x.LabId)
            .Equal(_labId).WithMessage($"Lab ID must equal {_labId}");

        RuleFor(x => x)
            .Must((panelGroupRs, _) => !HasDuplicateName(panelGroupRs, _existingPanelGroups))
            .WithMessage("A panel group with this name already exists for this lab");
    }

    private bool HasDuplicateName(PanelGroupRs panelGroup, IEnumerable<PanelGroupRs> existingPanelGroups)
    {
        return existingPanelGroups.Any(x =>
            x.Name == panelGroup.Name &&
            x.LabId == panelGroup.LabId &&
            // Don't flag the item as a duplicate of itself when updating
            x.PanelGroupId != panelGroup.PanelGroupId);
    }
}