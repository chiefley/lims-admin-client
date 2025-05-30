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

public partial class ClientRs
{
    // Fetch method for retrieving clients
    public static async Task<List<ClientRs>> FetchClientRss(IQueryable<Client> query)
    {
        return await query.Select(c => new ClientRs
        {
            ClientId = c.Id,
            Name = c.Name,
            DbaName = c.DbaName,
            Address1 = c.Address1,
            Address2 = c.Address2,
            CcClientId = c.CcClientId,
            CcPrimaryAddressId = c.CcPrimaryAddressId,
            City = c.City,
            ContactFirstName = c.ContactFirstName,
            ContactLastName = c.ContactLastName,
            Email = c.Email,
            Phone = c.Phone,
            PostalCode = c.PostalCode,
            LimsClientApiID = c.LimsClientApiID,
            LimsClientApiKey = c.LimsClientApiKey,
            Active = c.Active,
            ClientStateLicenseRss = c.ClientLicenses.Select(l => new ClientStateLicenseRs
            {
                ClientStateLicenseId = l.Id,
                Name = l.Name,
                LicenseNumber = l.LicenseNumber,
                ClientLicenseTypeId = l.ClientLicenseTypeId,
                CcLicenseId = l.CCLicenseId,
                Active = l.Active
            }).ToList(),
            ClientPricingRss = c.ClientPricings.Select(cp => new ClientPricingRs
            {
                Value = cp.Value,
                ClientId = cp.ClientId,
                ClientPricingId = cp.Id,
                IsPercent = cp.IsPercent,
                PanelId = cp.PanelId
            }).ToList()
        }).ToListAsync();
    }

    // Validation method
    public static ValidationResult Validate(ClientRs response, List<ClientRs> existingResponses, int labId,  NCLimsContext context)
    {
        var validator = new ClientRsValidator(existingResponses);
        var validationResult = validator.Validate(response);

        // Validate child collections
        if (response.ClientStateLicenseRss != null && response.ClientStateLicenseRss.Any())
        {
            foreach (var license in response.ClientStateLicenseRss)
            {
                var licenseValidation = ClientStateLicenseRs.Validate(license, response.ClientId, context);
                if (!licenseValidation.IsValid)
                {
                    foreach (var error in licenseValidation.Errors)
                    {
                        validationResult.Errors.Add(new FluentValidation.Results.ValidationFailure(
                            $"ClientStateLicenseRss[{response.ClientStateLicenseRss.IndexOf(license)}].{error.PropertyName}",
                            error.ErrorMessage));
                    }
                }
            }
        }

        if (response.ClientPricingRss != null && response.ClientPricingRss.Any())
        {
            foreach (var pricing in response.ClientPricingRss)
            {
                var pricingValidation = ClientPricingRs.Validate(pricing, response.ClientPricingRss);
                if (!pricingValidation.IsValid)
                {
                    foreach (var error in pricingValidation.Errors)
                    {
                        validationResult.Errors.Add(new FluentValidation.Results.ValidationFailure(
                            $"ClientPricingRss[{response.ClientPricingRss.IndexOf(pricing)}].{error.PropertyName}",
                            error.ErrorMessage));
                    }
                }
            }
        }


        return new ValidationResult
        {
            IsValid = validationResult.Errors.Any(),
            Errors = validationResult.Errors.Select(e => new ValidationError
            {
                PropertyName = e.PropertyName,
                ErrorMessage = e.ErrorMessage
            }).ToList()
        };
    }

    // Upsert method
    public static async Task<Client> UpsertFromResponse(
        ClientRs response,
        List<Client> existingClients,
        NCLimsContext context,
        int labId)
    {
        Client client;

        if (response.ClientId <= 0)
        {
            // New client
            client = new Client
            {
                LabId = labId
            };
            context.Clients.Add(client);
        }
        else
        {
            // Find existing client
            client = existingClients.SingleOrDefault(c => c.Id == response.ClientId)
                ?? throw new KeyNotFoundException($"Client with ID {response.ClientId} not found");
        }

        // Update properties
        client.Name = response.Name ?? throw new InvalidOperationException("Name cannot be null");
        client.DbaName = response.DbaName;
        client.Address1 = response.Address1;
        client.Address2 = response.Address2;
        client.CcClientId = response.CcClientId;
        client.CcPrimaryAddressId = response.CcPrimaryAddressId;
        client.City = response.City;
        client.ContactFirstName = response.ContactFirstName;
        client.ContactLastName = response.ContactLastName;
        client.Email = response.Email;
        client.Phone = response.Phone;
        client.PostalCode = response.PostalCode;
        client.LimsClientApiID = response.LimsClientApiID;
        client.LimsClientApiKey = response.LimsClientApiKey;
        client.Active = response.Active;

        // Process child collections
        await ClientStateLicenseRs.UpsertFromResponses(
            response.ClientStateLicenseRss,
            client.ClientLicenses.ToList(),
            client,
            context);

        return client;
    }
}

public class ClientRsValidator : AbstractValidator<ClientRs>
{
    private readonly List<ClientRs> _existingClientRss;

    public ClientRsValidator()
    {
    }

    public ClientRsValidator(List<ClientRs> existingClientRss)
    {
        _existingClientRss = existingClientRss;

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required")
            .Must((clientRs, _) => !BeUniqueName(_existingClientRss, clientRs))
            .WithMessage("Client name must be unique.");

        RuleFor(x => x.DbaName)
            .MaximumLength(150).WithMessage("DBA Name cannot exceed 150 characters")
            .Must((clientRs, _) => !BeUniqueDbaName(_existingClientRss, clientRs))
            .WithMessage("Client dba name must be unique.");

        RuleFor(x => x.Address1)
            .MaximumLength(150).WithMessage("Address Line 1 cannot exceed 150 characters");

        RuleFor(x => x.Address2)
            .MaximumLength(150).WithMessage("Address Line 2 cannot exceed 150 characters");

        RuleFor(x => x.City)
            .MaximumLength(150).WithMessage("City cannot exceed 150 characters");

        RuleFor(x => x.ContactFirstName)
            .MaximumLength(150).WithMessage("Contact First Name cannot exceed 150 characters");

        RuleFor(x => x.ContactLastName)
            .MaximumLength(150).WithMessage("Contact Last Name cannot exceed 150 characters");

        RuleFor(x => x.Email)
            .MaximumLength(150).WithMessage("Email cannot exceed 150 characters")
            .EmailAddress().When(x => !string.IsNullOrEmpty(x.Email))
            .WithMessage("Email must be a valid email address");

        RuleFor(x => x.PostalCode)
            .MaximumLength(10).WithMessage("Postal Code cannot exceed 10 characters");

        RuleFor(x => x.LimsClientApiKey)
            .MaximumLength(150).WithMessage("LIMS Client API Key cannot exceed 150 characters");
    }

    private bool BeUniqueName(List<ClientRs> existingClientRss, ClientRs clientRs)
    {
        return existingClientRss.Any(x =>
            x.Name.Equals(clientRs.Name, StringComparison.InvariantCultureIgnoreCase)
            && !ReferenceEquals(x, clientRs));
    }

    private bool BeUniqueDbaName(List<ClientRs> existingClientRss, ClientRs clientRs)
    {
        return existingClientRss.Any(x =>
            x.DbaName.Equals(clientRs.DbaName, StringComparison.InvariantCultureIgnoreCase)
            && !ReferenceEquals(x, clientRs));
    }
}


