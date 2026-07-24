using DealHunter.Infrastructure.Parsers;
using FluentAssertions;
using Xunit;

namespace DealHunter.Tests.Unit.Parsers;

public class OlxHtmlParserTests
{
    private readonly OlxHtmlParser _parser = new();

    [Fact]
    public void Parse_ValidOlxHtmlFixture_ExtractsAllOffersCorrectly()
    {
        // Arrange
        var fixturePath = Path.Combine(AppContext.BaseDirectory, "Fixtures", "olx_search_results.html");
        if (!File.Exists(fixturePath))
        {
            fixturePath = Path.Combine(Directory.GetCurrentDirectory(), "Fixtures", "olx_search_results.html");
        }

        var htmlContent = File.ReadAllText(fixturePath);

        // Act
        var offers = _parser.Parse(htmlContent);

        // Assert
        offers.Should().HaveCount(3);

        var firstOffer = offers.First(o => o.OfferId == "891234567");
        firstOffer.Title.Should().Be("PlayStation 5 Slim 1TB Disc Edition");
        firstOffer.Price.Should().Be(1850m);
        firstOffer.OfferUrl.Should().Contain("playstation-5-ps5-slik-disc-edition-ID891234567.html");
        firstOffer.ImageUrl.Should().Be("https://ireland.apollo.olxcdn.com/v1/files/sample123/image;s=647x0");

        var secondOffer = offers.First(o => o.OfferId == "891234568");
        secondOffer.Price.Should().Be(1400m);

        var thirdOffer = offers.First(o => o.OfferId == "891234569");
        thirdOffer.Price.Should().Be(950m);
    }

    [Fact]
    public void Parse_HtmlWithCategoryPrefixInUrl_PicksActualOfferIdNotCategoryId()
    {
        // Arrange
        var htmlContent = @"
            <div data-cy='l-card'>
                <a href='/d/oferta/komputer-stacjonarny-CID99-ID108H3y.html'>
                    <h6>Komputer Gamingowy</h6>
                </a>
                <p data-testid='ad-price'>2 500 zł</p>
            </div>";

        // Act
        var offers = _parser.Parse(htmlContent);

        // Assert
        offers.Should().HaveCount(1);
        offers[0].OfferId.Should().Be("108H3y");
    }

    [Fact]
    public void Parse_HtmlWithoutIdInUrl_ProducesDeterministicHash()
    {
        // Arrange
        var htmlContent = @"
            <div data-cy='l-card'>
                <a href='/d/oferta/custom-item-name.html?search_reason=test'>
                    <h6>Custom Item Title</h6>
                </a>
                <p data-testid='ad-price'>100 zł</p>
            </div>";

        // Act
        var offersRun1 = _parser.Parse(htmlContent);
        var offersRun2 = _parser.Parse(htmlContent);

        // Assert
        offersRun1.Should().HaveCount(1);
        offersRun2.Should().HaveCount(1);
        offersRun1[0].OfferId.Should().Be(offersRun2[0].OfferId);
        offersRun1[0].OfferId.Should().NotBeNullOrWhiteSpace();
    }

    [Fact]
    public void Parse_EmptyOrNullHtml_ReturnsEmptyList()
    {
        // Act & Assert
        _parser.Parse(string.Empty).Should().BeEmpty();
        _parser.Parse("   ").Should().BeEmpty();
    }
}
