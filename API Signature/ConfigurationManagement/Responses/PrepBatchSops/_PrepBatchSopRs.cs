using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using NCLims.Business.NewBatch.ConfigurationManagement.Responses.BatchSops;
using NCLims.Data;
using NCLims.Models.Enums;
using NCLims.Models.NewBatch;

namespace NCLims.Business.NewBatch.ConfigurationManagement.Responses.PrepBatchSops;

public partial class PrepBatchSopRs : BatchSopRs
{
    public static async Task<List<PrepBatchSopRs>> PrepBatchSopRss(IQueryable<PrepBatchSop> query)
    {
        var pbsops = await query.Select(pbsop => new PrepBatchSopRs
        {
            BatchSopId = pbsop.Id,
            LabId = pbsop.LabId,
            Name = pbsop.Name,
            Sop = pbsop.Sop,
            Version = pbsop.Version,
            SopGroup = pbsop.SopGroup,
            DefaultDilution = pbsop.DefaultDilution,
            DefaultExtractionVolumeMl = pbsop.DefaultExtractionVolumeMl,
            DefaultInjectionVolumeUl = pbsop.DefaultInjectionVolumeUl,
            MaxSamplesPerBatch = pbsop.MaxSamplesPerBatch,
            MaxWeightG = pbsop.MaxWeightG,
            MinWeightG = pbsop.MinWeightG,
            DecimalFormatType = pbsop.DecimalFormatType.ToString(),
            SignificantDigits = pbsop.SignificantDigits,
            ManifestSamplePrepBatchSopRss = pbsop.ManifestSampleTypePrepBatchSop
                .Select(mstb => new ManifestSamplePrepBatchSopRs
                {
                    ManifestSamplePrepBatchSopId = mstb.Id,
                    BatchSopId = mstb.PrepBatchSopId,
                    EffectiveDate = mstb.EffectiveOn,
                    ManifestSampleTypeId = mstb.ManifestSampleTypeId,
                    PanelGroupId = mstb.PanelGroupId,
                    Panels = string.Join(", ", mstb.PanelGroup.Panels.Select(p => p.Name))
                }).ToList(),
            SopProcedures = pbsop.SopProcedures
                .Select(p => new SopProcedureRs()
                {
                    SopProcedureId = p.Id,
                    BatchSopId = pbsop.Id,
                    ProcedureName = p.ProcedureName,
                    Section = p.Section,
                    ProcedureItems = p.SopProcedureItems
                        .Select(pi => new SopProcedureItemRs
                        {
                            SopProcedureId = p.Id,
                            SopProcedurItemId = pi.Id,
                            IndentLevel = pi.IndentLevel,
                            ItemNumber = pi.ItemNumber,
                            Order = pi.Order,
                            Text = pi.Text
                        }).ToList(),
                }).ToList()
        }).ToListAsync();

        var pbControlSamples = await query
            .SelectMany(pb => pb.PrepBatchSopControlSamples)
            .Include(cs => cs.ControlSampleSpecification)
            .ToListAsync();

        foreach (var pbsop in pbsops)
        {
            var controlSamples = pbControlSamples
                .Where(ctl => ctl.PrepBatchSopId == pbsop.BatchSopId)
                .ToList();

            List<PrepBatchSopControlSampleRs> responses = [];
            foreach (var model in controlSamples)
            {
                if (model is PrepBatchSopDupControlSample dupSample)
                {
                    var dupe = new PrepBatchSopDupControlSampleRs();
                    dupe.Map(dupSample);
                    responses.Add(dupe);
                }
                else
                {
                    var response = new PrepBatchSopControlSampleRs();
                    response.Map(model);
                    responses.Add(response);
                }
            }
            pbsop.PrepBatchSopControlSamples = responses;
        }
        return pbsops;
    }

