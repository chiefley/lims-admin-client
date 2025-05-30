using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using NCLims.Business.NewBatch.ConfigurationManagement.Responses.BatchSops;
using NCLims.Models.NewBatch;

namespace NCLims.Business.NewBatch.ConfigurationManagement.Responses.PrepBatchSops;

public partial class PrepBatchSopSelectionRs : BatchSopSelectionRs
{
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