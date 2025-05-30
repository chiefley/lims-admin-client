using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using NCLims.Business.NewBatch.ConfigurationManagement.Responses.BatchSops;
using NCLims.Models.NewBatch;

namespace NCLims.Business.NewBatch.ConfigurationManagement.Responses.AnalyticalBatchSops;

public partial class AnalyticalBatchSopSelectionRs : BatchSopSelectionRs
{
    public static async Task<List<AnalyticalBatchSopSelectionRs>> FetchPrepBatchSopSelectionRs(IQueryable<AnalyticalBatchSop> query)
    {
        var ret = await query.Select(absop => new AnalyticalBatchSopSelectionRs
        {
            BatchSopId = absop.Id,
            LabId = absop.LabId,
            Name = absop.Name,
            Sop = absop.Sop,
            Version = absop.Version,
            SopGroup = absop.SopGroup,
            BatchCount = absop.AnalyticalBatches.Count
        }
        ).ToListAsync();
        return ret;
    }
}