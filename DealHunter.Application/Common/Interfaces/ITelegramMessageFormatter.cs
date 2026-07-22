using DealHunter.Application.DTOs;

namespace DealHunter.Application.Common.Interfaces;

public interface ITelegramMessageFormatter
{
    string FormatWelcomeMessage(long chatId);
    string FormatHelpMessage();
    string FormatRulesList(IReadOnlyList<SearchRuleDto> rules);
    string FormatRuleAddedSuccess(SearchRuleDto rule);
    string FormatRuleDeletedSuccess(string identifier);
    string FormatErrorMessage(string message);
}
