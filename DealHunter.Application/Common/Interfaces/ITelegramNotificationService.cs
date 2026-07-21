using DealHunter.Application.DTOs;

namespace DealHunter.Application.Common.Interfaces;

public interface ITelegramNotificationService
{
    Task SendOfferAlertAsync(long chatId, ExtractedOfferDto offer, CancellationToken cancellationToken = default);
}
