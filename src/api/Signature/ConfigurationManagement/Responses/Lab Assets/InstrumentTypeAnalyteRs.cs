using System;
using FluentValidation;
using NCLims.Data;
using NCLims.Models;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace NCLims.Business.NewBatch.ConfigurationManagement.Responses.Lab_Assets;


/// EXCEPTION TO STANDARD PATTERN:
// 1. This Response object uses a composite key (InstrumentTypeId, AnalyteAlias) instead of a 
//    single primary key ID field. The database structure reflects this with a complex key.
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

public class InstrumentTypeAnalyteRs
{
    // UNIQUENESS CONSTRAINT:
    // The combination of InstrumentTypeId and AnalyteAlias must be unique.

    // Foreign key to parent.  No display, no edit.
    public int InstrumentTypeId { get; set; }

    // Dropdown control.  Use ConfigurationMaintenanceSelectors.Compounds
    // UNIQUENESS CONSTRAINT:
    // The combination of InstrumentTypeId and AnalyteAlias must be unique.
    [Required] public int? AnalyteId { get; set; }

    [Required] [StringLength(150)] public string AnalyteAlias { get; set; }

    // Upsert method for handling a collection of instrument type analytes
    public static async Task UpsertFromResponses(
        List<InstrumentTypeAnalyteRs> responses,
        List<InstrumentTypeAnalyte> existingAnalytes,
        InstrumentType instrumentType,
        NCLimsContext context)
    {
        if (responses == null) throw new ArgumentNullException(nameof(responses));
        if (existingAnalytes == null) throw new ArgumentNullException(nameof(existingAnalytes));
        if (instrumentType == null) throw new ArgumentNullException(nameof(instrumentType));
        if (context == null) throw new ArgumentNullException(nameof(context));

        // Hard delete any models that are not in the response list.
        foreach (var model in existingAnalytes)
        {
            var x = responses
                .Where(res => res.AnalyteId == model.AnalyteId
                                        && res.InstrumentTypeId == model.InstrumentTypeId)
                .ToList();

            var response = responses
                .SingleOrDefault(res => 
                    res.AnalyteId == model.AnalyteId
                    && res.InstrumentTypeId == model.InstrumentTypeId
                    && res.AnalyteAlias == model.AnalyteAlias);
            if (response == null)
                instrumentType.InstrumentTypeAnalytes.Remove(model);
        }

        // Update or insert analytes
        foreach (var response in responses)
        {
            InstrumentTypeAnalyte? analyte;

            analyte = existingAnalytes
                .SingleOrDefault(m =>
                    m.InstrumentTypeId == response.InstrumentTypeId
                    && m.AnalyteId == response.AnalyteId
                    && m.AnalyteAlias == response.AnalyteAlias);

            // If no existing entity model, create one.
            if (analyte is null)
            {
                // New analyte
                analyte = new InstrumentTypeAnalyte
                {
                    AnalyteId = response.AnalyteId ?? throw new InvalidOperationException("AnalyteId cannot be null."),
                    InstrumentTypeId = response.InstrumentTypeId
                };
                instrumentType.InstrumentTypeAnalytes.Add(analyte);
                context.InstrumentTypeAnalytes.Add(analyte);
            }
            
            // Update properties
            analyte.AnalyteAlias = response.AnalyteAlias;
        }
    }
}

/// Validator for InstrumentTypeAnalyteRs
public class InstrumentTypeAnalyteRsValidator : AbstractValidator<InstrumentTypeAnalyteRs>
{
    public IEnumerable<InstrumentTypeAnalyteRs>? ExistingAnalytes { get; set; }

    public InstrumentTypeAnalyteRsValidator()
    {
    }

    public InstrumentTypeAnalyteRsValidator(IEnumerable<InstrumentTypeAnalyteRs>? existingAnalytes)
    {
        if (existingAnalytes is null) throw new InvalidOperationException("Existing Analytes Property cannot be null");

        RuleFor(x => x.AnalyteId)
            .GreaterThan(0).WithMessage("Analyte ID must be greater than 0");

        RuleFor(x => x.InstrumentTypeId)
            .GreaterThan(0).WithMessage("Instrument Type ID must be greater than 0");

        RuleFor(x => x.AnalyteAlias)
            .NotEmpty().WithMessage("Analyte alias is required")
            .MaximumLength(150).WithMessage("Analyte alias cannot exceed 150 characters");

        // Composite uniqueness validation for InstrumentTypeId and AnalyteId
        RuleFor(x => x)
            .Must((analyte, _) => !HasDuplicateCompositeKey(analyte, existingAnalytes))
            .WithMessage("The combination of Instrument Type and Analyte must be unique. This Analyte is already associated with this Instrument Type.");
    }

    private bool HasDuplicateCompositeKey(InstrumentTypeAnalyteRs analyte, IEnumerable<InstrumentTypeAnalyteRs> existingAnalytes)
    {
        return existingAnalytes.Any(x =>
            x.InstrumentTypeId == analyte.InstrumentTypeId &&
            x.AnalyteAlias == analyte.AnalyteAlias &&
            // Don't flag the item as a duplicate of itself when updating
            // For new items without IDs this won't matter
            !ReferenceEquals(x, analyte));
    }
}

