using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using NCLims.Business.NewBatch.ConfigurationManagement.Responses;
using NCLims.Business.NewBatch.ConfigurationManagement.Responses.AnalyticalBatchSops;
using NCLims.Business.NewBatch.ConfigurationManagement.Responses.Auth;
using NCLims.Business.NewBatch.ConfigurationManagement.Responses.Basic_Tables;
using NCLims.Business.NewBatch.ConfigurationManagement.Responses.BatchSops;
using NCLims.Business.NewBatch.ConfigurationManagement.Responses.Clients;
using NCLims.Business.NewBatch.ConfigurationManagement.Responses.Lab_Assets;
using NCLims.Business.NewBatch.ConfigurationManagement.Responses.PrepBatchSops;
using NCLims.Data;
using NCLims.Data.Utilities;
using NCLims.Models.NewBatch;
using NCLims.Models.NewBatch.Analytical;

namespace NCLims.Business.NewBatch.ConfigurationManagement;

public interface IConfigurationMaintenanceService
{
    Task<ConfigurationMaintenanceSelectors> FetchSelectors(int labId);
    Task<List<PrepBatchSopSelectionRs>> FetchPrepBatchSopSelectionResponse(int labId);
    Task<List<AnalyticalBatchSopSelectionRs>> FetchAnalyticalBatchSopSelectionResponse(int labId);
    Task<PrepBatchSopRs> FetchPrepBatchSopRs(int prepBatchSopId);
    Task<AnalyticalBatchSopRs> FetchAnalyticalBatchSopRs(int anBatchSopId);
    Task<List<CompoundRs>> FetchCompoundRs();
    Task<List<CompoundRs>> UpsertCompoundRss(List<CompoundRs> responses);
    Task<List<PanelRs>> FetchPanelRss(int labId);
    Task<List<PanelRs>> UpsertPanelRss(List<PanelRs> responses, int labId);
    Task<List<InstrumentTypeRs>> FetchInstrumentTypeRss(int labId);
    Task<List<InstrumentTypeRs>> UpsertInstrumentTypeRss(List<InstrumentTypeRs> responses, int labId);
    Task<List<DBEnumRs>> FetchDBEnumRss(int labId);
    Task<List<DBEnumRs>> UpsertDBEnumRss(List<DBEnumRs> responses, int labId);
    Task<List<CcSampleCategoryRs>> UpsertCcSampleCategoryRss(List<CcSampleCategoryRs> responses);
    Task<List<CcSampleCategoryRs>> FetchCCSampleCategoryRss(int labId);
    Task<List<FileParserRs>> FetchFileParserRss();
    Task<List<FileParserRs>> UpsertFileParserRss(List<FileParserRs> responses);
    Task<List<ItemTypeRs>> FetchItemTypeRss(int stateId);
    Task<List<ItemTypeRs>> UpsertItemTypeRss(List<ItemTypeRs> responses, int stateId);
    Task<List<NavMenuItemRs>> FetchNavMenuItemRss(int labId);
    Task<List<NavMenuItemRs>> UpsertNavMenuItemRss(List<NavMenuItemRs> responses, int labId);
    Task<List<NeededByRs>> FetchNeededByRss(int labId);
    Task<List<NeededByRs>> UpsertNeededByRss(List<NeededByRs> responses, int labId);
    Task<List<PanelGroupRs>> FetchPanelGroupRss(int labId);
    Task<List<PanelGroupRs>> UpsertPanelGroupRss(List<PanelGroupRs> responses, int labId);
    Task<List<PotencyCategoryRs>> FetchPotencyCategoryRss(int stateId);
    Task<List<PotencyCategoryRs>> UpsertPotencyCategoryRss(List<PotencyCategoryRs> responses);
    Task<List<TestCategoryRs>> FetchTestCategoryRss(int stateId);
    Task<List<TestCategoryRs>> UpsertTestCategoryRss(List<TestCategoryRs> responses, int stateId);
    Task<List<ClientLicenseTypeRs>> FetchClientLicenseTypeRss(int stateId);
    Task<List<ClientLicenseTypeRs>> UpsertClientLicenseTypeRss(List<ClientLicenseTypeRs> responses, int stateId);
    Task<List<ClientLicenseCategoryRs>> FetchClientLicenseCategoryRss();
    Task<List<ClientLicenseCategoryRs>> UpsertClientLicenseCategoryRss(List<ClientLicenseCategoryRs> responses);
    Task<List<ClientRs>> FetchClientRss(int labId);
    Task<List<ClientRs>> UpsertClientRss(List<ClientRs> responses, int labId);
    Task<List<UserLabRs>> FetchUserLabRss(int userId);
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
        var dbEnumTypes = await _selectorService.DBEnumTypes(labId, true, false);
        var ccSampleTypes = await _selectorService.CCSampleTypes(true, false);

