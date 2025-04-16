using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using FluentValidation;
using NCLims.Data;
using System.Linq;
using System.Threading.Tasks;
using NCLims.Models;

namespace NCLims.Business.NewBatch.ConfigurationManagement.Responses.Lab_Assets;

/// EXCEPTION TO STANDARD PATTERN:
// 1. This Response object uses a unique constraint (InstrumentId, Peripheral Type) i
//
// 2. HARD DELETE IMPLEMENTATION: Unlike most other configuration objects that use soft delete
//    with an Active flag, this entity supports permanent deletion.
//    
// 3. CLIENT IMPLEMENTATION REQUIREMENTS:
//    - UI should display delete controls for these items
//    - No "Active" filtering should be applied (no Active property exists)
//    - Client should confirm with users that deletion is permanent
//    - When items are removed from the list on client side, they will be permanently deleted in database
//
// 4. Data flow: When making updates, any records in the database that are not included in the
//    submitted collection will be permanently removed.

public class InstrumentPeripheralRs
{
    // Primary Key.   No display, no edit
    public int InstrumentPeripheralId { get; set; }
    // @validation: unique constraint on InstrumentId and Peripheral Type.
    // Foreign key to parent.  No display, no edit.
    public int InstrumentId { get; set; }
    // Dropdown control.  Choices come from ConfigurationMaintenanceSelectors.DurableLabAssets
    [Required]
    public int? DurableLabAssetId { get; set; }

    // @validation: unique constraint on InstrumentId and Peripheral Type.
    [Required]
    [StringLength(250)]
    public string? PeripheralType { get; set; }

    // Upsert method for handling a collection of peripherals
    public static async Task UpsertFromResponses(
        List<InstrumentPeripheralRs> responses,
        List<InstrumentPeripheral> existingPeripherals,
        Instrument instrument,
        NCLimsContext context)
    {
        foreach (var model in existingPeripherals)
        {
            var response = responses
                .SingleOrDefault(res => res.InstrumentPeripheralId == model.Id);

            if (response is null)
                instrument.InstrumentPeripherals.Remove(model);
        }

        // Update or insert peripherals
        foreach (var response in responses)
        {
            InstrumentPeripheral peripheral;

            if (response.InstrumentPeripheralId <= 0)
            {
                // New peripheral
                peripheral = new InstrumentPeripheral();
                instrument.InstrumentPeripherals.Add(peripheral);
                context.InstrumentPeripherals.Add(peripheral);
            }
            else
            {
                // Existing peripheral
                peripheral = existingPeripherals.SingleOrDefault(p => p.Id == response.InstrumentPeripheralId)
                     ?? throw new InvalidOperationException($"No existing model with Id {response.InstrumentPeripheralId}");
            }

            // Update properties
            peripheral.DurableLabAssetId = response.DurableLabAssetId ?? throw new InvalidOperationException("DurableLabAssetId cannot be null.");
            peripheral.PeripheralType = response.PeripheralType;
        }
    }
}

// Validator for InstrumentPeripheralRs
public class InstrumentPeripheralRsValidator : AbstractValidator<InstrumentPeripheralRs>
{
    public IEnumerable<InstrumentPeripheralRs>? ExistingInstrumentPeripherals { get; set; }
    public InstrumentPeripheralRsValidator()
    {
        if (ExistingInstrumentPeripherals is null) throw new InvalidOperationException("ExistingPeripherals Property cannot be null");
        RuleFor(x => x.DurableLabAssetId)
            .GreaterThan(0).WithMessage("Durable lab asset ID must be greater than 0")
            .NotNull().WithMessage("DurableLabAsset canot be null.");

        RuleFor(x => x.PeripheralType)
            .NotEmpty().WithMessage("Peripheral type is required")
            .MaximumLength(250).WithMessage("Peripheral type cannot exceed 250 characters");

        // uniqueness validation for InstrumentId and PeripheralType
        RuleFor(x => x)
            .Must((analyte, _) => !HasUniquenessConstraint(analyte, ExistingInstrumentPeripherals))
            .WithMessage("The combination of Instrument Type and Analyte must be unique. This Analyte is already associated with this Instrument Type.");
    }

    private bool HasUniquenessConstraint(InstrumentPeripheralRs analyte, IEnumerable<InstrumentPeripheralRs> existingAnalytes)
    {
        return existingAnalytes.Any(x =>
            x.InstrumentId == analyte.InstrumentId &&
            x.PeripheralType == analyte.PeripheralType &&
            // Don't flag the item as a duplicate of itself when updating
            // For new items without IDs this won't matter
            !ReferenceEquals(x, analyte));
    }
}
