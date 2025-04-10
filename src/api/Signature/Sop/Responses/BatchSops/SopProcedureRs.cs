using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace NCLims.Business.NewBatch.Sop.Responses.BatchSops;

public class SopProcedureRs
{
    // Primary Key.  No display, no edit.
    public int SopProcedureId { get; set; }
    // Foreign Key. No display, no edit.
    // @validation: unique-combination: BatchSopId, Section, ProcedureName
    public int BatchSopId { get; set; }

    // @validation: unique-combination: BatchSopId, Section, ProcedureName
    [Required]
    [StringLength(50)]
    public string Section { get; set; }
    // @validation: unique-combination: BatchSopId, Section, ProcedureName
    [Required]
    [StringLength(50)]
    public string ProcedureName { get; set; }
    public List<SopProcedureItemRs> ProcedureItems { get; set; }
}