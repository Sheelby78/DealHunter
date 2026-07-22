using DealHunter.Domain.Entities;
using DealHunter.Infrastructure.Persistence.Repositories;
using DealHunter.Tests.Fixtures;
using FluentAssertions;
using Xunit;

namespace DealHunter.Tests.Integration.Repositories;

[Collection("PostgresCollection")]
public class SearchRuleRepositoryTests
{
    private readonly PostgresContainerFixture _fixture;

    public SearchRuleRepositoryTests(PostgresContainerFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task AddAsync_ShouldPersistRuleInPostgres()
    {
        // Arrange
        await using var dbContext = _fixture.CreateDbContext();
        var repository = new SearchRuleRepository(dbContext);
        var rule = SearchRule.Create(123456789, "https://www.olx.pl/elektronika/laptopy/", 2500m);

        // Act
        await repository.AddAsync(rule);

        // Assert
        var fetched = await repository.GetByIdAsync(rule.Id);
        fetched.Should().NotBeNull();
        fetched!.ChatId.Should().Be(123456789);
        fetched.Url.Should().Be("https://www.olx.pl/elektronika/laptopy/");
        fetched.MaxPrice.Should().Be(2500m);
        fetched.IsActive.Should().BeTrue();
    }

    [Fact]
    public async Task GetAllActiveAsync_ShouldReturnOnlyActiveRules()
    {
        // Arrange
        await using var dbContext = _fixture.CreateDbContext();
        var repository = new SearchRuleRepository(dbContext);

        var activeRule = SearchRule.Create(999, "https://www.olx.pl/active/", 100m);
        var inactiveRule = SearchRule.Create(999, "https://www.olx.pl/inactive/", 200m);
        inactiveRule.Deactivate();

        await repository.AddAsync(activeRule);
        await repository.AddAsync(inactiveRule);

        // Act
        var activeRules = await repository.GetAllActiveAsync();

        // Assert
        activeRules.Should().ContainSingle(r => r.Id == activeRule.Id);
        activeRules.Should().NotContain(r => r.Id == inactiveRule.Id);
    }

    [Fact]
    public async Task DeleteAsync_ShouldRemoveRuleFromDatabase()
    {
        // Arrange
        await using var dbContext = _fixture.CreateDbContext();
        var repository = new SearchRuleRepository(dbContext);
        var rule = SearchRule.Create(555, "https://www.olx.pl/to-delete/", 500m);
        await repository.AddAsync(rule);

        // Act
        await repository.DeleteAsync(rule.Id);

        // Assert
        var deleted = await repository.GetByIdAsync(rule.Id);
        deleted.Should().BeNull();
    }

    [Fact]
    public async Task GetByChatIdAsync_ShouldReturnActiveRulesForChatOrderedByCreatedAt()
    {
        // Arrange
        await using var dbContext = _fixture.CreateDbContext();
        var repository = new SearchRuleRepository(dbContext);

        var chatId = 888777L;
        var rule1 = SearchRule.Create(chatId, "https://www.olx.pl/rule1/", 100m);
        var rule2 = SearchRule.Create(chatId, "https://www.olx.pl/rule2/", 200m);
        var otherChatRule = SearchRule.Create(111L, "https://www.olx.pl/other/", 300m);

        await repository.AddAsync(rule1);
        await repository.AddAsync(rule2);
        await repository.AddAsync(otherChatRule);

        // Act
        var rules = await repository.GetByChatIdAsync(chatId);

        // Assert
        rules.Should().HaveCount(2);
        rules[0].Id.Should().Be(rule1.Id);
        rules[1].Id.Should().Be(rule2.Id);
    }
}
