using System;
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

public partial class InstrumentTypeRs
{
    public static async Task<List<InstrumentTypeRs>> FetchInstrumentTypes(IQueryable<InstrumentType> query)
    {
        var ret = await query.Select(it => new InstrumentTypeRs
        {
            Name = it.Name,
            DataFolder = it.DataFolder,
            InstrumentFileParser = it.InstrumentFileParser.ToString(),
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
    public static ValidationResult Validate(InstrumentTypeRs instrumentType, List<InstrumentTypeRs> existingInstrumentTypeRss, int labId)
    {
        var validator = new InstrumentTypeRsValidator(existingInstrumentTypeRss, labId);
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

        foreach (var analyte in instrumentType.InstrumentTypeAnalyteRss)
        {
            var res = InstrumentTypeAnalyteRs.Validate(analyte, instrumentType.InstrumentTypeAnalyteRss);
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
        instrumentType.InstrumentFileParser = Enum.Parse<InstrumentFileParserType>(response.InstrumentFileParser!);
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
    private readonly List<InstrumentTypeRs> _existingInstrumentTypeRss;
    private readonly int _labId;

    public InstrumentTypeRsValidator()
    {
    }

    public InstrumentTypeRsValidator(List<InstrumentTypeRs> existingInstrumentTypeRss, int labId)
    {
        _existingInstrumentTypeRss = existingInstrumentTypeRss;
        _labId = labId;

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
            .Equal(_labId).WithMessage($"Lab ID must equal {_labId}");

        RuleFor(x => x)
            .Must((instrumentTypeRs, _) => !HasUniqueName(instrumentTypeRs, existingInstrumentTypeRss))
            .WithMessage("The combination of Instrument Type and Analyte must be unique. This Analyte is already associated with this Instrument Type.");
    }

    private bool HasUniqueName(InstrumentTypeRs instrumentTypeRs, IEnumerable<InstrumentTypeRs> existingInstrumentTypeRss)
    {
        return existingInstrumentTypeRss.Any(x =>
            x.Name == instrumentTypeRs.Name &&
            // Don't flag the item as a duplicate of itself when updating
            // For new items without IDs this won't matter
            !ReferenceEquals(x, instrumentTypeRs));
    }
}
