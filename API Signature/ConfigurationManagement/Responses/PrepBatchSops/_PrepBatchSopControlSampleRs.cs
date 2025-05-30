using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using NCLims.Business.NewBatch.ConfigurationManagement.Responses.PrepBatchSops;
using NCLims.Data;
using NCLims.Models.NewBatch;
using NCLims.Models.NewBatch.Analytical;

namespace NCLims.Business.NewBatch.ConfigurationManagement.Responses.PrepBatchSops;

public partial class PrepBatchSopControlSampleRs
{

    public void Map(PrepBatchSopControlSample pbsop)
    {
        PrepBatchSopControlSampleId = pbsop.Id;
        AnalysisType = pbsop.ControlSampleSpecification.AnalysisType.ToString();
        Category = pbsop.ControlSampleSpecification.Category.ToString();
        ControlSampleOrder = pbsop.ControlSampleOrder;
        ControlSampleType = pbsop.ControlSampleSpecification.ControlSampleType.ToString();
        Description = pbsop.ControlSampleSpecification.Description;
        HistoricalDays = pbsop.HistoricalDays;
        PassCriteria = pbsop.ControlSampleSpecification.PassCriteria.ToString();
        QCCondition = pbsop.ControlSampleSpecification.QCCondition.ToString();
        QCFactor1 = pbsop.QCFactor1;
        QCFactor2 = pbsop.QCFactor2;
        QCSource = pbsop.ControlSampleSpecification.QCSource.ToString();
        QCTargetRangeHigh = pbsop.QCTargetRangeHigh;
        QCTargetRangeLow = pbsop.QCTargetRangeLow;
    }

    public static async Task<List<PrepBatchSopControlSampleRs>> FetchPrepBatchSopControlSampleRss(
        IQueryable<PrepBatchSopControlSample> query)
    {
        var models = await query.ToListAsync();

        List<PrepBatchSopControlSampleRs> responses = [];
        foreach (var model in models)
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
        return responses;
    }

    public static ValidationResult Validate(PrepBatchSopControlSampleRs prepBatchSopControlSampleRs)
    {
        var validator = new PrepBatchSopControlSampleRsValidator();
        var validationResult = validator.Validate(prepBatchSopControlSampleRs);

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
        List<PrepBatchSopControlSampleRs> responses,
        List<PrepBatchSopControlSample> existingItems,
        PrepBatchSop prepBatchSop,
        NCLimsContext context)
    {
        if (responses == null) throw new ArgumentNullException(nameof(responses));
        if (existingItems == null) throw new ArgumentNullException(nameof(existingItems));
        if (prepBatchSop == null) throw new ArgumentNullException(nameof(prepBatchSop));
        if (context == null) throw new ArgumentNullException(nameof(context));

        // Remove items that are no longer in the response
        foreach (var existingItem in existingItems)
        {
            if (!responses.Any(r => r.PrepBatchSopControlSampleId == existingItem.Id))
            {
                prepBatchSop.PrepBatchSopControlSamples.Remove(existingItem);
                context.Remove(existingItem);
            }
        }

        // Update or add items from the response
        foreach (var response in responses)
        {
            PrepBatchSopControlSample model;

            if (response.PrepBatchSopControlSampleId <= 0)
            {
                // Determine if it's a regular or duplicate control sample
                model = response is PrepBatchSopDupControlSampleRs ? new PrepBatchSopDupControlSample() : new PrepBatchSopControlSample();
                model.ControlSampleSpecification = new ControlSampleSpecification();
                prepBatchSop.PrepBatchSopControlSamples.Add(model);
                context.Add(model);
            }
            else
            {
                // Existing item
                model = existingItems.SingleOrDefault(e => e.Id == response.PrepBatchSopControlSampleId)
                    ?? throw new KeyNotFoundException($"PrepBatchSopControlSample with ID {response.PrepBatchSopControlSampleId} not found");
            }

            // Update properties
            model.PrepBatchSopId = prepBatchSop.Id;
            model.PrepBatchSop = prepBatchSop;
            model.SopBatchPositionType = Enum.Parse<SopBatchPositionType>(response.SopBatchPositionType);
            model.ControlSampleOrder = response.ControlSampleOrder ?? throw new InvalidOperationException("ControlSampleOrder cannot be null");
            model.QCFactor1 = response.QCFactor1;
            model.QCFactor2 = response.QCFactor2;
            model.QCTargetRangeLow = response.QCTargetRangeLow;
            model.QCTargetRangeHigh = response.QCTargetRangeHigh;
            model.HistoricalDays = response.HistoricalDays;

            if (model.ControlSampleSpecification == null)
            {
                var controlSampleSpecification = new ControlSampleSpecification();
                model.ControlSampleSpecification = controlSampleSpecification;
                context.ControlSampleSampleSpecifications.Add(controlSampleSpecification);
                await context.SaveChangesAsync(); //
            }


            model.ControlSampleSpecification.ControlSampleType = Enum.Parse<ControlSampleType>(response.ControlSampleType!);
            model.ControlSampleSpecification.Description = response.Description;
            model.ControlSampleSpecification.Category = Enum.Parse<ControlSampleCategory>(response.Category!);
                model.ControlSampleSpecification.AnalysisType = Enum.Parse<ControlSampleAnalysis>(response.AnalysisType!);
            model.ControlSampleSpecification.QCSource = Enum.Parse<ControlSampleQCSource>(response.QCSource!);
            model.ControlSampleSpecification.PassCriteria = Enum.Parse<ControlSamplePassCriteria>(response.PassCriteria!);
            model.ControlSampleSpecification.QCCondition = Enum.Parse<QCCondition>(response.QCCondition!);

            // Handle partner control sample for duplicate samples
            if (model is PrepBatchSopDupControlSample dupControlSample)
            {
                dupControlSample.PartnerSopControlSampleId =
                    ((PrepBatchSopDupControlSampleRs)response).PrepBatchSopControlSampleId;
            }
        }
    }
}

public class PrepBatchSopControlSampleRsValidator : AbstractValidator<PrepBatchSopControlSampleRs>
{
    public PrepBatchSopControlSampleRsValidator()
    {
        RuleFor(x => x.SopBatchPositionType)
            .NotNull().WithMessage("SOP batch position type is required");

        RuleFor(x => x.ControlSampleOrder)
            .NotNull().WithMessage("Control sample order is required")
            .GreaterThanOrEqualTo(0).WithMessage("Control sample order must be a non-negative number");

        RuleFor(x => x.ControlSampleType)
            .NotNull().WithMessage("Control sample type is required");

        RuleFor(x => x.Category)
            .NotNull().WithMessage("Category is required");

        RuleFor(x => x.AnalysisType)
            .NotNull().WithMessage("Analysis type is required");

        RuleFor(x => x.QCSource)
            .NotNull().WithMessage("QC source is required");

        RuleFor(x => x.PassCriteria)
            .NotNull().WithMessage("Pass criteria is required");

        RuleFor(x => x.QCCondition)
            .NotNull().WithMessage("QC condition is required");

        RuleFor(x => x.QCTargetRangeLow)
            .LessThanOrEqualTo(x => x.QCTargetRangeHigh)
            .When(x => x.QCTargetRangeLow.HasValue && x.QCTargetRangeHigh.HasValue)
            .WithMessage("QC target range low must be less than or equal to QC target range high");
    }
}

public partial class PrepBatchSopDupControlSampleRs : PrepBatchSopControlSampleRs
{
    public  void Map(PrepBatchSopDupControlSample pbsop)
    {
        base.Map(pbsop);
    }
}
