using NCLims.Models;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace NCLims.Business.NewBatch.ConfigurationManagement.Responses.Basic_Tables;

public class TestCategoryRs
{
    // Primary Key.  No display, no edit.
    public int TestCategoryId { get; set; }
    [Required]
    [StringLength(50)]
    public string? Name { get; set; }
    [StringLength(250)]
    public string? Description { get; set; }

    // Lab context.  Set to 1001 on new()
    // No display, no edit.
    public int StateId { get; set; }
    public int? CcTestPackageId { get; set; }

    // Default to true on new()
    public bool Active { get; set; } = true;

    public static async Task<List<TestCategoryRs>> FetchTestCategoryRss(IQueryable<TestCategory> query)
    {
        var ret = await query.Select(q => new TestCategoryRs
        {
            Name = q.Name,
            Description = q.Description,
            StateId = q.StateId,
            CcTestPackageId = q.CcTestPackageId,
            TestCategoryId =   q.Id,
            Active = q.Active
        }).ToListAsync();
        return ret;
    }
}