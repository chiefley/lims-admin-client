using NCLims.Models.NewBatch;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace NCLims.Business.NewBatch.ConfigurationManagement.Responses.Basic_Tables;

// This is a deletable table.  Rows can be hard-deleted in the UI.
public class NavMenuItemRs
{
    // Primary key.  No display, no edit.
    public int NavMenuItemId { get; set; }
    // Foreign Key to parent.  No display, no edit.
    public int? ParentNavMenuItemId { get; set; }

    // Combobox control.  Choices come from ConfigurationMaintenanceSelectors.NavMenuKeys.
    [Required]
    public string? MenuKey { get; set; }

    // @validation:  Unique constraint(Name, LabId)
    [Required]
    [StringLength(50)]
    public string? Name { get; set; }

    // @validation:  Unique constraint(Slug, LabId)
    [Required]
    [StringLength(50)]
    public string? Slug { get; set; }
    [StringLength(250)]
    public string? Url { get; set; }
    [StringLength(250)]
    public string? UrlArgs { get; set; }


    [StringLength(500)]
    public string? Icon { get; set; }
    [Required]
    public int? Order { get; set; }

    [StringLength(250)]
    public string? SpecialProcessingMethod { get; set; }
    [StringLength(500)]
    public string? SpecialProcessingArgs { get; set; }

    [Required]
    [StringLength(250)]
    public string? PageTitle { get; set; }

    // @validation:  Unique constraint(Slug, LabId)
    // @validation:  Unique constraint(Name, LabId)
    // Set to lab contexts LabId on new()
    [Required]
    public int LabId { get; set; }

    [JsonPropertyOrder(100)]
    public List<NavMenuItemRs> ChildItems { get; set; } = [];

    public static async Task<List<NavMenuItemRs>> FetchNavItems(IQueryable<NavMenuItem> query)
    {
        var flatItems = await query
            .Select(q => new NavMenuItemRs()
            {
                Name = q.Name,
                Icon = q.Icon,
                MenuKey = q.MenuKey.ToString(),
                Order = q.Order,
                SpecialProcessingMethod = q.SpecialProcessingMethod,
                SpecialProcessingArgs = q.SpecialProcessingArgs,
                Url = q.Url,
                UrlArgs = q.UrlArgs,
                PageTitle = q.PageTitle,
                LabId = q.LabId,
                Slug = q.Slug,
                NavMenuItemId = q.Id,
                ParentNavMenuItemId =  q.ParentItemId
            }).ToListAsync();

        var hierarchy = flatItems
            .Where(fi => fi.ParentNavMenuItemId is null)
            .ToList();

        // Assemble the items in their hierarchy.
        foreach (var fi in flatItems)
        {
            var childItems = flatItems
                .Where(it => it.ParentNavMenuItemId == fi.NavMenuItemId)
                .ToList();

            fi.ChildItems = childItems;
        }
        return hierarchy;
    }
}