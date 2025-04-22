using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using NCLims.Business.NewBatch.ConfigurationManagement.Responses;
using NCLims.Business.NewBatch.ConfigurationManagement.Responses.AnalyticalBatchSops;
using NCLims.Business.NewBatch.ConfigurationManagement.Responses.Basic_Tables;
using NCLims.Business.NewBatch.ConfigurationManagement.Responses.BatchSops;
using NCLims.Business.NewBatch.ConfigurationManagement.Responses.Lab_Assets;
using NCLims.Business.NewBatch.ConfigurationManagement.Responses.PrepBatchSops;
using NCLims.Data;
using NCLims.Data.Utilities;
using NCLims.Models;
using NCLims.Models.NewBatch;
using NCLims.Models.NewBatch.Analytical;

namespace NCLims.Business.NewBatch.ConfigurationManagement;

public interface IConfigurationMaintenanceService
{
    Task<ConfigurationMaintenanceSelectors> FetchSelectors(int labId);
    Task<List<PrepBatchSopSelectionRs>> FetchPrepBatchSopSelectionResponse(int labId);
    Task<List<AnalyticalBatchSopSelectionRs>> FetchAnalyticalBatchSopSelectionResponse(int labId);
    Task<List<PrepBatchSopSelectionRs>> FetchBatchSopSelectionResponse(int labId);
    Task<PrepBatchSopRs> FetchPrepBatchSopRs(int prepBatchSopId);
    Task<AnalyticalBatchSopRs> FetchAnalyticalBatchSopRs(int anBatchSopId);
    Task<List<CompoundRs>> FetchCompoundRs();
    Task<List<CompoundRs>> UpsertCompoundRss(List<CompoundRs> responses);
    Task<List<PanelRs>> FetchPanelRss(int labId);
    Task<List<PanelRs>> UpsertPanelRss(List<PanelRs> responses, int labId);
    Task<List<InstrumentTypeRs>> FetchInstrumentTypeRss(int labId);
    Task<List<InstrumentTypeRs>> UpsertInstrumentTypeRss(List<InstrumentTypeRs> responses, int labId);
}

public class ConfigurationMaintenanceService : IConfigurationMaintenanceService
{
    private readonly INCLimsContextFactory _ctxFactory;
    private readonly SelectorService _selectorService;

    public ConfigurationMaintenanceService(
        INCLimsContextFactory ctxFactory, 
        SelectorService selectorService)
    {
        _ctxFactory = ctxFactory;
        _selectorService = selectorService;
    }

