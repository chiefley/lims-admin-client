using System.ComponentModel.DataAnnotations;

namespace NCLims.Business.NewBatch.ConfigurationManagement.Responses.Basic_Tables;

public class CcSampleTypeRs
{
    // Primary Key.  No display, no edit.
    public int CcSampleTypeId { get; set; }
    // Foreign key.  No display, no edit.
    public int CategoryId { get; set; }
    [Required]
    [StringLength(150)]
    public string Name { get; set; }
}