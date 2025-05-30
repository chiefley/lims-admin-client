using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FluentValidation;
using NCLims.Data;
using NCLims.Models.NewBatch;

namespace NCLims.Business.NewBatch.ConfigurationManagement.Responses.BatchSops;

public abstract partial class SopFieldRs
{

    public void Map(SopField model)
    {
        BatchSopId = model.BatchSopId;
        Section = model.Section;
        Name = model.Name;
        DisplayName = model.DisplayName;
        Row = model.Row;
        Column = model.Column;
        BatchPropertyName = model.BatchPropertyName;
        Required = model.Required;
        ReadOnly = model.ReadOnly;
        RequiredMessage = model.RequiredMessage;
        MinValueMessage = model.MinValueMessage;
        MaxValueMessage = model.MaxValueMessage;
        RegexMessage = model.RegexMessage;
    }


    // SopFieldRs validation and upsert methods
    // Factory method to create the appropriate SopFieldRs based on the SopField type
    public static SopFieldRs Create(SopField sopField)
    {
        return sopField switch
        {
            DateTimeSopField dateTimeField => new DateTimeSopFieldRs
            {
                SopFieldId = dateTimeField.Id,
                BatchSopId = dateTimeField.BatchSopId,
                Section = dateTimeField.Section,
                Name = dateTimeField.Name,
                DisplayName = dateTimeField.DisplayName,
                Row = dateTimeField.Row,
                Column = dateTimeField.Column,
                BatchPropertyName = dateTimeField.BatchPropertyName,
                Required = dateTimeField.Required,
                ReadOnly = dateTimeField.ReadOnly,
                RequiredMessage = dateTimeField.RequiredMessage,
                MinValueMessage = dateTimeField.MinValueMessage,
                MaxValueMessage = dateTimeField.MaxValueMessage,
                RegexMessage = dateTimeField.RegexMessage,
                DatePartOnly = dateTimeField.DatePartOnly
            },
            DoubleSopField doubleField => new DoubleSopFieldRs
            {
                SopFieldId = doubleField.Id,
                BatchSopId = doubleField.BatchSopId,
                Section = doubleField.Section,
                Name = doubleField.Name,
                DisplayName = doubleField.DisplayName,
                Row = doubleField.Row,
                Column = doubleField.Column,
                BatchPropertyName = doubleField.BatchPropertyName,
                Required = doubleField.Required,
                ReadOnly = doubleField.ReadOnly,
                RequiredMessage = doubleField.RequiredMessage,
                MinValueMessage = doubleField.MinValueMessage,
                MaxValueMessage = doubleField.MaxValueMessage,
                RegexMessage = doubleField.RegexMessage,
                MinDoubleValue = doubleField.MinDoubleValue,
                MaxDoubleValue = doubleField.MaxDoubleValue,
                Precision = doubleField.Precision
            },
            LabAssetSopField labAssetField => new LabAssetSopFieldRs
            {
                SopFieldId = labAssetField.Id,
                BatchSopId = labAssetField.BatchSopId,
                Section = labAssetField.Section,
                Name = labAssetField.Name,
                DisplayName = labAssetField.DisplayName,
                Row = labAssetField.Row,
                Column = labAssetField.Column,
                BatchPropertyName = labAssetField.BatchPropertyName,
                Required = labAssetField.Required,
                ReadOnly = labAssetField.ReadOnly,
                RequiredMessage = labAssetField.RequiredMessage,
                MinValueMessage = labAssetField.MinValueMessage,
                MaxValueMessage = labAssetField.MaxValueMessage,
                RegexMessage = labAssetField.RegexMessage,
                LabAssetTypeId = labAssetField.LabAssetTypeId
            },
            InstrumentTypeSopField instrumentTypeField => new InstrumentTypeSopFieldRs
            {
                SopFieldId = instrumentTypeField.Id,
                BatchSopId = instrumentTypeField.BatchSopId,
                Section = instrumentTypeField.Section,
                Name = instrumentTypeField.Name,
                DisplayName = instrumentTypeField.DisplayName,
                Row = instrumentTypeField.Row,
                Column = instrumentTypeField.Column,
                BatchPropertyName = instrumentTypeField.BatchPropertyName,
                Required = instrumentTypeField.Required,
                ReadOnly = instrumentTypeField.ReadOnly,
                RequiredMessage = instrumentTypeField.RequiredMessage,
                MinValueMessage = instrumentTypeField.MinValueMessage,
                MaxValueMessage = instrumentTypeField.MaxValueMessage,
                RegexMessage = instrumentTypeField.RegexMessage,
                InstrumentTypeId = instrumentTypeField.InstrumentTypeId
            },
            SopEnumSopField sopEnumField => new SopEnumSopFieldRs
            {
                SopFieldId = sopEnumField.Id,
                BatchSopId = sopEnumField.BatchSopId,
                Section = sopEnumField.Section,
                Name = sopEnumField.Name,
                DisplayName = sopEnumField.DisplayName,
                Row = sopEnumField.Row,
                Column = sopEnumField.Column,
                BatchPropertyName = sopEnumField.BatchPropertyName,
                Required = sopEnumField.Required,
                ReadOnly = sopEnumField.ReadOnly,
                RequiredMessage = sopEnumField.RequiredMessage,
                MinValueMessage = sopEnumField.MinValueMessage,
                MaxValueMessage = sopEnumField.MaxValueMessage,
                RegexMessage = sopEnumField.RegexMessage,
                SopEnumTypeId = sopEnumField.SopEnumTypeId
            },
            UserSopField userField => new UserSopFieldRs
            {
                SopFieldId = userField.Id,
                BatchSopId = userField.BatchSopId,
                Section = userField.Section,
                Name = userField.Name,
                DisplayName = userField.DisplayName,
                Row = userField.Row,
                Column = userField.Column,
                BatchPropertyName = userField.BatchPropertyName,
                Required = userField.Required,
                ReadOnly = userField.ReadOnly,
                RequiredMessage = userField.RequiredMessage,
                MinValueMessage = userField.MinValueMessage,
                MaxValueMessage = userField.MaxValueMessage,
                RegexMessage = userField.RegexMessage,
                ApplicationRoleId = userField.ApplicationRoleId
            },
            TextSopField textField => new TextSopFieldRs
            {
                SopFieldId = textField.Id,
                BatchSopId = textField.BatchSopId,
                Section = textField.Section,
                Name = textField.Name,
                DisplayName = textField.DisplayName,
                Row = textField.Row,
                Column = textField.Column,
                BatchPropertyName = textField.BatchPropertyName,
                Required = textField.Required,
                ReadOnly = textField.ReadOnly,
                RequiredMessage = textField.RequiredMessage,
                MinValueMessage = textField.MinValueMessage,
                MaxValueMessage = textField.MaxValueMessage,
                RegexMessage = textField.RegexMessage
            },
            TableColumnTextSopField tableColumnTextField => new TableColumnTextSopFieldRs
            {
                SopFieldId = tableColumnTextField.Id,
                BatchSopId = tableColumnTextField.BatchSopId,
                Section = tableColumnTextField.Section,
                Name = tableColumnTextField.Name,
                DisplayName = tableColumnTextField.DisplayName,
                Row = tableColumnTextField.Row,
                Column = tableColumnTextField.Column,
                BatchPropertyName = tableColumnTextField.BatchPropertyName,
                Required = tableColumnTextField.Required,
                ReadOnly = tableColumnTextField.ReadOnly,
                RequiredMessage = tableColumnTextField.RequiredMessage,
                MinValueMessage = tableColumnTextField.MinValueMessage,
                MaxValueMessage = tableColumnTextField.MaxValueMessage,
                RegexMessage = tableColumnTextField.RegexMessage,
                TableName = tableColumnTextField.TableName,
                ColumnWidth = tableColumnTextField.ColumnWidth,
                VmPropertyName = tableColumnTextField.VmPropertyName,
                ValidationRegex = tableColumnTextField.ValidationRegex,
                MinLength = tableColumnTextField.MinLength,
                MaxLength = tableColumnTextField.MaxLength
            },
            TableColumnIntSopField tableColumnIntField => new TableColumnIntSopFieldRs
            {
                SopFieldId = tableColumnIntField.Id,
                BatchSopId = tableColumnIntField.BatchSopId,
                Section = tableColumnIntField.Section,
                Name = tableColumnIntField.Name,
                DisplayName = tableColumnIntField.DisplayName,
                Row = tableColumnIntField.Row,
                Column = tableColumnIntField.Column,
                BatchPropertyName = tableColumnIntField.BatchPropertyName,
                Required = tableColumnIntField.Required,
                ReadOnly = tableColumnIntField.ReadOnly,
                RequiredMessage = tableColumnIntField.RequiredMessage,
                MinValueMessage = tableColumnIntField.MinValueMessage,
                MaxValueMessage = tableColumnIntField.MaxValueMessage,
                RegexMessage = tableColumnIntField.RegexMessage,
                TableName = tableColumnIntField.TableName,
                ColumnWidth = tableColumnIntField.ColumnWidth,
                VmPropertyName = tableColumnIntField.VmPropertyName,
                MinIntValue = tableColumnIntField.MinIntValue,
                MaxIntValue = tableColumnIntField.MaxIntValue
            },
            TableColumnDoubleSopField tableColumnDoubleField => new TableColumnDoubleSopFieldRs
            {
                SopFieldId = tableColumnDoubleField.Id,
                BatchSopId = tableColumnDoubleField.BatchSopId,
                Section = tableColumnDoubleField.Section,
                Name = tableColumnDoubleField.Name,
                DisplayName = tableColumnDoubleField.DisplayName,
                Row = tableColumnDoubleField.Row,
                Column = tableColumnDoubleField.Column,
                BatchPropertyName = tableColumnDoubleField.BatchPropertyName,
                Required = tableColumnDoubleField.Required,
                ReadOnly = tableColumnDoubleField.ReadOnly,
                RequiredMessage = tableColumnDoubleField.RequiredMessage,
                MinValueMessage = tableColumnDoubleField.MinValueMessage,
                MaxValueMessage = tableColumnDoubleField.MaxValueMessage,
                RegexMessage = tableColumnDoubleField.RegexMessage,
                TableName = tableColumnDoubleField.TableName,
                ColumnWidth = tableColumnDoubleField.ColumnWidth,
                VmPropertyName = tableColumnDoubleField.VmPropertyName,
                MinDoubleValue = tableColumnDoubleField.MinDoubleValue,
                MaxDoubleValue = tableColumnDoubleField.MaxDoubleValue,
                Precision = tableColumnDoubleField.Precision
            },
            TableColumnDateTimeField tableColumnDateTimeField => new TableColumnDateTimeFieldRs
            {
                SopFieldId = tableColumnDateTimeField.Id,
                BatchSopId = tableColumnDateTimeField.BatchSopId,
                Section = tableColumnDateTimeField.Section,
                Name = tableColumnDateTimeField.Name,
                DisplayName = tableColumnDateTimeField.DisplayName,
                Row = tableColumnDateTimeField.Row,
                Column = tableColumnDateTimeField.Column,
                BatchPropertyName = tableColumnDateTimeField.BatchPropertyName,
                Required = tableColumnDateTimeField.Required,
                ReadOnly = tableColumnDateTimeField.ReadOnly,
                RequiredMessage = tableColumnDateTimeField.RequiredMessage,
                MinValueMessage = tableColumnDateTimeField.MinValueMessage,
                MaxValueMessage = tableColumnDateTimeField.MaxValueMessage,
                RegexMessage = tableColumnDateTimeField.RegexMessage,
                TableName = tableColumnDateTimeField.TableName,
                ColumnWidth = tableColumnDateTimeField.ColumnWidth,
                VmPropertyName = tableColumnDateTimeField.VmPropertyName,
                DatePartOnly = tableColumnDateTimeField.DatePartOnly
            },
            TableColumnSopEnumField tableColumnSopEnumField => new TableColumnSopEnumFieldRs
            {
                SopFieldId = tableColumnSopEnumField.Id,
                BatchSopId = tableColumnSopEnumField.BatchSopId,
                Section = tableColumnSopEnumField.Section,
                Name = tableColumnSopEnumField.Name,
                DisplayName = tableColumnSopEnumField.DisplayName,
                Row = tableColumnSopEnumField.Row,
                Column = tableColumnSopEnumField.Column,
                BatchPropertyName = tableColumnSopEnumField.BatchPropertyName,
                Required = tableColumnSopEnumField.Required,
                ReadOnly = tableColumnSopEnumField.ReadOnly,
                RequiredMessage = tableColumnSopEnumField.RequiredMessage,
                MinValueMessage = tableColumnSopEnumField.MinValueMessage,
                MaxValueMessage = tableColumnSopEnumField.MaxValueMessage,
                RegexMessage = tableColumnSopEnumField.RegexMessage,
                TableName = tableColumnSopEnumField.TableName,
                ColumnWidth = tableColumnSopEnumField.ColumnWidth,
                VmPropertyName = tableColumnSopEnumField.VmPropertyName
            },
            _ => throw new NotSupportedException($"Unsupported SopField type: {sopField.GetType().Name}")
        };
    }

