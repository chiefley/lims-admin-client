using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using NCLims.Models;

namespace NCLims.Business.NewBatch.ConfigurationManagement.Responses.Basic_Tables;

public class PotencyCategoryRs
{
    // Primary Key.  No display, no edit.
    public int PotencyCategoryId { get; set; }

    [Required]
    [StringLength(150)]
    public string? Name { get; set; }

    [StringLength(250)]
    public string? Description { get; set; }

    // Part of Lab Context.  Set to 1001 on new()
    [Required]
    public int? StateId { get; set; }

    public static async Task<List<PotencyCategoryRs>> FetchPotencyCategoryRss(IQueryable<PotencyCategory> query)
    {
        var ret = await query.Select(q => new PotencyCategoryRs
        {
            Name =  q.Name,
            Description = q.Description,
            StateId = q.StateId,
            PotencyCategoryId = q.Id
        }).ToListAsync();

        return ret;
    }
}