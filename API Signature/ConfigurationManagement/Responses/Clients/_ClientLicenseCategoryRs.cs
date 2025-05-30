using FluentValidation;
using NCLims.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using NCLims.Models;

namespace NCLims.Business.NewBatch.ConfigurationManagement.Responses.Clients;

public partial class ClientLicenseCategoryRs
{
    public static async Task<List<ClientLicenseCategoryRs>> FetchClientLicenseCategoryRss(
        IQueryable<ClientLicenseCategory> query)
    {
        var ret = await query.Select(q => new ClientLicenseCategoryRs
        {
            Name = q.Name,
            Active = q.Active,
            ClientLicenseCategoryId = q.Id,
            Description = q.Description
        }).ToListAsync();

        return ret;
    }

    public static ValidationResult Validate(ClientLicenseCategoryRs category,
        List<ClientLicenseCategoryRs> existingCategories)
    {
        var validator = new ClientLicenseCategoryRsValidator(existingCategories);
        var validationResult = validator.Validate(category);

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

    public static async Task<ClientLicenseCategory> UpsertFromResponse(
        ClientLicenseCategoryRs response,
        List<ClientLicenseCategory> existingCategories,
        NCLimsContext context)
    {
        if (response == null) throw new ArgumentNullException(nameof(response));
        if (existingCategories == null) throw new ArgumentNullException(nameof(existingCategories));
        if (context == null) throw new ArgumentNullException(nameof(context));

        ClientLicenseCategory clientLicenseCategory;

        if (response.ClientLicenseCategoryId <= 0)
        {
            clientLicenseCategory = new ClientLicenseCategory();
            context.ClientLicenseCategories.Add(clientLicenseCategory);
        }
        else
        {
            clientLicenseCategory = existingCategories.SingleOrDefault(cc =>
                                          cc.Id == response.ClientLicenseCategoryId)
                                      ?? throw new KeyNotFoundException(
                                          $"ClientLicenseCategory with Id {response.ClientLicenseCategoryId} not found");
        }

        clientLicenseCategory.Name = response.Name;
        clientLicenseCategory.Description = response.Description;
        clientLicenseCategory.Active = response.Active;
        return clientLicenseCategory;
    }
}


public class ClientLicenseCategoryRsValidator : AbstractValidator<ClientLicenseCategoryRs>
{
    private readonly List<ClientLicenseCategoryRs>? _categories;

    public ClientLicenseCategoryRsValidator()
    {
    }

    public ClientLicenseCategoryRsValidator(List<ClientLicenseCategoryRs> categories)
    {
        _categories = categories ?? throw new ArgumentNullException(nameof(categories));

        RuleFor(x => x.Name)
            .NotNull().WithMessage("Name cannot be null.")
            .NotEmpty().WithMessage("Name cannot be Empty.")
            .MaximumLength(150).WithMessage("Name cannot exceed 150 characters.");

        RuleFor(x => x.Description)
            .MaximumLength(250).WithMessage("Description cannot exceed 150 characters.");

        RuleFor(x => x)
            .Must(IsNameUnique).WithMessage("Name must be unique.");
    }

    public bool IsNameUnique(ClientLicenseCategoryRs category)
    {
        if (category == null) throw new ArgumentNullException(nameof(category));
        return _categories!.Any(x =>
            x.Name == category.Name &&
            // Don't flag the item as a duplicate of itself when updating
            // For new items without IDs this won't matter
            !ReferenceEquals(x, category));
    }

}