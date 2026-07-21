using DealHunter.Domain.Entities;

namespace DealHunter.Domain.Repositories;

public interface IProcessedOfferRepository
{
    Task AddAsync(ProcessedOffer offer, CancellationToken cancellationToken = default);
    Task<bool> ExistsAsync(string offerId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<string>> FilterExistingOfferIdsAsync(IEnumerable<string> offerIds, CancellationToken cancellationToken = default);
}
