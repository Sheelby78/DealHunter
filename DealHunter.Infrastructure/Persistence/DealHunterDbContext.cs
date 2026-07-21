using DealHunter.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DealHunter.Infrastructure.Persistence;

public class DealHunterDbContext : DbContext
{
    public DealHunterDbContext(DbContextOptions<DealHunterDbContext> options)
        : base(options)
    {
    }

    public DbSet<SearchRule> SearchRules => Set<SearchRule>();
    public DbSet<ProcessedOffer> ProcessedOffers => Set<ProcessedOffer>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(DealHunterDbContext).Assembly);
    }
}
