using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using NCLims.Models;

namespace NCLims.Business.NewBatch.Sop.Responses.Basic_Tables;

public class CompoundRs
{
    // Primary Key, no display.
    public int AnalyteId { get; set; }

    // @validation:  Must be unique.
    [Required]
    [StringLength(50)] 
    public string Cas { get; set; }

    [Required]
    [StringLength(150)] 
    public string Name { get; set; }

    [StringLength(150)] 
    public string CcCompoundName { get; set; }

    public static async Task<List<CompoundRs>> FetchAnalyteRs(IQueryable<Analyte> query)
    {
        var ret = await query.Select(an => new CompoundRs
        {
            Name = an.Name,
            CcCompoundName = an.CcCompoundName,
            AnalyteId = an.Id,
            Cas = an.Cas
        }).ToListAsync();

        return ret;
    }
}