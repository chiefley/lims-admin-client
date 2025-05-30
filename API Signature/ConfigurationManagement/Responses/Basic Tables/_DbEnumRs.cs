﻿using System;
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
    
    public static async Task<List<DBEnumRs>> FetchDbEnumRss(IQueryable<DBEnum> query)
    {
        var ret = await query.Select(d => new DBEnumRs
        {
            DbEnumId = d.Id,
            Name = d.Name,
            Enum = d.Enum,
            LabId = d.LabId,
        }).ToListAsync();

        return ret;
    }

    public static void Delete(
        List<DBEnumRs> responses,
        List<DBEnum> existingDbEnums,
        NCLimsContext context)
    {
        foreach (var model in existingDbEnums)
        {
            var response = responses
                .SingleOrDefault(r => r.DbEnumId == model.Id);
            if (response is null)
                context.DBEnums.Remove(model);
        }
    }

    public static async Task<DBEnum> UpsertFromResponse(
        DBEnumRs response,
        List<DBEnum> existingDbEnums,
        NCLimsContext context)
    {
        if (response == null) throw new ArgumentNullException(nameof(response));
        if (existingDbEnums == null) throw new ArgumentNullException(nameof(existingDbEnums));
        if (context == null) throw new ArgumentNullException(nameof(context));

        DBEnum? dbEnum;

        if (response.DbEnumId <= 0)
        {
            dbEnum = new DBEnum();
            context.DBEnums.Add(dbEnum);
        }

        else
        {
            dbEnum = existingDbEnums.SingleOrDefault(d => d.Id == response.DbEnumId)
                     ?? throw new InvalidOperationException("No existing DBEnum.");
        }

        dbEnum.Enum = response.Enum;
        dbEnum.LabId = response.LabId;
        dbEnum.Name = response.Name;

        return dbEnum;
    }
}

// Validator for PanelRs
public class DbEnumRsValidator : AbstractValidator<DBEnumRs>
{
    private readonly List<DBEnumRs> _existingDbEnumRss;
    private readonly int _labId;

    public DbEnumRsValidator()
    {
    }

    public DbEnumRsValidator(List<DBEnumRs> existingDbEnumRss, int labId)
    {
        _existingDbEnumRss = existingDbEnumRss;
        _labId = labId;

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required")
            .MaximumLength(150).WithMessage("Name cannot exceed 150 characters");

        RuleFor(x => x.Enum)
            .NotEmpty().WithMessage("Enum is required")
            .MaximumLength(150).WithMessage("Slug cannot exceed 150 characters");

        RuleFor(x => x.LabId)
            .Equal(_labId).WithMessage($"Lab ID must equal {_labId}");

        RuleFor(x => x)
            .Must((enumRs, _) => !HasDuplicateName(enumRs, existingDbEnumRss))
            .WithMessage("The combination of Name and Enum must be unique for a given LabId.");
    }

    private bool HasDuplicateName(DBEnumRs enumRs, IEnumerable<DBEnumRs> existingEnums)
    {
        return existingEnums.Any(x =>
            x.Name == enumRs.Name &&
            x.Enum == enumRs.Enum &&
            x.LabId == enumRs.LabId &&
            // Don't flag the item as a duplicate of itself when updating
            // For new items without IDs this won't matter
            !ReferenceEquals(x, enumRs));
    }
}


