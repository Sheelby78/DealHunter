using DealHunter.Domain.Repositories;
using DealHunter.Infrastructure.Persistence;
using DealHunter.Infrastructure.Persistence.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace DealHunter.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureServices(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Connection string 'DefaultConnection' was not found.");

        services.AddDbContext<DealHunterDbContext>(options =>
            options.UseNpgsql(connectionString));

        services.AddScoped<ISearchRuleRepository, SearchRuleRepository>();
        services.AddScoped<IProcessedOfferRepository, ProcessedOfferRepository>();
        services.AddSingleton<DealHunter.Application.Common.Interfaces.IOlxHtmlParser, DealHunter.Infrastructure.Parsers.OlxHtmlParser>();

        var botToken = configuration["Telegram:BotToken"] ?? "DUMMY_BOT_TOKEN";
        services.AddSingleton<Telegram.Bot.ITelegramBotClient>(_ => new Telegram.Bot.TelegramBotClient(botToken));
        services.AddTransient<DealHunter.Application.Common.Interfaces.ITelegramNotificationService, DealHunter.Infrastructure.Notifications.TelegramNotificationService>();

        return services;
    }
}
