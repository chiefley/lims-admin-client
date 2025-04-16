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

public class InstrumentRs
{
    // Primary Key.  No display. No edit
    public int InstrumentId { get; set; }
    // Foreign Key to parent.  No display, No edit.
    public int InstrumentTypeId { get; set; }
    // @validation, Unique for all Names.
    [Required]
    [StringLength(150)]
    public string? Name { get; set; }
    // Date part Only
    public DateTime? LastPM { get; set; }
    // Date part only.
    public DateTime? NextPm { get; set; }
    public bool OutOfService { get; set; }
    // Defaults to true.
    public bool Active { get; set; } = true;

    [JsonPropertyOrder(100)]
    public List<InstrumentPeripheralRs> InstrumentPeripheralRss { get; set; } = [];

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
}

// Validator for InstrumentRs
public class InstrumentRsValidator : AbstractValidator<InstrumentRs>
{
    public InstrumentRsValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required")
            .MaximumLength(150).WithMessage("Name cannot exceed 150 characters");

        RuleFor(x => x.InstrumentTypeId)
            .GreaterThan(0).When(x => x.InstrumentId > 0)
            .WithMessage("Instrument type ID must be greater than 0 for existing instruments");

        // Validate each peripheral
        RuleForEach(x => x.InstrumentPeripheralRss)
            .SetValidator(new InstrumentPeripheralRsValidator());
    }
}