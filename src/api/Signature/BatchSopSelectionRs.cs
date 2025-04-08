using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text.Json.Serialization;
using FluentValidation;
using NCLims.Models.NewBatch;

namespace NCLims.Business.NewBatch.Sop.Responses;

[JsonPolymorphic]
[JsonDerivedType(typeof(PrepBatchSopSelectionRs), nameof(PrepBatchSopSelectionRs))]
[JsonDerivedType(typeof(AnalyticalBatchSopSelectionRs), nameof(AnalyticalBatchSopSelectionRs))]
public abstract class BatchSopSelectionRs
{
    // Primary Key, no display, not editable.
    [Required]
    public int BatchSopId { get; set; }

    // @validation: unique-combination: Name, Sop, Version
    [Required]
    [StringLength(150)]
    public string Name { get; set; }

    // @validation: unique-combination: Name, Sop, Version
    [Required]
    [StringLength(50)]
    public string Sop { get; set; }

    // @validation: unique-combination: Name, Sop, Version
    [Required]
    [StringLength(10)]
    public string Version { get; set; }

    [Required]
    [StringLength(50)]
    public string SopGroup { get; set; }

    // Display only.  Not editable.
    public int BatchCount { get; set; }

    // No display, not editable.
    [Required]
    public int LabId { get; set; }

    [JsonPropertyName("$type")]
    public virtual string Type => GetType().Name;

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