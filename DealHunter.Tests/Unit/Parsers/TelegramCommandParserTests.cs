using DealHunter.Application.Common.Models;
using DealHunter.Application.Common.Services;
using FluentAssertions;
using Xunit;

namespace DealHunter.Tests.Unit.Parsers;

public class TelegramCommandParserTests
{
    private readonly TelegramCommandParser _parser = new();

    [Theory]
    [InlineData("/start", TelegramCommandType.Start)]
    [InlineData("/help", TelegramCommandType.Help)]
    [InlineData("/list", TelegramCommandType.List)]
    public void Parse_BasicCommands_ReturnsExpectedType(string text, TelegramCommandType expectedType)
    {
        // Act
        var result = _parser.Parse(text);

        // Assert
        result.Type.Should().Be(expectedType);
        result.ErrorMessage.Should().BeNull();
    }

    [Fact]
    public void Parse_AddCommandWithUrlAndMaxPriceFlag_ParsesUrlAndPrice()
    {
        // Arrange
        var text = "/add https://www.olx.pl/elektronika/ --max-price 1500,50";

        // Act
        var result = _parser.Parse(text);

        // Assert
        result.Type.Should().Be(TelegramCommandType.Add);
        result.Url.Should().Be("https://www.olx.pl/elektronika/");
        result.MaxPrice.Should().Be(1500.50m);
        result.ErrorMessage.Should().BeNull();
    }

    [Fact]
    public void Parse_AddCommandWithUrlAndDirectNumber_ParsesUrlAndPrice()
    {
        // Arrange
        var text = "/add https://www.olx.pl/elektronika/ 2000";

        // Act
        var result = _parser.Parse(text);

        // Assert
        result.Type.Should().Be(TelegramCommandType.Add);
        result.Url.Should().Be("https://www.olx.pl/elektronika/");
        result.MaxPrice.Should().Be(2000m);
    }

    [Fact]
    public void Parse_AddCommandWithoutUrl_ReturnsError()
    {
        // Arrange
        var text = "/add";

        // Act
        var result = _parser.Parse(text);

        // Assert
        result.Type.Should().Be(TelegramCommandType.Add);
        result.ErrorMessage.Should().NotBeNullOrEmpty();
    }

    [Theory]
    [InlineData("/delete 1", "1")]
    [InlineData("/delete 89123456-1234-1234-1234-123456789012", "89123456-1234-1234-1234-123456789012")]
    public void Parse_DeleteCommand_ParsesIdentifier(string text, string expectedIdentifier)
    {
        // Act
        var result = _parser.Parse(text);

        // Assert
        result.Type.Should().Be(TelegramCommandType.Delete);
        result.RuleIdentifier.Should().Be(expectedIdentifier);
        result.ErrorMessage.Should().BeNull();
    }

    [Fact]
    public void Parse_DeleteCommandWithoutIdentifier_ReturnsError()
    {
        // Act
        var result = _parser.Parse("/delete");

        // Assert
        result.Type.Should().Be(TelegramCommandType.Delete);
        result.ErrorMessage.Should().NotBeNullOrEmpty();
    }
}
