using NCLims.Models.NewBatch;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using NCLims.Data;

namespace NCLims.Business.NewBatch.ConfigurationManagement.Responses.Basic_Tables;

// This is a deletable table.  Rows can be hard-deleted in the UI.
public partial class NavMenuItemRs
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
}