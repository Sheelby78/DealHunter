using DealHunter.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DealHunter.Infrastructure.Persistence.Configurations;

public class ProcessedOfferConfiguration : IEntityTypeConfiguration<ProcessedOffer>
{
    public void Configure(EntityTypeBuilder<ProcessedOffer> builder)
    {
        builder.ToTable("ProcessedOffers");

        builder.HasKey(o => o.OfferId);

        builder.Property(o => o.OfferId)
            .HasMaxLength(256);

        builder.Property(o => o.RuleId)
            .IsRequired();

        builder.Property(o => o.Title)
            .IsRequired()
            .HasMaxLength(512);

        builder.Property(o => o.Price)
            .HasPrecision(18, 2);

        builder.Property(o => o.OfferUrl)
            .IsRequired()
            .HasMaxLength(2048);

        builder.Property(o => o.ImageUrl)
            .HasMaxLength(2048);

        builder.Property(o => o.ProcessedAt)
            .IsRequired();

        builder.HasOne<SearchRule>()
            .WithMany()
            .HasForeignKey(o => o.RuleId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(o => o.ProcessedAt);
    }
}
