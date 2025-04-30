using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using NCLims.Business.NewBatch.ConfigurationManagement.Responses.BatchSops;
using NCLims.Models.NewBatch;

namespace NCLims.Business.NewBatch.ConfigurationManagement.Responses.PrepBatchSops;

public partial class PrepBatchSopSelectionRs : BatchSopSelectionRs
{
    public override string Type => nameof(PrepBatchSopSelectionRs);

}