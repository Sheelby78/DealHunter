namespace DealHunter.Application.DTOs;

public record SearchRuleDto(
    Guid Id,
    long ChatId,
    string Url,
    decimal? MaxPrice,
    bool IsActive,
    DateTimeOffset CreatedAt);
