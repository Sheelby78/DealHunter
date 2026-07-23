using DealHunter.Api.Configuration;
using DealHunter.Api.Controllers;
using DealHunter.Api.DTOs;
using DealHunter.Application.DTOs;
using DealHunter.Application.Rules.Commands.AddSearchRule;
using DealHunter.Application.Rules.Commands.DeleteSearchRule;
using DealHunter.Application.Rules.Queries.GetSearchRules;
using FluentAssertions;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using NSubstitute;
using Xunit;

using Microsoft.Extensions.Configuration;

namespace DealHunter.Tests.Unit.Api.Controllers;

public class RulesControllerTests
{
    private readonly IMediator _mediator = Substitute.For<IMediator>();
    private readonly RulesController _controller;

    public RulesControllerTests()
    {
        var inMemorySettings = new Dictionary<string, string?>
        {
            { "Telegram:ChatId", "12345" }
        };

        IConfiguration configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(inMemorySettings)
            .Build();

        _controller = new RulesController(_mediator, configuration);
    }

    [Fact]
    public async Task GetRules_ReturnsOkWithRules()
    {
        var expectedRules = new List<SearchRuleDto>
        {
            new(Guid.NewGuid(), 12345, "https://www.olx.pl/elektronika/", 500, true, DateTimeOffset.UtcNow)
        };

        _mediator.Send(Arg.Is<GetSearchRulesQuery>(q => q.ChatId == 12345), Arg.Any<CancellationToken>())
            .Returns(expectedRules);

        var result = await _controller.GetRules(CancellationToken.None);

        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        okResult.Value.Should().BeEquivalentTo(expectedRules);
    }

    [Fact]
    public async Task CreateRule_ValidRequest_ReturnsOkWithCreatedRule()
    {
        var request = new CreateRuleRequest("https://www.olx.pl/oferta/test-ID123.html", 250);
        var expectedDto = new SearchRuleDto(Guid.NewGuid(), 12345, request.Url, request.MaxPrice, true, DateTimeOffset.UtcNow);

        _mediator.Send(Arg.Is<AddSearchRuleCommand>(c => c.ChatId == 12345 && c.Url == request.Url && c.MaxPrice == request.MaxPrice), Arg.Any<CancellationToken>())
            .Returns(expectedDto);

        var result = await _controller.CreateRule(request, CancellationToken.None);

        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        okResult.Value.Should().Be(expectedDto);
    }

    [Fact]
    public async Task CreateRule_InvalidArgument_ReturnsBadRequest()
    {
        var request = new CreateRuleRequest("https://invalid-domain.com", 250);

        _mediator.Send(Arg.Any<AddSearchRuleCommand>(), Arg.Any<CancellationToken>())
            .GetType(); // Ensure NSubstitute setup if needed
        _mediator.When(m => m.Send(Arg.Any<AddSearchRuleCommand>(), Arg.Any<CancellationToken>()))
            .Do(_ => throw new ArgumentException("Invalid URL."));

        var result = await _controller.CreateRule(request, CancellationToken.None);

        result.Should().BeOfType<BadRequestObjectResult>();
    }

    [Fact]
    public async Task DeleteRule_ExistingRule_ReturnsNoContent()
    {
        var ruleId = Guid.NewGuid().ToString();

        _mediator.Send(Arg.Is<DeleteSearchRuleCommand>(c => c.ChatId == 12345 && c.RuleIdentifier == ruleId), Arg.Any<CancellationToken>())
            .Returns(true);

        var result = await _controller.DeleteRule(ruleId, CancellationToken.None);

        result.Should().BeOfType<NoContentResult>();
    }

    [Fact]
    public async Task DeleteRule_NonExistingRule_ReturnsNotFound()
    {
        var ruleId = "non-existing-id";

        _mediator.Send(Arg.Is<DeleteSearchRuleCommand>(c => c.ChatId == 12345 && c.RuleIdentifier == ruleId), Arg.Any<CancellationToken>())
            .Returns(false);

        var result = await _controller.DeleteRule(ruleId, CancellationToken.None);

        result.Should().BeOfType<NotFoundResult>();
    }
}
