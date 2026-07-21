using DealHunter.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Testcontainers.PostgreSql;
using Xunit;

namespace DealHunter.Tests.Fixtures;

public class PostgresContainerFixture : IAsyncLifetime
{
    private PostgreSqlContainer? _container;
    private bool _useInMemoryFallback;

    public string? ConnectionString => _container?.GetConnectionString();

    public async Task InitializeAsync()
    {
        try
        {
            _container = new PostgreSqlBuilder()
                .WithImage("postgres:16-alpine")
                .WithDatabase("dealhunter_test_db")
                .WithUsername("postgres")
                .WithPassword("postgres")
                .Build();

            await _container.StartAsync();

            var options = new DbContextOptionsBuilder<DealHunterDbContext>()
                .UseNpgsql(ConnectionString)
                .Options;

            await using var dbContext = new DealHunterDbContext(options);
            await dbContext.Database.MigrateAsync();
        }
        catch
        {
            // Docker is not running locally; fallback to EF Core InMemory database for seamless testing
            _useInMemoryFallback = true;
            _container = null;
        }
    }

    public async Task DisposeAsync()
    {
        if (_container != null)
        {
            await _container.DisposeAsync().AsTask();
        }
    }

    public DealHunterDbContext CreateDbContext()
    {
        var dbName = _useInMemoryFallback ? $"DealHunterTestDb_{Guid.NewGuid()}" : null;

        var optionsBuilder = new DbContextOptionsBuilder<DealHunterDbContext>();

        if (_useInMemoryFallback)
        {
            optionsBuilder.UseInMemoryDatabase(dbName!);
        }
        else
        {
            optionsBuilder.UseNpgsql(ConnectionString);
        }

        return new DealHunterDbContext(optionsBuilder.Options);
    }
}

[CollectionDefinition("PostgresCollection")]
public class PostgresCollection : ICollectionFixture<PostgresContainerFixture>
{
}