    public static ValidationResult Validate(SopFieldRs sopFieldRs)
    {
        // Base validation for all SopField types
        var baseValidator = new SopFieldRsBaseValidator();
        var baseValidationResult = baseValidator.Validate(sopFieldRs);

        var result = new ValidationResult
        {
            IsValid = baseValidationResult.IsValid,
            Errors = baseValidationResult.Errors.Select(e => new ValidationError
            {
                PropertyName = e.PropertyName,
                ErrorMessage = e.ErrorMessage
            }).ToList()
        };

        // Type-specific validation
        AbstractValidator<SopFieldRs> typeValidator = sopFieldRs switch
        {
            DateTimeSopFieldRs => new DateTimeSopFieldRsValidator(),
            DoubleSopFieldRs => new DoubleSopFieldRsValidator(),
            LabAssetSopFieldRs => new LabAssetSopFieldRsValidator(),
            InstrumentTypeSopFieldRs => new InstrumentTypeSopFieldRsValidator(),
            SopEnumSopFieldRs => new SopEnumSopFieldRsValidator(),
            UserSopFieldRs => new UserSopFieldRsValidator(),
            TextSopFieldRs => new TextSopFieldRsValidator(),
            TableColumnTextSopFieldRs => new TableColumnTextSopFieldRsValidator(),
            TableColumnIntSopFieldRs => new TableColumnIntSopFieldRsValidator(),
            TableColumnDoubleSopFieldRs => new TableColumnDoubleSopFieldRsValidator(),
            TableColumnDateTimeFieldRs => new TableColumnDateTimeFieldRsValidator(),
            TableColumnSopEnumFieldRs => new TableColumnSopEnumFieldRsValidator(),
            _ => throw new NotSupportedException($"Unsupported SopFieldRs type: {sopFieldRs.GetType().Name}")
        };

        var typeValidationResult = typeValidator.Validate(sopFieldRs);
        if (!typeValidationResult.IsValid)
        {
            result.IsValid = false;
            result.Errors.AddRange(typeValidationResult.Errors.Select(e => new ValidationError
            {
                PropertyName = e.PropertyName,
                ErrorMessage = e.ErrorMessage
            }));
        }

        return result;
    }

