using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using NCLims.Business.NewBatch.Sop.Responses.BatchSops;
using NCLims.Models.NewBatch;

namespace NCLims.Business.NewBatch.Sop.Responses.PrepBatchSops;

public class PrepBatchSopSelectionRs : BatchSopSelectionRs
{
    public override string Type => nameof(PrepBatchSopSelectionRs);

    public static async Task<List<PrepBatchSopSelectionRs>> FetchPrepBatchSopSelectionRs(IQueryable<PrepBatchSop> query)
    {
        var ret = await query.Select(pbsop => new PrepBatchSopSelectionRs
        {
            BatchSopId = pbsop.Id,
            LabId = pbsop.LabId,
            Name = pbsop.Name,
            Sop = pbsop.Sop,
            Version = pbsop.Version,
            SopGroup = pbsop.SopGroup,
            BatchCount = pbsop.PrepBatches.Count
        }
        ).ToListAsync();
        return ret;
    }

    public PrepBatchSop Update(PrepBatchSop bsop)
    {
        base.Update(bsop);
        return bsop;
    }
}