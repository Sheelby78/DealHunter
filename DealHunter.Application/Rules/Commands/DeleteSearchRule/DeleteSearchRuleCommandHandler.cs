using DealHunter.Domain.Repositories;
using MediatR;

namespace DealHunter.Application.Rules.Commands.DeleteSearchRule;

public class DeleteSearchRuleCommandHandler : IRequestHandler<DeleteSearchRuleCommand, bool>
{
    private readonly ISearchRuleRepository _searchRuleRepository;

    public DeleteSearchRuleCommandHandler(ISearchRuleRepository searchRuleRepository)
    {
        _searchRuleRepository = searchRuleRepository;
    }

    public async Task<bool> Handle(DeleteSearchRuleCommand request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.RuleIdentifier))
        {
            return false;
        }

        var trimmed = request.RuleIdentifier.Trim();

        if (int.TryParse(trimmed, out var index))
        {
            if (index < 1)
            {
                return false;
            }

            var userRules = await _searchRuleRepository.GetByChatIdAsync(request.ChatId, cancellationToken);
            if (index > userRules.Count)
            {
                return false;
            }

            var targetRule = userRules[index - 1];
            await _searchRuleRepository.DeleteAsync(targetRule.Id, cancellationToken);
            return true;
        }

        if (Guid.TryParse(trimmed, out var ruleGuid))
        {
            var rule = await _searchRuleRepository.GetByIdAsync(ruleGuid, cancellationToken);
            if (rule != null && rule.ChatId == request.ChatId)
            {
                await _searchRuleRepository.DeleteAsync(ruleGuid, cancellationToken);
                return true;
            }
        }

        return false;
    }
}