    public static async Task UpsertFromResponses(
        List<SopFieldRs> responses,
        List<SopField> existingFields,
        BatchSop batchSop,
        NCLimsContext context)
    {
        if (responses == null) throw new ArgumentNullException(nameof(responses));
        if (existingFields == null) throw new ArgumentNullException(nameof(existingFields));
        if (batchSop == null) throw new ArgumentNullException(nameof(batchSop));
        if (context == null) throw new ArgumentNullException(nameof(context));

        // Remove fields that are no longer in the response
        foreach (var existingField in existingFields)
        {
            if (!responses.Any(r => r.SopFieldId == existingField.Id))
            {
                batchSop.SopFields.Remove(existingField);
                context.Remove(existingField);
            }
        }

        // Update or add fields from the response
        foreach (var response in responses)
        {
            SopField field;

            if (response.SopFieldId <= 0)
            {
                // New field, create instance of the appropriate type
                field = CreateSopFieldInstance(response);
                batchSop.SopFields.Add(field);
                context.Add(field);
            }
            else
            {
                // Existing field
                field = existingFields.SingleOrDefault(f => f.Id == response.SopFieldId)
                        ?? throw new KeyNotFoundException($"SopField with ID {response.SopFieldId} not found");

                // If the field type has changed, we need to create a new instance
                if (!IsMatchingFieldType(field, response))
                {
                    batchSop.SopFields.Remove(field);
                    context.Remove(field);

                    field = CreateSopFieldInstance(response);
                    batchSop.SopFields.Add(field);
                    context.Add(field);
                }
            }

            // Update common properties
            field.BatchSopId = batchSop.Id;
            field.BatchSop = batchSop;
            field.Section = response.Section;
            field.Name = response.Name;
            field.DisplayName = response.DisplayName;
            field.Row = response.Row;
            field.Column = response.Column;
            field.BatchPropertyName = response.BatchPropertyName;
            field.Required = response.Required;
            field.ReadOnly = response.ReadOnly;
            field.RequiredMessage = response.RequiredMessage;
            field.MinValueMessage = response.MinValueMessage;
            field.MaxValueMessage = response.MaxValueMessage;
            field.RegexMessage = response.RegexMessage;

            // Update type-specific properties
            UpdateTypeSpecificProperties(field, response);
        }
    }

    private static SopField CreateSopFieldInstance(SopFieldRs response)
    {
        return response switch
        {
            DateTimeSopFieldRs => new DateTimeSopField(),
            DoubleSopFieldRs => new DoubleSopField(),
            LabAssetSopFieldRs => new LabAssetSopField(),
            InstrumentTypeSopFieldRs => new InstrumentTypeSopField(),
            SopEnumSopFieldRs => new SopEnumSopField(),
            UserSopFieldRs => new UserSopField(),
            TextSopFieldRs => new TextSopField(),
            TableColumnTextSopFieldRs => new TableColumnTextSopField(),
            TableColumnIntSopFieldRs => new TableColumnIntSopField(),
            TableColumnDoubleSopFieldRs => new TableColumnDoubleSopField(),
            TableColumnDateTimeFieldRs => new TableColumnDateTimeField(),
            TableColumnSopEnumFieldRs => new TableColumnSopEnumField(),
            _ => throw new NotSupportedException($"Unsupported SopFieldRs type: {response.GetType().Name}")
        };
    }

