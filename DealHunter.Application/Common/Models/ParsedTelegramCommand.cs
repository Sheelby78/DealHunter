namespace DealHunter.Application.Common.Models;

public record ParsedTelegramCommand(
    TelegramCommandType Type,
    string? Url = null,
    decimal? MaxPrice = null,
    string? RuleIdentifier = null,
    string? ErrorMessage = null);
