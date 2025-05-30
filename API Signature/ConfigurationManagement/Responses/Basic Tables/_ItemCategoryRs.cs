using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using NCLims.Data;
using NCLims.Models;

namespace NCLims.Business.NewBatch.ConfigurationManagement.Responses.Basic_Tables;

public partial class ItemCategoryRs
{
    public static async Task<List<ItemCategoryRs>> FetchItemCategoryRss(IQueryable<ItemCategory> query)
    {
        var ret = await query.Select(ic => new ItemCategoryRs
        {
            ItemCategoryId = ic.Id,
            Name = ic.Name,
            Description = ic.Description,
            ItemTypeId = ic.ItemTypeId,
            SuppressQfQn = ic.SuppressQfQn,
            StateId = ic.StateId,
            CcSampleTypeId = ic.CcSampleTypeId,
            SuppressLimits = ic.SuppressLimits,
            Active = ic.Active
        }).ToListAsync();

        return ret;
    }

    public static ValidationResult Validate(ItemCategoryRs itemCategory, List<ItemCategoryRs> existingItemCategories, int stateId)
    {
        var validator = new ItemCategoryRsValidator(existingItemCategories, stateId);
        var validationResult = validator.Validate(itemCategory);

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

    public static ItemCategory UpsertFromResponse(
        ItemCategoryRs response,
        List<ItemCategory> existingCategories,
        ItemType parentItemType,
        NCLimsContext context)
    {
        if (response == null) throw new ArgumentNullException(nameof(response));
        if (existingCategories == null) throw new ArgumentNullException(nameof(existingCategories));
        if (parentItemType == null) throw new ArgumentNullException(nameof(parentItemType));
        if (context == null) throw new ArgumentNullException(nameof(context));

        ItemCategory itemCategory;

        if (response.ItemCategoryId <= 0)
        {
            // New item category
            itemCategory = new ItemCategory();
            context.ItemCategories.Add(itemCategory);
            parentItemType.ItemCategories.Add(itemCategory); // Establish relationship
        }
        else
        {
            // Find existing item category
            itemCategory = existingCategories.SingleOrDefault(ic => ic.Id == response.ItemCategoryId)
                ?? throw new KeyNotFoundException($"ItemCategory with ID {response.ItemCategoryId} not found");
        }

        // Update properties
        itemCategory.Name = response.Name ?? throw new InvalidOperationException("Name cannot be null");
        itemCategory.Description = response.Description;
        itemCategory.ItemTypeId = parentItemType.Id; // Set from parent
        itemCategory.SuppressQfQn = response.SuppressQfQn;
        itemCategory.StateId = response.StateId;
        itemCategory.CcSampleTypeId = response.CcSampleTypeId;
        itemCategory.SuppressLimits = response.SuppressLimits;
        itemCategory.Active = response.Active;

        return itemCategory;
    }
}

public class ItemCategoryRsValidator : AbstractValidator<ItemCategoryRs>
{
    private readonly List<ItemCategoryRs> _existingItemCategories;
    private readonly int _stateId;

    public ItemCategoryRsValidator()
    {
    }

    public ItemCategoryRsValidator(List<ItemCategoryRs> existingItemCategories, int stateId)
    {
        _existingItemCategories = existingItemCategories;
        _stateId = stateId;

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required")
            .MaximumLength(150).WithMessage("Name cannot exceed 150 characters");

        RuleFor(x => x.Description)
            .MaximumLength(250).WithMessage("Description cannot exceed 250 characters");

        RuleFor(x => x.StateId)
            .Equal(_stateId).WithMessage($"State ID must equal {_stateId}");

        RuleFor(x => x)
            .Must((itemCategory, _) => !HasDuplicateName(itemCategory, _existingItemCategories))
            .WithMessage("An item category with this name already exists for this ItemType");
    }

    private bool HasDuplicateName(ItemCategoryRs itemCategory, IEnumerable<ItemCategoryRs> existingCategories)
    {
        return existingCategories.Any(x =>
            x.Name == itemCategory.Name &&
            x.ItemTypeId == itemCategory.ItemTypeId &&
            x.ItemCategoryId != itemCategory.ItemCategoryId);
    }
}