    private static bool IsMatchingFieldType(SopField field, SopFieldRs response)
    {
        return (field, response) switch
        {
            (DateTimeSopField, DateTimeSopFieldRs) => true,
            (DoubleSopField, DoubleSopFieldRs) => true,
            (LabAssetSopField, LabAssetSopFieldRs) => true,
            (InstrumentTypeSopField, InstrumentTypeSopFieldRs) => true,
            (SopEnumSopField, SopEnumSopFieldRs) => true,
            (UserSopField, UserSopFieldRs) => true,
            (TextSopField, TextSopFieldRs) => true,
            (TableColumnTextSopField, TableColumnTextSopFieldRs) => true,
            (TableColumnIntSopField, TableColumnIntSopFieldRs) => true,
            (TableColumnDoubleSopField, TableColumnDoubleSopFieldRs) => true,
            (TableColumnDateTimeField, TableColumnDateTimeFieldRs) => true,
            (TableColumnSopEnumField, TableColumnSopEnumFieldRs) => true,
            _ => false
        };
    }

    private static void UpdateTypeSpecificProperties(SopField field, SopFieldRs response)
    {
        switch (field, response)
        {
            case (DateTimeSopField dateTimeField, DateTimeSopFieldRs dateTimeResponse):
                dateTimeField.DatePartOnly = dateTimeResponse.DatePartOnly;
                break;

            case (DoubleSopField doubleField, DoubleSopFieldRs doubleResponse):
                doubleField.MinDoubleValue = doubleResponse.MinDoubleValue ?? 0;
                doubleField.MaxDoubleValue = doubleResponse.MaxDoubleValue ?? 0;
                doubleField.Precision = doubleResponse.Precision;
                break;

            case (LabAssetSopField labAssetField, LabAssetSopFieldRs labAssetResponse):
                labAssetField.LabAssetTypeId = labAssetResponse.LabAssetTypeId;
                break;

            case (InstrumentTypeSopField instrumentTypeField, InstrumentTypeSopFieldRs instrumentTypeResponse):
                instrumentTypeField.InstrumentTypeId = instrumentTypeResponse.InstrumentTypeId;
                break;

            case (SopEnumSopField sopEnumField, SopEnumSopFieldRs sopEnumResponse):
                sopEnumField.SopEnumTypeId = sopEnumResponse.SopEnumTypeId;
                break;

            case (UserSopField userField, UserSopFieldRs userResponse):
                userField.ApplicationRoleId = userResponse.ApplicationRoleId ?? 0;
                break;

            case (TableColumnTextSopField tableColumnTextField, TableColumnTextSopFieldRs tableColumnTextResponse):
                tableColumnTextField.TableName = tableColumnTextResponse.TableName;
                tableColumnTextField.ColumnWidth = tableColumnTextResponse.ColumnWidth;
                tableColumnTextField.VmPropertyName = tableColumnTextResponse.VmPropertyName;
                tableColumnTextField.ValidationRegex = tableColumnTextResponse.ValidationRegex;
                tableColumnTextField.MinLength = tableColumnTextResponse.MinLength;
                tableColumnTextField.MaxLength = tableColumnTextResponse.MaxLength;
                break;

            case (TableColumnIntSopField tableColumnIntField, TableColumnIntSopFieldRs tableColumnIntResponse):
                tableColumnIntField.TableName = tableColumnIntResponse.TableName;
                tableColumnIntField.ColumnWidth = tableColumnIntResponse.ColumnWidth;
                tableColumnIntField.VmPropertyName = tableColumnIntResponse.VmPropertyName;
                tableColumnIntField.MinIntValue = tableColumnIntResponse.MinIntValue;
                tableColumnIntField.MaxIntValue = tableColumnIntResponse.MaxIntValue;
                break;

            case (TableColumnDoubleSopField tableColumnDoubleField, TableColumnDoubleSopFieldRs
                tableColumnDoubleResponse):
                tableColumnDoubleField.TableName = tableColumnDoubleResponse.TableName;
                tableColumnDoubleField.ColumnWidth = tableColumnDoubleResponse.ColumnWidth;
                tableColumnDoubleField.VmPropertyName = tableColumnDoubleResponse.VmPropertyName;
                tableColumnDoubleField.MinDoubleValue = tableColumnDoubleResponse.MinDoubleValue;
                tableColumnDoubleField.MaxDoubleValue = tableColumnDoubleResponse.MaxDoubleValue;
                tableColumnDoubleField.Precision = tableColumnDoubleResponse.Precision;
                break;

            case (TableColumnDateTimeField tableColumnDateTimeField, TableColumnDateTimeFieldRs
                tableColumnDateTimeResponse):
                tableColumnDateTimeField.TableName = tableColumnDateTimeResponse.TableName;
                tableColumnDateTimeField.ColumnWidth = tableColumnDateTimeResponse.ColumnWidth;
                tableColumnDateTimeField.VmPropertyName = tableColumnDateTimeResponse.VmPropertyName;
                tableColumnDateTimeField.DatePartOnly = tableColumnDateTimeResponse.DatePartOnly;
                break;

            case (TableColumnSopEnumField tableColumnSopEnumField, TableColumnSopEnumFieldRs tableColumnSopEnumResponse)
                :
                tableColumnSopEnumField.TableName = tableColumnSopEnumResponse.TableName;
                tableColumnSopEnumField.ColumnWidth = tableColumnSopEnumResponse.ColumnWidth;
                tableColumnSopEnumField.VmPropertyName = tableColumnSopEnumResponse.VmPropertyName;
                break;
        }
    }


}

