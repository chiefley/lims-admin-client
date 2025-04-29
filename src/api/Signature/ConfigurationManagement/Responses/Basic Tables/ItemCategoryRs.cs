using System;
using System.ComponentModel.DataAnnotations;

namespace NCLims.Business.NewBatch.ConfigurationManagement.Responses.Basic_Tables;

public partial class ItemCategoryRs
{
    // Primary Key.  No display, no edit.
    public int ItemCategoryId { get; set; }
    [Required]
    public string? Name { get; set; }
    [StringLength(250)]
    public string? Description { get; set; }
    // Foreign key to parent ItemType
    public int ItemTypeId { get; set; }
    // Set to false on new().
    public bool SuppressQfQn { get; set; } = false;
    [Required]
    [Obsolete("The stateid should only be in the ItemType.")]
    public int StateId { get; set; }
    // Dropdown control.  Choices come from ConfigurationMaintenanceSelectors.CCSampleTypes. 
    // Nullable.  Not required.
    public int? CcSampleTypeId { get; set; }
    // Set to false on new().
    public bool SuppressLimits { get; set; } = false;

    // Default to true on new()
    public bool Active { get; set; } = true;

}