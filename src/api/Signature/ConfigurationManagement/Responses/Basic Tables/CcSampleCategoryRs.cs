using NCLims.Models;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using NCLims.Data;
using FluentValidation;
using System;

namespace NCLims.Business.NewBatch.ConfigurationManagement.Responses.Basic_Tables;

public partial class CcSampleCategoryRs
{
    // Primary Key.  No display, no edit.
    public int CcSampleCategoryId { get; set; }
    [Required]
    [StringLength(50)]
    public string Name { get; set; }
    [Required]
    public int? DefaultCcSampleProductionMethodId { get; set; }

    [JsonPropertyOrder(100)]
    public List<CcSampleTypeRs> CcSampleTypeRss { get; set; } = [];

}