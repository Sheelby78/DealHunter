using DealHunter.Infrastructure.Persistence;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace DealHunter.Tests.Fixtures;

public class PostgresContainerFixture : IAsyncLifetime
{
    private SqliteConnection? _connection;

    public async Task InitializeAsync()
    {
        _connection = new SqliteConnection("Data Source=:memory:");
        await _connection.OpenAsync();

        var options = new DbContextOptionsBuilder<DealHunterDbContext>()
            .UseSqlite(_connection)
            .Options;

        await using var dbContext = new DealHunterDbContext(options);
        await dbContext.Database.EnsureCreatedAsync();
    }

    public async Task DisposeAsync()
    {
        if (_connection != null)
        {
            await _connection.CloseAsync();
            await _connection.DisposeAsync();
        }
    }

    public DealHunterDbContext CreateDbContext()
    {
        var optionsBuilder = new DbContextOptionsBuilder<DealHunterDbContext>()
            .UseSqlite(_connection!);

        return new DealHunterDbContext(optionsBuilder.Options);
    }
}

[CollectionDefinition("PostgresCollection")]
public class PostgresCollection : ICollectionFixture<PostgresContainerFixture>
{
}