    public async Task<ConfigurationMaintenanceSelectors> FetchSelectors(int labId)
    {
        await using var ctx = _ctxFactory.Create;
        var manifestSampleTypes = await _selectorService.ManifestSampleTypeNames(labId, true, false);
        var panelGroupTypes = await _selectorService.PanelGroups(labId, true, false);
        var labAssetTypes = await _selectorService.LabAssetTypeSelector(labId, true, false);
        var sopEnumTypes = await _selectorService.SopEnumTypeSelector(labId, true, false);
        var instrumentTypes = await _selectorService.InstrumentTypes(labId, true, false);
        var userRoles = await _selectorService.UserRoles(labId, true, false);
        var decimalFormatTypes =  _selectorService.DecimalFormatTypes(true);
        var sopBatchPositionTypes = _selectorService.SopBatchPositionTypes(true);
        var controlSampleTypes = _selectorService.ControlSampleTypes(true);
        var controlSampleCategories = _selectorService.ControlSampleCategories(true);
        var controlSampleAnalyses = _selectorService.ControlSampleAnalyses(true);
        var controlSampleQCSources = _selectorService.ControlSampleQCSources(true);
        var controlSamplePasCriteria = _selectorService.ControlSamplePassCriteria(true);
        var qcConditions = _selectorService.QCConditions(true);
        var compounds = await _selectorService.Compounds(true, false);
        var panelGroups = await _selectorService.PanelGroups(labId, true, false);
        var panelTypes = _selectorService.PanelTypes(true);

        var stateId = await ctx.Labs.Where(l => l.Id == labId).Select(l => l.StateId).SingleAsync();
        var testCategoryTypes = await _selectorService.TestCategories(stateId, true, false);
        var instrumentFileParserTypes = _selectorService.InstrumentFileParserTypes(true);
        var durableLabAssets = await _selectorService.DurableLabAssetSelector(labId, true, false);
        var prepBatchSops = await _selectorService.PrepBatchSops(labId, true, false);
        var analyticalBatchSops = await _selectorService.AnalyticalBatchSops(labId, true, false);
        var peripheralTypes = await _selectorService.DBEnums(labId, "NBInstrumentPeripheralTypeSlug", true, false);

        var ret = new ConfigurationMaintenanceSelectors
        {
            ManifestSampleTypeItems = manifestSampleTypes.DropDownItems(),
            PanelGroupItems = panelGroupTypes.DropDownItems(),
            LabAssetTypes = labAssetTypes.DropDownItems(),
            SopEnumTypes = sopEnumTypes.DropDownItems(),
            InstrumentTypes = instrumentTypes.DropDownItems(),
            UserRoles = userRoles.DropDownItems(),
            DecimalFormatTypes = decimalFormatTypes.DropDownItems(),
            SopBatchPositionTypes = sopBatchPositionTypes.DropDownItems(),
            ControlSampleTypes = controlSampleTypes.DropDownItems(),
            ControlSampleAnalyses = controlSampleAnalyses.DropDownItems(),
            ControlSampleQCSources = controlSampleQCSources.DropDownItems(),
            ControlSampleCategories = controlSampleCategories.DropDownItems(),
            ControlSamplePassCriteria = controlSamplePasCriteria.DropDownItems(),
            QCConditions = qcConditions.DropDownItems(),
            Compounds = compounds.DropDownItems(),
            PanelGroups = panelGroups.DropDownItems(),
            PanelTypes = panelTypes.DropDownItems(),
            TestCategoryTypes = testCategoryTypes.DropDownItems(),
            InstrumentFileParserTypes = instrumentFileParserTypes.DropDownItems(),
            DurableLabAssets = durableLabAssets.DropDownItems(),
            AggregateRollupMethodTypes = _selectorService.EnumTypes<AggregateRollupMethodType>(true).DropDownItems(),
            AnalysisMethodTypes = _selectorService.EnumTypes<ManifestSampleAnalysisMethodType>(true).DropDownItems(),
            ReportPercentTypes = _selectorService.EnumTypes<ReportPercentType>(true).DropDownItems(),
            ComparisonTypes = _selectorService.EnumTypes<NcComparisonType>(true).DropDownItems(),
            PrepBatchSops = prepBatchSops.DropDownItems(),
            AnalyticalBatchSops = analyticalBatchSops.DropDownItems(),
            PeripheralTypes = peripheralTypes.DropDownItems()
        };

        return ret;
    }

    public  async Task<List<PrepBatchSopSelectionRs>> FetchPrepBatchSopSelectionResponse(int labId)
    {
        await using var ctx = _ctxFactory.Create;
        var query = ctx.PrepBatchSops
            .Where(pbsop => pbsop.LabId == labId);
        var ret = await PrepBatchSopSelectionRs.FetchPrepBatchSopSelectionRs(query);
        return ret;
    }

    public async Task<List<AnalyticalBatchSopSelectionRs>> FetchAnalyticalBatchSopSelectionResponse(int labId)
    {
        await using var ctx = _ctxFactory.Create;
        var query = ctx.AnalyticalBatchSops
            .Where(absop => absop.LabId == labId);
        var ret = await AnalyticalBatchSopSelectionRs.FetchPrepBatchSopSelectionRs(query);
        return ret;
    }

    public async Task<List<PrepBatchSopSelectionRs>> FetchBatchSopSelectionResponse(int labId)
    {
        await using var ctx = _ctxFactory.Create;
        var query = ctx.PrepBatchSops
            .Where(pbsop => pbsop.LabId == labId);
        var ret = await PrepBatchSopSelectionRs.FetchPrepBatchSopSelectionRs(query);
        return ret;
    }


