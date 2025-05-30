using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FluentValidation;
using NCLims.Data;
using NCLims.Models;

namespace NCLims.Business.NewBatch.ConfigurationManagement.Responses.Clients;

public partial class ClientPricingRs
{
    public static async Task UpsertFromResponse(
        ClientPricingRs response,
        Client client,
        NCLimsContext context)
    {
        if (response == null) throw new ArgumentNullException(nameof(response));
        if (client == null) throw new ArgumentNullException(nameof(client));
        if (context == null) throw new ArgumentNullException(nameof(context));

        ClientPricing clientPricing;
        if (response.ClientPricingId <= 0)
        {
            clientPricing = new ClientPricing();
            client.ClientPricings.Add(clientPricing);
            context.ClientPricings.Add(clientPricing);
        }
        else
        {
            clientPricing = client.ClientPricings.SingleOrDefault(pr => pr.Id == response.ClientPricingId) 
                            ?? throw new KeyNotFoundException($"ClientPricing with ID {response.ClientPricingId} not found.");
        }

        clientPricing.Value = response.Value ?? 0;
        clientPricing.IsPercent = response.IsPercent;
        clientPricing.PanelId = response.PanelId;
    }


    public static async Task DeleteFromResponse(
        List<ClientPricingRs> responses,
        Client client,
        NCLimsContext context)
    {
        foreach (var clientPricing in client.ClientPricings)
        {
            if (responses.All(rs => rs.ClientId != clientPricing.Id))
                client.ClientPricings.Remove(clientPricing);
        }
    }


    public static ValidationResult Validate(ClientPricingRs clientPricingRs,
        List<ClientPricingRs> existingClientPricingRss)
    {
        var validator = new ClientPricingRsValidator(existingClientPricingRss);
        var validationResult = validator.Validate(clientPricingRs);

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

public class ClientPricingRsValidator : AbstractValidator<ClientPricingRs>
{
    public ClientPricingRsValidator()
    {
    }

    public ClientPricingRsValidator(List<ClientPricingRs> existingClientPricingRss)
    {
        RuleFor(x => x)
            .Must((clientPricingRs, _) => !IsUniqueForPanel(clientPricingRs, existingClientPricingRss))
            .WithMessage("Panel slugs must be unique (except for POT).");
    }

    private bool IsUniqueForPanel(ClientPricingRs clientPricingRs, IEnumerable<ClientPricingRs> existingPricingRss)
    {
        return existingPricingRss.Any(x =>
            x.ClientId == clientPricingRs.ClientId &&
            x.PanelId == clientPricingRs.PanelId &&
            !ReferenceEquals(x, clientPricingRs));
    }
}