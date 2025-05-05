using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace NCLims.Business.NewBatch.ConfigurationManagement.Responses.Basic_Tables;

public partial class ItemTypeRs
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

}