    public async Task<PrepBatchSopRs> FetchPrepBatchSopRs(int prepBatchSopId)
    {
        await using var ctx = _ctxFactory.Create;
        var query = ctx.PrepBatchSops.AsNoTracking()
            .Where(pbsop => pbsop.Id == prepBatchSopId);

        var pbsops = await PrepBatchSopRs.PrepBatchSopRss(query);

        var pbsop = pbsops.FirstOrDefault();

        var sopFields = await ctx.SopFields.AsNoTracking()
            .Where(f => f.BatchSopId == prepBatchSopId)
            .ToListAsync();

        pbsop.SopFields = sopFields.Select(SopFieldRs.Create).ToList();

        return pbsop;
    }

    public async Task<AnalyticalBatchSopRs> FetchAnalyticalBatchSopRs(int anBatchSopId)
    {
        await using var ctx = _ctxFactory.Create;
        var query = ctx.AnalyticalBatchSops.AsNoTracking()
            .Where(pbsop => pbsop.Id == anBatchSopId);

        var analyteSelectors = await _selectorService.AnalyteCas(true, false);

        var ansops = await AnalyticalBatchSopRs.FetchAnalyticalBatchSopRss(query, analyteSelectors);

        var ansop = ansops.FirstOrDefault();

        var sopFields = await ctx.SopFields.AsNoTracking()
            .Where(f => f.BatchSopId == anBatchSopId)
            .ToListAsync();

        ansop.SopFields = sopFields.Select(SopFieldRs.Create).ToList();

        return ansop;
    }

    public async Task<List<CompoundRs>> FetchCompoundRs()
    {
        await using var ctx = _ctxFactory.Create;
        var query = ctx.Analytes;
        var ret = await CompoundRs.FetchAnalyteRs(query);
        return ret;
    }

    public async Task<List<CompoundRs>> UpsertCompoundRss(List<CompoundRs> responses)
    {
        if (responses == null) throw new ArgumentNullException(nameof(responses));
        await using var ctx = _ctxFactory.Create;

        var models = await ctx.Analytes.ToListAsync();
        foreach (var response in responses)
            await CompoundRs.UpsertFromResponses(responses, models, ctx);

        await ctx.SaveChangesAsync();

        var query = ctx.Analytes;
        var updatedResponses = await CompoundRs.FetchAnalyteRs(query);
        return updatedResponses;
    }

    public async Task<List<PanelRs>> FetchPanelRss(int labId)
    {
        await using var ctx = _ctxFactory.Create;
        var query = ctx.Panels
            .Where(p => p.LabId == labId);
        var ret = await PanelRs.FetchPanelRss(query);
        return ret;
    }

    public async Task<List<PanelRs>> UpsertPanelRss(List<PanelRs> responses, int labId)
    {
        if (responses == null) throw new ArgumentNullException(nameof(responses));

        await using var ctx = _ctxFactory.Create;
        var models = await ctx.Panels
            .Include(p => p.ChildPanelPanels)
            .ThenInclude(cpp => cpp.ChildPanel)
            .Where(p => p.LabId == labId)
            .ToListAsync();

        foreach (var panelRs in responses)
            PanelRs.UpsertFromResponse(panelRs, models, ctx);

        await ctx.SaveChangesAsync();

        var query = ctx.Panels.Where(p => p.LabId == labId);
        var returningResponses = await PanelRs.FetchPanelRss(query);

        return returningResponses;
    }

    public async Task<List<InstrumentTypeRs>> FetchInstrumentTypeRss(int labId)
    {
        await using var ctx = _ctxFactory.Create;
        var query = ctx.InstrumentTypes
            .Where(p => p.LabId == labId);
        var ret = await InstrumentTypeRs.FetchInstrumentTypes(query);
        return ret;
    }

    public async Task<List<InstrumentTypeRs>> UpsertInstrumentTypeRss(List<InstrumentTypeRs> responses, int labId)
    {
        await using var ctx = _ctxFactory.Create;
        var models = await ctx.InstrumentTypes
            .Include(it => it.InstrumentTypeAnalytes)
            .Include(it => it.Instruments)
            .ThenInclude(ins => ins.InstrumentPeripherals)
            .Where(ins => ins.LabId == labId)
            .ToListAsync();

        foreach (var response in responses)
            await InstrumentTypeRs.UpsertFromResponse(response, models, ctx);

        await ctx.SaveChangesAsync();

        var query = ctx.InstrumentTypes
            .Where(p => p.LabId == labId);
        var updatedResponses = await InstrumentTypeRs.FetchInstrumentTypes(query);
        return updatedResponses;
    }
}