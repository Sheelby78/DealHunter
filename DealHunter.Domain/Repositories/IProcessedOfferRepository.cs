using DealHunter.Domain.Entities;

namespace DealHunter.Domain.Repositories;

public interface IProcessedOfferRepository
{
    Task AddAsync(ProcessedOffer offer, CancellationToken cancellationToken = default);
    Task AddRangeAsync(IEnumerable<ProcessedOffer> offers, CancellationToken cancellationToken = default);
    Task<bool> ExistsAsync(string offerId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<string>> FilterExistingOfferIdsAsync(IEnumerable<string> offerIds, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ProcessedOffer>> GetPendingNotificationsAsync(CancellationToken cancellationToken = default);
    Task MarkAsNotifiedAsync(string offerId, DateTimeOffset notifiedAt, CancellationToken cancellationToken = default);
}
