using DealHunter.Application.Common.Interfaces;
using DealHunter.Application.Rules.Commands.AddSearchRule;
using DealHunter.Application.Rules.Commands.DeleteSearchRule;
using DealHunter.Application.Rules.Queries.GetSearchRules;
using DealHunter.Domain.Entities;
using DealHunter.Domain.Repositories;
using FluentAssertions;
using NSubstitute;
using Xunit;

namespace DealHunter.Tests.Unit.Rules;

public class RuleManagementHandlerTests
{
    private readonly ISearchRuleRepository _repository = Substitute.For<ISearchRuleRepository>();
    private readonly IOlxUrlValidator _validator = Substitute.For<IOlxUrlValidator>();

    [Fact]
    public async Task AddSearchRule_ValidUrl_SavesAndReturnsDto()
    {
        // Arrange
        string? error = null;
        _validator.IsValidOlxUrl(Arg.Any<string>(), out error).Returns(true);

        var handler = new AddSearchRuleCommandHandler(_repository, _validator);
        var command = new AddSearchRuleCommand(12345, "https://www.olx.pl/elektronika/", 1500m);

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.ChatId.Should().Be(12345);
        result.Url.Should().Be("https://www.olx.pl/elektronika/");
        result.MaxPrice.Should().Be(1500m);
        result.IsActive.Should().BeTrue();

        await _repository.Received(1).AddAsync(Arg.Is<SearchRule>(r => r.ChatId == 12345), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task AddSearchRule_InvalidUrl_ThrowsArgumentException()
    {
        // Arrange
        _validator.IsValidOlxUrl(Arg.Any<string>(), out Arg.Any<string?>())
            .Returns(x =>
            {
                x[1] = "Nieprawidłowy domenowy URL";
                return false;
            });

        var handler = new AddSearchRuleCommandHandler(_repository, _validator);
        var command = new AddSearchRuleCommand(12345, "https://invalid.com");

        // Act & Assert
        var act = () => handler.Handle(command, CancellationToken.None);
        await act.Should().ThrowAsync<ArgumentException>().WithMessage("*Nieprawidłowy domenowy URL*");
    }

    [Fact]
    public async Task GetSearchRules_ReturnsMappedRulesForChatId()
    {
        // Arrange
        var rule1 = SearchRule.Create(12345, "https://olx.pl/1", 1000m);
        var rule2 = SearchRule.Create(12345, "https://olx.pl/2", 2000m);

        _repository.GetByChatIdAsync(12345, Arg.Any<CancellationToken>())
            .Returns(new List<SearchRule> { rule1, rule2 });

        var handler = new GetSearchRulesQueryHandler(_repository);

        // Act
        var result = await handler.Handle(new GetSearchRulesQuery(12345), CancellationToken.None);

        // Assert
        result.Should().HaveCount(2);
        result[0].Url.Should().Be("https://olx.pl/1");
        result[1].Url.Should().Be("https://olx.pl/2");
    }

    [Fact]
    public async Task DeleteSearchRule_ValidIndex_DeletesRuleAndReturnsTrue()
    {
        // Arrange
        var rule1 = SearchRule.Create(12345, "https://olx.pl/1");
        var rule2 = SearchRule.Create(12345, "https://olx.pl/2");

        _repository.GetByChatIdAsync(12345, Arg.Any<CancellationToken>())
            .Returns(new List<SearchRule> { rule1, rule2 });

        var handler = new DeleteSearchRuleCommandHandler(_repository);

        // Act
        var result = await handler.Handle(new DeleteSearchRuleCommand(12345, "2"), CancellationToken.None);

        // Assert
        result.Should().BeTrue();
        await _repository.Received(1).DeleteAsync(rule2.Id, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task DeleteSearchRule_InvalidIndex_ReturnsFalse()
    {
        // Arrange
        _repository.GetByChatIdAsync(12345, Arg.Any<CancellationToken>())
            .Returns(new List<SearchRule>());

        var handler = new DeleteSearchRuleCommandHandler(_repository);

        // Act
        var result = await handler.Handle(new DeleteSearchRuleCommand(12345, "5"), CancellationToken.None);

        // Assert
        result.Should().BeFalse();
    }
}
