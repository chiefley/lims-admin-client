using NCLims.Models.NewBatch;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using NCLims.Data;

namespace NCLims.Business.NewBatch.ConfigurationManagement.Responses.Basic_Tables;

// This is a deletable table.  Rows can be hard-deleted in the UI.
public class NavMenuItemRs
{
    // Primary key.  No display, no edit.
    public int NavMenuItemId { get; set; }
    // Foreign Key to parent.  No display, no edit.
    public int? ParentNavMenuItemId { get; set; }

    // Combobox control.  Choices come from ConfigurationMaintenanceSelectors.NavMenuKeys.
    [Required]
    public string? MenuKey { get; set; }

    // @validation:  Unique constraint(Name, LabId)
    [Required]
    [StringLength(50)]
    public string? Name { get; set; }

    // @validation:  Unique constraint(Slug, LabId)
    [Required]
    [StringLength(50)]
    public string? Slug { get; set; }
    [StringLength(250)]
    public string? Url { get; set; }
    [StringLength(250)]
    public string? UrlArgs { get; set; }


    [StringLength(500)]
    public string? Icon { get; set; }
    [Required]
    public int? Order { get; set; }

    [StringLength(250)]
    public string? SpecialProcessingMethod { get; set; }
    [StringLength(500)]
    public string? SpecialProcessingArgs { get; set; }

    [Required]
    [StringLength(250)]
    public string? PageTitle { get; set; }

    // @validation:  Unique constraint(Slug, LabId)
    // @validation:  Unique constraint(Name, LabId)
    // Set to lab contexts LabId on new()
    [Required]
    public int LabId { get; set; }

    [JsonPropertyOrder(100)]
    public List<NavMenuItemRs> ChildItems { get; set; } = [];

    public static async Task<List<NavMenuItemRs>> FetchNavItems(IQueryable<NavMenuItem> query)
    {
        var flatItems = await query
            .Select(q => new NavMenuItemRs()
            {
                Name = q.Name,
                Icon = q.Icon,
                MenuKey = q.MenuKey.ToString(),
                Order = q.Order,
                SpecialProcessingMethod = q.SpecialProcessingMethod,
                SpecialProcessingArgs = q.SpecialProcessingArgs,
                Url = q.Url,
                UrlArgs = q.UrlArgs,
                PageTitle = q.PageTitle,
                LabId = q.LabId,
                Slug = q.Slug,
                NavMenuItemId = q.Id,
                ParentNavMenuItemId = q.ParentItemId
            }).ToListAsync();

        var hierarchy = flatItems
            .Where(fi => fi.ParentNavMenuItemId is null)
            .ToList();

        // Assemble the items in their hierarchy.
        foreach (var fi in flatItems)
        {
            var childItems = flatItems
                .Where(it => it.ParentNavMenuItemId == fi.NavMenuItemId)
                .ToList();

            fi.ChildItems = childItems;
        }
        return hierarchy;
    }

    /// <summary>
    /// Deletes NavMenuItem records that aren't present in the responses list
    /// </summary>
    public static void Delete(
        List<NavMenuItemRs> responses,
        List<NavMenuItem> existingItems,
        NCLimsContext context)
    {
        // This implementation is recursive to handle the hierarchical nature of NavMenuItems
        Delete(responses, existingItems, context, null);
    }

    /// <summary>
    /// Recursive helper method to delete NavMenuItems
    /// </summary>
    private static void Delete(
        List<NavMenuItemRs> responses,
        List<NavMenuItem> existingItems,
        NCLimsContext context,
        int? parentId)
    {
        // Get all existing items with this parent
        var existingWithParent = existingItems.Where(e => e.ParentItemId == parentId).ToList();

        // Get all response items with this parent
        var responsesWithParent = responses.Where(r => r.ParentNavMenuItemId == parentId).ToList();

        // Find items to delete (those that exist in DB but not in the responses)
        foreach (var model in existingWithParent)
        {
            var response = responsesWithParent
                .SingleOrDefault(r => r.NavMenuItemId == model.Id);

            if (response is null)
            {
                // This model isn't in the responses, so delete it and all its children
                var childModels = existingItems.Where(e => e.ParentItemId == model.Id).ToList();
                foreach (var child in childModels)
                {
                    context.NavMenuItem.Remove(child);
                }
                context.NavMenuItem.Remove(model);
            }
            else
            {
                // Process children of this item recursively
                Delete(response.ChildItems, existingItems, context, model.Id);
            }
        }
    }