        var dataFileLevels = _selectorService.EnumSelector<DataFileLevel>(true);
        var dataFileTypes = _selectorService.EnumSelector<DataFileType>(true);
        var fieldDelimeterTypes = _selectorService.EnumSelector<FieldDelimiterType>(true);
        var navMenuKeys = _selectorService.EnumSelector<NavMenuKey>(true);
        var dayOfWeeks = _selectorService.EnumSelector<DayOfWeek>(true);
        var dataFileSampleMultiplicities = _selectorService.EnumSelector<DataFileSampleMultiplicity>(true);
        var clientLicenseCategories = await _selectorService.ClientLicenseCategories(true, false);
        var clientLicenseTypes = await _selectorService.ClientLicenseTypes(stateId, true, false);

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
            PeripheralTypes = peripheralTypes.DropDownItems(),
            DBEnumTypes = dbEnumTypes.DropDownItems(),
            CCSampleTypes = ccSampleTypes.DropDownItems(),

            DataFileLevels = dataFileLevels.DropDownItems(),
            DataFileSampleMultiplicities = dataFileSampleMultiplicities.DropDownItems(),
            DataFileTypes = dataFileTypes.DropDownItems(),
            FieldDelimeterTypes = fieldDelimeterTypes.DropDownItems(),
            NavMenuKeys = navMenuKeys.DropDownItems(),
            DayOfWeeks = dayOfWeeks.DropDownItems(),
            ClientLicenseCategories = clientLicenseCategories.DropDownItems(),
            ClientLicenseTypes = clientLicenseTypes.DropDownItems()
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


