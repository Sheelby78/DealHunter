using DealHunter.Application.DTOs;
using MediatR;

namespace DealHunter.Application.Rules.Commands.AddSearchRule;

public record AddSearchRuleCommand(
    long ChatId,
    string Url,
    decimal? MaxPrice = null) : IRequest<SearchRuleDto>;
