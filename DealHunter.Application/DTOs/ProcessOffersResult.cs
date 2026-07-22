namespace DealHunter.Application.DTOs;

public record ProcessOffersResult(
    int RulesProcessed,
    int OffersParsed,
    int NewOffersNotified);
