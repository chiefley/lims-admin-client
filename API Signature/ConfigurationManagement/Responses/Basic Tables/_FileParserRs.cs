using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using NCLims.Data;
using NCLims.Models.NewBatch;

namespace NCLims.Business.NewBatch.ConfigurationManagement.Responses.Basic_Tables;

public partial class FileParserRs
{
    
    public static async Task<List<FileParserRs>> FetchFileParserRss(IQueryable<FileParser> query)
    {
        var fileParsers = await query
            .Include(fp => fp.Fields)
            .ToListAsync();

        List<FileParserRs> ret = [];

        foreach (var parser in fileParsers)
        {
            var fileParserFs = new FileParserRs
            {
                InstrumentTypeId = parser.InstrumentTypeId,
                FieldDelimiter = parser.FieldDelimiter.ToString(),
                FileParserId = parser.Id,
                FileType = parser.FileType.ToString(),
                SampleMultiplicity = parser.SampleMultiplicity.ToString(),
                Version = parser.Version
            };

            ret.Add(fileParserFs);

            foreach (var field in parser.Fields)
            {
                var fileParserFieldRs = field is SingleValueParserField
                    ? new SingleValueParserFieldRs()
                    : new TableValueParserFieldRs {ColumnIndex = ((TableValueParserField)field).ColumnIndex};

                fileParserFieldRs.Required = field.Required;
                fileParserFieldRs.BindingProperty = field.BindingProperty;
                fileParserFieldRs.DataFileLevel = field.DataFileLevel.ToString();
                fileParserFieldRs.DefaultValue = field.DefaultValue;
                fileParserFieldRs.FieldName = field.FieldName;
                fileParserFieldRs.FileParserFieldId = field.Id;
                fileParserFieldRs.FileVersionSignal = field.FileVersionSignal;
                fileParserFieldRs.Maximum = field.Maximum;
                fileParserFieldRs.Minimum = field.Minimum;
                fileParserFieldRs.NotApplicableSignal = field.NotApplicableSignal;
                fileParserFieldRs.SectionOrTableName = field.SectionOrTableName;
                fileParserFieldRs.RegexFormat = field.RegexFormat;
                fileParserFieldRs.UseDefaultIfNoParse = field.UseDefaultIfNoParse;
            }
        }

        return ret;
    }

    public static ValidationResult Validate(FileParserRs fileParserRs, List<FileParserRs> existingFileParsers)
    {
        var validator = new FileParserRsValidator(existingFileParsers);
        var validationResult = validator.Validate(fileParserRs);

        var result = new ValidationResult
        {
            IsValid = validationResult.IsValid,
            Errors = validationResult.Errors.Select(e => new ValidationError
            {
                PropertyName = e.PropertyName,
                ErrorMessage = e.ErrorMessage
            }).ToList()
        };

        // Validate each field
        foreach (var field in fileParserRs.FileParserFieldRss)
        {
            var fieldValidationResult = FileParserFieldRs.Validate(field, fileParserRs.FileParserFieldRss);
            if (!fieldValidationResult.IsValid)
            {
                result.IsValid = false;
                result.Errors.AddRange(fieldValidationResult.Errors);
            }
        }

        return result;
    }

    // Upsert method to update or insert a FileParser and its children
    public static async Task<FileParser> UpsertFromResponse(
        FileParserRs response,
        List<FileParser> existingFileParsers,
        NCLimsContext context)
    {
        if (response == null) throw new ArgumentNullException(nameof(response));
        if (existingFileParsers == null) throw new ArgumentNullException(nameof(existingFileParsers));
        if (context == null) throw new ArgumentNullException(nameof(context));

        FileParser fileParser;

        // Find or create the file parser
        if (response.FileParserId <= 0)
        {
            // New file parser
            fileParser = new FileParser();
            context.FileParsers.Add(fileParser);
        }
        else
        {
            // Existing file parser
            fileParser = existingFileParsers.SingleOrDefault(fp => fp.Id == response.FileParserId)
                ?? throw new KeyNotFoundException($"FileParser with ID {response.FileParserId} not found");
        }

        // Update the file parser properties
        fileParser.Version = response.Version;
        fileParser.FileType = Enum.Parse<DataFileType>(response.FileType!);
        fileParser.FieldDelimiter = Enum.Parse<FieldDelimiterType>(response.FieldDelimiter!);
        fileParser.SampleMultiplicity = Enum.Parse<DataFileSampleMultiplicity>(response.SampleMultiplicity!);
        fileParser.InstrumentTypeId = response.InstrumentTypeId ?? throw new InvalidOperationException("InstrumentTypeId cannot be null.");

        // Ensure fields collection is initialized
        fileParser.Fields ??= new List<FileParserField>();

        // Handle fields
        await FileParserFieldRs.UpsertFromResponses(
            response.FileParserFieldRss,
            fileParser.Fields.ToList(),
            fileParser,
            context);

        return fileParser;
    }
}

// Validator for FileParserRs
public class FileParserRsValidator : AbstractValidator<FileParserRs>
{
    public FileParserRsValidator()
    {
    }

    public FileParserRsValidator(List<FileParserRs> existingFileParsers)
    {
        RuleFor(x => x.Version)
            .NotEmpty().WithMessage("Version is required")
            .MaximumLength(50).WithMessage("Version cannot exceed 50 characters");

        RuleFor(x => x.FileType)
            .NotEmpty().WithMessage("File type is required")
            .Must(BeValidFileType).WithMessage("Invalid file type");

        RuleFor(x => x.FieldDelimiter)
            .NotEmpty().WithMessage("Field delimiter is required")
            .Must(BeValidFieldDelimiter).WithMessage("Invalid field delimiter");

        RuleFor(x => x.SampleMultiplicity)
            .NotEmpty().WithMessage("Sample multiplicity is required")
            .Must(BeValidSampleMultiplicity).WithMessage("Invalid sample multiplicity");

        RuleFor(x => x.InstrumentTypeId)
            .NotNull().WithMessage("Instrument type is required")
            .GreaterThan(0).WithMessage("Instrument type ID must be greater than 0");

        // Validate uniqueness of version + instrument type combination
        RuleFor(x => x)
            .Must((fileParserRs, _) => !HasDuplicateVersionAndInstrumentType(fileParserRs, existingFileParsers))
            .WithMessage("A file parser with this version already exists for this instrument type");
    }

    private bool BeValidFileType(string fileType)
    {
        return !string.IsNullOrEmpty(fileType) && Enum.TryParse<DataFileType>(fileType, out _);
    }

    private bool BeValidFieldDelimiter(string fieldDelimiter)
    {
        return !string.IsNullOrEmpty(fieldDelimiter) && Enum.TryParse<FieldDelimiterType>(fieldDelimiter, out _);
    }

    private bool BeValidSampleMultiplicity(string sampleMultiplicity)
    {
        return !string.IsNullOrEmpty(sampleMultiplicity) && Enum.TryParse<DataFileSampleMultiplicity>(sampleMultiplicity, out _);
    }

    private bool HasDuplicateVersionAndInstrumentType(FileParserRs fileParserRs, IEnumerable<FileParserRs> existingFileParsers)
    {
        return existingFileParsers.Any(x =>
            x.Version == fileParserRs.Version &&
            x.InstrumentTypeId == fileParserRs.InstrumentTypeId &&
            x.FileParserId != fileParserRs.FileParserId);
    }
}