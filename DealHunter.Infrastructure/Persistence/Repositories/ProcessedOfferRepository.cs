using DealHunter.Domain.Entities;
using DealHunter.Domain.Repositories;
using Microsoft.EntityFrameworkCore;

namespace DealHunter.Infrastructure.Persistence.Repositories;

public class ProcessedOfferRepository : IProcessedOfferRepository
{
    private readonly DealHunterDbContext _dbContext;

    public ProcessedOfferRepository(DealHunterDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task AddAsync(ProcessedOffer offer, CancellationToken cancellationToken = default)
    {
        await _dbContext.ProcessedOffers.AddAsync(offer, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<bool> ExistsAsync(string offerId, CancellationToken cancellationToken = default)
    {
        return await _dbContext.ProcessedOffers
            .AnyAsync(o => o.OfferId == offerId, cancellationToken);
    }

    public async Task<IReadOnlyList<string>> FilterExistingOfferIdsAsync(IEnumerable<string> offerIds, CancellationToken cancellationToken = default)
    {
        var idList = offerIds.Distinct().ToList();
        if (idList.Count == 0)
        {
            return Array.Empty<string>();
        }

        return await _dbContext.ProcessedOffers
            .Where(o => idList.Contains(o.OfferId))
            .Select(o => o.OfferId)
            .ToListAsync(cancellationToken);
    }
}
