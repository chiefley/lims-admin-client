using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using NCLims.Models;

namespace NCLims.Business.NewBatch.ConfigurationManagement.Responses.Auth;

public partial class UserLabRs
{
    public static async Task<List<UserLabRs>> FetchUeUserLabRss(IQueryable<UserLab> query)
    {
        var ret = await query
            .OrderByDescending(q => q.IsDefault)
            .ThenBy(q => q.Lab.Name)
            .Select(q => new UserLabRs
        {
            LabId = q.LabId,
            IsDefaultLab = q.IsDefault,
            LabName = q.Lab.Name,
            StateAbbreviation = q.Lab.State.Abbreviation,
            StateId = q.Lab.StateId,
            UserId = q.AspNetUserId,
            UserLabId = q.Id
        }).ToListAsync();
        return ret;
    }
}