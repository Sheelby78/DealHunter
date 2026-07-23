using DealHunter.Api.Configuration;
using DealHunter.Api.DTOs;
using DealHunter.Api.Filters;
using DealHunter.Application.Rules.Commands.AddSearchRule;
using DealHunter.Application.Rules.Commands.DeleteSearchRule;
using DealHunter.Application.Rules.Queries.GetSearchRules;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace DealHunter.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[PinAuthorize]
public class RulesController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly long _chatId;

    public RulesController(IMediator mediator, IConfiguration configuration)
    {
        _mediator = mediator;
        _chatId = configuration.GetValue<long>("Telegram:ChatId");
    }

    [HttpGet]
    public async Task<IActionResult> GetRules(CancellationToken cancellationToken)
    {
        var query = new GetSearchRulesQuery(_chatId);
        var rules = await _mediator.Send(query, cancellationToken);
        return Ok(rules);
    }

    [HttpPost]
    public async Task<IActionResult> CreateRule([FromBody] CreateRuleRequest request, CancellationToken cancellationToken)
    {
        if (request == null || string.IsNullOrWhiteSpace(request.Url))
        {
            return BadRequest(new { error = "Url is required." });
        }

        try
        {
            var command = new AddSearchRuleCommand(_chatId, request.Url, request.MaxPrice);
            var result = await _mediator.Send(command, cancellationToken);
            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteRule(string id, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(id))
        {
            return BadRequest(new { error = "Rule identifier is required." });
        }

        var command = new DeleteSearchRuleCommand(_chatId, id);
        var success = await _mediator.Send(command, cancellationToken);
        if (!success)
        {
            return NotFound();
        }

        return NoContent();
    }
}
