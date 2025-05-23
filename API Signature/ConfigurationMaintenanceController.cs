using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using NCLims.Data;
using System.Threading.Tasks;
using NCLims.Business.NewBatch.ConfigurationManagement;
using NCLims.Business.NewBatch.ConfigurationManagement.Responses;
using NCLims.Business.NewBatch.ConfigurationManagement.Responses.AnalyticalBatchSops;
using NCLims.Business.NewBatch.ConfigurationManagement.Responses.Basic_Tables;
using NCLims.Business.NewBatch.ConfigurationManagement.Responses.Lab_Assets;
using NCLims.Business.NewBatch.ConfigurationManagement.Responses.PrepBatchSops;
using NCLims.Business.NewBatch.ConfigurationManagement.Responses.Clients;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using NCLims.Business.NewBatch.ConfigurationManagement.Responses.Auth;

namespace NCLims.App.Controllers;

[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "Admin")]
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

    // Returns ServiceResponse<List<ItemTypeRs>>
    [HttpGet("FetchItemTypeRss/{stateId}")]
    public async Task<IActionResult> FetchItemTypeRss(int stateId)
    {
        try
        {
            var payload = await _sopService.FetchItemTypeRss(stateId);
            var sr = new ServiceResponse<List<ItemTypeRs>>
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
            var payload = await _sopService.FetchPanelRss(labId);
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

    // Returns ServiceResponse<List<PanelRs>>
    [HttpPut("UpsertPanelRss/{labId}")]
    public async Task<IActionResult> UpsertPanelRss([FromBody] List<PanelRs> responses, int labId)
    {
        try
        {
            foreach (var response in responses)
            {
                var x = PanelRs.Validate(response, responses, labId);
                if (!x.IsValid)
                    throw new InvalidOperationException(x.Errors.First().ErrorMessage);
            }

            var payload = await _sopService.UpsertPanelRss(responses, labId);

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

    // Returns ServiceResponse<List<PanelGroupRs>>
    [HttpGet("FetchPanelGroupRss/{labId}")]
    public async Task<IActionResult> FetchPanelGroupRss(int labId)
    {
        try
        {
            var payload = await _sopService.FetchPanelGroupRss(labId);
            var sr = new ServiceResponse<List<PanelGroupRs>>
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

    // Returns ServiceResponse<List<PanelGroupRs>>
    [HttpPut("UpsertPanelGroupRss/{labId}")]
    public async Task<IActionResult> UpsertPanelGroupRss([FromBody] List<PanelGroupRs> responses, int labId)
    {
        try
        {
            foreach (var response in responses)
            {
                var x = PanelGroupRs.Validate(response, responses, labId);
                if (!x.IsValid)
                    throw new InvalidOperationException(x.Errors.First().ErrorMessage);
            }

            var payload = await _sopService.UpsertPanelGroupRss(responses, labId);

            var sr = new ServiceResponse<List<PanelGroupRs>>
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
                var x= InstrumentTypeRs.Validate(response, responses, labId);
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

    // Returns ServiceResponse<List<FileParserRs>>
    [HttpGet("FetchFileParserRss")]
    public async Task<IActionResult> FetchFileParserRss()
    {
        try
        {
            var payload = await _sopService.FetchFileParserRss();
            var sr = new ServiceResponse<List<FileParserRs>>
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

    // Returns ServiceResponse<List<FileParserRs>>
    [HttpPut("UpsertFileParserRss")]
    public async Task<IActionResult> UpsertFileParserRss([FromBody] List<FileParserRs> responses)
    {
        try
        {
            var payload = await _sopService.UpsertFileParserRss(responses);
            var sr = new ServiceResponse<List<FileParserRs>>
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

    // Returns ServiceResponse<List<DBEnumRs>>
    [HttpGet("FetchDBEnumRss/{labId}")]
    public async Task<IActionResult> FetchDBEnumRss(int labId)
    {
        try
        {
            var payload = await _sopService.FetchDBEnumRss(labId);
            var sr = new ServiceResponse<List<DBEnumRs>>
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

    // Returns ServiceResponse<List<NeededByRs>>
    [HttpGet("FetchNeededByRss/{labId}")]
    public async Task<IActionResult> FetchNeededByRss(int labId)
    {
        try
        {
            var payload = await _sopService.FetchNeededByRss(labId);
            var sr = new ServiceResponse<List<NeededByRs>>
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

    // Returns ServiceResponse<List<NeededByRs>>
    [HttpPut("UpsertNeededByRss/{labId}")]
    public async Task<IActionResult> UpsertNeededByRs([FromBody] List<NeededByRs> responses, int labId)
    {
        try
        {
            var payload = await _sopService.UpsertNeededByRss(responses, labId);
            var sr = new ServiceResponse<List<NeededByRs>>
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

    // Returns ServiceResponse<List<NavMenuItemRs>>
    [HttpGet("FetchNavMenuItemRss/{labId}")]
    public async Task<IActionResult> FetchNavMenuItemRss(int labId)
    {
        try
        {
            var payload = await _sopService.FetchNavMenuItemRss(labId);
            var sr = new ServiceResponse<List<NavMenuItemRs>>
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

    // Returns ServiceResponse<List<ItemTypeRs>>
    [HttpPut("UpsertItemTypeRss/{labId}")]
    public async Task<IActionResult> UpsertItemTypeRs([FromBody] List<ItemTypeRs> responses, int labId)
    {
        try
        {
            var payload = await _sopService.UpsertItemTypeRss(responses, labId);
            var sr = new ServiceResponse<List<ItemTypeRs>>
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

    [HttpPut("UpsertNavMenuItemRss/{labId}")]
    public async Task<IActionResult> UpsertNavMenuItemRs([FromBody] List<NavMenuItemRs> responses, int labId)
    {
        try
        {
            var payload = await _sopService.UpsertNavMenuItemRss(responses, labId);
            var sr = new ServiceResponse<List<NavMenuItemRs>>
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

    // Returns ServiceResponse<List<PanelGroupRs>>
    [HttpPut("UpsertPanelGroupRss/{labId}")]
    public async Task<IActionResult> UpsertPanelGroupRs([FromBody] List<PanelGroupRs> responses, int labId)
    {
        try
        {
            var payload = await _sopService.UpsertPanelGroupRss(responses, labId);
            var sr = new ServiceResponse<List<PanelGroupRs>>
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

    // Returns ServiceResponse<List<TestCategoryRs>>
    [HttpGet("FetchTestCategoryRss/{stateId}")]
    public async Task<IActionResult> FetchTestCategoryRss(int stateId)
    {
        try
        {
            var payload = await _sopService.FetchTestCategoryRss(stateId);
            var sr = new ServiceResponse<List<TestCategoryRs>>
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

    // Returns ServiceResponse<List<TestCategoryRs>>
    [HttpPut("UpsertTestCategoryRss/{labId}")]
    public async Task<IActionResult> UpsertTestCategoryRs([FromBody] List<TestCategoryRs> responses, int labId)
    {
        try
        {
            var payload = await _sopService.UpsertTestCategoryRss(responses, labId);
            var sr = new ServiceResponse<List<TestCategoryRs>>
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

    // Returns ServiceResponse<List<PotencyCategoryRs>>
    [HttpGet("FetchPotencyCategoryRss/{stateId}")]
    public async Task<IActionResult> FetchPotencyCategoryRss(int stateId)
    {
        try
        {
            var payload = await _sopService.FetchPotencyCategoryRss(stateId);
            var sr = new ServiceResponse<List<PotencyCategoryRs>>
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

    // Returns ServiceResponse<List<PotencyCategoryRs>>
    [HttpPut("UpsertPotencyCategoryRss/{labId}")]
    public async Task<IActionResult> UpsertPotencyCategoryRs([FromBody] List<PotencyCategoryRs> responses)
    {
        try
        {
            var payload = await _sopService.UpsertPotencyCategoryRss(responses);
            var sr = new ServiceResponse<List<PotencyCategoryRs>>
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


    // Returns ServiceResponse<List<CcSampleCategoryRs>>
    [HttpGet("FetchCcSampleCategoryRss/{labId}")]
    public async Task<IActionResult> FetchCCSampleCategoryRss(int labId)
    {
        try
        {
            var payload = await _sopService.FetchCCSampleCategoryRss(labId);
            var sr = new ServiceResponse<List<CcSampleCategoryRs>>
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


    // Returns ServiceResponse<List<CcSampleCategoryRs>>
    [HttpPut("UpsertCcSampleCategoryRss/{labId}")]
    public async Task<IActionResult> UpsertCcSampleCategoryRss([FromBody] List<CcSampleCategoryRs> responses)
    {
        try
        {
            var payload = await _sopService.UpsertCcSampleCategoryRss(responses);
            var sr = new ServiceResponse<List<CcSampleCategoryRs>>
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

    // Returns ServiceResponse<List<ClientLicenseTypeRs>>
    [HttpGet("FetchClientLicenseTypeRss/{labId}")]
    public async Task<IActionResult> FetchClientLicenseTypeRss(int labId)
    {
        try
        {
            var payload = await _sopService.FetchClientLicenseTypeRss(labId);
            var sr = new ServiceResponse<List<ClientLicenseTypeRs>>
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


    // Returns ServiceResponse<List<ClientLicenseTypeRs>>
    [HttpPut("UpsertClientLicenseTypeRss/{stateId}")]
    public async Task<IActionResult> UpsertClientLicenseTypeRss([FromBody] List<ClientLicenseTypeRs> responses, int stateId)
    {
        try
        {
            var payload = await _sopService.UpsertClientLicenseTypeRss(responses, stateId);
            var sr = new ServiceResponse<List<ClientLicenseTypeRs>>
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

    // Returns ServiceResponse<List<ClientLicenseCategoryRs>>
    [HttpGet("FetchClientLicenseCategoryRss")]
    public async Task<IActionResult> FetchClientLicenseCategoryRss()
    {
        try
        {
            var payload = await _sopService.FetchClientLicenseCategoryRss();
            var sr = new ServiceResponse<List<ClientLicenseCategoryRs>>
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


    // Returns ServiceResponse<List<ClientLicenseCategoryRs>>
    [HttpPut("UpsertClientLicenseCategoryRss")]
    public async Task<IActionResult> UpsertClientLicenseCategoryRss([FromBody] List<ClientLicenseCategoryRs> responses)
    {
        try
        {
            var payload = await _sopService.UpsertClientLicenseCategoryRss(responses);
            var sr = new ServiceResponse<List<ClientLicenseCategoryRs>>
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

    // Returns ServiceResponse<List<ClientRs>>
    [HttpGet("FetchClientRss/{labId}")]
    public async Task<IActionResult> FetchClientRss(int labId)
    {
        try
        {
            var payload = await _sopService.FetchClientRss(labId);
            var sr = new ServiceResponse<List<ClientRs>>
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


    // Returns ServiceResponse<List<ClientRs>>
    [HttpPut("UpsertClientRss/{labId}")]
    public async Task<IActionResult> UpsertClientRss([FromBody] List<ClientRs> responses, int labId)
    {
        try
        {
            var payload = await _sopService.UpsertClientRss(responses, labId);
            var sr = new ServiceResponse<List<ClientRs>>
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

    // Returns ServiceResponse<List<UserLabRs>>
    [HttpGet("FetchUserLabRss")]
    public async Task<IActionResult> FetchUserLabRss()
    {
        try
        {
            var userId = GetUserId();
            var payload = await _sopService.FetchUserLabRss(userId);
            var sr = new ServiceResponse<List<UserLabRs>>
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

    private int GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
        {
            throw new InvalidOperationException("Cannot find user.");
        }

        return userId;
    }

}