    public async Task<PrepBatchSopRs> FetchPrepBatchSopRs(int prepBatchSopId)
    {
        await using var ctx = _ctxFactory.Create;
        var query = ctx.PrepBatchSops
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
            await PanelRs.UpsertFromResponse(panelRs, models, ctx);

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

    public async Task<List<DBEnumRs>> FetchDBEnumRss(int labId)
    {
        await using var ctx = _ctxFactory.Create;
        var query = ctx.DBEnums
            .Where(p => p.LabId == labId);
        var ret = await DBEnumRs.FetchDbEnumRss(query);
        return ret;
    }

    public async Task<List<DBEnumRs>> UpsertDBEnumRss(List<DBEnumRs> responses, int labId)
    {
        await using var ctx = _ctxFactory.Create;

        var models = await ctx.DBEnums
            .Where(ins => ins.LabId == labId)
            .ToListAsync();

        DBEnumRs.Delete(responses, models, ctx);

        foreach (var response in responses)
            await DBEnumRs.UpsertFromResponse(response, models, ctx);

        await ctx.SaveChangesAsync();

        var query = ctx.DBEnums
            .Where(p => p.LabId == labId);
        var updatedResponses = await DBEnumRs.FetchDbEnumRss(query);
        return updatedResponses;
    }

    public async Task<List<CcSampleCategoryRs>> UpsertCcSampleCategoryRss(List<CcSampleCategoryRs> responses)
    {
        await using var ctx = _ctxFactory.Create;

        var models = await ctx.CcSampleCategories
            .ToListAsync();

        CcSampleCategoryRs.Delete(responses, models, ctx);

        foreach (var response in responses)
            await CcSampleCategoryRs.UpsertFromResponse(response, models, ctx);

        await ctx.SaveChangesAsync();

        var query = ctx.CcSampleCategories;
        var updatedResponses = await CcSampleCategoryRs.FetchCcSampleCategoryRss(query);
        return updatedResponses;
    }


    public async Task<List<CcSampleCategoryRs>> FetchCCSampleCategoryRss(int labId)
    {
        await using var ctx = _ctxFactory.Create;
        var query = ctx.CcSampleCategories;
        var ret = await CcSampleCategoryRs.FetchCcSampleCategoryRss(query);
        return ret;
    }

    public async Task<List<FileParserRs>> FetchFileParserRss()
    {
        await using var ctx = _ctxFactory.Create;
        var query = ctx.FileParsers;
        var ret = await FileParserRs.FetchFileParserRss(query);
        return ret;
    }

    public async Task<List<FileParserRs>> UpsertFileParserRss(List<FileParserRs> responses)
    {
        await using var ctx = _ctxFactory.Create;
        var models = await ctx.FileParsers
            .Include(fp => fp.Fields)
            .ToListAsync();

        foreach (var response in responses)
            await FileParserRs.UpsertFromResponse(response, models, ctx);

        await ctx.SaveChangesAsync();

        var query = ctx.FileParsers;
        var updatedResponses = await FileParserRs.FetchFileParserRss(query);
        return updatedResponses;
    }

    public async Task<List<ItemTypeRs>> FetchItemTypeRss(int stateId)
    {
        await using var ctx = _ctxFactory.Create;
        var query = ctx.ItemTypes.Where(it => it.StateId == stateId);
        var ret = await ItemTypeRs.FetchItemTypeRss(query);
        return ret;
    }

    public async Task<List<ItemTypeRs>> UpsertItemTypeRss(List<ItemTypeRs> responses, int stateId)
    {
        await using var ctx = _ctxFactory.Create;
        var models = await ctx.ItemTypes
            .Include(it => it.ItemCategories)
            .Where(it => it.StateId == stateId)
            .ToListAsync();

        foreach (var response in responses)
            await ItemTypeRs.UpsertFromResponse(response, models, ctx);

        await ctx.SaveChangesAsync();

        var query = ctx.ItemTypes
            .Where(it => it.StateId == stateId);
        var updatedResponses = await ItemTypeRs.FetchItemTypeRss(query);
        return updatedResponses;
    }

    public async Task<List<NavMenuItemRs>> FetchNavMenuItemRss(int labId)
    {
        await using var ctx = _ctxFactory.Create;
        var query = ctx.NavMenuItem.Where(it => it.LabId == labId);
        var ret = await NavMenuItemRs.FetchNavItems(query);
        return ret;
    }

    public async Task<List<NavMenuItemRs>> UpsertNavMenuItemRss(List<NavMenuItemRs> responses, int labId)
    {
        await using var ctx = _ctxFactory.Create;
        var models = await ctx.NavMenuItem
            .Where(nmi => nmi.LabId == labId)
            .ToListAsync();

        foreach (var response in responses)
            await NavMenuItemRs.UpsertFromResponse(response, models, ctx);

        await ctx.SaveChangesAsync();

        var query = ctx.NavMenuItem
            .Where(nmi => nmi.LabId == labId);
        var updatedResponses = await NavMenuItemRs.FetchNavItems(query);
        return updatedResponses;
    }

    public async Task<List<NeededByRs>> FetchNeededByRss(int labId)
    {
        await using var ctx = _ctxFactory.Create;
        var query = ctx.NeededBy.Where(it => it.LabId == labId);
        var ret = await NeededByRs.FetchNeededByRss(query);
        return ret;
    }

    public async Task<List<NeededByRs>> UpsertNeededByRss(List<NeededByRs> responses, int labId)
    {
        await using var ctx = _ctxFactory.Create;
        var models = await ctx.NeededBy
            .Where(nmi => nmi.LabId == labId)
            .ToListAsync();

        foreach (var response in responses)
            await NeededByRs.UpsertFromResponse(response, models, ctx);

        await ctx.SaveChangesAsync();

        var query = ctx.NeededBy
            .Where(nmi => nmi.LabId == labId);
        var updatedResponses = await NeededByRs.FetchNeededByRss(query);
        return updatedResponses;
    }

    public async Task<List<PanelGroupRs>> FetchPanelGroupRss(int labId)
    {
        await using var ctx = _ctxFactory.Create;
        var query = ctx.PanelGroups.Where(it => it.LabId == labId);
        var ret = await PanelGroupRs.FetchPanelGroupRss(query);
        return ret;
    }

    public async Task<List<PanelGroupRs>> UpsertPanelGroupRss(List<PanelGroupRs> responses, int labId)
    {
        await using var ctx = _ctxFactory.Create;
        var models = await ctx.PanelGroups
            .Where(nmi => nmi.LabId == labId)
            .ToListAsync();

        foreach (var response in responses)
            await PanelGroupRs.UpsertFromResponse(response, models, ctx);

        await ctx.SaveChangesAsync();

        var query = ctx.PanelGroups
            .Where(nmi => nmi.LabId == labId);
        var updatedResponses = await PanelGroupRs.FetchPanelGroupRss(query);
        return updatedResponses;
    }

    public async Task<List<PotencyCategoryRs>> FetchPotencyCategoryRss(int stateId)
    {
        await using var ctx = _ctxFactory.Create;
        var query = ctx.PotencyCategories.Where(it => it.StateId == stateId);
        var ret = await PotencyCategoryRs.FetchPotencyCategoryRss(query);
        return ret;
    }

    public async Task<List<PotencyCategoryRs>> UpsertPotencyCategoryRss(List<PotencyCategoryRs> responses)
    {
        await using var ctx = _ctxFactory.Create;
        var models = await ctx.PotencyCategories
            .ToListAsync();

        foreach (var response in responses)
            await PotencyCategoryRs.UpsertFromResponse(response, models, ctx);

        await ctx.SaveChangesAsync();

        var query = ctx.PotencyCategories;
        var updatedResponses = await PotencyCategoryRs.FetchPotencyCategoryRss(query);
        return updatedResponses;
    }

    public async Task<List<TestCategoryRs>> FetchTestCategoryRss(int stateId)
    {
        await using var ctx = _ctxFactory.Create;
        var query = ctx.TestCategory.Where(it => it.StateId == stateId);
        var ret = await TestCategoryRs.FetchTestCategoryRss(query);
        return ret;
    }

    public async Task<List<TestCategoryRs>> UpsertTestCategoryRss(List<TestCategoryRs> responses, int stateId)
    {
        await using var ctx = _ctxFactory.Create;
        var models = await ctx.TestCategory
            .Where(nmi => nmi.StateId == stateId)
            .ToListAsync();

        foreach (var response in responses)
            await TestCategoryRs.UpsertFromResponse(response, models, ctx);

        await ctx.SaveChangesAsync();

        var query = ctx.TestCategory
            .Where(nmi => nmi.StateId == stateId);
        var updatedResponses = await TestCategoryRs.FetchTestCategoryRss(query);
        return updatedResponses;
    }

    public async Task<List<ClientLicenseTypeRs>> FetchClientLicenseTypeRss(int stateId)
    {
        await using var ctx = _ctxFactory.Create;
        var query = ctx.ClientLicenseTypes.Where(it => it.StateId == stateId);
        var ret = await ClientLicenseTypeRs.FetchClientLicenseTypeRss(query);
        return ret;
    }

    public async Task<List<ClientLicenseTypeRs>> UpsertClientLicenseTypeRss(List<ClientLicenseTypeRs> responses, int stateId)
    {
        await using var ctx = _ctxFactory.Create;
        var models = await ctx.ClientLicenseTypes
            .Where(nmi => nmi.StateId == stateId)
            .ToListAsync();

        foreach (var response in responses)
            await ClientLicenseTypeRs.UpsertFromResponse(response, models, ctx);

        await ctx.SaveChangesAsync();

        var query = ctx.ClientLicenseTypes
            .Where(nmi => nmi.StateId == stateId);
        var updatedResponses = await ClientLicenseTypeRs.FetchClientLicenseTypeRss(query);
        return updatedResponses;
    }

    public async Task<List<ClientLicenseCategoryRs>> FetchClientLicenseCategoryRss()
    {
        await using var ctx = _ctxFactory.Create;
        var query = ctx.ClientLicenseCategories;
        var ret = await ClientLicenseCategoryRs.FetchClientLicenseCategoryRss(query);
        return ret;
    }

    public async Task<List<ClientLicenseCategoryRs>> UpsertClientLicenseCategoryRss(List<ClientLicenseCategoryRs> responses)
    {
        await using var ctx = _ctxFactory.Create;
        var models = await ctx.ClientLicenseCategories
            .ToListAsync();

        foreach (var response in responses)
            await ClientLicenseCategoryRs.UpsertFromResponse(response, models, ctx);

        await ctx.SaveChangesAsync();

        var query = ctx.ClientLicenseCategories;
        var updatedResponses = await ClientLicenseCategoryRs.FetchClientLicenseCategoryRss(query);
        return updatedResponses;
    }


    public async Task<List<ClientRs>> FetchClientRss(int labId)
    {
        await using var ctx = _ctxFactory.Create;
        var query = ctx.Clients.Where(it => it.LabId == labId);
        var ret = await ClientRs.FetchClientRss(query);
        return ret;
    }

    public async Task<List<ClientRs>> UpsertClientRss(List<ClientRs> responses, int labId)
    {
       
        await using var ctx = _ctxFactory.Create;
        var models = await ctx.Clients
            .Include(cl => cl.ClientLicenses)
            .Include(cl => cl.ClientPricings)
            .Where(nmi => nmi.LabId == labId)
            .ToListAsync();

        foreach (var response in responses)
            await ClientRs.UpsertFromResponse(response, models, ctx, labId);

        await ctx.SaveChangesAsync();

        var query = ctx.Clients
            .Where(nmi => nmi.LabId == labId);
        var updatedResponses = await ClientRs.FetchClientRss(query);
        return updatedResponses;
    }

    public async Task<List<UserLabRs>> FetchUserLabRss(int userId)
    {
        await using var ctx = _ctxFactory.Create;
        var query = ctx.UserLabs.Where(ul => ul.AspNetUserId == userId);
        var response = await UserLabRs.FetchUeUserLabRss(query);
        return response;
    }
}