    /// <summary>
    /// Updates or inserts NavMenuItem records from the responses
    /// </summary>
    public static async Task<NavMenuItem> UpsertFromResponse(
        NavMenuItemRs response,
        List<NavMenuItem> existingItems,
        NCLimsContext context)
    {
        if (response == null) throw new ArgumentNullException(nameof(response));
        if (existingItems == null) throw new ArgumentNullException(nameof(existingItems));
        if (context == null) throw new ArgumentNullException(nameof(context));

        NavMenuItem navMenuItem;

        if (response.NavMenuItemId <= 0)
        {
            // New menu item
            navMenuItem = new NavMenuItem();
            context.NavMenuItem.Add(navMenuItem);
        }
        else
        {
            // Find existing menu item
            navMenuItem = existingItems.SingleOrDefault(m => m.Id == response.NavMenuItemId)
                ?? throw new KeyNotFoundException($"NavMenuItem with ID {response.NavMenuItemId} not found");
        }

        // Update properties
        navMenuItem.Name = response.Name ?? string.Empty;
        navMenuItem.Slug = response.Slug ?? string.Empty;
        navMenuItem.LabId = response.LabId;
        navMenuItem.Icon = response.Icon;
        navMenuItem.MenuKey = response.MenuKey != null 
            ? Enum.Parse<NavMenuKey>(response.MenuKey) 
            : throw new InvalidOperationException("Null Menu key");
        navMenuItem.Order = response.Order ?? 0;
        navMenuItem.PageTitle = response.PageTitle;
        navMenuItem.SpecialProcessingArgs = response.SpecialProcessingArgs;
        navMenuItem.SpecialProcessingMethod = response.SpecialProcessingMethod;
        navMenuItem.Url = response.Url;
        navMenuItem.UrlArgs = response.UrlArgs;

        // Handle the parent relationship - but not by ID
        if (response.ParentNavMenuItemId.HasValue && response.ParentNavMenuItemId.Value > 0)
        {
            // This is referencing an existing parent
            var parentEntity = existingItems.SingleOrDefault(e => e.Id == response.ParentNavMenuItemId.Value);
            if (parentEntity != null)
            {
                navMenuItem.ParentItemId = parentEntity.Id;
            }
        }
        // Parent ID is null - this is a root item
        else if (!response.ParentNavMenuItemId.HasValue)
        {
            navMenuItem.ParentItemId = null;
        }
        // We'll handle negative parent IDs (new items) in a special way below

        // Process child items if any
        if (response.ChildItems != null && response.ChildItems.Any())
        {
            // Initialize the child collection if necessary
            navMenuItem.ChildItems ??= new List<NavMenuItem>();

            foreach (var childResponse in response.ChildItems)
            {
                NavMenuItem childItem;

                if (childResponse.NavMenuItemId <= 0)
                {
                    // This is a new child item
                    childItem = new NavMenuItem();

                    // Set up the parent-child relationship properly
                    childItem.ParentItem = navMenuItem;
                    navMenuItem.ChildItems.Add(childItem);

                    // Add to the context
                    context.NavMenuItem.Add(childItem);
                }
                else
                {
                    // Existing child item
                    childItem = existingItems.SingleOrDefault(e => e.Id == childResponse.NavMenuItemId)
                        ?? throw new KeyNotFoundException($"Child NavMenuItem with ID {childResponse.NavMenuItemId} not found");

                    // Make sure the parent-child relationship is consistent
                    childItem.ParentItem = navMenuItem;
                    if (!navMenuItem.ChildItems.Contains(childItem))
                    {
                        navMenuItem.ChildItems.Add(childItem);
                    }
                }

                // Update child item properties
                childItem.Name = childResponse.Name ?? string.Empty;
                childItem.Slug = childResponse.Slug ?? string.Empty;
                childItem.LabId = childResponse.LabId;
                childItem.Icon = childResponse.Icon;
                childItem.MenuKey = Enum.Parse<NavMenuKey>(childResponse.MenuKey!);
                childItem.Order = childResponse.Order ?? 0;
                childItem.PageTitle = childResponse.PageTitle;
                childItem.SpecialProcessingArgs = childResponse.SpecialProcessingArgs;
                childItem.SpecialProcessingMethod = childResponse.SpecialProcessingMethod;
                childItem.Url = childResponse.Url;
                childItem.UrlArgs = childResponse.UrlArgs;

                // Process nested children recursively
                if (childResponse.ChildItems != null && childResponse.ChildItems.Any())
                {
                    // Create a new response that has this child as the parent
                    var nestedResponse = new NavMenuItemRs
                    {
                        NavMenuItemId = childItem.Id, // If it's a new item, Id will be 0, which is fine
                        Name = childItem.Name,
                        Slug = childItem.Slug,
                        LabId = childItem.LabId,
                        Icon = childItem.Icon,
                        MenuKey = childItem.MenuKey.ToString(),
                        Order = childItem.Order,
                        PageTitle = childItem.PageTitle,
                        SpecialProcessingArgs = childItem.SpecialProcessingArgs,
                        SpecialProcessingMethod = childItem.SpecialProcessingMethod,
                        Url = childItem.Url,
                        UrlArgs = childItem.UrlArgs,
                        ChildItems = childResponse.ChildItems,
                        // No need to set ParentNavMenuItemId as we're working with the entity relationships
                    };

                    await UpsertFromResponse(nestedResponse, existingItems, context);
                }
            }
        }

        return navMenuItem;
    }

