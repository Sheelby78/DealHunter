using DealHunter.Application.Common.Interfaces;
using DealHunter.Application.DTOs;
using Telegram.Bot;
using Telegram.Bot.Types;
using Telegram.Bot.Types.Enums;
using Telegram.Bot.Types.ReplyMarkups;

namespace DealHunter.Infrastructure.Notifications;

public class TelegramNotificationService : ITelegramNotificationService
{
    private readonly ITelegramBotClient _botClient;

    public TelegramNotificationService(ITelegramBotClient botClient)
    {
        _botClient = botClient;
    }

    public async Task SendOfferAlertAsync(long chatId, ExtractedOfferDto offer, CancellationToken cancellationToken = default)
    {
        var caption = $"<b>{HtmlEncode(offer.Title)}</b>\nCena: <b>{offer.Price:N2} zł</b>";
        var inlineKeyboard = new InlineKeyboardMarkup(new[]
        {
            InlineKeyboardButton.WithUrl("Zobacz ogłoszenie", offer.OfferUrl)
        });

        if (!string.IsNullOrWhiteSpace(offer.ImageUrl) && Uri.IsWellFormedUriString(offer.ImageUrl, UriKind.Absolute))
        {
            try
            {
                var photoInput = InputFile.FromUri(offer.ImageUrl);
                await _botClient.SendPhoto(
                    chatId: chatId,
                    photo: photoInput,
                    caption: caption,
                    parseMode: ParseMode.Html,
                    replyMarkup: inlineKeyboard,
                    cancellationToken: cancellationToken
                );
                return;
            }
            catch
            {
                // Fallback to text message if sending photo fails
            }
        }

        await _botClient.SendMessage(
            chatId: chatId,
            text: caption,
            parseMode: ParseMode.Html,
            replyMarkup: inlineKeyboard,
            cancellationToken: cancellationToken
        );
    }

    private static string HtmlEncode(string text)
    {
        return System.Net.WebUtility.HtmlEncode(text);
    }
}
