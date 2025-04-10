using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace NCLims.Business.NewBatch.Sop.Responses.Lab_Assets;

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