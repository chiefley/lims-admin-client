using NCLims.Models.NewBatch.LabAssets;
using NCLims.Models;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NCLims.Business.NewBatch.Sop.Responses;

public class InstrumentRs
{
    // Primary Key.  No display. No edit
    public int InstrumentId { get; set; }
    // Foreign Key to parent.  No display, No edit.
    public int InstrumentTypeId { get; set; }
    // @validation, Unique for all Names.
    [Required]
    [StringLength(150)]
    public string? Name { get; set; }
    public DateTime? LastPM { get; set; }
    public DateTime? NextPm { get; set; }
    public bool OutOfService { get; set; }
    public List<InstrumentPeripheralRs> InstrumentPeripheralRss { get; set; } = [];
}