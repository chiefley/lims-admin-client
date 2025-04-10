using System.Collections.Generic;

namespace NCLims.Business.NewBatch.Sop;

public class ServiceResponse<T>
{
    public bool Success { get; set; }
    public string Message { get; set; }
    public T Data { get; set; }
    public List<ValidationError> ValidationErrors { get; set; } = [];
}

public class ValidationError
{
    public string PropertyName { get; set; }
    public string ErrorMessage { get; set; }
}