using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using NCLims.Data;
using NCLims.Models;

namespace NCLims.Business.NewBatch.ConfigurationManagement.Responses.Clients;

public partial class ClientLicenseTypeRs
{
    public static async Task<List<ClientLicenseTypeRs>> FetchClientLicenseTypeRss(IQueryable<ClientLicenseType> query)
    {
        var ret = await query.Select(q => new ClientLicenseTypeRs
        {
           Active = q.Active,
           ClientLicenseCategoryId =  q.ClientLicenseCategoryId,
           ClientLicenseTypeId = q.Id,
           Description = q.Description,
           LicenseFormat = q.LicenseFormat,
           Name = q.Name,
           StateId = q.StateId,
        }).ToListAsync();

        return ret;
    }
     public static ValidationResult Validate(ClientLicenseTypeRs response, int stateId, NCLimsContext context)
    {
        var validator = new ClientLicenseTypeRsValidator(stateId, context);
        var validationResult = validator.Validate(response);

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

    // Upsert method
    public static async Task<ClientLicenseType> UpsertFromResponse(
        ClientLicenseTypeRs response,
        List<ClientLicenseType> existingTypes,
        NCLimsContext context)
    {
        ClientLicenseType licenseType;

        if (response.ClientLicenseTypeId <= 0)
        {
            // New client license type
            licenseType = new ClientLicenseType();
            context.ClientLicenseTypes.Add(licenseType);
        }
        else
        {
            // Find existing client license type
            licenseType = existingTypes.SingleOrDefault(t => t.Id == response.ClientLicenseTypeId)
                          ?? throw new KeyNotFoundException($"ClientLicenseType with ID {response.ClientLicenseTypeId} not found");
        }

        // Update properties
        licenseType.Name = response.Name ?? throw new InvalidOperationException("Name cannot be null");
        licenseType.Description = response.Description;
        licenseType.LicenseFormat = response.LicenseFormat;
        licenseType.StateId = response.StateId;
        licenseType.ClientLicenseCategoryId = response.ClientLicenseCategoryId ?? throw new InvalidOperationException("ClientLicenseCategoryId cannot be null");
        licenseType.Active = response.Active;

        return licenseType;
    }
}

// Validator class
public class ClientLicenseTypeRsValidator : AbstractValidator<ClientLicenseTypeRs>
{
    private readonly NCLimsContext _context;
    private readonly int _stateId;

    public ClientLicenseTypeRsValidator()
    {
    }

    public ClientLicenseTypeRsValidator(int stateId, NCLimsContext context)
    {
        _context = context;
        _stateId = stateId;

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required")
            .MaximumLength(150).WithMessage("Name cannot exceed 150 characters")
            .MustAsync(BeUniqueName).WithMessage("Name must be unique within the state");

        RuleFor(x => x.Description)
            .MaximumLength(250).WithMessage("Description cannot exceed 250 characters");

        RuleFor(x => x.LicenseFormat)
            .MaximumLength(150).WithMessage("License Format cannot exceed 150 characters");

        RuleFor(x => x.StateId)
            .Equal(_stateId).WithMessage($"State ID must equal {_stateId}");

        RuleFor(x => x.ClientLicenseCategoryId)
            .NotNull().WithMessage("Client License Category is required")
            .MustAsync(BeValidClientLicenseCategory).WithMessage("Selected Client License Category does not exist or is inactive");
    }

    private async Task<bool> BeUniqueName(ClientLicenseTypeRs model, string name, CancellationToken cancellationToken)
    {
        if (string.IsNullOrEmpty(name)) return true;

        // Check if there's another license type with the same name in the same state (excluding this one if it's an update)
        var exists = await _context.ClientLicenseTypes
            .Where(c => c.Name == name && c.StateId == model.StateId && c.Id != model.ClientLicenseTypeId)
            .AnyAsync(cancellationToken);

        return !exists;
    }

    private async Task<bool> BeValidClientLicenseCategory(int? categoryId, CancellationToken cancellationToken)
    {
        if (categoryId == null) return false;

        return await _context.ClientLicenseCategories
            .Where(c => c.Id == categoryId && c.Active)
            .AnyAsync(cancellationToken);
    }
}