using DealHunter.Application.Common.Models;

namespace DealHunter.Application.Common.Interfaces;

public interface ITelegramCommandParser
{
    ParsedTelegramCommand Parse(string text);
}
