using FluentValidation;
using NCLims.Data;
using NCLims.Models.NewBatch;
using System.Collections.Generic;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace NCLims.Business.NewBatch.ConfigurationManagement.Responses.Basic_Tables;


public abstract partial  class FileParserFieldRs
{
    public static ValidationResult Validate(FileParserFieldRs field, List<FileParserFieldRs> existingFields)
    {
        AbstractValidator<FileParserFieldRs> validator;

        if (field is TableValueParserFieldRs tableField)
        {
            validator = new TableValueParserFieldRsValidator(existingFields);
        }
        else
        {
            validator = new FileParserFieldRsValidator(existingFields);
        }

        var validationResult = validator.Validate(field);

        var result = new ValidationResult
        {
            IsValid = validationResult.IsValid,
            Errors = validationResult.Errors.Select(e => new ValidationError
            {
                PropertyName = e.PropertyName,
                ErrorMessage = e.ErrorMessage
            }).ToList()
        };

        return result;
    }

    // Upsert method for handling a collection of fields
    public static async Task UpsertFromResponses(
        List<FileParserFieldRs> responses,
        List<FileParserField> existingFields,
        FileParser fileParser,
        NCLimsContext context)
    {
        if (responses == null) throw new ArgumentNullException(nameof(responses));
        if (existingFields == null) throw new ArgumentNullException(nameof(existingFields));
        if (fileParser == null) throw new ArgumentNullException(nameof(fileParser));
        if (context == null) throw new ArgumentNullException(nameof(context));

        // Handle removal of fields not in the response
        var fieldsToRemove = new List<FileParserField>();
        foreach (var existingField in existingFields)
        {
            var responseField = responses.SingleOrDefault(r => r.FileParserFieldId == existingField.Id);
            if (responseField == null)
            {
                fieldsToRemove.Add(existingField);
            }
        }

        foreach (var fieldToRemove in fieldsToRemove)
        {
            fileParser.Fields.Remove(fieldToRemove);
            context.Remove(fieldToRemove);
        }

        // Update or create fields
        foreach (var response in responses)
        {
            FileParserField field;

            if (response.FileParserFieldId <= 0)
            {
                // Create new field
                if (response is TableValueParserFieldRs tableField)
                {
                    field = new TableValueParserField();
                }
                else
                {
                    field = new SingleValueParserField();
                }

                fileParser.Fields.Add(field);
                context.Add(field);
            }
            else
            {
                // Find existing field
                field = existingFields.SingleOrDefault(f => f.Id == response.FileParserFieldId)
                    ?? throw new KeyNotFoundException($"Field with ID {response.FileParserFieldId} not found");

                // Check for type mismatch and handle appropriately
                if (response is TableValueParserFieldRs tableField && field is not TableValueParserField)
                {
                    // Type mismatch - remove old field and create new one
                    fileParser.Fields.Remove(field);
                    context.Remove(field);

                    field = new TableValueParserField();
                    fileParser.Fields.Add(field);
                    context.Add(field);
                }
                else if (response is not TableValueParserFieldRs && field is TableValueParserField)
                {
                    // Type mismatch - remove old field and create new one
                    fileParser.Fields.Remove(field);
                    context.Remove(field);

                    field = new SingleValueParserField();
                    fileParser.Fields.Add(field);
                    context.Add(field);
                }
            }

            // Update common properties
            field.FieldName = response.FieldName;
            field.Required = response.Required ?? false;
            field.FileVersionSignal = response.FileVersionSignal ?? false;
            field.BindingProperty = response.BindingProperty;
            field.Minimum = response.Minimum;
            field.Maximum = response.Maximum;
            field.DefaultValue = response.DefaultValue;
            field.NotApplicableSignal = response.NotApplicableSignal;
            field.UseDefaultIfNoParse = response.UseDefaultIfNoParse ?? false;
            field.RegexFormat = response.RegexFormat;
            field.DataFileLevel = Enum.Parse<DataFileLevel>(response.DataFileLevel!);
            field.SectionOrTableName = response.SectionOrTableName;
            field.FileParserId = fileParser.Id;

            // Update type-specific properties
            if (response is TableValueParserFieldRs tableValueResponse && field is TableValueParserField tableValueField)
            {
                tableValueField.ColumnIndex = tableValueResponse.ColumnIndex ?? 0;
            }
        }
    }
}

public partial class SingleValueParserFieldRs : FileParserFieldRs
{
 
}

public partial class TableValueParserFieldRs : SingleValueParserFieldRs
{
  
}

public class FileParserFieldRsValidator : AbstractValidator<FileParserFieldRs>
{
    public FileParserFieldRsValidator()
    {
    }

    public FileParserFieldRsValidator(List<FileParserFieldRs> existingFields)
    {
        RuleFor(x => x.FieldName)
            .NotEmpty().WithMessage("Field name is required")
            .MaximumLength(50).WithMessage("Field name cannot exceed 50 characters");

        RuleFor(x => x.BindingProperty)
            .NotEmpty().WithMessage("Binding property is required")
            .MaximumLength(50).WithMessage("Binding property cannot exceed 50 characters");

        RuleFor(x => x.Minimum)
            .MaximumLength(50).WithMessage("Minimum value cannot exceed 50 characters");

        RuleFor(x => x.Maximum)
            .MaximumLength(50).WithMessage("Maximum value cannot exceed 50 characters");

        RuleFor(x => x.DefaultValue)
            .MaximumLength(50).WithMessage("Default value cannot exceed 50 characters");

        RuleFor(x => x.NotApplicableSignal)
            .MaximumLength(50).WithMessage("Not applicable signal cannot exceed 50 characters");

        RuleFor(x => x.RegexFormat)
            .MaximumLength(250).WithMessage("Regex format cannot exceed 250 characters");

        RuleFor(x => x.DataFileLevel)
            .NotEmpty().WithMessage("Data file level is required")
            .Must(BeValidDataFileLevel).WithMessage("Invalid data file level");

        RuleFor(x => x.SectionOrTableName)
            .NotEmpty().WithMessage("Section or table name is required")
            .MaximumLength(50).WithMessage("Section or table name cannot exceed 50 characters");

        // Validate uniqueness of field name within parser
        RuleFor(x => x)
            .Must((field, _) => !HasDuplicateFieldName(field, existingFields))
            .WithMessage("A field with this name already exists for this parser");
    }

    private bool BeValidDataFileLevel(string dataFileLevel)
    {
        return !string.IsNullOrEmpty(dataFileLevel) && Enum.TryParse<DataFileLevel>(dataFileLevel, out _);
    }

    private bool HasDuplicateFieldName(FileParserFieldRs field, IEnumerable<FileParserFieldRs> existingFields)
    {
        return existingFields.Any(x =>
            x.FieldName == field.FieldName &&
            x.FileParserFieldId != field.FileParserFieldId);
    }
}

// Additional validator for TableValueParserFieldRs
public class TableValueParserFieldRsValidator : FileParserFieldRsValidator
{
    public TableValueParserFieldRsValidator()
    {
    }

    public TableValueParserFieldRsValidator(List<FileParserFieldRs> existingFields)
        : base(existingFields)
    {
        RuleFor(x => ((TableValueParserFieldRs)x).ColumnIndex)
            .NotNull().WithMessage("Column index is required")
            .GreaterThanOrEqualTo(0).WithMessage("Column index must be non-negative");
    }
}