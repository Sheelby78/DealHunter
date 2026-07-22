using System.Globalization;
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

        var cardNodes = doc.DocumentNode.SelectNodes("//div[@data-cy='l-card']")
            ?? doc.DocumentNode.SelectNodes("//div[contains(@class, 'css-1ap5cn4')]")
            ?? doc.DocumentNode.SelectNodes("//div[contains(@data-testid, 'offer-card')]");

        if (cardNodes == null || cardNodes.Count == 0)
        {
            return Array.Empty<ExtractedOfferDto>();
        }

        var offers = new List<ExtractedOfferDto>();

        foreach (var card in cardNodes)
        {
            var offer = ExtractOfferFromCard(card);
            if (offer != null)
            {
                offers.Add(offer);
            }
        }

        return offers;
    }

    private static ExtractedOfferDto? ExtractOfferFromCard(HtmlNode card)
    {
        var linkNode = card.SelectSingleNode(".//a[@href]");
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

        var idAttr = card.GetAttributeValue("id", string.Empty);
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
            ?? card.SelectSingleNode(".//*[contains(@class, 'css-13v1m6a')]")
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

    private static string ExtractOfferIdFromUrl(string url)
    {
        var match = OfferIdRegex().Match(url);
        if (match.Success)
        {
            return match.Groups[1].Value;
        }

        var uri = new Uri(url, UriKind.RelativeOrAbsolute);
        var path = uri.IsAbsoluteUri ? uri.AbsolutePath : url;
        var lastSegment = path.Split('/', StringSplitOptions.RemoveEmptyEntries).LastOrDefault();

        if (!string.IsNullOrWhiteSpace(lastSegment))
        {
            var cleaned = lastSegment.Replace(".html", string.Empty, StringComparison.OrdinalIgnoreCase);
            return cleaned;
        }

        return Guid.NewGuid().ToString("N");
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
