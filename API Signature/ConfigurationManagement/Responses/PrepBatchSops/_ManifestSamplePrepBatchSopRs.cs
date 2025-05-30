using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FluentValidation;
using NCLims.Data;
using NCLims.Models.NewBatch;

namespace NCLims.Business.NewBatch.ConfigurationManagement.Responses.PrepBatchSops;

public partial class ManifestSamplePrepBatchSopRs
{
    public static ValidationResult Validate(ManifestSamplePrepBatchSopRs manifestSamplePrepBatchSopRs)
    {
        var validator = new ManifestSamplePrepBatchSopRsValidator();
        var validationResult = validator.Validate(manifestSamplePrepBatchSopRs);

        return new ValidationResult
        {
            IsValid = validationResult.IsValid,
            Errors = validationResult.Errors.Select(e => new ValidationError
            {
                PropertyName = e.PropertyName,
                ErrorMessage = e.ErrorMessage
            }).ToList()
        };
    }

    public static async Task UpsertFromResponses(
        List<ManifestSamplePrepBatchSopRs> responses,
        List<ManifestSampleTypePrepBatchSop> existingItems,
        PrepBatchSop prepBatchSop,
        NCLimsContext context)
    {
        if (responses == null) throw new ArgumentNullException(nameof(responses));
        if (existingItems == null) throw new ArgumentNullException(nameof(existingItems));
        if (prepBatchSop == null) throw new ArgumentNullException(nameof(prepBatchSop));
        if (context == null) throw new ArgumentNullException(nameof(context));

        // Remove items that are no longer in the response
        foreach (var existingItem in existingItems)
        {
            if (!responses.Any(r => r.ManifestSamplePrepBatchSopId == existingItem.Id))
            {
                prepBatchSop.ManifestSampleTypePrepBatchSop.Remove(existingItem);
                context.Remove(existingItem);
            }
        }

        // Update or add items from the response
        foreach (var response in responses)
        {
            ManifestSampleTypePrepBatchSop item;

            if (response.ManifestSamplePrepBatchSopId <= 0)
            {
                // New item
                item = new ManifestSampleTypePrepBatchSop();
                prepBatchSop.ManifestSampleTypePrepBatchSop.Add(item);
            }
            else
            {
                // Existing item
                item = existingItems.SingleOrDefault(e => e.Id == response.ManifestSamplePrepBatchSopId)
                    ?? throw new KeyNotFoundException($"ManifestSampleTypePrepBatchSop with ID {response.ManifestSamplePrepBatchSopId} not found");
            }

            // Update properties
            item.ManifestSampleTypeId = response.ManifestSampleTypeId ?? throw new InvalidOperationException("ManifestSampleTypeId cannot be null");
            item.PanelGroupId = response.PanelGroupId ?? throw new InvalidOperationException("PanelGroupId cannot be null");
            item.PrepBatchSopId = prepBatchSop.Id;
            item.PrepBatchSop = prepBatchSop;
            item.EffectiveOn = response.EffectiveDate ?? DateTime.MaxValue;
        }
    }
}

public class ManifestSamplePrepBatchSopRsValidator : AbstractValidator<ManifestSamplePrepBatchSopRs>
{
    public ManifestSamplePrepBatchSopRsValidator()
    {
        RuleFor(x => x.ManifestSampleTypeId)
            .NotNull().WithMessage("Manifest sample type is required")
            .GreaterThan(0).WithMessage("Manifest sample type ID must be greater than 0");

        RuleFor(x => x.PanelGroupId)
            .NotNull().WithMessage("Panel group is required")
            .GreaterThan(0).WithMessage("Panel group ID must be greater than 0");

        RuleFor(x => x.EffectiveDate)
            .NotNull().WithMessage("Effective date is required");
    }
}
