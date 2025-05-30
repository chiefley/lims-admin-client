using NCLims.Business.NewBatch.ConfigurationManagement.Responses.BatchSops;
using NCLims.Data;
using NCLims.Models.NewBatch;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using FluentValidation;

namespace NCLims.Business.NewBatch.ConfigurationManagement.Responses.ReagentPrepLogBatchSops;

public partial class ReagentPrepLogBatchSopRs : BatchSopRs
{
    public static async Task<List<ReagentPrepLogBatchSopRs>> FetchPrepLogBatchSopRss(IQueryable<ReagentPrepLogBatchSop> query, int labId, NCLimsContext ctx)
    {
        var ret = await query.Select(q => new ReagentPrepLogBatchSopRs
        {
            ReagentPrepLogBatchSopId = q.Id,
            LabAssetTypeId = q.LabAssetTypeId,
            ExpiryDays = q.ExpiryDays,
            EffectiveOn = q.EffectiveOn,
            SopProcedures = q.SopProcedures
                .Select(p => new SopProcedureRs()
                {
                    SopProcedureId = p.Id,
                    BatchSopId = q.Id,
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

        return ret;
    }

   // public static ValidationResult Validate(ReagentPrepLogBatchSopRs reagentPrepLogBatchSopRs)
}

public class ReagentPrepLogBatchSopRsValidator : AbstractValidator<ReagentPrepLogBatchSopRs>
{
    public ReagentPrepLogBatchSopRsValidator()
    {
    }

    public ReagentPrepLogBatchSopRsValidator(int labId)
    {
        RuleFor(x => x.LabAssetTypeId)
            .NotNull().WithMessage($"LabAssetTypeId cannot be null.")
            .GreaterThan(0).WithMessage("LabAssetTypeId must be greater than zero.");

        RuleFor(x => x.ExpiryDays)
            .NotNull().WithMessage($"ExpiryDays cannot be null.")
            .GreaterThan(0).WithMessage("ExpiryDays must be greater than zero.");

        RuleFor(x => x.EffectiveOn)
            .NotNull().WithMessage($"EffectiveOn cannot be null.")
            .GreaterThan(DateTime.MinValue).WithMessage("EffectiveOn must be greater than the dawn of time.");
    }
}
