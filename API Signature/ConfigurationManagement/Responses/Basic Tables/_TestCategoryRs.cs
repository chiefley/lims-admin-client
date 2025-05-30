using System;
using NCLims.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using NCLims.Data;
using FluentValidation;

namespace NCLims.Business.NewBatch.ConfigurationManagement.Responses.Basic_Tables;

public partial class TestCategoryRs
{
    public static async Task<List<TestCategoryRs>> FetchTestCategoryRss(IQueryable<TestCategory> query)
    {
        var ret = await query.Select(q => new TestCategoryRs
        {
            Name = q.Name,
            Description = q.Description,
            StateId = q.StateId,
            CcTestPackageId = q.CcTestPackageId,
            TestCategoryId =   q.Id,
            Active = q.Active
        }).ToListAsync();
        return ret;
    }

    // Validation method
    public static ValidationResult Validate(TestCategoryRs testCategoryRs, List<TestCategoryRs> existingTestCategoryRss, int stateId)
    {
        var validator = new TestCategoryRsValidator(existingTestCategoryRss, stateId);
        var validationResult = validator.Validate(testCategoryRs);

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

    // Upsert method
    public static async Task<TestCategory> UpsertFromResponse(
        TestCategoryRs response,
        List<TestCategory> existingCategories,
        NCLimsContext context)
    {
        if (response == null) throw new ArgumentNullException(nameof(response));
        if (existingCategories == null) throw new ArgumentNullException(nameof(existingCategories));
        if (context == null) throw new ArgumentNullException(nameof(context));

        TestCategory testCategory;

        // Find or create the test category
        if (response.TestCategoryId <= 0)
        {
            // New test category
            testCategory = new TestCategory();
            context.TestCategory.Add(testCategory);
        }
        else
        {
            // Existing test category
            testCategory = existingCategories.SingleOrDefault(tc => tc.Id == response.TestCategoryId)
                           ?? throw new KeyNotFoundException($"TestCategory with ID {response.TestCategoryId} not found");
        }

        // Update the test category properties
        testCategory.Name = response.Name;
        testCategory.Description = response.Description;
        testCategory.StateId = response.StateId;
        testCategory.CcTestPackageId = response.CcTestPackageId;
        testCategory.Active = response.Active;

        return testCategory;
    }

    public static async Task<List<TestCategory>> UpsertFromResponses(
        List<TestCategoryRs> responses,
        List<TestCategory> existingCategories,
        NCLimsContext context)
    {
        if (responses == null) throw new ArgumentNullException(nameof(responses));
        if (existingCategories == null) throw new ArgumentNullException(nameof(existingCategories));
        if (context == null) throw new ArgumentNullException(nameof(context));

        var result = new List<TestCategory>();

        foreach (var response in responses)
        {
            var testCategory = await UpsertFromResponse(response, existingCategories, context);
            result.Add(testCategory);
        }

        return result;
    }
}

// Validator for TestCategoryRs
public class TestCategoryRsValidator : AbstractValidator<TestCategoryRs>
{
    private readonly List<TestCategoryRs> _existingTestCategoryRss;
    private readonly int _stateId;

    public TestCategoryRsValidator()
    {
        // Default constructor for serialization or other purposes
    }

    public TestCategoryRsValidator(List<TestCategoryRs> existingTestCategoryRss, int stateId)
    {
        _existingTestCategoryRss = existingTestCategoryRss;
        _stateId = stateId;

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required")
            .MaximumLength(50).WithMessage("Name cannot exceed 50 characters");

        RuleFor(x => x.Description)
            .MaximumLength(250).WithMessage("Description cannot exceed 250 characters");

        RuleFor(x => x.StateId)
            .Equal(_stateId).WithMessage($"State ID must equal {_stateId}");

        RuleFor(x => x)
            .Must((testCategoryRs, _) => !HasDuplicateName(testCategoryRs, existingTestCategoryRss))
            .WithMessage("A Test Category with this name already exists for this State.");
    }

    private bool HasDuplicateName(TestCategoryRs testCategoryRs, IEnumerable<TestCategoryRs> existingTestCategoryRss)
    {
        return existingTestCategoryRss.Any(x =>
            x.Name == testCategoryRs.Name &&
            x.StateId == testCategoryRs.StateId &&
            // Don't flag the item as a duplicate of itself when updating
            x.TestCategoryId != testCategoryRs.TestCategoryId);
    }
}
