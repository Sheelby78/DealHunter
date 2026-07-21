using DealHunter.Application.Common.Validators;
using FluentAssertions;
using Xunit;

namespace DealHunter.Tests.Unit.Validators;

public class OlxUrlValidatorTests
{
    private readonly OlxUrlValidator _validator = new();

    [Theory]
    [InlineData("https://www.olx.pl/elektronika/q-ps5/")]
    [InlineData("https://olx.pl/d/oferta/playstation-5-ID123.html")]
    [InlineData("http://m.olx.pl/moda/")]
    public void IsValidOlxUrl_ValidUrls_ReturnsTrue(string url)
    {
        // Act
        var result = _validator.IsValidOlxUrl(url, out var errorMessage);

        // Assert
        result.Should().BeTrue();
        errorMessage.Should().BeNull();
    }

    [Theory]
    [InlineData("", "Adres URL nie może być pusty.")]
    [InlineData("   ", "Adres URL nie może być pusty.")]
    [InlineData("invalid-url-string", "Podany adres URL ma nieprawidłową strukturę.")]
    [InlineData("ftp://olx.pl/elektronika", "Adres URL musi używać bezpiecznego protokołu HTTP lub HTTPS.")]
    [InlineData("https://allegro.pl/kategoria/elektronika", "Adres URL musi prowadzić do serwisu OLX.pl.")]
    [InlineData("https://olx.pl/", "Adres URL musi prowadzić do konkretnej kategorii lub wyników wyszukiwania, a nie do strony głównej.")]
    public void IsValidOlxUrl_InvalidUrls_ReturnsFalseWithErrorMessage(string url, string expectedErrorMessage)
    {
        // Act
        var result = _validator.IsValidOlxUrl(url, out var errorMessage);

        // Assert
        result.Should().BeFalse();
        errorMessage.Should().Be(expectedErrorMessage);
    }
}
