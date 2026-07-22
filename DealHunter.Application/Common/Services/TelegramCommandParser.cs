using System.Globalization;
using System.Text.RegularExpressions;
using DealHunter.Application.Common.Interfaces;
using DealHunter.Application.Common.Models;

namespace DealHunter.Application.Common.Services;

public partial class TelegramCommandParser : ITelegramCommandParser
{
    [GeneratedRegex(@"--max-price\s+(\d+(?:[.,]\d+)?)", RegexOptions.IgnoreCase)]
    private static partial Regex MaxPriceFlagRegex();

    public ParsedTelegramCommand Parse(string text)
    {
        if (string.IsNullOrWhiteSpace(text))
        {
            return new ParsedTelegramCommand(TelegramCommandType.Unknown, ErrorMessage: "Wiadomość jest pusta.");
        }

        var trimmed = text.Trim();
        var parts = trimmed.Split(' ', StringSplitOptions.RemoveEmptyEntries);

        var firstToken = parts[0].ToLowerInvariant();

        if (firstToken.StartsWith("/start"))
        {
            return new ParsedTelegramCommand(TelegramCommandType.Start);
        }

        if (firstToken.StartsWith("/help"))
        {
            return new ParsedTelegramCommand(TelegramCommandType.Help);
        }

        if (firstToken.StartsWith("/list"))
        {
            return new ParsedTelegramCommand(TelegramCommandType.List);
        }

        if (firstToken.StartsWith("/add"))
        {
            return ParseAddCommand(trimmed, parts);
        }

        if (firstToken.StartsWith("/delete") || firstToken.StartsWith("/del"))
        {
            return ParseDeleteCommand(parts);
        }

        return new ParsedTelegramCommand(TelegramCommandType.Unknown);
    }

    private static ParsedTelegramCommand ParseAddCommand(string fullText, string[] parts)
    {
        if (parts.Length < 2)
        {
            return new ParsedTelegramCommand(
                TelegramCommandType.Add,
                ErrorMessage: "Podaj URL wyszukiwania OLX. Przykładowe użycie:\n<code>/add https://www.olx.pl/elektronika/ --max-price 1500</code>"
            );
        }

        decimal? maxPrice = null;
        var argsText = fullText[(parts[0].Length)..].Trim();

        var match = MaxPriceFlagRegex().Match(argsText);
        if (match.Success)
        {
            var priceStr = match.Groups[1].Value.Replace(',', '.');
            if (decimal.TryParse(priceStr, CultureInfo.InvariantCulture, out var parsedPrice))
            {
                maxPrice = parsedPrice;
            }
            argsText = MaxPriceFlagRegex().Replace(argsText, string.Empty).Trim();
        }

        var remainingParts = argsText.Split(' ', StringSplitOptions.RemoveEmptyEntries);
        if (remainingParts.Length == 0)
        {
            return new ParsedTelegramCommand(
                TelegramCommandType.Add,
                ErrorMessage: "Podaj URL wyszukiwania OLX."
            );
        }

        var url = remainingParts[0];

        if (!maxPrice.HasValue && remainingParts.Length > 1)
        {
            var potentialPrice = remainingParts[1].Replace(',', '.');
            if (decimal.TryParse(potentialPrice, CultureInfo.InvariantCulture, out var parsedPrice))
            {
                maxPrice = parsedPrice;
            }
        }

        return new ParsedTelegramCommand(
            Type: TelegramCommandType.Add,
            Url: url,
            MaxPrice: maxPrice
        );
    }

    private static ParsedTelegramCommand ParseDeleteCommand(string[] parts)
    {
        if (parts.Length < 2)
        {
            return new ParsedTelegramCommand(
                TelegramCommandType.Delete,
                ErrorMessage: "Podaj numer lub ID reguły do usunięcia. Przykładowe użycie:\n<code>/delete 1</code>"
            );
        }

        return new ParsedTelegramCommand(
            Type: TelegramCommandType.Delete,
            RuleIdentifier: parts[1]
        );
    }
}
