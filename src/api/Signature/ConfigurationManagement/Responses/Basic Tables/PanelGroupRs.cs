using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using NCLims.Models;

namespace NCLims.Business.NewBatch.ConfigurationManagement.Responses.Basic_Tables;

public class PanelGroupRs
{
    // Primary key.  No display, no edit.
    public int PanelGroupId { get; set; }

    [Required]
    [StringLength(150)]
    public string? Name { get; set; }

    // Lab Context.  Set to context.LabId on new()
    [Required]
    public int LabId { get; set; }

    [Required]
    public bool Active { get; set; }

    public static async Task<List<PanelGroupRs>> FetchPanelGroupRss(IQueryable<PanelGroup> query)
    {
        var ret = await query.Select(q => new PanelGroupRs
        {
            Name = q.Name,
            LabId = q.LabId,
            Active = q.Active,
            PanelGroupId = q.Id
        }).ToListAsync();

        return ret;
    }
}