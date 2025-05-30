using System.Collections.Generic;
using System.Linq;
using FluentValidation;
using NCLims.Models.NewBatch;

namespace NCLims.Business.NewBatch.ConfigurationManagement.Responses.BatchSops;

public abstract partial class BatchSopSelectionRs
{
    
    public BatchSop Update(BatchSop model)
    {
        model.Name = Name;
        model.Sop = Sop;
        model.Version = Version;
        model.SopGroup = SopGroup;
        model.LabId = LabId;
        return model;
    }
}

public class SingleBatchSopSelectionValidator : AbstractValidator<BatchSopSelectionRs>
{
    private readonly IEnumerable<BatchSopSelectionRs> _existingItems;

    public SingleBatchSopSelectionValidator(IEnumerable<BatchSopSelectionRs> existingItems)
    {
        _existingItems = existingItems;

        RuleFor(x => x.Name).NotEmpty().MaximumLength(150);
        RuleFor(x => x.Sop).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Version).NotEmpty().MaximumLength(10);
        RuleFor(x => x.SopGroup).NotEmpty().MaximumLength(50);
        RuleFor(x => x.LabId).GreaterThan(0);

        RuleFor(x => x)
            .Must(BeUniqueCombination)
            .WithMessage("The combination of Name, SOP, and Version must be unique.");
    }

    private bool BeUniqueCombination(BatchSopSelectionRs item)
    {
        return !_existingItems.Any(x =>
            x.Name == item.Name &&
            x.Sop == item.Sop &&
            x.Version == item.Version &&
            x.BatchSopId != item.BatchSopId);
    }
}