using DealHunter.Application.Common.Interfaces;
using DealHunter.Application.DTOs;
using DealHunter.Domain.Entities;
using DealHunter.Domain.Repositories;
using MediatR;

namespace DealHunter.Application.Offers.Commands.ProcessOffers;

public class ProcessOffersCommandHandler : IRequestHandler<ProcessOffersCommand, ProcessOffersResult>
{
    private readonly ISearchRuleRepository _searchRuleRepository;
    private readonly IProcessedOfferRepository _processedOfferRepository;
    private readonly IOlxHtmlParser _olxHtmlParser;
    private readonly ITelegramNotificationService _telegramNotificationService;
    private readonly HttpClient _httpClient;

    public ProcessOffersCommandHandler(
        ISearchRuleRepository searchRuleRepository,
        IProcessedOfferRepository processedOfferRepository,
        IOlxHtmlParser olxHtmlParser,
        ITelegramNotificationService telegramNotificationService,
        HttpClient httpClient)
    {
        _searchRuleRepository = searchRuleRepository;
        _processedOfferRepository = processedOfferRepository;
        _olxHtmlParser = olxHtmlParser;
        _telegramNotificationService = telegramNotificationService;
        _httpClient = httpClient;
    }

    public async Task<ProcessOffersResult> Handle(ProcessOffersCommand request, CancellationToken cancellationToken)
    {
        var activeRules = await _searchRuleRepository.GetAllActiveAsync(cancellationToken);
        var totalParsed = 0;
        var totalNotified = 0;

        foreach (var rule in activeRules)
        {
            var html = await _httpClient.GetStringAsync(rule.Url, cancellationToken);
            var extractedOffers = _olxHtmlParser.Parse(html);
            totalParsed += extractedOffers.Count;

            var matchingOffers = extractedOffers
                .Where(o => !rule.MaxPrice.HasValue || o.Price <= rule.MaxPrice.Value)
                .ToList();

            if (matchingOffers.Count == 0)
            {
                continue;
            }

            var offerIds = matchingOffers.Select(o => o.OfferId);
            var existingOfferIds = (await _processedOfferRepository.FilterExistingOfferIdsAsync(offerIds, cancellationToken))
                .ToHashSet();

            var newOffers = matchingOffers
                .Where(o => !existingOfferIds.Contains(o.OfferId))
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

        return new ProcessOffersResult(
            RulesProcessed: activeRules.Count,
            OffersParsed: totalParsed,
            NewOffersNotified: totalNotified
        );
    }
}
