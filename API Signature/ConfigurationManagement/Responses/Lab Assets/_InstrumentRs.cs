using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using FluentValidation;
using NCLims.Data;
using NCLims.Models;

namespace NCLims.Business.NewBatch.ConfigurationManagement.Responses.Lab_Assets;

public partial class InstrumentRs
{

    // Upsert method for handling a collection of instruments
    public static async Task UpsertFromResponses(
        List<InstrumentRs> responses,
        List<Instrument> existingInstruments,
        InstrumentType instrumentType,
        NCLimsContext context)
    {
        // Update or insert instruments
        foreach (var response in responses)
        {
            Instrument instrument;

            if (response.InstrumentId <= 0)
            {
                // New instrument
                instrument = new Instrument();
                instrumentType.Instruments.Add(instrument);
                context.Instruments.Add(instrument);
            }
            else
            {
                // Existing instrument
                instrument = existingInstruments.SingleOrDefault(i => i.Id == response.InstrumentId)
                    ?? throw new InvalidOperationException($"Unknown Instrument with Id: {response.InstrumentId}");
              
            }

            // Update properties
            instrument.Name = response.Name;
            instrument.LastPM = response.LastPM;
            instrument.NextPm = response.NextPm;
            instrument.OutOfService = response.OutOfService;
            instrument.Active = response.Active;

            instrument.InstrumentPeripherals ??= new List<InstrumentPeripheral>();

            // Handle peripherals for this instrument
            await InstrumentPeripheralRs.UpsertFromResponses(
                response.InstrumentPeripheralRss,
                instrument.InstrumentPeripherals.ToList(),
                instrument,
                context);
        }
    }

    // Validation method
    public static ValidationResult Validate(InstrumentRs instrumentRs, int labId)
    {
        var validator = new InstrumentRsValidator();
        var validationResult = validator.Validate(instrumentRs);

        var result = new ValidationResult
        {
            IsValid = validationResult.IsValid,
            Errors = validationResult.Errors.Select(e => new ValidationError
            {
                PropertyName = e.PropertyName,
                ErrorMessage = e.ErrorMessage
            }).ToList()
        };

        foreach (var peripheral in instrumentRs.InstrumentPeripheralRss)
        {
            var res = InstrumentPeripheralRs.Validate(peripheral, instrumentRs.InstrumentPeripheralRss);
            if (res.IsValid) continue;
            result.IsValid = false;
            result.Errors.AddRange(res.Errors.Select(e => new ValidationError
            {
                PropertyName = e.PropertyName,
                ErrorMessage = e.ErrorMessage
            }).ToList());
            break;
        }
        return result;
    }
}

// Validator for InstrumentRs
public class InstrumentRsValidator : AbstractValidator<InstrumentRs>
{
    private readonly List<InstrumentRs> _existingInstrumentRss;

    public InstrumentRsValidator()
    {
    }


    public InstrumentRsValidator(List<InstrumentRs> existingInstrumentRss)
    {
        _existingInstrumentRss = existingInstrumentRss;
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required")
            .MaximumLength(150).WithMessage("Name cannot exceed 150 characters");

        RuleFor(x => x.InstrumentTypeId)
            .GreaterThan(0).When(x => x.InstrumentId > 0)
            .WithMessage("Instrument type ID must be greater than 0 for existing instruments");

        RuleFor(x => x)
            .Must((instrumentTypeRs, _) => !HasUniqueName(instrumentTypeRs, existingInstrumentRss))
            .WithMessage("The combination of Instrument Type and Analyte must be unique. This Analyte is already associated with this Instrument Type.");
    }

    private bool HasUniqueName(InstrumentRs instrumentRs, IEnumerable<InstrumentRs> existingInstrumentRss)
    {
        return existingInstrumentRss.Any(x =>
            x.Name == instrumentRs.Name &&
            // Don't flag the item as a duplicate of itself when updating
            // For new items without IDs this won't matter
            !ReferenceEquals(x, instrumentRs));
    }
}