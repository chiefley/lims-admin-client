using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace NCLims.Business.NewBatch.Sop.Responses;

public class SopProcedureRs
{
    // Primary Key.  No display, no edit.
    public int BatchSopId { get; set; }
    // Foreign Key. No display, no edit.
    public int SopProcedureId { get; set; }
    [Required]
    [StringLength(50)]
    public string Section { get; set; }
    [Required]
    [StringLength(50)]
    public string ProcedureName { get; set; }
    public List<SopProcedureItemRs> ProcedureItems { get; set; }
}