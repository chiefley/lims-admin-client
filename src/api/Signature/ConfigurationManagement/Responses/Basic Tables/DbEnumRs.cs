using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using NCLims.Data;
using DBEnum = NCLims.Models.NewBatch.DBEnum;

namespace NCLims.Business.NewBatch.ConfigurationManagement.Responses.Basic_Tables;

public partial class DBEnumRs
{
    // Primary key, no display, no edit
    public int DbEnumId { get; set; }

    // @validation:  Unique constraint (Name, Enum, LabId)
    [Required] [StringLength(150)] public string Name { get; set; }

    // @validation:  Unique constraint (Name, Enum, LabId)
    // Combobox control. Choices come from ConfigurationMaintenanceSelectors.DBEnumTypes.
    [Required] [StringLength(150)] public string Enum { get; set; }

    // Lab Context. No display, no edit.
    public int LabId { get; set; }
}
    
