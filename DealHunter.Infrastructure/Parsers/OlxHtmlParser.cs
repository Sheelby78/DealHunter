using System.Globalization;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;
using DealHunter.Application.Common.Interfaces;
using DealHunter.Application.DTOs;
using HtmlAgilityPack;

namespace DealHunter.Infrastructure.Parsers;

public partial class OlxHtmlParser : IOlxHtmlParser
{
    private const string BaseUrl = "https://www.olx.pl";

    [GeneratedRegex(@"[^\d,.]")]
    private static partial Regex NonNumericRegex();

    [GeneratedRegex(@"ID([a-zA-Z0-9]+)")]
    private static partial Regex OfferIdRegex();

    public IReadOnlyList<ExtractedOfferDto> Parse(string htmlContent)
    {
        if (string.IsNullOrWhiteSpace(htmlContent))
        {
            return Array.Empty<ExtractedOfferDto>();
        }

        var doc = new HtmlDocument();
        doc.LoadHtml(htmlContent);

        // Link-First Strategy: Find all anchor tags pointing directly to listing URLs
        var linkNodes = doc.DocumentNode.SelectNodes("//a[contains(@href, '/d/oferta/')] | //a[contains(@href, '/oferta/')]");
        var cardNodes = doc.DocumentNode.SelectNodes("//div[@data-cy='l-card'] | //div[contains(@data-testid, 'offer-card')] | //div[contains(@data-testid, 'ad-card')]");

        var targetContainers = new List<HtmlNode>();

        if (linkNodes != null && linkNodes.Count > 0)
        {
            foreach (var linkNode in linkNodes)
            {
                var container = linkNode.Ancestors("div").FirstOrDefault(d =>
                    d.GetAttributeValue("data-cy", string.Empty) == "l-card" ||
                    d.GetAttributeValue("data-testid", string.Empty).Contains("offer-card") ||
                    d.GetAttributeValue("data-testid", string.Empty).Contains("ad-card")
                ) ?? linkNode.ParentNode;

                if (container != null && !targetContainers.Contains(container))
                {
                    targetContainers.Add(container);
                }
            }
        }
        else if (cardNodes != null && cardNodes.Count > 0)
        {
            targetContainers.AddRange(cardNodes);
        }

        if (targetContainers.Count == 0)
        {
            return Array.Empty<ExtractedOfferDto>();
        }

        var offers = new List<ExtractedOfferDto>();
        var seenOfferIds = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        foreach (var card in targetContainers)
        {
            var offer = ExtractOfferFromCard(card);
            if (offer != null && ValidateOffer(offer) && seenOfferIds.Add(offer.OfferId))
            {
                offers.Add(offer);
            }
        }

        return offers;
    }

    private static ExtractedOfferDto? ExtractOfferFromCard(HtmlNode card)
    {
        var linkNode = card.SelectSingleNode(".//a[contains(@href, '/oferta/')]")
            ?? card.SelectSingleNode(".//a[contains(@href, '/d/')]")
            ?? card.SelectSingleNode(".//a[@href]");

        if (linkNode == null)
        {
            return null;
        }

        var href = linkNode.GetAttributeValue("href", string.Empty);
        if (string.IsNullOrWhiteSpace(href))
        {
            return null;
        }

        var offerUrl = href.StartsWith("http", StringComparison.OrdinalIgnoreCase)
            ? href
            : $"{BaseUrl}{href}";

        var idAttr = card.GetAttributeValue("data-id", string.Empty);
        if (string.IsNullOrWhiteSpace(idAttr))
        {
            idAttr = card.GetAttributeValue("id", string.Empty);
        }

        var offerId = !string.IsNullOrWhiteSpace(idAttr) ? idAttr : ExtractOfferIdFromUrl(offerUrl);

        if (string.IsNullOrWhiteSpace(offerId))
        {
            return null;
        }

        var titleNode = card.SelectSingleNode(".//h6")
            ?? card.SelectSingleNode(".//h4")
            ?? card.SelectSingleNode(".//h3")
            ?? linkNode;
        var title = HtmlEntity.DeEntitize(titleNode.InnerText?.Trim() ?? string.Empty);

        if (string.IsNullOrWhiteSpace(title))
        {
            return null;
        }

        var priceNode = card.SelectSingleNode(".//*[@data-testid='ad-price']")
            ?? card.SelectSingleNode(".//*[contains(text(), 'zł')]");

        var priceText = priceNode != null ? HtmlEntity.DeEntitize(priceNode.InnerText?.Trim() ?? string.Empty) : string.Empty;
        var price = ParsePrice(priceText);

        var imgNode = card.SelectSingleNode(".//img[@src]");
        var imageUrl = imgNode?.GetAttributeValue("src", string.Empty);

        if (!string.IsNullOrWhiteSpace(imageUrl) && imageUrl.StartsWith("data:", StringComparison.OrdinalIgnoreCase))
        {
            imageUrl = imgNode?.GetAttributeValue("data-src", string.Empty);
        }

        if (string.IsNullOrWhiteSpace(imageUrl))
        {
            imageUrl = null;
        }

        return new ExtractedOfferDto(
            OfferId: offerId,
            Title: title,
            Price: price,
            OfferUrl: offerUrl,
            ImageUrl: imageUrl
        );
    }

    private static bool ValidateOffer(ExtractedOfferDto offer)
    {
        if (string.IsNullOrWhiteSpace(offer.OfferId) || offer.OfferId.Length < 2)
        {
            return false;
        }

        if (string.IsNullOrWhiteSpace(offer.Title))
        {
            return false;
        }

        if (string.IsNullOrWhiteSpace(offer.OfferUrl))
        {
            return false;
        }

        if (!offer.OfferUrl.Contains("/oferta/", StringComparison.OrdinalIgnoreCase) &&
            !offer.OfferUrl.Contains("/d/", StringComparison.OrdinalIgnoreCase))
        {
            return false;
        }

        return true;
    }

    private static string ExtractOfferIdFromUrl(string url)
    {
        var matches = OfferIdRegex().Matches(url);
        if (matches.Count > 0)
        {
            var lastMatch = matches.Last();
            if (lastMatch.Success && lastMatch.Groups.Count > 1 && !string.IsNullOrWhiteSpace(lastMatch.Groups[1].Value))
            {
                return lastMatch.Groups[1].Value;
            }
        }

        var uri = Uri.TryCreate(url, UriKind.RelativeOrAbsolute, out var parsedUri) ? parsedUri : null;
        var cleanPath = uri != null && uri.IsAbsoluteUri ? uri.AbsolutePath : url.Split('?')[0];

        return ComputeDeterministicHash(cleanPath);
    }

    private static string ComputeDeterministicHash(string input)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(input.ToLowerInvariant()));
        return Convert.ToHexString(bytes)[..16];
    }

    private static decimal ParsePrice(string priceText)
    {
        if (string.IsNullOrWhiteSpace(priceText) ||
            priceText.Contains("Za darmo", StringComparison.OrdinalIgnoreCase) ||
            priceText.Contains("Zamienię", StringComparison.OrdinalIgnoreCase))
        {
            return 0m;
        }

        var sanitized = NonNumericRegex().Replace(priceText, string.Empty).Replace(',', '.');

        if (decimal.TryParse(sanitized, CultureInfo.InvariantCulture, out var parsedPrice))
        {
            return parsedPrice;
        }

        return 0m;
    }
}
