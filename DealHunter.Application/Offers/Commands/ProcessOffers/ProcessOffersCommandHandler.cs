using DealHunter.Application.Common.Interfaces;
using DealHunter.Application.Common.Models;
using DealHunter.Application.DTOs;
using DealHunter.Domain.Entities;
using DealHunter.Domain.Repositories;
using MediatR;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace DealHunter.Application.Offers.Commands.ProcessOffers;

public class ProcessOffersCommandHandler : IRequestHandler<ProcessOffersCommand, ProcessOffersResult>
{
    private readonly ISearchRuleRepository _searchRuleRepository;
    private readonly IProcessedOfferRepository _processedOfferRepository;
    private readonly IOlxHtmlParser _olxHtmlParser;
    private readonly ITelegramNotificationService _telegramNotificationService;
    private readonly HttpClient _httpClient;
    private readonly ResilienceOptions _resilienceOptions;
    private readonly ILogger<ProcessOffersCommandHandler>? _logger;

    public ProcessOffersCommandHandler(
        ISearchRuleRepository searchRuleRepository,
        IProcessedOfferRepository processedOfferRepository,
        IOlxHtmlParser olxHtmlParser,
        ITelegramNotificationService telegramNotificationService,
        HttpClient httpClient,
        IOptions<ResilienceOptions>? resilienceOptions = null,
        ILogger<ProcessOffersCommandHandler>? logger = null)
    {
        _searchRuleRepository = searchRuleRepository;
        _processedOfferRepository = processedOfferRepository;
        _olxHtmlParser = olxHtmlParser;
        _telegramNotificationService = telegramNotificationService;
        _httpClient = httpClient;
        _resilienceOptions = resilienceOptions?.Value ?? new ResilienceOptions();
        _logger = logger;
    }

    public async Task<ProcessOffersResult> Handle(ProcessOffersCommand request, CancellationToken cancellationToken)
    {
        var activeRules = await _searchRuleRepository.GetAllActiveAsync(cancellationToken);
        var totalParsed = 0;
        var totalNotified = 0;

        for (var i = 0; i < activeRules.Count; i++)
        {
            var rule = activeRules[i];

            if (i > 0 && _resilienceOptions.InterRequestDelaySeconds > 0)
            {
                await Task.Delay(TimeSpan.FromSeconds(_resilienceOptions.InterRequestDelaySeconds), cancellationToken);
            }

            try
            {
                var html = await _httpClient.GetStringAsync(rule.Url, cancellationToken);
                var extractedOffers = _olxHtmlParser.Parse(html);
                totalParsed += extractedOffers.Count;

                var matchingOffers = extractedOffers
                    .Where(o => !rule.MaxPrice.HasValue || o.Price <= rule.MaxPrice.Value)
                    .ToList();

                if (!rule.IsInitialized)
                {
                    if (matchingOffers.Count > 0)
                    {
                        var offerIds = matchingOffers.Select(o => o.OfferId);
                        var existingOfferIds = (await _processedOfferRepository.FilterExistingOfferIdsAsync(offerIds, cancellationToken))
                            .ToHashSet();

                        var baselineOffers = matchingOffers
                            .Where(o => !existingOfferIds.Contains(o.OfferId))
                            .Select(o => ProcessedOffer.Create(
                                offerId: o.OfferId,
                                ruleId: rule.Id,
                                title: o.Title,
                                price: o.Price,
                                offerUrl: o.OfferUrl,
                                imageUrl: o.ImageUrl
                            ))
                            .ToList();

                        if (baselineOffers.Count > 0)
                        {
                            await _processedOfferRepository.AddRangeAsync(baselineOffers, cancellationToken);
                        }
                    }

                    rule.MarkInitialized();
                    await _searchRuleRepository.UpdateAsync(rule, cancellationToken);

                    _logger?.LogInformation(
                        "Initial baseline initialized for rule {RuleId}: saved {Count} offers as baseline without notifications.",
                        rule.Id,
                        matchingOffers.Count
                    );
                    continue;
                }

                if (matchingOffers.Count == 0)
                {
                    continue;
                }

                var initializedOfferIds = matchingOffers.Select(o => o.OfferId);
                var existingInitializedOfferIds = (await _processedOfferRepository.FilterExistingOfferIdsAsync(initializedOfferIds, cancellationToken))
                    .ToHashSet();

                var newOffers = matchingOffers
                    .Where(o => !existingInitializedOfferIds.Contains(o.OfferId))
                    .ToList();

                foreach (var offer in newOffers)
                {
                    await _telegramNotificationService.SendOfferAlertAsync(rule.ChatId, offer, cancellationToken);

                    var processedOffer = ProcessedOffer.Create(
                        offerId: offer.OfferId,
                        ruleId: rule.Id,
                        title: offer.Title,
                        price: offer.Price,
                        offerUrl: offer.OfferUrl,
                        imageUrl: offer.ImageUrl
                    );

                    await _processedOfferRepository.AddAsync(processedOffer, cancellationToken);
                    totalNotified++;
                }
            }
            catch (Exception ex) when (ex is not OperationCanceledException || !cancellationToken.IsCancellationRequested)
            {
                _logger?.LogError(ex, "Failed to process search rule {RuleId} ({RuleUrl})", rule.Id, rule.Url);
            }
        }

        return new ProcessOffersResult(
            RulesProcessed: activeRules.Count,
            OffersParsed: totalParsed,
            NewOffersNotified: totalNotified
        );
    }
}
