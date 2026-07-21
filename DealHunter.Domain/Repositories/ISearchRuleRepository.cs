using DealHunter.Domain.Entities;

namespace DealHunter.Domain.Repositories;

public interface ISearchRuleRepository
{
    Task AddAsync(SearchRule rule, CancellationToken cancellationToken = default);
    Task<SearchRule?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<SearchRule>> GetAllActiveAsync(CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
