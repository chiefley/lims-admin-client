using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using NCLims.Models;

namespace NCLims.Business.NewBatch.ConfigurationManagement.Responses.Basic_Tables;

public class ItemTypeRs
{
    // Primary Key.  No display, no edit.
    public int ItemTypeId { get; set; }
    [Required]
    [StringLength(250)]
    public string Name { get; set; }
    // Part of Lab Context. Set to default of 2 on new()
    [Required]
    public int? StateId { get; set; } = 2;
    [Required]
    public bool? ReportPercent { get; set; }
    // Set to true on new().
    public bool Active { get; set; } = true;

    [JsonPropertyOrder(100)]
    public List<ItemCategoryRs> ItemCategories { get; set; } = [];

    public static async Task<List<ItemTypeRs>> FetchItemTypeRss(IQueryable<ItemType> query)
    {
        var ret = await query.Select(it => new ItemTypeRs
        {
            ItemTypeId = it.Id,
            Name = it.Name,
            StateId = it.StateId,
            ReportPercent = it.ReportPercent,
            Active = it.Active,
            ItemCategories = it.ItemCategories.Select(ic => new ItemCategoryRs
            {
                ItemCategoryId = ic.Id,
                ItemTypeId = ic.ItemTypeId,
                Name = ic.Name,
                CcSampleTypeId = ic.CcSampleTypeId,
                Description = ic.Description,
                StateId = it.StateId,
                SuppressLimits = ic.SuppressLimits,
                SuppressQfQn = ic.SuppressQfQn,
                Active = ic.Active
            }).ToList()
        }).ToListAsync();

        return ret;
    }
}