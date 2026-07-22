using System.Net;
using DealHunter.Application.Common.Interfaces;
using DealHunter.Application.Common.Models;
using DealHunter.Application.DTOs;
using DealHunter.Application.Offers.Commands.ProcessOffers;
using DealHunter.Domain.Entities;
using DealHunter.Domain.Repositories;
using FluentAssertions;
using Microsoft.Extensions.Options;
using NSubstitute;
using Xunit;

namespace DealHunter.Tests.Unit.Offers;

public class ProcessOffersCommandHandlerTests
{
    private readonly ISearchRuleRepository _searchRuleRepository = Substitute.For<ISearchRuleRepository>();
    private readonly IProcessedOfferRepository _processedOfferRepository = Substitute.For<IProcessedOfferRepository>();
    private readonly IOlxHtmlParser _olxHtmlParser = Substitute.For<IOlxHtmlParser>();
    private readonly ITelegramNotificationService _telegramNotificationService = Substitute.For<ITelegramNotificationService>();

    private ProcessOffersCommandHandler CreateHandler(
        string returnedHtml = "<html></html>",
        HttpMessageHandler? customHandler = null,
        ResilienceOptions? options = null)
    {
        var handlerMock = customHandler ?? new MockHttpMessageHandler(returnedHtml);
        var httpClient = new HttpClient(handlerMock);
        var resilienceOptions = Options.Create(options ?? new ResilienceOptions { InterRequestDelaySeconds = 0 });

        return new ProcessOffersCommandHandler(
            _searchRuleRepository,
            _processedOfferRepository,
            _olxHtmlParser,
            _telegramNotificationService,
            httpClient,
            resilienceOptions
        );
    }

    [Fact]
    public async Task Handle_WithActiveRule_FiltersMaxPriceAndDeduplicatesExistingOffers()
    {
        // Arrange
        var rule = SearchRule.Create(chatId: 12345, url: "https://www.olx.pl/elektronika/q-ps5/", maxPrice: 1500m);
        _searchRuleRepository.GetAllActiveAsync(Arg.Any<CancellationToken>())
            .Returns(new List<SearchRule> { rule });

        var offerTooExpensive = new ExtractedOfferDto("ID-EXPENSIVE", "PS5 Pro", 3000m, "https://olx.pl/1", null);
        var offerNewValid = new ExtractedOfferDto("ID-NEW-VALID", "PS5 Slim", 1400m, "https://olx.pl/2", "http://img.jpg");
        var offerAlreadyProcessed = new ExtractedOfferDto("ID-EXISTING", "PS5 Digital", 1200m, "https://olx.pl/3", null);

        _olxHtmlParser.Parse(Arg.Any<string>())
            .Returns(new List<ExtractedOfferDto> { offerTooExpensive, offerNewValid, offerAlreadyProcessed });

        _processedOfferRepository.FilterExistingOfferIdsAsync(Arg.Any<IEnumerable<string>>(), Arg.Any<CancellationToken>())
            .Returns(new List<string> { "ID-EXISTING" });

        var handler = CreateHandler();

        // Act
        var result = await handler.Handle(new ProcessOffersCommand(), CancellationToken.None);

        // Assert
        result.RulesProcessed.Should().Be(1);
        result.OffersParsed.Should().Be(3);
        result.NewOffersNotified.Should().Be(1);

        await _telegramNotificationService.Received(1).SendOfferAlertAsync(
            12345,
            Arg.Is<ExtractedOfferDto>(o => o.OfferId == "ID-NEW-VALID"),
            Arg.Any<CancellationToken>()
        );

        await _processedOfferRepository.Received(1).AddAsync(
            Arg.Is<ProcessedOffer>(p => p.OfferId == "ID-NEW-VALID" && p.RuleId == rule.Id),
            Arg.Any<CancellationToken>()
        );
    }

    [Fact]
    public async Task Handle_FailingRule_IsolatesExceptionAndProcessesRemainingRules()
    {
        // Arrange
        var ruleFail = SearchRule.Create(chatId: 100, url: "https://www.olx.pl/fail/", maxPrice: 1000m);
        var ruleSuccess = SearchRule.Create(chatId: 200, url: "https://www.olx.pl/success/", maxPrice: 2000m);

        _searchRuleRepository.GetAllActiveAsync(Arg.Any<CancellationToken>())
            .Returns(new List<SearchRule> { ruleFail, ruleSuccess });

        var failingHttpHandler = new RouteHttpMessageHandler(url =>
        {
            if (url.Contains("fail"))
            {
                throw new HttpRequestException("Network failure on OLX");
            }
            return new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new StringContent("<html>valid</html>")
            };
        });

