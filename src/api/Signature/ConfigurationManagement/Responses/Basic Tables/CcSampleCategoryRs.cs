using NCLims.Models;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace NCLims.Business.NewBatch.ConfigurationManagement.Responses.Basic_Tables;

public class CcSampleCategoryRs
{
    // Primary Key.  No display, no edit.
    public int CcSampleCategoryId { get; set; }
    [Required]
    [StringLength(50)]
    public string Name { get; set; }
    [Required]
    public int? DefaultCcSampleProductionMethodId { get; set; }

    [JsonPropertyOrder(100)]
    public List<CcSampleTypeRs> CcSampleTypeRss { get; set; }

    public static async Task<List<CcSampleCategoryRs>> FetchCcSampleCategoryRss(IQueryable<CcSampleCategory> query)
    {
        var ret = await query.Select(ccs => new CcSampleCategoryRs
        {
            Name = ccs.Name,
            CcSampleCategoryId = ccs.CcId,
            DefaultCcSampleProductionMethodId = ccs.DefaultCcSampleProductionMethodId,
            CcSampleTypeRss = ccs.SampleTypes.Select(cct => new CcSampleTypeRs
            {
                CcSampleTypeId = cct.CcId,
                CategoryId = ccs.CcId,
            }).ToList()
        }).ToListAsync();
        return ret;
    }
}