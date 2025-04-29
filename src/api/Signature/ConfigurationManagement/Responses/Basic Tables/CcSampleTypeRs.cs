using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using NCLims.Data;
using NCLims.Models;

namespace NCLims.Business.NewBatch.ConfigurationManagement.Responses.Basic_Tables;

public partial class CcSampleTypeRs
{
    // Primary Key.  No display, no edit.
    public int CcSampleTypeId { get; set; }
    // Foreign key.  No display, no edit.
    public int CategoryId { get; set; }
    [Required]
    [StringLength(150)]
    public string Name { get; set; }
}