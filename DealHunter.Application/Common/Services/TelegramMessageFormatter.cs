using System.Net;
using System.Text;
using DealHunter.Application.DTOs;
using DealHunter.Application.Common.Interfaces;

namespace DealHunter.Application.Common.Services;

public class TelegramMessageFormatter : ITelegramMessageFormatter
{
    public string FormatWelcomeMessage(long chatId)
    {
        return $"Witaj w <b>DealHunter</b>! 🎯\nTwój identyfikator Telegram Chat ID: <code>{chatId}</code>\n\nUżyj /help aby zobaczyć dostępne polecenia.";
    }

    public string FormatHelpMessage()
    {
        return "<b>Dostępne polecenia DealHunter:</b>\n\n" +
               "• <code>/add &lt;URL_OLX&gt; [--max-price &lt;KWOTA&gt;]</code> – dodaj nową regułę śledzenia okazjonalnych ofert z OLX\n" +
               "• <code>/list</code> – wyświetl swoje aktywne reguły monitorowania\n" +
               "• <code>/delete &lt;NUMER_LUB_ID&gt;</code> – usuń regułę podając jej numer z listy lub identyfikator\n" +
               "• <code>/help</code> – wyświetl tę pomoc";
    }

    public string FormatRulesList(IReadOnlyList<SearchRuleDto> rules)
    {
        if (rules == null || rules.Count == 0)
        {
            return "Nie masz jeszcze żadnych aktywnych reguł monitorowania.\nUżyj /add aby dodać pierwszą regułę z OLX!";
        }

        var sb = new StringBuilder();
        sb.AppendLine("<b>Twoje aktywne reguły monitorowania:</b>\n");

        for (var i = 0; i < rules.Count; i++)
        {
            var rule = rules[i];
            var priceText = rule.MaxPrice.HasValue ? $"<b>{rule.MaxPrice.Value:N2} zł</b>" : "brak limitu";
            sb.AppendLine($"{i + 1}. <a href=\"{WebUtility.HtmlEncode(rule.Url)}\">Link OLX</a> | Max cena: {priceText}");
        }

        sb.AppendLine("\n<i>Użyj <code>/delete &lt;numer&gt;</code> (np. <code>/delete 1</code>) aby usunąć regułę.</i>");
        return sb.ToString();
    }

    public string FormatRuleAddedSuccess(SearchRuleDto rule)
    {
        var priceText = rule.MaxPrice.HasValue ? $"{rule.MaxPrice.Value:N2} zł" : "brak limitu";
        return $"✅ <b>Dodano nową regułę monitorowania!</b>\n\n• Link: <a href=\"{WebUtility.HtmlEncode(rule.Url)}\">OLX URL</a>\n• Cena maksymalna: <b>{priceText}</b>";
    }

    public string FormatRuleDeletedSuccess(string identifier)
    {
        return $"🗑️ <b>Pomyślnie usunięto regułę monitorowania ({identifier})!</b>";
    }

    public string FormatErrorMessage(string message)
    {
        return $"⚠️ <b>Błąd:</b> {WebUtility.HtmlEncode(message)}";
    }
}
