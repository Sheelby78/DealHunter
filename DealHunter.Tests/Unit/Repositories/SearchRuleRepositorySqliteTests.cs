using DealHunter.Domain.Entities;
using DealHunter.Infrastructure.Persistence;
using DealHunter.Infrastructure.Persistence.Repositories;
using FluentAssertions;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace DealHunter.Tests.Unit.Repositories;

public class SearchRuleRepositorySqliteTests : IDisposable
{
    private readonly SqliteConnection _connection;
    private readonly DealHunterDbContext _dbContext;
    private readonly SearchRuleRepository _sut;

    public SearchRuleRepositorySqliteTests()
    {
        _connection = new SqliteConnection("DataSource=:memory:");
        _connection.Open();

        var options = new DbContextOptionsBuilder<DealHunterDbContext>()
            .UseSqlite(_connection)
            .Options;

        _dbContext = new DealHunterDbContext(options);
        _dbContext.Database.EnsureCreated();

        _sut = new SearchRuleRepository(_dbContext);
    }

    [Fact]
    public async Task GetByChatIdAsync_OnSqlite_ShouldNotThrowNotSupportedException()
    {
        var chatId = 123456L;
        var rule1 = SearchRule.Create(chatId, "https://www.olx.pl/test1/", 500m);
        var rule2 = SearchRule.Create(chatId, "https://www.olx.pl/test2/", 1000m);

        await _sut.AddAsync(rule1);
        await _sut.AddAsync(rule2);

        var act = () => _sut.GetByChatIdAsync(chatId);

        var rules = await act.Should().NotThrowAsync();
        rules.Subject.Should().HaveCount(2);
    }

    public void Dispose()
    {
        _dbContext.Dispose();
        _connection.Dispose();
    }
}