// Base validator for all SopField types
    public class SopFieldRsBaseValidator : AbstractValidator<SopFieldRs>
    {
        public SopFieldRsBaseValidator()
        {
            RuleFor(x => x.Section)
                .NotEmpty().WithMessage("Section is required")
                .MaximumLength(150).WithMessage("Section cannot exceed 150 characters");

            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Name is required")
                .MaximumLength(150).WithMessage("Name cannot exceed 150 characters");

            RuleFor(x => x.DisplayName)
                .MaximumLength(150).WithMessage("Display name cannot exceed 150 characters");

            RuleFor(x => x.BatchPropertyName)
                .MaximumLength(150).WithMessage("Batch property name cannot exceed 150 characters");

            RuleFor(x => x.RequiredMessage)
                .MaximumLength(150).WithMessage("Required message cannot exceed 150 characters");

            RuleFor(x => x.MinValueMessage)
                .MaximumLength(150).WithMessage("Min value message cannot exceed 150 characters");

            RuleFor(x => x.MaxValueMessage)
                .MaximumLength(150).WithMessage("Max value message cannot exceed 150 characters");

            RuleFor(x => x.RegexMessage)
                .MaximumLength(150).WithMessage("Regex message cannot exceed 150 characters");
        }
    }

    // Type-specific validators would be defined for each SopField type
    // Just showing a few as examples

    public class DateTimeSopFieldRsValidator : AbstractValidator<SopFieldRs>
    {
        public DateTimeSopFieldRsValidator()
        {
            // No additional validation needed
        }
    }

    public class DoubleSopFieldRsValidator : AbstractValidator<SopFieldRs>
    {
        public DoubleSopFieldRsValidator()
        {
            RuleFor(x => ((DoubleSopFieldRs)x).MinDoubleValue)
                .NotNull().WithMessage("Min double value is required");

            RuleFor(x => ((DoubleSopFieldRs)x).MaxDoubleValue)
                .NotNull().WithMessage("Max double value is required");

            RuleFor(x => (DoubleSopFieldRs)x)
                .Must(x => x.MinDoubleValue <= x.MaxDoubleValue)
                .WithMessage("Min double value must be less than or equal to max double value")
                .When(x => ((DoubleSopFieldRs)x).MinDoubleValue.HasValue && ((DoubleSopFieldRs)x).MaxDoubleValue.HasValue);
        }
    }




   
//// Base validator for all SopField types
//public class SopFieldRsBaseValidator : AbstractValidator<SopFieldRs>
//{
//    public SopFieldRsBaseValidator()
//    {
//        RuleFor(x => x.Section)
//            .NotEmpty().WithMessage("Section is required")
//            .MaximumLength(150).WithMessage("Section cannot exceed 150 characters");

//        RuleFor(x => x.Name)
//            .NotEmpty().WithMessage("Name is required")
//            .MaximumLength(150).WithMessage("Name cannot exceed 150 characters");

//        RuleFor(x => x.DisplayName)
//            .MaximumLength(150).WithMessage("Display name cannot exceed 150 characters");

//        RuleFor(x => x.BatchPropertyName)
//            .MaximumLength(150).WithMessage("Batch property name cannot exceed 150 characters");

//        RuleFor(x => x.RequiredMessage)
//            .MaximumLength(150).WithMessage("Required message cannot exceed 150 characters");

//        RuleFor(x => x.MinValueMessage)
//            .MaximumLength(150).WithMessage("Min value message cannot exceed 150 characters");

//        RuleFor(x => x.MaxValueMessage)
//            .MaximumLength(150).WithMessage("Max value message cannot exceed 150 characters");

//        RuleFor(x => x.RegexMessage)
//            .MaximumLength(150).WithMessage("Regex message cannot exceed 150 characters");
//    }
//}

//// Type-specific validators would be defined for each SopField type
//// Just showing a few as examples

//public class DateTimeSopFieldRsValidator : AbstractValidator<SopFieldRs>
//{
//    public DateTimeSopFieldRsValidator()
//    {
//        // No additional validation needed
//    }
//}

//public class DoubleSopFieldRsValidator : AbstractValidator<SopFieldRs>
//{
//    public DoubleSopFieldRsValidator()
//    {
//        RuleFor(x => ((DoubleSopFieldRs)x).MinDoubleValue)
//            .NotNull().WithMessage("Min double value is required");

//        RuleFor(x => ((DoubleSopFieldRs)x).MaxDoubleValue)
//            .NotNull().WithMessage("Max double value is required");

//        RuleFor(x => (DoubleSopFieldRs)x)
//            .Must(x => x.MinDoubleValue <= x.MaxDoubleValue)
//            .WithMessage("Min double value must be less than or equal to max double value")
//            .When(x => ((DoubleSopFieldRs)x).MinDoubleValue.HasValue && ((DoubleSopFieldRs)x).MaxDoubleValue.HasValue);
//    }
//}


// LabAssetSopFieldRs Validator
public class LabAssetSopFieldRsValidator : AbstractValidator<SopFieldRs>
{
    public LabAssetSopFieldRsValidator()
    {
        RuleFor(x => ((LabAssetSopFieldRs)x).LabAssetTypeId)
            .NotNull().WithMessage("Lab asset type is required")
            .GreaterThan(0).WithMessage("Lab asset type ID must be greater than 0")
            .When(x => ((LabAssetSopFieldRs)x).Required);
    }
}

// InstrumentTypeSopFieldRs Validator
public class InstrumentTypeSopFieldRsValidator : AbstractValidator<SopFieldRs>
{
    public InstrumentTypeSopFieldRsValidator()
    {
        RuleFor(x => ((InstrumentTypeSopFieldRs)x).InstrumentTypeId)
            .NotNull().WithMessage("Instrument type is required")
            .GreaterThan(0).WithMessage("Instrument type ID must be greater than 0")
            .When(x => ((InstrumentTypeSopFieldRs)x).Required);
    }
}

// SopEnumSopFieldRs Validator
public class SopEnumSopFieldRsValidator : AbstractValidator<SopFieldRs>
{
    public SopEnumSopFieldRsValidator()
    {
        RuleFor(x => ((SopEnumSopFieldRs)x).SopEnumTypeId)
            .NotNull().WithMessage("SOP enum type is required")
            .GreaterThan(0).WithMessage("SOP enum type ID must be greater than 0")
            .When(x => ((SopEnumSopFieldRs)x).Required);
    }
}

