namespace DealHunter.Application.DTOs;

public record OfferDto(
    string OfferId,
    Guid RuleId,
    string Title,
    decimal Price,
    string OfferUrl,
    string? ImageUrl,
    DateTimeOffset ProcessedAt);
