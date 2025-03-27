
// This is the form of the response from all of the API methods.  
// The actual payload is in the Data property.

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