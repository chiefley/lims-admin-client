using System.Collections.Generic;
using NCLims.Models.Enums;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using NCLims.Models;

namespace NCLims.Business.NewBatch.Sop.Responses;

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
    // Dropdown control.  Choices come from SopMaintenanceSelectors.InstrumentFileParserTypes.
    [Required]
    public InstrumentFileParserType? InstrumentFileParser { get; set; }

    public List<InstrumentRs> InstrumentRss { get; set; } = [];
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
            InstrumentRss = it.Instruments.Select(ins => new InstrumentRs
            {
                Name = ins.Name,
                InstrumentId = ins.Id,
                InstrumentTypeId = ins.InstrumentTypeId,
                LastPM = ins.LastPM,
                NextPm = ins.NextPm,
                OutOfService = ins.OutOfService,
                InstrumentPeripheralRss = ins.InstrumentPeripherals.Select(ip => new InstrumentPeripheralRs
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
}