    public static ValidationResult Validate(PrepBatchSopRs prepBatchSopRs, int labId)
    {
        // First validate the base class properties using the BatchSopRs validator
        var baseSopValidator = new BatchSopRsValidator(labId);
        var baseValidationResult = baseSopValidator.Validate(prepBatchSopRs);

        var result = new ValidationResult
        {
            IsValid = baseValidationResult.IsValid,
            Errors = baseValidationResult.Errors.Select(e => new ValidationError
            {
                PropertyName = e.PropertyName,
                ErrorMessage = e.ErrorMessage
            }).ToList()
        };

        // Then validate the PrepBatchSopRs specific properties
        var prepBatchSopValidator = new PrepBatchSopRsValidator();
        var prepValidationResult = prepBatchSopValidator.Validate(prepBatchSopRs);

        if (!prepValidationResult.IsValid)
        {
            result.IsValid = false;
            result.Errors.AddRange(prepValidationResult.Errors.Select(e => new ValidationError
            {
                PropertyName = e.PropertyName,
                ErrorMessage = e.ErrorMessage
            }));
        }

        // Validate child collections
        foreach (var manifestSamplePrepBatchSop in prepBatchSopRs.ManifestSamplePrepBatchSopRss)
        {
            var manifestResult = ManifestSamplePrepBatchSopRs.Validate(manifestSamplePrepBatchSop);
            if (manifestResult.IsValid) continue;
            result.IsValid = false;
            result.Errors.AddRange(manifestResult.Errors);
        }

        foreach (var controlSample in prepBatchSopRs.PrepBatchSopControlSamples)
        {
            var controlResult = PrepBatchSopControlSampleRs.Validate(controlSample);
            if (controlResult.IsValid) continue;
            result.IsValid = false;
            result.Errors.AddRange(controlResult.Errors);
        }

        // Validate SOP fields (inherited from BatchSopRs)
        foreach (var sopField in prepBatchSopRs.SopFields)
        {
            var sopFieldResult = SopFieldRs.Validate(sopField);
            if (sopFieldResult.IsValid) continue;
            result.IsValid = false;
            result.Errors.AddRange(sopFieldResult.Errors);
        }

        // Validate SOP procedures (inherited from BatchSopRs)
        foreach (var sopProcedure in prepBatchSopRs.SopProcedures)
        {
            var sopProcedureResult = SopProcedureRs.Validate(sopProcedure);
            if (sopProcedureResult.IsValid) continue;
            result.IsValid = false;
            result.Errors.AddRange(sopProcedureResult.Errors);
        }

        return result;
    }

    // Upsert method to handle creating or updating PrepBatchSop and its children
    public static async Task<PrepBatchSop> UpsertFromResponse(
        PrepBatchSopRs response,
        List<PrepBatchSop> existingPrepBatchSops,
        NCLimsContext context)
    {
        if (response == null) throw new ArgumentNullException(nameof(response));
        if (existingPrepBatchSops == null) throw new ArgumentNullException(nameof(existingPrepBatchSops));
        if (context == null) throw new ArgumentNullException(nameof(context));

        PrepBatchSop prepBatchSop;

        // Find or create the prep batch SOP
        if (response.BatchSopId <= 0)
        {
            // New prep batch SOP
            prepBatchSop = new PrepBatchSop();
            context.PrepBatchSops.Add(prepBatchSop);
        }
        else
        {
            // Existing prep batch SOP
            prepBatchSop = existingPrepBatchSops.SingleOrDefault(s => s.Id == response.BatchSopId)
                ?? throw new KeyNotFoundException($"PrepBatchSop with ID {response.BatchSopId} not found");
        }

        // Update base BatchSop properties
        prepBatchSop.Name = response.Name;
        prepBatchSop.Sop = response.Sop;
        prepBatchSop.Version = response.Version;
        prepBatchSop.SopGroup = response.SopGroup;
        prepBatchSop.LabId = response.LabId;
        prepBatchSop.SignificantDigits = response.SignificantDigits ?? 0;
        prepBatchSop.DecimalFormatType = Enum.Parse<DecimalFormatType>(response.DecimalFormatType!);

        // Update PrepBatchSop specific properties
        prepBatchSop.MaxSamplesPerBatch = response.MaxSamplesPerBatch;
        prepBatchSop.DefaultDilution = response.DefaultDilution;
        prepBatchSop.DefaultExtractionVolumeMl = response.DefaultExtractionVolumeMl;
        prepBatchSop.DefaultInjectionVolumeUl = response.DefaultInjectionVolumeUl;
        prepBatchSop.MaxWeightG = response.MaxWeightG;
        prepBatchSop.MinWeightG = response.MinWeightG;

        // Initialize collections if null
        prepBatchSop.ManifestSampleTypePrepBatchSop ??= new List<ManifestSampleTypePrepBatchSop>();
        prepBatchSop.PrepBatchSopControlSamples ??= new List<PrepBatchSopControlSample>();
        prepBatchSop.SopFields ??= new List<SopField>();
        prepBatchSop.SopProcedures ??= new List<SopProcedure>();

        // Handle ManifestSamplePrepBatchSop items
        await ManifestSamplePrepBatchSopRs.UpsertFromResponses(
            response.ManifestSamplePrepBatchSopRss,
            prepBatchSop.ManifestSampleTypePrepBatchSop.ToList(),
            prepBatchSop,
            context);

        // Handle PrepBatchSopControlSample items
        await PrepBatchSopControlSampleRs.UpsertFromResponses(
            response.PrepBatchSopControlSamples,
            prepBatchSop.PrepBatchSopControlSamples.ToList(),
            prepBatchSop,
            context);

        // Handle SopField items (inherited from BatchSopRs)
        await SopFieldRs.UpsertFromResponses(
            response.SopFields.ToList(),
            prepBatchSop.SopFields.ToList(),
            prepBatchSop,
            context);

        // Handle SopProcedure items (inherited from BatchSopRs)
        await SopProcedureRs.UpsertFromResponses(
            response.SopProcedures.ToList(),
            prepBatchSop.SopProcedures.ToList(),
            prepBatchSop,
            context);

        return prepBatchSop;
    }
}


