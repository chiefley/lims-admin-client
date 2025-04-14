using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using NCLims.Models;

namespace NCLims.Business.NewBatch.ConfigurationManagement.Responses.Lab_Assets;

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
    // Date part Only
    public DateTime? LastPM { get; set; }
    // Date part only.
    public DateTime? NextPm { get; set; }
    public bool OutOfService { get; set; }
    // Defaults to true.
    public bool Active { get; set; } = true;

    [JsonPropertyOrder(100)]
    public List<InstrumentPeripheralRs> InstrumentPeripheralRss { get; set; } = [];
}