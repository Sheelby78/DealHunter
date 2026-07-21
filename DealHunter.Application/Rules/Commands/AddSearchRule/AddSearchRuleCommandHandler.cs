using DealHunter.Application.Common.Interfaces;
using DealHunter.Application.DTOs;
using DealHunter.Domain.Entities;
using DealHunter.Domain.Repositories;
using MediatR;

namespace DealHunter.Application.Rules.Commands.AddSearchRule;

public class AddSearchRuleCommandHandler : IRequestHandler<AddSearchRuleCommand, SearchRuleDto>
{
    private readonly ISearchRuleRepository _searchRuleRepository;
    private readonly IOlxUrlValidator _olxUrlValidator;

    public AddSearchRuleCommandHandler(
        ISearchRuleRepository searchRuleRepository,
        IOlxUrlValidator olxUrlValidator)
    {
        _searchRuleRepository = searchRuleRepository;
        _olxUrlValidator = olxUrlValidator;
    }

    public async Task<SearchRuleDto> Handle(AddSearchRuleCommand request, CancellationToken cancellationToken)
    {
        if (!_olxUrlValidator.IsValidOlxUrl(request.Url, out var errorMessage))
        {
            throw new ArgumentException(errorMessage ?? "Nieprawidłowy adres URL OLX.", nameof(request.Url));
        }

        var rule = SearchRule.Create(
            chatId: request.ChatId,
            url: request.Url,
            maxPrice: request.MaxPrice
        );

        await _searchRuleRepository.AddAsync(rule, cancellationToken);

        return new SearchRuleDto(
            Id: rule.Id,
            ChatId: rule.ChatId,
            Url: rule.Url,
            MaxPrice: rule.MaxPrice,
            IsActive: rule.IsActive,
            CreatedAt: rule.CreatedAt
        );
    }
}
