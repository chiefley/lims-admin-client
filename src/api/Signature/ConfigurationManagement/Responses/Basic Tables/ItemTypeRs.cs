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

namespace NCLims.Business.NewBatch.ConfigurationManagement.Responses.Basic_Tables;

public class ItemTypeRs
{
    // Primary Key.  No display, no edit.
    public int ItemTypeId { get; set; }
    [Required]
    [StringLength(250)]
    public string Name { get; set; }
    // Part of Lab Context. Set to default of 2 on new()
    [Required]
    public int? StateId { get; set; } = 2;
    [Required]
    public bool? ReportPercent { get; set; }
    // Set to true on new().
    public bool Active { get; set; } = true;

    [JsonPropertyOrder(100)]
    public List<ItemCategoryRs> ItemCategories { get; set; } = [];

    public static async Task<List<ItemTypeRs>> FetchItemTypeRss(IQueryable<ItemType> query)
    {
        var ret = await query.Select(it => new ItemTypeRs
        {
            ItemTypeId = it.Id,
            Name = it.Name,
            StateId = it.StateId,
            ReportPercent = it.ReportPercent,
            Active = it.Active,
            ItemCategories = it.ItemCategories.Select(ic => new ItemCategoryRs
            {
                ItemCategoryId = ic.Id,
                Name = ic.Name,
                CcSampleTypeId = ic.CcSampleTypeId,
                Description = ic.Description,
                StateId = it.StateId,
                SuppressLimits = ic.SuppressLimits,
                SuppressQfQn = ic.SuppressQfQn,
                ItemTypeId = it.Id,
                Active = ic.Active
            }).ToList()
        }).ToListAsync();

        return ret;
    }

    public static ValidationResult Validate(ItemTypeRs itemType, List<ItemTypeRs> existingItemTypes, int stateId)
    {
        var validator = new ItemTypeRsValidator(existingItemTypes, stateId);
        var validationResult = validator.Validate(itemType);

        var result = new ValidationResult
        {
            IsValid = validationResult.IsValid,
            Errors = validationResult.Errors.Select(e => new ValidationError
            {
                PropertyName = e.PropertyName,
                ErrorMessage = e.ErrorMessage
            }).ToList()
        };

        // Validate each item category
        if (itemType.ItemCategories != null)
        {
            foreach (var itemCategory in itemType.ItemCategories)
            {
                // Ensure state ID is consistent with parent
                itemCategory.StateId = stateId;

                var categoryResult = ItemCategoryRs.Validate(itemCategory, itemType.ItemCategories, stateId);
                if (!categoryResult.IsValid)
                {
                    result.IsValid = false;
                    result.Errors.AddRange(categoryResult.Errors);
                }
            }
        }

        return result;
    }

    public static async Task<ItemType> UpsertFromResponse(
        ItemTypeRs response,
        List<ItemType> existingItemTypes,
        NCLimsContext context)
    {
        if (response == null) throw new ArgumentNullException(nameof(response));
        if (existingItemTypes == null) throw new ArgumentNullException(nameof(existingItemTypes));
        if (context == null) throw new ArgumentNullException(nameof(context));

        ItemType itemType;

        if (response.ItemTypeId <= 0)
        {
            // New item type
            itemType = new ItemType();
            context.ItemTypes.Add(itemType);
        }
        else
        {
            // Find existing item type
            itemType = existingItemTypes.SingleOrDefault(it => it.Id == response.ItemTypeId)
                ?? throw new KeyNotFoundException($"ItemType with ID {response.ItemTypeId} not found");
        }

        // Update properties
        itemType.Name = response.Name;
        itemType.StateId = response.StateId ?? 2; // Default to state ID 2 if not provided
        itemType.ReportPercent = response.ReportPercent ?? false;
        itemType.Active = response.Active;

        // Initialize the child collection if necessary
        itemType.ItemCategories ??= new List<ItemCategory>();

        // Process item categories
        if (response.ItemCategories != null && response.ItemCategories.Any())
        {
            // Get all existing categories for this item type
            var existingCategories = itemType.ItemCategories.ToList();

            // Track which categories we've processed to identify deleted categories
            var processedCategoryIds = new HashSet<int>();

            // Process each category in the response
            foreach (var categoryResponse in response.ItemCategories)
            {
                // Make sure the category has the correct references
                categoryResponse.ItemTypeId = itemType.Id;
                categoryResponse.StateId = itemType.StateId; // Ensure consistent state ID

                // Update or create the category
                var category = ItemCategoryRs.UpsertFromResponse(
                    categoryResponse,
                    existingCategories,
                    itemType,
                    context);

                // Record that we've processed this category
                if (category.Id > 0)
                {
                    processedCategoryIds.Add(category.Id);
                }
            }

            // Handle soft deletion by setting Active = false for unprocessed categories
            foreach (var existingCategory in existingCategories)
            {
                if (!processedCategoryIds.Contains(existingCategory.Id))
                {
                    existingCategory.Active = false;
                }
            }
        }

        return itemType;
    }
}

public class ItemTypeRsValidator : AbstractValidator<ItemTypeRs>
{
    private readonly List<ItemTypeRs> _existingItemTypes;
    private readonly int _stateId;

    public ItemTypeRsValidator()
    {
    }

    public ItemTypeRsValidator(List<ItemTypeRs> existingItemTypes, int stateId)
    {
        _existingItemTypes = existingItemTypes;
        _stateId = stateId;

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required")
            .MaximumLength(250).WithMessage("Name cannot exceed 250 characters");

        RuleFor(x => x.StateId)
            .Equal(_stateId).WithMessage($"State ID must equal {_stateId}");

        RuleFor(x => x.ReportPercent)
            .NotNull().WithMessage("ReportPercent is required");

        RuleFor(x => x)
            .Must((itemType, _) => !HasDuplicateName(itemType, _existingItemTypes))
            .WithMessage("An item type with this name already exists");
    }

    private bool HasDuplicateName(ItemTypeRs itemType, IEnumerable<ItemTypeRs> existingTypes)
    {
        return existingTypes.Any(x =>
            x.Name == itemType.Name &&
            x.ItemTypeId != itemType.ItemTypeId);
    }
}