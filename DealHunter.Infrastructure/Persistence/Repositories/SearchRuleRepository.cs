using DealHunter.Domain.Entities;
using DealHunter.Domain.Repositories;
using Microsoft.EntityFrameworkCore;

namespace DealHunter.Infrastructure.Persistence.Repositories;

public class SearchRuleRepository : ISearchRuleRepository
{
    private readonly DealHunterDbContext _dbContext;

    public SearchRuleRepository(DealHunterDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task AddAsync(SearchRule rule, CancellationToken cancellationToken = default)
    {
        await _dbContext.SearchRules.AddAsync(rule, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<SearchRule?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _dbContext.SearchRules
            .FirstOrDefaultAsync(r => r.Id == id, cancellationToken);
    }

    public async Task<IReadOnlyList<SearchRule>> GetByChatIdAsync(long chatId, CancellationToken cancellationToken = default)
    {
        var rules = await _dbContext.SearchRules
            .Where(r => r.ChatId == chatId && r.IsActive)
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        return rules.OrderBy(r => r.CreatedAt).ToList();
    }

    public async Task<IReadOnlyList<SearchRule>> GetAllActiveAsync(CancellationToken cancellationToken = default)
    {
        return await _dbContext.SearchRules
            .Where(r => r.IsActive)
            .AsNoTracking()
            .ToListAsync(cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var rule = await GetByIdAsync(id, cancellationToken);
        if (rule != null)
        {
            _dbContext.SearchRules.Remove(rule);
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
    }
}
