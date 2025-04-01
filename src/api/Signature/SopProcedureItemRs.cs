using System.ComponentModel.DataAnnotations;

namespace NCLims.Business.NewBatch.Sop.Responses;

public class SopProcedureItemRs
{
    // Primary Key.  No display, no edit.
    public int SopProcedurItemId { get; set; }
    // Foreign Key to parent.  No display, no edit.
    public int SopProcedureId { get; set; }
    // Sortable
    [Required]
    public int Order { get; set; } = 0;
    [StringLength(50)]
    public string? ItemNumber { get; set; }
    [StringLength(500)]
    public string Text { get; set; }
    public int IndentLevel { get; set; } = 0;
}