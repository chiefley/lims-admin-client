using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using NCLims.Data;
using NCLims.Models;

namespace NCLims.Business.NewBatch.ConfigurationManagement.Responses.Basic_Tables;

public class CompoundRs
{
    // Primary Key, no display.
    public int AnalyteId { get; set; }

    // @validation:  Must be unique.
    [Required]
    [StringLength(50)] 
    public string Cas { get; set; }

    [Required]
    [StringLength(150)] 
    public string Name { get; set; }

    [StringLength(150)] 
    public string CcCompoundName { get; set; }

    // Defaults to true on new.
    public bool Active { get; set; } = true;

    public static async Task<List<CompoundRs>> FetchAnalyteRs(IQueryable<Analyte> query)
    {
        var ret = await query.Select(an => new CompoundRs
        {
            Name = an.Name,
            CcCompoundName = an.CcCompoundName,
            AnalyteId = an.Id,
            Cas = an.Cas,
            Active = an.Active,
        }).ToListAsync();

        return ret;
    }

    public static async Task UpsertFromResponses(
        List<CompoundRs> responses,
        List<Analyte> existingAnalytes,
        NCLimsContext context)
    {
        foreach (var response in responses)
        {
            Analyte analyte;
            if (response.AnalyteId <= 0)
            {
                analyte = new Analyte();
                context.Add(analyte);
            }
            else
            {
                analyte = existingAnalytes
                              .SingleOrDefault(an => an.Id == response.AnalyteId)
                          ?? throw new InvalidOperationException($"Unknown analyte with Id: {response.AnalyteId}");
            }

            analyte.Name = response.Name;
            analyte.Cas = response.Cas;
            analyte.Active = response.Active;
            analyte.CcCompoundName = response.CcCompoundName;
        }
    }

    public static ValidationResult Validate(CompoundRs compoundRs, List<CompoundRs> compoundRss)
    {
        var validator = new CompoundRsValidator(compoundRss);
        var validationResult = validator.Validate(compoundRs);

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

}

public class CompoundRsValidator : AbstractValidator<CompoundRs>
{
    private readonly List<CompoundRs> _compoundRss;

    public CompoundRsValidator()
    {
    }

    public CompoundRsValidator(List<CompoundRs> compoundRss)
    {
        _compoundRss = compoundRss;
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required")
            .MaximumLength(150).WithMessage("Name cannot exceed 150 characters");

        RuleFor(x => x.Cas)
            .NotEmpty().WithMessage("Cas is required")
            .MaximumLength(50).WithMessage("Cas cannot exceed 150 characters");

        RuleFor(x => x.CcCompoundName)
            .MaximumLength(150).WithMessage("Name cannot exceed 150 characters");

        RuleFor(x => x)
            .Must((compoundRs, _) => !HasDuplicateCas(compoundRs, compoundRss))
            .WithMessage("The combination of Instrument Type and Analyte must be unique. This Analyte is already associated with this Instrument Type.");
    }

    private bool HasDuplicateCas(CompoundRs compoundRs, IEnumerable<CompoundRs> existingCompounds)
    {
        return existingCompounds.Any(x =>
            x.Cas == compoundRs.Cas &&
            // Don't flag the item as a duplicate of itself when updating
            // For new items without IDs this won't matter
            !ReferenceEquals(x, compoundRs));
    }
}