// UserSopFieldRs Validator
public class UserSopFieldRsValidator : AbstractValidator<SopFieldRs>
{
    public UserSopFieldRsValidator()
    {
        RuleFor(x => ((UserSopFieldRs)x).ApplicationRoleId)
            .NotNull().WithMessage("Application role is required")
            .GreaterThan(0).WithMessage("Application role ID must be greater than 0")
            .When(x => ((UserSopFieldRs)x).Required);
    }
}

// TextSopFieldRs Validator
public class TextSopFieldRsValidator : AbstractValidator<SopFieldRs>
{
    public TextSopFieldRsValidator()
    {
        // No specific validation needed beyond the base validation
    }
}

// TableColumnTextSopFieldRs Validator
public class TableColumnTextSopFieldRsValidator : AbstractValidator<SopFieldRs>
{
    public TableColumnTextSopFieldRsValidator()
    {
        RuleFor(x => ((TableColumnTextSopFieldRs)x).TableName)
            .NotEmpty().WithMessage("Table name is required")
            .MaximumLength(50).WithMessage("Table name cannot exceed 50 characters");

        RuleFor(x => ((TableColumnTextSopFieldRs)x).VmPropertyName)
            .NotEmpty().WithMessage("VM property name is required")
            .MaximumLength(250).WithMessage("VM property name cannot exceed 250 characters");

        RuleFor(x => ((TableColumnTextSopFieldRs)x).ValidationRegex)
            .MaximumLength(250).WithMessage("Validation regex cannot exceed 250 characters");

        RuleFor(x => ((TableColumnTextSopFieldRs)x).MinLength)
            .Must((field, minLength) => !minLength.HasValue || !((TableColumnTextSopFieldRs)field).MaxLength.HasValue || minLength <= ((TableColumnTextSopFieldRs)field).MaxLength)
            .WithMessage("Minimum length must be less than or equal to maximum length")
            .When(x => ((TableColumnTextSopFieldRs)x).MinLength.HasValue && ((TableColumnTextSopFieldRs)x).MaxLength.HasValue);
    }
}

// TableColumnIntSopFieldRs Validator
public class TableColumnIntSopFieldRsValidator : AbstractValidator<SopFieldRs>
{
    public TableColumnIntSopFieldRsValidator()
    {
        RuleFor(x => ((TableColumnIntSopFieldRs)x).TableName)
            .NotEmpty().WithMessage("Table name is required")
            .MaximumLength(50).WithMessage("Table name cannot exceed 50 characters");

        RuleFor(x => ((TableColumnIntSopFieldRs)x).VmPropertyName)
            .NotEmpty().WithMessage("VM property name is required")
            .MaximumLength(250).WithMessage("VM property name cannot exceed 250 characters");

        RuleFor(x => ((TableColumnIntSopFieldRs)x).MinIntValue)
            .Must((field, minValue) => !minValue.HasValue || !((TableColumnIntSopFieldRs)field).MaxIntValue.HasValue || minValue <= ((TableColumnIntSopFieldRs)field).MaxIntValue)
            .WithMessage("Minimum value must be less than or equal to maximum value")
            .When(x => ((TableColumnIntSopFieldRs)x).MinIntValue.HasValue && ((TableColumnIntSopFieldRs)x).MaxIntValue.HasValue);
    }
}

// TableColumnDoubleSopFieldRs Validator
public class TableColumnDoubleSopFieldRsValidator : AbstractValidator<SopFieldRs>
{
    public TableColumnDoubleSopFieldRsValidator()
    {
        RuleFor(x => ((TableColumnDoubleSopFieldRs)x).TableName)
            .NotEmpty().WithMessage("Table name is required")
            .MaximumLength(50).WithMessage("Table name cannot exceed 50 characters");

        RuleFor(x => ((TableColumnDoubleSopFieldRs)x).VmPropertyName)
            .NotEmpty().WithMessage("VM property name is required")
            .MaximumLength(250).WithMessage("VM property name cannot exceed 250 characters");

        RuleFor(x => ((TableColumnDoubleSopFieldRs)x).MinDoubleValue)
            .Must((field, minValue) => !minValue.HasValue || !((TableColumnDoubleSopFieldRs)field).MaxDoubleValue.HasValue || minValue <= ((TableColumnDoubleSopFieldRs)field).MaxDoubleValue)
            .WithMessage("Minimum value must be less than or equal to maximum value")
            .When(x => ((TableColumnDoubleSopFieldRs)x).MinDoubleValue.HasValue && ((TableColumnDoubleSopFieldRs)x).MaxDoubleValue.HasValue);

        RuleFor(x => ((TableColumnDoubleSopFieldRs)x).Precision)
            .GreaterThanOrEqualTo(0).WithMessage("Precision must be a non-negative number");
    }
}

// TableColumnDateTimeFieldRs Validator
public class TableColumnDateTimeFieldRsValidator : AbstractValidator<SopFieldRs>
{
    public TableColumnDateTimeFieldRsValidator()
    {
        RuleFor(x => ((TableColumnDateTimeFieldRs)x).TableName)
            .NotEmpty().WithMessage("Table name is required")
            .MaximumLength(50).WithMessage("Table name cannot exceed 50 characters");

        RuleFor(x => ((TableColumnDateTimeFieldRs)x).VmPropertyName)
            .NotEmpty().WithMessage("VM property name is required")
            .MaximumLength(250).WithMessage("VM property name cannot exceed 250 characters");

        // DatePartOnly is a boolean, no specific validation needed
    }
}

// TableColumnSopEnumFieldRs Validator
public class TableColumnSopEnumFieldRsValidator : AbstractValidator<SopFieldRs>
{
    public TableColumnSopEnumFieldRsValidator()
    {
        RuleFor(x => ((TableColumnSopEnumFieldRs)x).TableName)
            .NotEmpty().WithMessage("Table name is required")
            .MaximumLength(50).WithMessage("Table name cannot exceed 50 characters");

        RuleFor(x => ((TableColumnSopEnumFieldRs)x).VmPropertyName)
            .NotEmpty().WithMessage("VM property name is required")
            .MaximumLength(250).WithMessage("VM property name cannot exceed 250 characters");
    }
}

