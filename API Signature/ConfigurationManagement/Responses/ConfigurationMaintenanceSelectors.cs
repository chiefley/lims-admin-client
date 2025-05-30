﻿using System.Collections.Generic;
using NCLims.Models.DTOs;

namespace NCLims.Business.NewBatch.ConfigurationManagement.Responses;

public class ConfigurationMaintenanceSelectors
{
    public List<DropDownItem> ManifestSampleTypeItems { get; set; } = [];
    public List<DropDownItem> PanelGroupItems { get; set; } = [];
    public List<DropDownItem> LabAssetTypes { get; set; } = [];
    public List<DropDownItem> SopEnumTypes { get; set; } = [];
    public List<DropDownItem> InstrumentTypes { get; set; } = [];
    public List<DropDownItem> UserRoles { get; set; } = [];
    public List<DropDownItem> DecimalFormatTypes { get; set; }
    public List<DropDownItem> SopBatchPositionTypes { get; set; }
    public List<DropDownItem> ControlSampleTypes { get; set; }
    public List<DropDownItem> ControlSampleCategories { get; set; }
    public List<DropDownItem> ControlSampleAnalyses { get; set; }
    public List<DropDownItem> ControlSampleQCSources { get; set; }
    public List<DropDownItem> ControlSamplePassCriteria { get; set; }
    public List<DropDownItem> QCConditions { get; set; }
    public List<DropDownItem> Compounds { get; set; }
    public List<DropDownItem> PanelGroups { get; set; }
    public List<DropDownItem> PanelTypes { get; set; }
    public List<DropDownItem> TestCategoryTypes { get; set; }
    public List<DropDownItem> InstrumentFileParserTypes { get; set; }
    public List<DropDownItem> DurableLabAssets { get; set; }
    public List<DropDownItem> AnalysisMethodTypes { get; set; }
    public List<DropDownItem> ReportPercentTypes { get; set; }
    public List<DropDownItem> ComparisonTypes { get; set; }
    public List<DropDownItem> AggregateRollupMethodTypes { get; set; }
    public List<DropDownItem> PrepBatchSops { get; set; }
    public List<DropDownItem> AnalyticalBatchSops { get; set; }
    public List<DropDownItem> PeripheralTypes { get; set; }
    public List<DropDownItem> DBEnumTypes { get; set; }
    public List<DropDownItem> CCSampleTypes { get; set; }


    public List<DropDownItem> DataFileLevels { get; set; }
    public List<DropDownItem> DataFileTypes { get; set; }
    public List<DropDownItem> FieldDelimeterTypes { get; set; }
    public List<DropDownItem> DataFileSampleMultiplicities { get; set; }
    public List<DropDownItem> NavMenuKeys { get; set; }
    public List<DropDownItem> DayOfWeeks { get; set; }
    public List<DropDownItem> ClientLicenseCategories { get; set; }
    public List<DropDownItem> ClientLicenseTypes { get; set; }
    public List<DropDownItem> UserLabs { get; set; }

}