        var offerValid = new ExtractedOfferDto("ID-OK", "Guitar", 500m, "https://olx.pl/guitar", null);
        _olxHtmlParser.Parse("<html>valid</html>")
            .Returns(new List<ExtractedOfferDto> { offerValid });

        _processedOfferRepository.FilterExistingOfferIdsAsync(Arg.Any<IEnumerable<string>>(), Arg.Any<CancellationToken>())
            .Returns(new List<string>());

        var handler = CreateHandler(customHandler: failingHttpHandler);

        // Act
        var result = await handler.Handle(new ProcessOffersCommand(), CancellationToken.None);

        // Assert
        result.RulesProcessed.Should().Be(2);
        result.OffersParsed.Should().Be(1);
        result.NewOffersNotified.Should().Be(1);

        await _telegramNotificationService.Received(1).SendOfferAlertAsync(
            200,
            Arg.Is<ExtractedOfferDto>(o => o.OfferId == "ID-OK"),
            Arg.Any<CancellationToken>()
        );
    }

    [Fact]
    public async Task Handle_TimeoutOnRule_IsolatesTaskCanceledExceptionAndProcessesRemainingRules()
    {
        // Arrange
        var ruleTimeout = SearchRule.Create(chatId: 100, url: "https://www.olx.pl/timeout/", maxPrice: 1000m);
        var ruleSuccess = SearchRule.Create(chatId: 200, url: "https://www.olx.pl/success/", maxPrice: 2000m);

        _searchRuleRepository.GetAllActiveAsync(Arg.Any<CancellationToken>())
            .Returns(new List<SearchRule> { ruleTimeout, ruleSuccess });

        var timingOutHttpHandler = new RouteHttpMessageHandler(url =>
        {
            if (url.Contains("timeout"))
            {
                throw new TaskCanceledException("HttpClient timeout occurred");
            }
            return new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new StringContent("<html>valid</html>")
            };
        });

        var offerValid = new ExtractedOfferDto("ID-TIMEOUT-OK", "Laptop", 800m, "https://olx.pl/laptop", null);
        _olxHtmlParser.Parse("<html>valid</html>")
            .Returns(new List<ExtractedOfferDto> { offerValid });

        _processedOfferRepository.FilterExistingOfferIdsAsync(Arg.Any<IEnumerable<string>>(), Arg.Any<CancellationToken>())
            .Returns(new List<string>());

        var handler = CreateHandler(customHandler: timingOutHttpHandler);

        // Act
        var result = await handler.Handle(new ProcessOffersCommand(), CancellationToken.None);

        // Assert
        result.RulesProcessed.Should().Be(2);
        result.OffersParsed.Should().Be(1);
        result.NewOffersNotified.Should().Be(1);
    }

    [Fact]
    public async Task Handle_NoActiveRules_ReturnsZeroCounts()
    {
        // Arrange
        _searchRuleRepository.GetAllActiveAsync(Arg.Any<CancellationToken>())
            .Returns(new List<SearchRule>());

        var handler = CreateHandler();

        // Act
        var result = await handler.Handle(new ProcessOffersCommand(), CancellationToken.None);

        // Assert
        result.RulesProcessed.Should().Be(0);
        result.OffersParsed.Should().Be(0);
        result.NewOffersNotified.Should().Be(0);
    }

    private class MockHttpMessageHandler : HttpMessageHandler
    {
        private readonly string _responseContent;

        public MockHttpMessageHandler(string responseContent)
        {
            _responseContent = responseContent;
        }

        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            var response = new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new StringContent(_responseContent)
            };
            return Task.FromResult(response);
        }
    }

    private class RouteHttpMessageHandler : HttpMessageHandler
    {
        private readonly Func<string, HttpResponseMessage> _responseFactory;

        public RouteHttpMessageHandler(Func<string, HttpResponseMessage> responseFactory)
        {
            _responseFactory = responseFactory;
        }

        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            var response = _responseFactory(request.RequestUri?.ToString() ?? string.Empty);
            return Task.FromResult(response);
        }
    }
}
