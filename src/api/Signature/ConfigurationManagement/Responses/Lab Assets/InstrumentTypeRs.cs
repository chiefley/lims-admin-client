﻿using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using NCLims.Models;
using NCLims.Models.Enums;

namespace NCLims.Business.NewBatch.ConfigurationManagement.Responses.Lab_Assets;

public class InstrumentTypeRs
{
    // Primary Key.  No display, no edit
    public int InstrumentTypeId { get; set; }
    // @validation:  Unique in the list.
    [Required]
    [StringLength(150)]
    public string? Name { get; set; }
    [Required]
    [StringLength(150)]
    public string MeasurementType { get; set; }
    [Required]
    [StringLength(250)]
    public string DataFolder { get; set; }
    public int? PeakAreaSaturationThreshold { get; set; }
    // Dropdown control.  Choices come from ConfigurationMaintenanceSelectors.InstrumentFileParserTypes.
    [Required]
    public InstrumentFileParserType? InstrumentFileParser { get; set; }

    // Defaults to true on new.
    public bool Active { get; set; } = true;

    [JsonPropertyOrder(100)]
    public List<InstrumentRs> InstrumentRss { get; set; } = [];
    [JsonPropertyOrder(100)]
    public List<InstrumentTypeAnalyteRs> InstrumentTypeAnalyteRss { get; set; } = [];

    public static async Task<List<InstrumentTypeRs>> FetchInstrumentTypes(IQueryable<InstrumentType> query)
    {
        var ret = await query.Select(it => new InstrumentTypeRs
        {
            Name = it.Name,
            DataFolder = it.DataFolder,
            InstrumentFileParser = it.InstrumentFileParser,
            InstrumentTypeId = it.Id,
            MeasurementType = it.MeasurementType,
            PeakAreaSaturationThreshold = it.PeakAreaSaturationThreshold,
            Active = it.Active,
            InstrumentRss = it.Instruments.Select(ins => new InstrumentRs
            {
                Name = ins.Name,
                InstrumentId = ins.Id,
                InstrumentTypeId = ins.InstrumentTypeId,
                LastPM = ins.LastPM,
                NextPm = ins.NextPm,
                OutOfService = ins.OutOfService,
                Active = ins.Active,
                InstrumentPeripheralRss = ins.InstrumentPeripherals.Select(ip => new Responses.Lab_Assets.InstrumentPeripheralRs
                {
                    InstrumentId = ip.InstrumentId,
                    DurableLabAssetId = ip.DurableLabAssetId,
                    InstrumentPeripheralId = ip.Id
                }).ToList(),
            }).ToList(),
            InstrumentTypeAnalyteRss = it.InstrumentTypeAnalytes.Select(ita => new InstrumentTypeAnalyteRs
            {
                InstrumentTypeId = ita.InstrumentTypeId,
                AnalyteId = ita.AnalyteId,
                AnalyteAlias = ita.AnalyteAlias
            }).ToList(),

        }).ToListAsync();
        return ret;
    }

    public InstrumentType Update(InstrumentType model)
    {
        if (InstrumentTypeId != model.Id) throw new InvalidOperationException("Wrong model to update");
        model.Name = Name;
        model.DataFolder = DataFolder;
        model.MeasurementType = MeasurementType;
        model.PeakAreaSaturationThreshold = PeakAreaSaturationThreshold;
        model.InstrumentFileParser = InstrumentFileParser ?? throw new InvalidOperationException("Must have an Instrument Parser.");
        return model;
    }
}