// FluentValidation validator for PrepBatchSopRs
public class PrepBatchSopRsValidator : AbstractValidator<PrepBatchSopRs>
{

    public PrepBatchSopRsValidator()
    {
        // Only validate PrepBatchSopRs specific properties
        // Base properties are validated by BatchSopRsValidator

        RuleFor(x => x.MaxSamplesPerBatch)
            .NotNull().WithMessage("Maximum samples per batch is required")
            .GreaterThan(0).WithMessage("Maximum samples per batch must be greater than 0");

        RuleFor(x => x.DefaultDilution)
            .NotNull().WithMessage("Default dilution is required")
            .GreaterThan(0).WithMessage("Default dilution must be greater than 0");

        RuleFor(x => x.DefaultExtractionVolumeMl)
            .NotNull().WithMessage("Default extraction volume is required")
            .GreaterThan(0).WithMessage("Default extraction volume must be greater than 0");

        RuleFor(x => x.DefaultInjectionVolumeUl)
            .NotNull().WithMessage("Default injection volume is required")
            .GreaterThan(0).WithMessage("Default injection volume must be greater than 0");

        RuleFor(x => x.MaxWeightG)
            .NotNull().WithMessage("Maximum weight is required")
            .GreaterThan(0).WithMessage("Maximum weight must be greater than 0");

        RuleFor(x => x.MinWeightG)
            .NotNull().WithMessage("Minimum weight is required")
            .GreaterThan(0).WithMessage("Minimum weight must be greater than 0");

        RuleFor(x => x)
            .Must(x => x.MaxWeightG > x.MinWeightG)
            .WithMessage("Maximum weight must be greater than minimum weight")
            .When(x => x.MaxWeightG.HasValue && x.MinWeightG.HasValue);
    }
}

// BatchSopRsValidator for validating base BatchSopRs properties
public class BatchSopRsValidator : AbstractValidator<BatchSopRs>
{
    private readonly int _labId;

    public BatchSopRsValidator()
    {

    }

    public BatchSopRsValidator(int labId)
    {
        _labId = labId;

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required")
            .MaximumLength(150).WithMessage("Name cannot exceed 150 characters");

        RuleFor(x => x.Sop)
            .NotEmpty().WithMessage("SOP is required")
            .MaximumLength(50).WithMessage("SOP cannot exceed 50 characters");

        RuleFor(x => x.Version)
            .NotEmpty().WithMessage("Version is required")
            .MaximumLength(10).WithMessage("Version cannot exceed 10 characters");

        RuleFor(x => x.SopGroup)
            .NotEmpty().WithMessage("SOP Group is required")
            .MaximumLength(50).WithMessage("SOP Group cannot exceed 50 characters");

        RuleFor(x => x.LabId)
            .Equal(_labId).WithMessage($"Lab ID must equal {_labId}");

        RuleFor(x => x.SignificantDigits)
            .NotNull().WithMessage("Significant digits is required");

        RuleFor(x => x.DecimalFormatType)
            .NotNull().WithMessage("Decimal format type is required");
    }
}