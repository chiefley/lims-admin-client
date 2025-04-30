namespace NCLims.Business.NewBatch.ConfigurationManagement;

/// <summary>
/// Represents a single validation error
/// </summary>
public class ValidationError
{
    /// <summary>
    /// The property that failed validation
    /// </summary>
    public string PropertyName { get; set; }

    /// <summary>
    /// The validation error message
    /// </summary>
    public string ErrorMessage { get; set; }
}