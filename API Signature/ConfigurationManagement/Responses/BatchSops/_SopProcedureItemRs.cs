using FluentValidation;
using NCLims.Data;
using NCLims.Models.NewBatch;
using System.Collections.Generic;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace NCLims.Business.NewBatch.ConfigurationManagement.Responses.BatchSops;

public partial class SopProcedureItemRs
{
    public static ValidationResult Validate(SopProcedureItemRs sopProcedureItemRs)
    {
        var validator = new SopProcedureItemRsValidator();
        var validationResult = validator.Validate(sopProcedureItemRs);

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

    public static async Task UpsertFromResponses(
        List<SopProcedureItemRs> responses,
        List<SopProcedureItem> existingItems,
        SopProcedure sopProcedure,
        NCLimsContext context)
    {
        if (responses == null) throw new ArgumentNullException(nameof(responses));
        if (existingItems == null) throw new ArgumentNullException(nameof(existingItems));
        if (sopProcedure == null) throw new ArgumentNullException(nameof(sopProcedure));
        if (context == null) throw new ArgumentNullException(nameof(context));

        // Remove items that are no longer in the response
        foreach (var existingItem in existingItems)
        {
            if (!responses.Any(r => r.SopProcedurItemId == existingItem.Id))
            {
                sopProcedure.SopProcedureItems.Remove(existingItem);
                context.Remove(existingItem);
            }
        }

        // Update or add items from the response
        foreach (var response in responses)
        {
            SopProcedureItem item;

            if (response.SopProcedurItemId <= 0)
            {
                // New item
                item = new SopProcedureItem();
                sopProcedure.SopProcedureItems.Add(item);
                context.Add(item);
            }
            else
            {
                // Existing item
                item = existingItems.SingleOrDefault(i => i.Id == response.SopProcedurItemId)
                    ?? throw new KeyNotFoundException($"SopProcedureItem with ID {response.SopProcedurItemId} not found");
            }

            // Update properties
            item.SopProcedureId = sopProcedure.Id;
            item.SopProcedure = sopProcedure;
            item.Order = response.Order;
            item.ItemNumber = response.ItemNumber;
            item.Text = response.Text;
            item.IndentLevel = response.IndentLevel;
        }
    }
}

public class SopProcedureItemRsValidator : AbstractValidator<SopProcedureItemRs>
{
    public SopProcedureItemRsValidator()
    {
        RuleFor(x => x.ItemNumber)
            .MaximumLength(50).WithMessage("Item number cannot exceed 50 characters");

        RuleFor(x => x.Text)
            .NotEmpty().WithMessage("Text is required")
            .MaximumLength(500).WithMessage("Text cannot exceed 500 characters");
    }
}