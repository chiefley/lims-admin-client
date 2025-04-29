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

public partial class CompoundRs
{
    // Primary Key, no display.
    public int AnalyteId { get; set; }

    // @validation:  Must be unique.
    [Required] [StringLength(50)] public string Cas { get; set; }

    [Required] [StringLength(150)] public string Name { get; set; }

    [StringLength(150)] public string CcCompoundName { get; set; }

    // Defaults to true on new.
    public bool Active { get; set; } = true;

}