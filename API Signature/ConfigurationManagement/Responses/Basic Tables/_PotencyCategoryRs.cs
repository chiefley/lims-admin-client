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

/// <summary>
/// Response class for PotencyCategory entities
/// HARD DELETE IMPLEMENTATION: This entity supports permanent deletion
/// </summary>
public partial class PotencyCategoryRs
{

    /// <summary>
    /// Fetches all PotencyCategory records from the database
    /// </summary>
    /// <param name="query">Query to filter potency categories</param>
    /// <returns>List of PotencyCategoryRs objects</returns>
    public static async Task<List<PotencyCategoryRs>> FetchPotencyCategoryRss(IQueryable<PotencyCategory> query)
    {
        var ret = await query.Select(q => new PotencyCategoryRs
        {
            Name = q.Name,
            Description = q.Description,
            StateId = q.StateId,
            PotencyCategoryId = q.Id
        }).ToListAsync();

        return ret;
    }

    /// <summary>
    /// Deletes PotencyCategory records that aren't present in the responses list
    /// </summary>
    /// <param name="responses">List of PotencyCategoryRs objects to keep</param>
    /// <param name="existingCategories">Existing PotencyCategory entities from database</param>
    /// <param name="context">Database context</param>
    public static void Delete(
        List<PotencyCategoryRs> responses,
        List<PotencyCategory> existingCategories,
        NCLimsContext context)
    {
        foreach (var model in existingCategories)
        {
            var response = responses
                .SingleOrDefault(r => r.PotencyCategoryId == model.Id);

            if (response is null)
                context.PotencyCategories.Remove(model);
        }
    }

    /// <summary>
    /// Updates or inserts PotencyCategory records from the responses
    /// </summary>
    /// <param name="response">The PotencyCategoryRs object to upsert</param>
    /// <param name="existingCategories">Existing PotencyCategory entities from database</param>
    /// <param name="context">Database context</param>
    /// <returns>The updated or created PotencyCategory entity</returns>
    public static async Task<PotencyCategory> UpsertFromResponse(
        PotencyCategoryRs response,
        List<PotencyCategory> existingCategories,
        NCLimsContext context)
    {
        if (response == null) throw new ArgumentNullException(nameof(response));
        if (existingCategories == null) throw new ArgumentNullException(nameof(existingCategories));
        if (context == null) throw new ArgumentNullException(nameof(context));

        PotencyCategory potencyCategory;

        if (response.PotencyCategoryId <= 0)
        {
            // New category
            potencyCategory = new PotencyCategory();
            context.PotencyCategories.Add(potencyCategory);
        }
        else
        {
            // Find existing category
            potencyCategory = existingCategories.SingleOrDefault(p => p.Id == response.PotencyCategoryId)
                ?? throw new KeyNotFoundException($"PotencyCategory with ID {response.PotencyCategoryId} not found");
        }

        // Update properties
        potencyCategory.Name = response.Name;
        potencyCategory.Description = response.Description;
        potencyCategory.StateId = response.StateId;

        return potencyCategory;
    }

    /// <summary>
    /// Validates PotencyCategory record against business rules
    /// </summary>
    /// <param name="potencyCategory">The PotencyCategoryRs to validate</param>
    /// <param name="existingCategories">Existing PotencyCategoryRs for uniqueness checks</param>
    /// <param name="stateId">StateId for validation</param>
    /// <returns>ValidationResult object with validation results</returns>
    public static ValidationResult Validate(
        PotencyCategoryRs potencyCategory,
        List<PotencyCategoryRs> existingCategories,
        int stateId)
    {
        var validator = new PotencyCategoryRsValidator(existingCategories, stateId);
        var validationResult = validator.Validate(potencyCategory);

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

    /// <summary>
    /// Batch upsert multiple PotencyCategory records
    /// </summary>
    /// <param name="responses">List of PotencyCategoryRs objects to upsert</param>
    /// <param name="existingCategories">Existing PotencyCategory entities from database</param>
    /// <param name="context">Database context</param>
    /// <returns>Task representing the asynchronous operation</returns>
    public static async Task UpsertFromResponses(
        List<PotencyCategoryRs> responses,
        List<PotencyCategory> existingCategories,
        NCLimsContext context)
    {
        if (responses == null) throw new ArgumentNullException(nameof(responses));
        if (existingCategories == null) throw new ArgumentNullException(nameof(existingCategories));
        if (context == null) throw new ArgumentNullException(nameof(context));

        // Delete records not present in responses
        Delete(responses, existingCategories, context);

        // Upsert each response
        foreach (var response in responses)
        {
            await UpsertFromResponse(response, existingCategories, context);
        }
    }
}

/// <summary>
/// Validator for PotencyCategoryRs
/// </summary>
public class PotencyCategoryRsValidator : AbstractValidator<PotencyCategoryRs>
{
    private readonly List<PotencyCategoryRs> _existingCategories;
    private readonly int _stateId;

    public PotencyCategoryRsValidator()
    {
        // Default constructor for FluentValidation
    }

    public PotencyCategoryRsValidator(List<PotencyCategoryRs> existingCategories, int stateId)
    {
        _existingCategories = existingCategories;
        _stateId = stateId;

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required")
            .MaximumLength(150).WithMessage("Name cannot exceed 150 characters");

        RuleFor(x => x.Description)
            .MaximumLength(250).WithMessage("Description cannot exceed 250 characters");

        RuleFor(x => x.StateId)
            .Equal(_stateId).WithMessage($"State ID must equal {_stateId}");

        RuleFor(x => x)
            .Must((category, _) => !HasDuplicateName(category, _existingCategories))
            .WithMessage("A potency category with this name already exists for this state");
    }

    /// <summary>
    /// Checks if there's another potency category with the same name in the same state
    /// </summary>
    private bool HasDuplicateName(PotencyCategoryRs category, IEnumerable<PotencyCategoryRs> existingCategories)
    {
        return existingCategories.Any(x =>
            x.Name == category.Name &&
            x.StateId == category.StateId &&
            x.PotencyCategoryId != category.PotencyCategoryId);
    }
}