    /// <summary>
    /// Validate NavMenuItem record against business rules
    /// </summary>
    public static ValidationResult Validate(NavMenuItemRs navMenuItemRs, List<NavMenuItemRs> existingItems, int labId)
    {
        var validator = new NavMenuItemRsValidator(existingItems, labId);
        var validationResult = validator.Validate(navMenuItemRs);

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
        if (navMenuItemRs.ChildItems != null && navMenuItemRs.ChildItems.Any())
        {
            foreach (var child in navMenuItemRs.ChildItems)
            {
                var childResult = Validate(child, existingItems, labId);
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
/// Validator for NavMenuItemRs
/// </summary>
public class NavMenuItemRsValidator : AbstractValidator<NavMenuItemRs>
{
    private readonly List<NavMenuItemRs> _existingItems;
    private readonly int _labId;

    public NavMenuItemRsValidator()
    {
    }

    public NavMenuItemRsValidator(List<NavMenuItemRs> existingItems, int labId)
    {
        _existingItems = existingItems;
        _labId = labId;

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required")
            .MaximumLength(50).WithMessage("Name cannot exceed 50 characters");

        RuleFor(x => x.Slug)
            .NotEmpty().WithMessage("Slug is required")
            .MaximumLength(50).WithMessage("Slug cannot exceed 50 characters");

        RuleFor(x => x.PageTitle)
            .NotEmpty().WithMessage("Page title is required")
            .MaximumLength(250).WithMessage("Page title cannot exceed 250 characters");

        RuleFor(x => x.MenuKey)
            .NotEmpty().WithMessage("Menu key is required");

        RuleFor(x => x.Order)
            .NotNull().WithMessage("Order is required");

        RuleFor(x => x.LabId)
            .Equal(_labId).WithMessage($"Lab ID must equal {_labId}");

        RuleFor(x => x.Url)
            .MaximumLength(250).WithMessage("URL cannot exceed 250 characters");

        RuleFor(x => x.UrlArgs)
            .MaximumLength(250).WithMessage("URL arguments cannot exceed 250 characters");

        RuleFor(x => x.Icon)
            .MaximumLength(500).WithMessage("Icon cannot exceed 500 characters");

        RuleFor(x => x.SpecialProcessingMethod)
            .MaximumLength(250).WithMessage("Special processing method cannot exceed 250 characters");

        RuleFor(x => x.SpecialProcessingArgs)
            .MaximumLength(500).WithMessage("Special processing arguments cannot exceed 500 characters");

        // Enforce uniqueness of Name within a lab
        RuleFor(x => x)
            .Must((item, _) => !HasDuplicateName(item, _existingItems))
            .WithMessage("The name must be unique within a lab");

        // Enforce uniqueness of Slug within a lab
        RuleFor(x => x)
            .Must((item, _) => !HasDuplicateSlug(item, _existingItems))
            .WithMessage("The slug must be unique within a lab");
    }

    /// <summary>
    /// Check if there's another menu item with the same name in the lab
    /// </summary>
    private bool HasDuplicateName(NavMenuItemRs item, IEnumerable<NavMenuItemRs> existingItems)
    {
        return existingItems.Any(x =>
            x.Name == item.Name &&
            x.LabId == item.LabId &&
            // Don't flag the item as a duplicate of itself when updating
            x.NavMenuItemId != item.NavMenuItemId);
    }

    /// <summary>
    /// Check if there's another menu item with the same slug in the lab
    /// </summary>
    private bool HasDuplicateSlug(NavMenuItemRs item, IEnumerable<NavMenuItemRs> existingItems)
    {
        return existingItems.Any(x =>
            x.Slug == item.Slug &&
            x.LabId == item.LabId &&
            // Don't flag the item as a duplicate of itself when updating
            x.NavMenuItemId != item.NavMenuItemId);
    }
}