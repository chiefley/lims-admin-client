using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using NCLims.Data;
using System.Threading.Tasks;
using NCLims.Business.NewBatch.ConfigurationManagement;
using NCLims.Business.NewBatch.ConfigurationManagement.Responses;
using NCLims.Business.NewBatch.ConfigurationManagement.Responses.AnalyticalBatchSops;
using NCLims.Business.NewBatch.ConfigurationManagement.Responses.Basic_Tables;
using NCLims.Business.NewBatch.ConfigurationManagement.Responses.Lab_Assets;
using NCLims.Business.NewBatch.ConfigurationManagement.Responses.PrepBatchSops;

namespace NCLims.App.Controllers;

[Route("api/ConfigurationMaintenance")]
public class ConfigurationMaintenanceController : BaseController
{
    private readonly IConfigurationMaintenanceService _sopService;

    public ConfigurationMaintenanceController(
        NCLimsContextFactory ctxFactory,
        IConfigurationMaintenanceService sopService) : base(ctxFactory)
    {
        _sopService = sopService;
    }

    // Returns ServiceResponse<ConfigurationMaintenanceSelectors>
    [HttpGet("FetchSelectors/{labId}")]
    public async Task<IActionResult> FetchSelectors(int labId)
    {
        try
        {
            var payload = await _sopService.FetchSelectors(labId);
            var sr = new ServiceResponse<ConfigurationMaintenanceSelectors>
            {
                Data = payload,
                Message = "Success",
                Success = true
            };
            return Ok(sr);
        }
        catch (Exception e)
        {
            Console.WriteLine(e);
            throw;
        }
    }

    // Returns ServiceResponse<List<PrepBatchSopSelectionRs>>
    [HttpGet("FetchBatchSopSelections/{labId}")]
    public async Task<IActionResult> FetchPrepBatchSopSelection(int labId)
    {
        try
        {
            var payload = await _sopService.FetchPrepBatchSopSelectionResponse(labId);
            var sr = new ServiceResponse<List<PrepBatchSopSelectionRs>>
            {
                Data = payload,
                Message = "Success",
                Success = true
            };
            return Ok(sr);
        }
        catch (Exception e)
        {
            Console.WriteLine(e);
            throw;
        }
    }

    // Returns ServiceResponse<List<PrepBatchSopRs>>
    [HttpGet("FetchPrepBatchSopRs/{prepBatchSopId}")]
    public async Task<IActionResult> FetchPrepBatchSopRs(int prepBatchSopId)
    {
        try
        {
            var payload = await _sopService.FetchPrepBatchSopRs(prepBatchSopId);
            var sr = new ServiceResponse<PrepBatchSopRs>
            {
                Data = payload,
                Message = "Success",
                Success = true
            };
            return Ok(sr);
        }
        catch (Exception e)
        {
            Console.WriteLine(e);
            throw;
        }
    }

    // Returns ServiceResponse<List<FetchAnalyticalBatchSopSelectionRs>>
    [HttpGet("FetchAnalyticalBatchSopSelections/{labId}")]
    public async Task<IActionResult> FetchAnalyticalBatchSopSelections(int labId)
    {
        try
        {
            var payload = await _sopService.FetchAnalyticalBatchSopSelectionResponse(labId);
            var sr = new ServiceResponse<List<AnalyticalBatchSopSelectionRs>>
            {
                Data = payload,
                Message = "Success",
                Success = true
            };
            return Ok(sr);
        }
        catch (Exception e)
        {
            Console.WriteLine(e);
            throw;
        }
    }

    // Returns ServiceResponse<List<AnalyticalBatchSopRs>>
    [HttpGet("FetchAnalyticalBatchSopRs/{prepBatchSopId}")]
    public async Task<IActionResult> FetchAnalyticalBatchSopRs(int prepBatchSopId)
    {
        try
        {
            var payload = await _sopService.FetchAnalyticalBatchSopRs(prepBatchSopId);
            var sr = new ServiceResponse<AnalyticalBatchSopRs>
            {
                Data = payload,
                Message = "Success",
                Success = true
            };
            return Ok(sr);
        }
        catch (Exception e)
        {
            Console.WriteLine(e);
            throw;
        }
    }


    // Returns ServiceResponse<List<CompoundRs>>
    [HttpGet("FetchCompoundRss")]
    public async Task<IActionResult> FetchCompoundRss()
    {
        try
        {
            var payload = await _sopService.FetchCompoundRs();
            var sr = new ServiceResponse<List<CompoundRs>>
            {
                Data = payload,
                Message = "Success",
                Success = true
            };
            return Ok(sr);
        }
        catch (Exception e)
        {
            Console.WriteLine(e);
            throw;
        }
    }


// Returns ServiceResponse<List<PanelRs>>
    [HttpGet("FetchPanelRss/{labId}")]
    public async Task<IActionResult> FetchPanelRss(int labId)
    {
        try
        {
            var payload = await _sopService.FetchPanels(labId);
            var sr = new ServiceResponse<List<PanelRs>>
            {
                Data = payload,
                Message = "Success",
                Success = true
            };
            return Ok(sr);
        }
        catch (Exception e)
        {
            Console.WriteLine(e);
            throw;
        }
    }

    // Returns ServiceResponse<List<InstrumentTypeRs>>
    [HttpGet("FetchInstrumentTypeRss/{labId}")]
    public async Task<IActionResult> FetchInstrumentTypeRss(int labId)
    {
        try
        {
            var payload = await _sopService.FetchInstrumentTypeRss(labId);
            var sr = new ServiceResponse<List<InstrumentTypeRs>>
            {
                Data = payload,
                Message = "Success",
                Success = true
            };
            return Ok(sr);
        }
        catch (Exception e)
        {
            Console.WriteLine(e);
            throw;
        }
    }
}