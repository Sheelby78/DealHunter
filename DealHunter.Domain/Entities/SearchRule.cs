namespace DealHunter.Domain.Entities;

public class SearchRule
{
    public Guid Id { get; private set; }
    public long ChatId { get; private set; }
    public string Url { get; private set; } = string.Empty;
    public decimal? MaxPrice { get; private set; }
    public bool IsActive { get; private set; }
    public DateTimeOffset CreatedAt { get; private set; }

    private SearchRule() { }

    public SearchRule(Guid id, long chatId, string url, decimal? maxPrice, bool isActive, DateTimeOffset createdAt)
    {
        Id = id;
        ChatId = chatId;
        Url = url;
        MaxPrice = maxPrice;
        IsActive = isActive;
        CreatedAt = createdAt;
    }

    public static SearchRule Create(long chatId, string url, decimal? maxPrice = null)
    {
        if (string.IsNullOrWhiteSpace(url))
        {
            throw new ArgumentException("Search rule URL cannot be empty.", nameof(url));
        }

        return new SearchRule(
            id: Guid.NewGuid(),
            chatId: chatId,
            url: url.Trim(),
            maxPrice: maxPrice,
            isActive: true,
            createdAt: DateTimeOffset.UtcNow
        );
    }

    public void Deactivate()
    {
        IsActive = false;
    }
}
