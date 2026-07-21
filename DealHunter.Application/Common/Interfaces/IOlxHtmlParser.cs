using DealHunter.Application.DTOs;

namespace DealHunter.Application.Common.Interfaces;

public interface IOlxHtmlParser
{
    IReadOnlyList<ExtractedOfferDto> Parse(string htmlContent);
}
