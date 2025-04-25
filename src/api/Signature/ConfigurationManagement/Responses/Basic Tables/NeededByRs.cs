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

public class NeededByRs
{
    // Primary Key. No display, no edit.
    public int NeededById { get; set; }

    // Dropdown control. Choices come from ConfigurationMaintenanceSelectors.TestCategoryTypes.
    [Required]
    public int? TestCategoryId { get; set; }

    public bool? MicroSelected { get; set; }

    // DropDown control. Choices come from ConfigurationMaintenanceSelectors.DayOfWeeks
    [Required]
    [StringLength(10)]
    public string? ReceivedDow { get; set; }

    // DropDown control. Choices come from ConfigurationMaintenanceSelectors.DayOfWeeks
    [Required]
    [StringLength(10)]
    public string? NeededByDow { get; set; }

    // Format must be H:mm or HH:mm.
    [Required]
    [StringLength(5)]
    public string? NeededByTime { get; set; }

    // Lab Context. Set to Lab Context LabId on new()
    public int LabId { get; set; }

    public static async Task<List<NeededByRs>> FetchNeededByRss(IQueryable<NeededBy> query)
    {
        var ret = await query.Select(q => new NeededByRs
        {
            LabId = q.LabId,
            MicroSelected = q.MicroSelected,
            NeededByDow = q.NeededByDow.ToString(),
            NeededById = q.Id,
            NeededByTime = q.NeededByTime,
            ReceivedDow = q.ReceivedDow.ToString(),
            TestCategoryId = q.TestCategoryId
        }).ToListAsync();
        return ret;
    }

    // Validation method
    public static ValidationResult Validate(NeededByRs neededBy, List<NeededByRs> existingNeededByRss, int labId)
    {
        var validator = new NeededByRsValidator(existingNeededByRss, labId);
        var validationResult = validator.Validate(neededBy);

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

    // Upsert method to update or insert NeededBy records
    public static async Task<NeededBy> UpsertFromResponse(
        NeededByRs response,
        List<NeededBy> existingNeededBys,
        NCLimsContext context)
    {
        if (response == null) throw new ArgumentNullException(nameof(response));
        if (existingNeededBys == null) throw new ArgumentNullException(nameof(existingNeededBys));
        if (context == null) throw new ArgumentNullException(nameof(context));

        NeededBy neededBy;

        // Find or create the NeededBy entity
        if (response.NeededById <= 0)
        {
            // New NeededBy
            neededBy = new NeededBy();
            context.NeededBy.Add(neededBy);
        }
        else
        {
            // Existing NeededBy
            neededBy = existingNeededBys.SingleOrDefault(n => n.Id == response.NeededById)
                ?? throw new KeyNotFoundException($"NeededBy with ID {response.NeededById} not found");
        }

        // Update the NeededBy properties
        neededBy.LabId = response.LabId;
        neededBy.TestCategoryId = response.TestCategoryId.Value;
        neededBy.MicroSelected = response.MicroSelected;

        // Parse the DayOfWeek enums from the string values - will throw exception if null or invalid
        neededBy.ReceivedDow = Enum.Parse<DayOfWeek>(response.ReceivedDow!);
        neededBy.NeededByDow = Enum.Parse<DayOfWeek>(response.NeededByDow!);
        neededBy.NeededByTime = response.NeededByTime;

        return neededBy;
    }

    // Helper method to upsert multiple NeededBy records
    public static async Task UpsertFromResponses(
        List<NeededByRs> responses,
        List<NeededBy> existingNeededBys,
        NCLimsContext context)
    {
        if (responses == null) throw new ArgumentNullException(nameof(responses));

        foreach (var response in responses)
        {
            await UpsertFromResponse(response, existingNeededBys, context);
        }
    }
}

// Validator for NeededByRs
public class NeededByRsValidator : AbstractValidator<NeededByRs>
{
    private readonly List<NeededByRs> _existingNeededByRss;
    private readonly int _labId;

    public NeededByRsValidator()
    {
    }

    public NeededByRsValidator(List<NeededByRs> existingNeededByRss, int labId)
    {
        _existingNeededByRss = existingNeededByRss;
        _labId = labId;

        RuleFor(x => x.TestCategoryId)
            .NotNull().WithMessage("Test Category is required");

        RuleFor(x => x.ReceivedDow)
            .NotEmpty().WithMessage("Received Day of Week is required")
            .MaximumLength(10).WithMessage("Received Day of Week cannot exceed 10 characters")
            .Must(BeValidDayOfWeek).WithMessage("Please enter a valid Day of Week");

        RuleFor(x => x.NeededByDow)
            .NotEmpty().WithMessage("Needed By Day of Week is required")
            .MaximumLength(10).WithMessage("Needed By Day of Week cannot exceed 10 characters")
            .Must(BeValidDayOfWeek).WithMessage("Please enter a valid Day of Week");

        RuleFor(x => x.NeededByTime)
            .NotEmpty().WithMessage("Needed By Time is required")
            .MaximumLength(5).WithMessage("Needed By Time cannot exceed 5 characters")
            .Matches(@"^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$").WithMessage("Needed By Time must be in format H:mm or HH:mm");

        RuleFor(x => x.LabId)
            .Equal(_labId).WithMessage($"Lab ID must equal {_labId}");

        RuleFor(x => x)
            .Must((neededBy, _) => !HasDuplicateCombination(neededBy, _existingNeededByRss))
            .WithMessage("The combination of Test Category, Received Day of Week, and Needed By Day of Week must be unique.");
    }

    private bool BeValidDayOfWeek(string dow)
    {
        if (string.IsNullOrEmpty(dow)) return false;

        return Enum.TryParse<DayOfWeek>(dow, out _);
    }

    private bool HasDuplicateCombination(NeededByRs neededBy, IEnumerable<NeededByRs> existingNeededByRss)
    {
        bool isDuplicate = existingNeededByRss.Any(x =>
            x.TestCategoryId == neededBy.TestCategoryId &&
            x.ReceivedDow == neededBy.ReceivedDow &&
            x.NeededByDow == neededBy.NeededByDow &&
            x.NeededById != neededBy.NeededById && // Don't compare with self
            x.LabId == neededBy.LabId);

        return isDuplicate;
    }
}