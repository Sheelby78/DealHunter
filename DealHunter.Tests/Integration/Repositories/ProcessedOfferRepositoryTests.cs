using DealHunter.Domain.Entities;
using DealHunter.Infrastructure.Persistence.Repositories;
using DealHunter.Tests.Fixtures;
using FluentAssertions;
using Xunit;

namespace DealHunter.Tests.Integration.Repositories;

[Collection("PostgresCollection")]
public class ProcessedOfferRepositoryTests
{
    private readonly PostgresContainerFixture _fixture;

    public ProcessedOfferRepositoryTests(PostgresContainerFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task AddAsync_And_ExistsAsync_ShouldBehaveCorrectly()
    {
        // Arrange
        await using var dbContext = _fixture.CreateDbContext();
        var ruleRepo = new SearchRuleRepository(dbContext);
        var offerRepo = new ProcessedOfferRepository(dbContext);

        var rule = SearchRule.Create(111, "https://www.olx.pl/offers/", 1000m);
        await ruleRepo.AddAsync(rule);

        var offer = ProcessedOffer.Create("OLX-998877", rule.Id, "iPhone 13 Pro", 2200m, "https://www.olx.pl/d/oferta/iphone-13-ID998877.html");

        // Act
        await offerRepo.AddAsync(offer);
        var exists = await offerRepo.ExistsAsync("OLX-998877");
        var notExists = await offerRepo.ExistsAsync("OLX-NONEXISTENT");

        // Assert
        exists.Should().BeTrue();
        notExists.Should().BeFalse();
    }

    [Fact]
    public async Task FilterExistingOfferIdsAsync_ShouldReturnOnlyIdsThatExistInDb()
    {
        // Arrange
        await using var dbContext = _fixture.CreateDbContext();
        var ruleRepo = new SearchRuleRepository(dbContext);
        var offerRepo = new ProcessedOfferRepository(dbContext);

        var rule = SearchRule.Create(222, "https://www.olx.pl/offers-filter/", 500m);
        await ruleRepo.AddAsync(rule);

        var offer1 = ProcessedOffer.Create("OLX-001", rule.Id, "Item 1", 100m, "https://olx.pl/1");
        var offer2 = ProcessedOffer.Create("OLX-002", rule.Id, "Item 2", 200m, "https://olx.pl/2");

        await offerRepo.AddAsync(offer1);
        await offerRepo.AddAsync(offer2);

        var candidateIds = new[] { "OLX-001", "OLX-002", "OLX-003", "OLX-004" };

        // Act
        var existingIds = await offerRepo.FilterExistingOfferIdsAsync(candidateIds);

        // Assert
        existingIds.Should().HaveCount(2);
        existingIds.Should().Contain(new[] { "OLX-001", "OLX-002" });
        existingIds.Should().NotContain(new[] { "OLX-003", "OLX-004" });
    }
}
