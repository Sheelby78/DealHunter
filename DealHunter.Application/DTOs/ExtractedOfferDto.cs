namespace DealHunter.Application.DTOs;

public record ExtractedOfferDto(
    string OfferId,
    string Title,
    decimal Price,
    string OfferUrl,
    string? ImageUrl);
