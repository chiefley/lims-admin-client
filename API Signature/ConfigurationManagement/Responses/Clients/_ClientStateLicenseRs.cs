using FluentValidation;
using Microsoft.EntityFrameworkCore;
using NCLims.Data;
using NCLims.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace NCLims.Business.NewBatch.ConfigurationManagement.Responses.Clients;

public partial class ClientStateLicenseRs
{

    // Validation method
    public static ValidationResult Validate(ClientStateLicenseRs response, int clientId, NCLimsContext context)
    {
        var validator = new ClientStateLicenseRsValidator(clientId, context);
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
    public static async Task<ClientStateLicense> UpsertFromResponse(
        ClientStateLicenseRs response,
        List<ClientStateLicense> existingLicenses,
        Client client,
        NCLimsContext context)
    {
        ClientStateLicense license;

        if (response.ClientStateLicenseId <= 0)
        {
            // New client state license
            license = new ClientStateLicense();
            client.ClientLicenses.Add(license);
            context.ClientStateLicenses.Add(license);
        }
        else
        {
            // Find existing client state license
            license = existingLicenses.SingleOrDefault(l => l.Id == response.ClientStateLicenseId)
                ?? throw new KeyNotFoundException($"ClientStateLicense with ID {response.ClientStateLicenseId} not found");
        }

        // Update properties
        license.Name = response.Name ?? throw new InvalidOperationException("Name cannot be null");
        license.LicenseNumber = response.LicenseNumber;
        license.ClientLicenseTypeId = response.ClientLicenseTypeId;
        license.CCLicenseId = response.CcLicenseId;
        license.Active = response.Active;
        license.Client = client;
        license.ClientId = client.Id;

        return license;
    }

    // Batch upsert method for handling collections
    public static async Task UpsertFromResponses(
        List<ClientStateLicenseRs> responses,
        List<ClientStateLicense> existingLicenses,
        Client client,
        NCLimsContext context)
    {
        if (responses == null || !responses.Any()) return;

        foreach (var response in responses)
        {
            await UpsertFromResponse(response, existingLicenses, client, context);
        }

        // Handle deletions (or inactivations)
        // For any existing license that isn't in the response list, set Active = false
        var responseIds = responses.Select(r => r.ClientStateLicenseId).Where(id => id > 0).ToHashSet();
        foreach (var existingLicense in existingLicenses)
        {
            if (!responseIds.Contains(existingLicense.Id))
            {
                existingLicense.Active = false;
            }
        }
    }
}

public class ClientStateLicenseRsValidator : AbstractValidator<ClientStateLicenseRs>
{
    private readonly NCLimsContext _context;
    private readonly int _clientId;

    public ClientStateLicenseRsValidator()
    {
    }

    public ClientStateLicenseRsValidator(int clientId, NCLimsContext context)
    {
        _context = context;
        _clientId = clientId;

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required")
            .MaximumLength(150).WithMessage("Name cannot exceed 150 characters");

        RuleFor(x => x.LicenseNumber)
            .NotEmpty().WithMessage("License Number is required")
            .MaximumLength(150).WithMessage("License Number cannot exceed 150 characters")
            .MustAsync(BeUniqueLicenseNumber).WithMessage("License Number must be unique");

        RuleFor(x => x.ClientLicenseTypeId)
            .NotEmpty().WithMessage("Client License Type is required")
            .MustAsync(BeValidClientLicenseType).WithMessage("Selected Client License Type does not exist or is inactive");
    }

    private async Task<bool> BeUniqueLicenseNumber(ClientStateLicenseRs model, string licenseNumber, CancellationToken cancellationToken)
    {
        if (string.IsNullOrEmpty(licenseNumber)) return true;

        // Check if there's another license with the same license number (excluding this one if it's an update)
        var exists = await _context.ClientStateLicenses
            .Where(c => c.LicenseNumber == licenseNumber && c.Id != model.ClientStateLicenseId)
            .AnyAsync(cancellationToken);

        return !exists;
    }

    private async Task<bool> BeValidClientLicenseType(int licenseTypeId, CancellationToken cancellationToken)
    {
        return await _context.ClientLicenseTypes
            .Where(t => t.Id == licenseTypeId && t.Active)
            .AnyAsync(cancellationToken);
    }
}