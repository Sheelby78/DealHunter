using MediatR;

namespace DealHunter.Application.Rules.Commands.DeleteSearchRule;

public record DeleteSearchRuleCommand(
    long ChatId,
    string RuleIdentifier) : IRequest<bool>;
