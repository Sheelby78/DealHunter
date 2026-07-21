using DealHunter.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DealHunter.Infrastructure.Persistence.Configurations;

public class SearchRuleConfiguration : IEntityTypeConfiguration<SearchRule>
{
    public void Configure(EntityTypeBuilder<SearchRule> builder)
    {
        builder.ToTable("SearchRules");

        builder.HasKey(r => r.Id);

        builder.Property(r => r.ChatId)
            .IsRequired();

        builder.Property(r => r.Url)
            .IsRequired()
            .HasMaxLength(2048);

        builder.Property(r => r.MaxPrice)
            .HasPrecision(18, 2);

        builder.Property(r => r.IsActive)
            .IsRequired();

        builder.Property(r => r.CreatedAt)
            .IsRequired();

        builder.HasIndex(r => r.IsActive);
        builder.HasIndex(r => r.ChatId);
    }
}
