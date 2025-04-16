﻿using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using NCLims.Data;
using NCLims.Models;
using NCLims.Models.Enums;

namespace NCLims.Business.NewBatch.ConfigurationManagement.Responses.Lab_Assets;

public class InstrumentTypeRs
{
    // Primary Key.  No display, no edit
    public int InstrumentTypeId { get; set; }
    // @validation:  Unique in the list.
    [Required]
    [StringLength(150)]
    public string? Name { get; set; }
    [Required]
    [StringLength(150)]
    public string MeasurementType { get; set; }
    [Required]
    [StringLength(250)]
    public string DataFolder { get; set; }
    public int? PeakAreaSaturationThreshold { get; set; }
    // Dropdown control.  Choices come from ConfigurationMaintenanceSelectors.InstrumentFileParserTypes.
    [Required]
    public InstrumentFileParserType? InstrumentFileParser { get; set; }

    // Defaults to true on new.
    public bool Active { get; set; } = true;

    public int LabId { get; set; }

    [JsonPropertyOrder(100)]
    public List<InstrumentRs> InstrumentRss { get; set; } = [];
    [JsonPropertyOrder(101)]
    public List<InstrumentTypeAnalyteRs> InstrumentTypeAnalyteRss { get; set; } = [];

    public static async Task<List<InstrumentTypeRs>> FetchInstrumentTypes(IQueryable<InstrumentType> query)
    {
        var ret = await query.Select(it => new InstrumentTypeRs
        {
            Name = it.Name,
            DataFolder = it.DataFolder,
            InstrumentFileParser = it.InstrumentFileParser,
            InstrumentTypeId = it.Id,
            MeasurementType = it.MeasurementType,
            PeakAreaSaturationThreshold = it.PeakAreaSaturationThreshold,
            LabId = it.LabId,
            Active = it.Active,
            InstrumentRss = it.Instruments.Select(ins => new InstrumentRs
            {
                Name = ins.Name,
                InstrumentId = ins.Id,
                InstrumentTypeId = ins.InstrumentTypeId,
                LastPM = ins.LastPM,
                NextPm = ins.NextPm,
                OutOfService = ins.OutOfService,
                Active = ins.Active,
                InstrumentPeripheralRss = ins.InstrumentPeripherals.Select(ip => new Responses.Lab_Assets.InstrumentPeripheralRs
                {
                    InstrumentId = ip.InstrumentId,
                    DurableLabAssetId = ip.DurableLabAssetId,
                    InstrumentPeripheralId = ip.Id
                }).ToList(),
            }).ToList(),
            InstrumentTypeAnalyteRss = it.InstrumentTypeAnalytes.Select(ita => new InstrumentTypeAnalyteRs
            {
                InstrumentTypeId = ita.InstrumentTypeId,
                AnalyteId = ita.AnalyteId,
                AnalyteAlias = ita.AnalyteAlias
            }).ToList(),

        }).ToListAsync();
        return ret;
    }

    // Validation method
    public static ValidationResult Validate(InstrumentTypeRs instrumentType, int labId)
    {
        var validator = new InstrumentTypeRsValidator { LabId = labId };
        var validationResult = validator.Validate(instrumentType);

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

    // Upsert method to update or insert instrument type and its children
    public static async Task<InstrumentType> UpsertFromResponse(
        InstrumentTypeRs response,
        List<InstrumentType> existingTypes,
        NCLimsContext context)
    {
        if (response == null) throw new ArgumentNullException(nameof(response));
        if (existingTypes == null) throw new ArgumentNullException(nameof(existingTypes));
        if (context == null) throw new ArgumentNullException(nameof(context));

        InstrumentType instrumentType;

        // Find or create the instrument type
        if (response.InstrumentTypeId <= 0)
        {
            // New instrument type
            instrumentType = new InstrumentType();
            context.InstrumentTypes.Add(instrumentType);
        }
        else
        {
            // Existing instrument type
            instrumentType = existingTypes.SingleOrDefault(it => it.Id == response.InstrumentTypeId)
                ?? throw new KeyNotFoundException($"InstrumentType with ID {response.InstrumentTypeId} not found");
        }

        // Update the instrument type properties
        instrumentType.Name = response.Name;
        instrumentType.MeasurementType = response.MeasurementType;
        instrumentType.DataFolder = response.DataFolder;
        instrumentType.PeakAreaSaturationThreshold = response.PeakAreaSaturationThreshold;
        instrumentType.InstrumentFileParser = response.InstrumentFileParser.Value;
        instrumentType.LabId = response.LabId;
        instrumentType.Active = response.Active;

        instrumentType.InstrumentTypeAnalytes ??= new List<InstrumentTypeAnalyte>();
        instrumentType.Instruments ??= new List<Instrument>();

        // Handle instruments
        await InstrumentRs.UpsertFromResponses(
            response.InstrumentRss,
            instrumentType.Instruments.ToList(),
            instrumentType,
            context);

        // Handle instrument type analytes
        await InstrumentTypeAnalyteRs.UpsertFromResponses(
            response.InstrumentTypeAnalyteRss,
            instrumentType.InstrumentTypeAnalytes.ToList(),
            instrumentType,
            context);

        return instrumentType;
    }
}

// Validator for InstrumentTypeRs
public class InstrumentTypeRsValidator : AbstractValidator<InstrumentTypeRs>
{
    public int LabId { get; set; }

    public InstrumentTypeRsValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required")
            .MaximumLength(150).WithMessage("Name cannot exceed 150 characters");

        RuleFor(x => x.MeasurementType)
            .NotEmpty().WithMessage("Measurement type is required")
            .MaximumLength(150).WithMessage("Measurement type cannot exceed 150 characters");

        RuleFor(x => x.DataFolder)
            .NotEmpty().WithMessage("Data folder is required")
            .MaximumLength(250).WithMessage("Data folder cannot exceed 250 characters");

        RuleFor(x => x.InstrumentFileParser)
            .IsInEnum().WithMessage("Invalid instrument file parser type");

        RuleFor(x => x.LabId)
            .Equal(LabId).WithMessage($"Lab ID must equal {LabId}");

        // Validate child instruments
        RuleForEach(x => x.InstrumentRss)
            .SetValidator(new InstrumentRsValidator());

        // Validate child analytes
        RuleForEach(x => x.InstrumentTypeAnalyteRss)
            .SetValidator(new InstrumentTypeAnalyteRsValidator());
    }
}
