using System.Collections.Generic;

namespace NCLims.Business.NewBatch.ConfigurationManagement;

/// <summary>
/// Contains validation result information
/// </summary>
public class ValidationResult
{
    /// <summary>
    /// Whether validation passed
    /// </summary>
    public bool IsValid { get; set; } = true;

    /// <summary>
    /// List of validation errors if validation failed
    /// </summary>
    public List<ValidationError> Errors { get; set; } = [];
}