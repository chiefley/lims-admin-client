using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using NCLims.Models;

namespace NCLims.Business.NewBatch.ConfigurationManagement.Responses.Basic_Tables;

public class NeededByRs
{
    // Primary Key.  No display, no edit.
    public int NeededById { get; set; }

    // Dropdown control.  Choices come from ConfigurationMaintenanceSelectors.TestCategoryTypes.
    [Required]
    public int? TestCategoryId { get; set; }

    public bool? MicroSelected { get; set; }

    // DropDown control.  Choices come from ConfigurationMaintenanceSelectors.DayOfWeeks
    [Required]
    [StringLength(10)]
    public string? ReceivedDow { get; set; }

    // DropDown control.  Choices come from ConfigurationMaintenanceSelectors.DayOfWeeks
    [Required]
    [StringLength(10)]
    public string? NeededByDow { get; set; }

    // Format must be H:mm or HH:mm.
    [Required]
    [StringLength(5)]
    public string? NeededByTime { get; set; }

    // Lab Context. Set to Lab Context LabId on new()
    public int LabId { get; set; }

    public async Task<List<NeededByRs>> FetchNeededByRss(IQueryable<NeededBy> query)
    {
        var ret = await query.Select(q => new NeededByRs
        {
            LabId =     q.LabId,
            MicroSelected = q.MicroSelected,
            NeededByDow =  q.NeededByDow.ToString(),
            NeededById =   q.Id,
            NeededByTime = q.NeededByTime,
            ReceivedDow =  q.ReceivedDow.ToString(),
            TestCategoryId =   q.TestCategoryId
        }).ToListAsync();
        return ret;
    }
    
}