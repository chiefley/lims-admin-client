using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using NCLims.Data;
using System.Threading.Tasks;
using FluentValidation;
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

    // Returns ServiceResponse<List<InstrumentTypeRs>>
    [HttpPut("UpsertCompoundRss/{labId}")]
    public async Task<IActionResult> UpsertCompoundRsRss([FromBody] List<CompoundRs> responses, int labId)
    {
        try
        {
            foreach (var response in responses)
            {
                var x = CompoundRs.Validate(response, responses);
                if (!x.IsValid) throw new InvalidOperationException(x.Errors.First().ErrorMessage);
            }

            var payload = await _sopService.UpsertCompoundRss(responses);

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

    // Returns ServiceResponse<List<InstrumentTypeRs>>
    [HttpPut("UpsertInstrumentTypeRss/{labId}")]
    public async Task<IActionResult> UpsertInstrumentTypeRss([FromBody] List<InstrumentTypeRs> responses, int labId)
    {
        try
        {
            foreach (var response in responses)
            {
                var x= InstrumentTypeRs.Validate(response, labId);
                if (!x.IsValid) throw new InvalidOperationException(x.Errors.First().ErrorMessage);
            }

            var payload = await _sopService.UpsertInstrumentTypeRss(responses, labId);

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