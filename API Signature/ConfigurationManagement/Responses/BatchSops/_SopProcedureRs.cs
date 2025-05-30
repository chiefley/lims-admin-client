using FluentValidation;
using NCLims.Business.NewBatch.ConfigurationManagement.Responses.BatchSops;
using NCLims.Business.NewBatch.ConfigurationManagement;
using NCLims.Data;
using NCLims.Models.NewBatch;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace NCLims.Business.NewBatch.ConfigurationManagement.Responses.BatchSops;

public partial class SopProcedureRs
{
    public static ValidationResult Validate(SopProcedureRs sopProcedureRs)
    {
        var validator = new SopProcedureRsValidator();
        var validationResult = validator.Validate(sopProcedureRs);

        var result = new ValidationResult
        {
            IsValid = validationResult.IsValid,
            Errors = validationResult.Errors.Select(e => new ValidationError
            {
                PropertyName = e.PropertyName,
                ErrorMessage = e.ErrorMessage
            }).ToList()
        };

        // Validate procedure items
        foreach (var procedureItem in sopProcedureRs.ProcedureItems)
        {
            var itemResult = SopProcedureItemRs.Validate(procedureItem);
            if (!itemResult.IsValid)
            {
                result.IsValid = false;
                result.Errors.AddRange(itemResult.Errors);
            }
        }

        return result;
    }

    public static async Task UpsertFromResponses(
        List<SopProcedureRs> responses,
        List<SopProcedure> existingProcedures,
        BatchSop batchSop,
        NCLimsContext context)
    {
        if (responses == null) throw new ArgumentNullException(nameof(responses));
        if (existingProcedures == null) throw new ArgumentNullException(nameof(existingProcedures));
        if (batchSop == null) throw new ArgumentNullException(nameof(batchSop));
        if (context == null) throw new ArgumentNullException(nameof(context));

        // Remove procedures that are no longer in the response
        foreach (var existingProcedure in existingProcedures)
        {
            if (!responses.Any(r => r.SopProcedureId == existingProcedure.Id))
            {
                batchSop.SopProcedures.Remove(existingProcedure);
                context.Remove(existingProcedure);
            }
        }

        // Update or add procedures from the response
        foreach (var response in responses)
        {
            SopProcedure procedure;

            if (response.SopProcedureId <= 0)
            {
                // New procedure
                procedure = new SopProcedure();
                batchSop.SopProcedures.Add(procedure);
                context.Add(procedure);
            }
            else
            {
                // Existing procedure
                procedure = existingProcedures.SingleOrDefault(p => p.Id == response.SopProcedureId)
                    ?? throw new KeyNotFoundException($"SopProcedure with ID {response.SopProcedureId} not found");
            }

            // Update properties
            procedure.BatchSopId = batchSop.Id;
            procedure.BatchSop = batchSop;
            procedure.Section = response.Section;
            procedure.ProcedureName = response.ProcedureName;

            // Initialize or retrieve collection
            procedure.SopProcedureItems ??= new List<SopProcedureItem>();
            var existingItems = procedure.SopProcedureItems.ToList();

            // Handle procedure items
            await SopProcedureItemRs.UpsertFromResponses(
                response.ProcedureItems,
                existingItems,
                procedure,
                context);
        }
    }

}



public class SopProcedureRsValidator : AbstractValidator<SopProcedureRs>
{
    public SopProcedureRsValidator()
    {
        RuleFor(x => x.Section)
            .NotEmpty().WithMessage("Section is required")
            .MaximumLength(50).WithMessage("Section cannot exceed 50 characters");

        RuleFor(x => x.ProcedureName)
            .NotEmpty().WithMessage("Procedure name is required")
            .MaximumLength(50).WithMessage("Procedure name cannot exceed 50 characters");
    }
}

// SopProcedureItemRs validation and upsert methods
public static class SopProcedureItemRsExtensions
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







