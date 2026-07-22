namespace DealHunter.Domain.Entities;

public class SearchRule
{
    public Guid Id { get; private set; }
    public long ChatId { get; private set; }
    public string Url { get; private set; } = string.Empty;
    public decimal? MaxPrice { get; private set; }
    public bool IsActive { get; private set; }
    public bool IsInitialized { get; private set; }
    public DateTimeOffset CreatedAt { get; private set; }

    private SearchRule() { }

    public SearchRule(Guid id, long chatId, string url, decimal? maxPrice, bool isActive, bool isInitialized, DateTimeOffset createdAt)
    {
        Id = id;
        ChatId = chatId;
        Url = url;
        MaxPrice = maxPrice;
        IsActive = isActive;
        IsInitialized = isInitialized;
        CreatedAt = createdAt;
    }

    public static SearchRule Create(long chatId, string url, decimal? maxPrice = null, bool isInitialized = false)
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
            isInitialized: isInitialized,
            createdAt: DateTimeOffset.UtcNow
        );
    }

    public void MarkInitialized()
    {
        IsInitialized = true;
    }

    public void Deactivate()
    {
        IsActive = false;
    }
}