// General validator for all table column fields to share common validation
public class TableColumnSopFieldRsBaseValidator : AbstractValidator<TableColumnSopFieldRs>
{
    public TableColumnSopFieldRsBaseValidator()
    {
        RuleFor(x => x.TableName)
            .NotEmpty().WithMessage("Table name is required")
            .MaximumLength(50).WithMessage("Table name cannot exceed 50 characters");

        RuleFor(x => x.ColumnWidth)
            .NotEmpty().WithMessage("Column width is required")
            .MaximumLength(50).WithMessage("Column width cannot exceed 50 characters");

        RuleFor(x => x.VmPropertyName)
            .NotEmpty().WithMessage("VM property name is required")
            .MaximumLength(250).WithMessage("VM property name cannot exceed 250 characters");
    }
}

 //public static ValidationResult Validate(SopFieldRs sopFieldRs)
 //   {
 //       // Base validation for all SopField types
 //       var baseValidator = new SopFieldRsBaseValidator();
 //       var baseValidationResult = baseValidator.Validate(sopFieldRs);

 //       var result = new ValidationResult
 //       {
 //           IsValid = baseValidationResult.IsValid,
 //           Errors = baseValidationResult.Errors.Select(e => new ValidationError
 //           {
 //               PropertyName = e.PropertyName,
 //               ErrorMessage = e.ErrorMessage
 //           }).ToList()
 //       };

 //       // Type-specific validation
 //       AbstractValidator<SopFieldRs> typeValidator = sopFieldRs switch
 //       {
 //           DateTimeSopFieldRs => new DateTimeSopFieldRsValidator(),
 //           DoubleSopFieldRs => new DoubleSopFieldRsValidator(),
 //           LabAssetSopFieldRs => new LabAssetSopFieldRsValidator(),
 //           InstrumentTypeSopFieldRs => new InstrumentTypeSopFieldRsValidator(),
 //           SopEnumSopFieldRs => new SopEnumSopFieldRsValidator(),
 //           UserSopFieldRs => new UserSopFieldRsValidator(),
 //           TextSopFieldRs => new TextSopFieldRsValidator(),
 //           TableColumnTextSopFieldRs => new TableColumnTextSopFieldRsValidator(),
 //           TableColumnIntSopFieldRs => new TableColumnIntSopFieldRsValidator(),
 //           TableColumnDoubleSopFieldRs => new TableColumnDoubleSopFieldRsValidator(),
 //           TableColumnDateTimeFieldRs => new TableColumnDateTimeFieldRsValidator(),
 //           TableColumnSopEnumFieldRs => new TableColumnSopEnumFieldRsValidator(),
 //           _ => throw new NotSupportedException($"Unsupported SopFieldRs type: {sopFieldRs.GetType().Name}")
 //       };

 //       var typeValidationResult = typeValidator.Validate(sopFieldRs);
 //       if (!typeValidationResult.IsValid)
 //       {
 //           result.IsValid = false;
 //           result.Errors.AddRange(typeValidationResult.Errors.Select(e => new ValidationError
 //           {
 //               PropertyName = e.PropertyName,
 //               ErrorMessage = e.ErrorMessage
 //           }));
 //       }

 //       return result;
 //   }

//    public static async Task UpsertFromResponses(
//        List<SopFieldRs> responses,
//        List<SopField> existingFields,
//        BatchSop batchSop,
//        NCLimsContext context)
//    {
//        if (responses == null) throw new ArgumentNullException(nameof(responses));
//        if (existingFields == null) throw new ArgumentNullException(nameof(existingFields));
//        if (batchSop == null) throw new ArgumentNullException(nameof(batchSop));
//        if (context == null) throw new ArgumentNullException(nameof(context));

//        // Remove fields that are no longer in the response
//        foreach (var existingField in existingFields)
//        {
//            if (!responses.Any(r => r.SopFieldId == existingField.Id))
//            {
//                batchSop.SopFields.Remove(existingField);
//                context.Remove(existingField);
//            }
//        }

//        // Update or add fields from the response
//        foreach (var response in responses)
//        {
//            SopField field;

//            if (response.SopFieldId <= 0)
//            {
//                // New field, create instance of the appropriate type
//                field = CreateSopFieldInstance(response);
//                batchSop.SopFields.Add(field);
//                context.Add(field);
//            }
//            else
//            {
//                // Existing field
//                field = existingFields.SingleOrDefault(f => f.Id == response.SopFieldId)
//                    ?? throw new KeyNotFoundException($"SopField with ID {response.SopFieldId} not found");

//                // If the field type has changed, we need to create a new instance
//                if (!IsMatchingFieldType(field, response))
//                {
//                    batchSop.SopFields.Remove(field);
//                    context.Remove(field);

//                    field = CreateSopFieldInstance(response);
//                    batchSop.SopFields.Add(field);
//                    context.Add(field);
//                }
//            }

//            // Update common properties
//            field.BatchSopId = batchSop.Id;
//            field.BatchSop = batchSop;
//            field.Section = response.Section;
//            field.Name = response.Name;
//            field.DisplayName = response.DisplayName;
//            field.Row = response.Row;
//            field.Column = response.Column;
//            field.BatchPropertyName = response.BatchPropertyName;
//            field.Required = response.Required;
//            field.ReadOnly = response.ReadOnly;
//            field.RequiredMessage = response.RequiredMessage;
//            field.MinValueMessage = response.MinValueMessage;
//            field.MaxValueMessage = response.MaxValueMessage;
//            field.RegexMessage = response.RegexMessage;

//            // Update type-specific properties
//            UpdateTypeSpecificProperties(field, response);
//        }
//    }

//    private static SopField CreateSopFieldInstance(SopFieldRs response)
//    {
//        return response switch
//        {
//            DateTimeSopFieldRs => new DateTimeSopField(),
//            DoubleSopFieldRs => new DoubleSopField(),
//            LabAssetSopFieldRs => new LabAssetSopField(),
//            InstrumentTypeSopFieldRs => new InstrumentTypeSopField(),
//            SopEnumSopFieldRs => new SopEnumSopField(),
//            UserSopFieldRs => new UserSopField(),
//            TextSopFieldRs => new TextSopField(),
//            TableColumnTextSopFieldRs => new TableColumnTextSopField(),
//            TableColumnIntSopFieldRs => new TableColumnIntSopField(),
//            TableColumnDoubleSopFieldRs => new TableColumnDoubleSopField(),
//            TableColumnDateTimeFieldRs => new TableColumnDateTimeField(),
//            TableColumnSopEnumFieldRs => new TableColumnSopEnumField(),
//            _ => throw new NotSupportedException($"Unsupported SopFieldRs type: {response.GetType().Name}")
//        };
//    }

