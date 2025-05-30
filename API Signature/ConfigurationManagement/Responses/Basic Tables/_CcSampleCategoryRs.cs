using NCLims.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using NCLims.Data;
using FluentValidation;
using System;

namespace NCLims.Business.NewBatch.ConfigurationManagement.Responses.Basic_Tables;

public partial class CcSampleCategoryRs
{
    public static async Task<List<CcSampleCategoryRs>> FetchCcSampleCategoryRss(IQueryable<CcSampleCategory> query)
    {
        var ret = await query.Select(ccs => new CcSampleCategoryRs
        {
            Name = ccs.Name,
            CcSampleCategoryId = ccs.CcId,
            DefaultCcSampleProductionMethodId = ccs.DefaultCcSampleProductionMethodId,
            CcSampleTypeRss = ccs.SampleTypes.Select(cct => new CcSampleTypeRs
            {
                CcSampleTypeId = cct.CcId,
                CategoryId = ccs.CcId,
                Name = cct.Name
            }).ToList()
        }).ToListAsync();
        return ret;
    }

    /// <summary>
    /// Deletes CcSampleCategory records that aren't present in the responses list
    /// </summary>
    public static void Delete(
        List<CcSampleCategoryRs> responses,
        List<CcSampleCategory> existingItems,
        NCLimsContext context)
    {
        foreach (var model in existingItems)
        {
            var response = responses
                .SingleOrDefault(r => r.CcSampleCategoryId == model.CcId);

            if (response is null)
            {
                // If this model isn't in the responses, delete it and all its children
                var childModels = model.SampleTypes.ToList();
                foreach (var child in childModels)
                {
                    context.CCSampleTypes.Remove(child);
                }
                context.CcSampleCategories.Remove(model);
            }
            else
            {
                // Process child items (CcSampleTypeRs)
                CcSampleTypeRs.Delete(response.CcSampleTypeRss, model.SampleTypes.ToList(), context);
            }
        }
    }

    /// <summary>
    /// Updates or inserts CcSampleCategory records from the responses
    /// </summary>
    public static async Task<CcSampleCategory> UpsertFromResponse(
        CcSampleCategoryRs response,
        List<CcSampleCategory> existingItems,
        NCLimsContext context)
    {
        if (response == null) throw new ArgumentNullException(nameof(response));
        if (existingItems == null) throw new ArgumentNullException(nameof(existingItems));
        if (context == null) throw new ArgumentNullException(nameof(context));

        CcSampleCategory category;

        if (response.CcSampleCategoryId <= 0)
        {
            // New category
            category = new CcSampleCategory();
            context.CcSampleCategories.Add(category);
        }
        else
        {
            // Find existing category
            category = existingItems.SingleOrDefault(m => m.CcId == response.CcSampleCategoryId)
                ?? throw new KeyNotFoundException($"CcSampleCategory with ID {response.CcSampleCategoryId} not found");
        }

        // Update properties
        category.Name = response.Name;
        category.DefaultCcSampleProductionMethodId = response.DefaultCcSampleProductionMethodId ?? 0;

        // Process child items (CcSampleTypeRs)
        if (response.CcSampleTypeRss != null && response.CcSampleTypeRss.Any())
        {
            // Initialize the child collection if necessary
            category.SampleTypes ??= new List<CCSampleType>();

            foreach (var childResponse in response.CcSampleTypeRss)
            {
                await CcSampleTypeRs.UpsertFromResponse(childResponse, category.SampleTypes.ToList(), category, context);
            }
        }

        return category;
    }

    /// <summary>
    /// Validate CcSampleCategory record against business rules
    /// </summary>
    public static ValidationResult Validate(CcSampleCategoryRs categoryRs, List<CcSampleCategoryRs> existingItems)
    {
        var validator = new CcSampleCategoryRsValidator(existingItems);
        var validationResult = validator.Validate(categoryRs);

        var result = new ValidationResult
        {
            IsValid = validationResult.IsValid,
            Errors = validationResult.Errors.Select(e => new ValidationError
            {
                PropertyName = e.PropertyName,
                ErrorMessage = e.ErrorMessage
            }).ToList()
        };

        // Also validate all child items
        if (categoryRs.CcSampleTypeRss != null && categoryRs.CcSampleTypeRss.Any())
        {
            foreach (var child in categoryRs.CcSampleTypeRss)
            {
                var childResult = CcSampleTypeRs.Validate(child, categoryRs.CcSampleTypeRss);
                if (!childResult.IsValid)
                {
                    result.IsValid = false;
                    result.Errors.AddRange(childResult.Errors);
                }
            }
        }

        return result;
    }
}

/// <summary>
/// Validator for CcSampleCategoryRs
/// </summary>
public class CcSampleCategoryRsValidator : AbstractValidator<CcSampleCategoryRs>
{
    private readonly List<CcSampleCategoryRs> _existingItems;

    public CcSampleCategoryRsValidator()
    {
    }

    public CcSampleCategoryRsValidator(List<CcSampleCategoryRs> existingItems)
    {
        _existingItems = existingItems;

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required")
            .MaximumLength(50).WithMessage("Name cannot exceed 50 characters");

        RuleFor(x => x.DefaultCcSampleProductionMethodId)
            .NotNull().WithMessage("Default CC Sample Production Method ID is required");

        // Enforce uniqueness of Name
        RuleFor(x => x)
            .Must((item, _) => !HasDuplicateName(item, _existingItems))
            .WithMessage("The name must be unique");
    }

    /// <summary>
    /// Check if there's another category with the same name
    /// </summary>
    private bool HasDuplicateName(CcSampleCategoryRs item, IEnumerable<CcSampleCategoryRs> existingItems)
    {
        return existingItems.Any(x =>
            x.Name == item.Name &&
            // Don't flag the item as a duplicate of itself when updating
            x.CcSampleCategoryId != item.CcSampleCategoryId);
    }
}