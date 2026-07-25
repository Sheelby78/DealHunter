namespace DealHunter.Domain.Entities;

public class ProcessedOffer
{
    public string OfferId { get; private set; } = string.Empty;
    public Guid RuleId { get; private set; }
    public string Title { get; private set; } = string.Empty;
    public decimal Price { get; private set; }
    public string OfferUrl { get; private set; } = string.Empty;
    public string? ImageUrl { get; private set; }
    public DateTimeOffset ProcessedAt { get; private set; }
    public DateTimeOffset? NotifiedAt { get; private set; }

    private ProcessedOffer() { }

    public ProcessedOffer(
        string offerId,
        Guid ruleId,
        string title,
        decimal price,
        string offerUrl,
        string? imageUrl,
        DateTimeOffset processedAt,
        DateTimeOffset? notifiedAt = null)
    {
        if (string.IsNullOrWhiteSpace(offerId))
        {
            throw new ArgumentException("Offer ID cannot be empty.", nameof(offerId));
        }

        OfferId = offerId.Trim();
        RuleId = ruleId;
        Title = title ?? string.Empty;
        Price = price;
        OfferUrl = offerUrl ?? string.Empty;
        ImageUrl = imageUrl;
        ProcessedAt = processedAt;
        NotifiedAt = notifiedAt;
    }

    public static ProcessedOffer Create(
        string offerId,
        Guid ruleId,
        string title,
        decimal price,
        string offerUrl,
        string? imageUrl = null,
        DateTimeOffset? notifiedAt = null)
    {
        return new ProcessedOffer(
            offerId: offerId,
            ruleId: ruleId,
            title: title,
            price: price,
            offerUrl: offerUrl,
            imageUrl: imageUrl,
            processedAt: DateTimeOffset.UtcNow,
            notifiedAt: notifiedAt
        );
    }

    public void MarkNotified(DateTimeOffset notifiedAt)
    {
        NotifiedAt = notifiedAt;
    }
}