//    private static bool IsMatchingFieldType(SopField field, SopFieldRs response)
//    {
//        return (field, response) switch
//        {
//            (DateTimeSopField, DateTimeSopFieldRs) => true,
//            (DoubleSopField, DoubleSopFieldRs) => true,
//            (LabAssetSopField, LabAssetSopFieldRs) => true,
//            (InstrumentTypeSopField, InstrumentTypeSopFieldRs) => true,
//            (SopEnumSopField, SopEnumSopFieldRs) => true,
//            (UserSopField, UserSopFieldRs) => true,
//            (TextSopField, TextSopFieldRs) => true,
//            (TableColumnTextSopField, TableColumnTextSopFieldRs) => true,
//            (TableColumnIntSopField, TableColumnIntSopFieldRs) => true,
//            (TableColumnDoubleSopField, TableColumnDoubleSopFieldRs) => true,
//            (TableColumnDateTimeField, TableColumnDateTimeFieldRs) => true,
//            (TableColumnSopEnumField, TableColumnSopEnumFieldRs) => true,
//            _ => false
//        };
//    }

//    private static void UpdateTypeSpecificProperties(SopField field, SopFieldRs response)
//    {
//        switch (field, response)
//        {
//            case (DateTimeSopField dateTimeField, DateTimeSopFieldRs dateTimeResponse):
//                dateTimeField.DatePartOnly = dateTimeResponse.DatePartOnly;
//                break;

//            case (DoubleSopField doubleField, DoubleSopFieldRs doubleResponse):
//                doubleField.MinDoubleValue = doubleResponse.MinDoubleValue ?? 0;
//                doubleField.MaxDoubleValue = doubleResponse.MaxDoubleValue ?? 0;
//                doubleField.Precision = doubleResponse.Precision;
//                break;

//            case (LabAssetSopField labAssetField, LabAssetSopFieldRs labAssetResponse):
//                labAssetField.LabAssetTypeId = labAssetResponse.LabAssetTypeId;
//                break;

//            case (InstrumentTypeSopField instrumentTypeField, InstrumentTypeSopFieldRs instrumentTypeResponse):
//                instrumentTypeField.InstrumentTypeId = instrumentTypeResponse.InstrumentTypeId;
//                break;

//            case (SopEnumSopField sopEnumField, SopEnumSopFieldRs sopEnumResponse):
//                sopEnumField.SopEnumTypeId = sopEnumResponse.SopEnumTypeId;
//                break;

//            case (UserSopField userField, UserSopFieldRs userResponse):
//                userField.ApplicationRoleId = userResponse.ApplicationRoleId ?? 0;
//                break;

//            case (TableColumnTextSopField tableColumnTextField, TableColumnTextSopFieldRs tableColumnTextResponse):
//                tableColumnTextField.TableName = tableColumnTextResponse.TableName;
//                tableColumnTextField.ColumnWidth = tableColumnTextResponse.ColumnWidth;
//                tableColumnTextField.VmPropertyName = tableColumnTextResponse.VmPropertyName;
//                tableColumnTextField.ValidationRegex = tableColumnTextResponse.ValidationRegex;
//                tableColumnTextField.MinLength = tableColumnTextResponse.MinLength;
//                tableColumnTextField.MaxLength = tableColumnTextResponse.MaxLength;
//                break;

//            case (TableColumnIntSopField tableColumnIntField, TableColumnIntSopFieldRs tableColumnIntResponse):
//                tableColumnIntField.TableName = tableColumnIntResponse.TableName;
//                tableColumnIntField.ColumnWidth = tableColumnIntResponse.ColumnWidth;
//                tableColumnIntField.VmPropertyName = tableColumnIntResponse.VmPropertyName;
//                tableColumnIntField.MinIntValue = tableColumnIntResponse.MinIntValue;
//                tableColumnIntField.MaxIntValue = tableColumnIntResponse.MaxIntValue;
//                break;

//            case (TableColumnDoubleSopField tableColumnDoubleField, TableColumnDoubleSopFieldRs tableColumnDoubleResponse):
//                tableColumnDoubleField.TableName = tableColumnDoubleResponse.TableName;
//                tableColumnDoubleField.ColumnWidth = tableColumnDoubleResponse.ColumnWidth;
//                tableColumnDoubleField.VmPropertyName = tableColumnDoubleResponse.VmPropertyName;
//                tableColumnDoubleField.MinDoubleValue = tableColumnDoubleResponse.MinDoubleValue;
//                tableColumnDoubleField.MaxDoubleValue = tableColumnDoubleResponse.MaxDoubleValue;
//                tableColumnDoubleField.Precision = tableColumnDoubleResponse.Precision;
//                break;

//            case (TableColumnDateTimeField tableColumnDateTimeField, TableColumnDateTimeFieldRs tableColumnDateTimeResponse):
//                tableColumnDateTimeField.TableName = tableColumnDateTimeResponse.TableName;
//                tableColumnDateTimeField.ColumnWidth = tableColumnDateTimeResponse.ColumnWidth;
//                tableColumnDateTimeField.VmPropertyName = tableColumnDateTimeResponse.VmPropertyName;
//                tableColumnDateTimeField.DatePartOnly = tableColumnDateTimeResponse.DatePartOnly;
//                break;

//            case (TableColumnSopEnumField tableColumnSopEnumField, TableColumnSopEnumFieldRs tableColumnSopEnumResponse):
//                tableColumnSopEnumField.TableName = tableColumnSopEnumResponse.TableName;
//                tableColumnSopEnumField.ColumnWidth = tableColumnSopEnumResponse.ColumnWidth;
//                tableColumnSopEnumField.VmPropertyName = tableColumnSopEnumResponse.VmPropertyName;
//                break;
//        }
//    }
//}
