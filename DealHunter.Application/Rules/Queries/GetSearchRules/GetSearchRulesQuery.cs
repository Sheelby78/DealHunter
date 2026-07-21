using DealHunter.Application.DTOs;
using MediatR;

namespace DealHunter.Application.Rules.Queries.GetSearchRules;

public record GetSearchRulesQuery(long ChatId) : IRequest<IReadOnlyList<SearchRuleDto>>;
