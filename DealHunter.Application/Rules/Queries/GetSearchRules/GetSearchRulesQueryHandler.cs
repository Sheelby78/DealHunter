using DealHunter.Application.DTOs;
using DealHunter.Domain.Repositories;
using MediatR;

namespace DealHunter.Application.Rules.Queries.GetSearchRules;

public class GetSearchRulesQueryHandler : IRequestHandler<GetSearchRulesQuery, IReadOnlyList<SearchRuleDto>>
{
    private readonly ISearchRuleRepository _searchRuleRepository;

    public GetSearchRulesQueryHandler(ISearchRuleRepository searchRuleRepository)
    {
        _searchRuleRepository = searchRuleRepository;
    }

    public async Task<IReadOnlyList<SearchRuleDto>> Handle(GetSearchRulesQuery request, CancellationToken cancellationToken)
    {
        var rules = await _searchRuleRepository.GetByChatIdAsync(request.ChatId, cancellationToken);

        return rules
            .Select(r => new SearchRuleDto(
                Id: r.Id,
                ChatId: r.ChatId,
                Url: r.Url,
                MaxPrice: r.MaxPrice,
                IsActive: r.IsActive,
                CreatedAt: r.CreatedAt
            ))
            .ToList();
    }
}
