using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FluentValidation;
using NCLims.Data;
using NCLims.Models;

namespace NCLims.Business.NewBatch.ConfigurationManagement.Responses.Basic_Tables;

public partial class CcSampleTypeRs
{
    /// <summary>
    /// Deletes CCSampleType records that aren't present in the responses list
    /// </summary>
    public static void Delete(
        List<CcSampleTypeRs> responses,
        List<CCSampleType> existingItems,
        NCLimsContext context)
    {
        foreach (var model in existingItems)
        {
            var response = responses
                .SingleOrDefault(r => r.CcSampleTypeId == model.CcId);

            if (response is null)
            {
                // If this model isn't in the responses, delete it
                context.CCSampleTypes.Remove(model);
            }
        }
    }

    /// <summary>
    /// Updates or inserts CCSampleType records from the responses
    /// </summary>
    public static async Task<CCSampleType> UpsertFromResponse(
        CcSampleTypeRs response,
        List<CCSampleType> existingItems,
        CcSampleCategory parentCategory,
        NCLimsContext context)
    {
        if (response == null) throw new ArgumentNullException(nameof(response));
        if (existingItems == null) throw new ArgumentNullException(nameof(existingItems));
        if (parentCategory == null) throw new ArgumentNullException(nameof(parentCategory));
        if (context == null) throw new ArgumentNullException(nameof(context));

        CCSampleType sampleType;

        if (response.CcSampleTypeId <= 0)
        {
            // New sample type
            sampleType = new CCSampleType();

            // Set up the parent-child relationship properly
            sampleType.SampleCategory = parentCategory;
            parentCategory.SampleTypes.Add(sampleType);

            // Add to the context
            context.CCSampleTypes.Add(sampleType);
        }
        else
        {
            // Find existing sample type
            sampleType = existingItems.SingleOrDefault(m => m.CcId == response.CcSampleTypeId)
                ?? throw new KeyNotFoundException($"CCSampleType with ID {response.CcSampleTypeId} not found");

            // Make sure the parent-child relationship is consistent
            sampleType.SampleCategory = parentCategory;
            if (!parentCategory.SampleTypes.Contains(sampleType))
            {
                parentCategory.SampleTypes.Add(sampleType);
            }
        }

        // Update properties
        sampleType.Name = response.Name;
        sampleType.CcSampleCategoryId = parentCategory.CcId;

        return sampleType;
    }

    /// <summary>
    /// Validate CCSampleType record against business rules
    /// </summary>
    public static ValidationResult Validate(CcSampleTypeRs sampleTypeRs, List<CcSampleTypeRs> existingItems)
    {
        var validator = new CcSampleTypeRsValidator(existingItems);
        var validationResult = validator.Validate(sampleTypeRs);

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
}

/// <summary>
/// Validator for CcSampleTypeRs
/// </summary>
public class CcSampleTypeRsValidator : AbstractValidator<CcSampleTypeRs>
{
    private readonly List<CcSampleTypeRs> _existingItems;

    public CcSampleTypeRsValidator()
    {
    }

    public CcSampleTypeRsValidator(List<CcSampleTypeRs> existingItems)
    {
        _existingItems = existingItems;

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required")
            .MaximumLength(150).WithMessage("Name cannot exceed 150 characters");

        RuleFor(x => x.CategoryId)
            .GreaterThan(0).WithMessage("Category ID must be greater than 0");

        // Enforce uniqueness of Name within the same category
        RuleFor(x => x)
            .Must((item, _) => !HasDuplicateNameInCategory(item, _existingItems))
            .WithMessage("The name must be unique within the category");
    }

    /// <summary>
    /// Check if there's another sample type with the same name in the same category
    /// </summary>
    private bool HasDuplicateNameInCategory(CcSampleTypeRs item, IEnumerable<CcSampleTypeRs> existingItems)
    {
        return existingItems.Any(x =>
            x.Name == item.Name &&
            x.CategoryId == item.CategoryId &&
            // Don't flag the item as a duplicate of itself when updating
            x.CcSampleTypeId != item.CcSampleTypeId);
    }

}