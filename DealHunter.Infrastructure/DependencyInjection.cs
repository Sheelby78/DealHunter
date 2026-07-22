using DealHunter.Application.Common.Models;
using DealHunter.Domain.Repositories;
using DealHunter.Infrastructure.Persistence;
using DealHunter.Infrastructure.Persistence.Repositories;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Polly;
using Polly.Extensions.Http;

namespace DealHunter.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureServices(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Connection string 'DefaultConnection' was not found.");

        EnsureSqliteDirectoryExists(connectionString);

        services.AddDbContext<DealHunterDbContext>(options =>
            options.UseSqlite(connectionString));

        services.Configure<ResilienceOptions>(configuration.GetSection(ResilienceOptions.SectionName));

        services.AddScoped<ISearchRuleRepository, SearchRuleRepository>();
        services.AddScoped<IProcessedOfferRepository, ProcessedOfferRepository>();
        services.AddSingleton<DealHunter.Application.Common.Interfaces.IOlxHtmlParser, DealHunter.Infrastructure.Parsers.OlxHtmlParser>();

        var botToken = configuration["Telegram:BotToken"] ?? "DUMMY_BOT_TOKEN";
        services.AddSingleton<Telegram.Bot.ITelegramBotClient>(_ => new Telegram.Bot.TelegramBotClient(botToken));
        services.AddTransient<DealHunter.Application.Common.Interfaces.ITelegramNotificationService, DealHunter.Infrastructure.Notifications.TelegramNotificationService>();

        services.AddHttpClient(Options.DefaultName)
            .AddPolicyHandler((serviceProvider, request) => GetOlxRetryPolicy(serviceProvider, request));

        return services;
    }

    public static IAsyncPolicy<HttpResponseMessage> GetOlxRetryPolicy(
        IServiceProvider serviceProvider,
        HttpRequestMessage request)
    {
        var options = serviceProvider.GetService<IOptions<ResilienceOptions>>()?.Value ?? new ResilienceOptions();
        var logger = serviceProvider.GetService<ILogger<ResilienceOptions>>();

        return HttpPolicyExtensions
            .HandleTransientHttpError()
            .Or<TimeoutException>()
            .Or<TaskCanceledException>(ex => !ex.CancellationToken.IsCancellationRequested)
            .WaitAndRetryAsync(
                options.MaxRetryCount,
                retryAttempt => TimeSpan.FromSeconds(options.BaseBackoffSeconds * Math.Pow(2, retryAttempt - 1)),
                onRetry: (outcome, timeSpan, retryAttempt, context) =>
                {
                    logger?.LogWarning(
                        "Retrying OLX HTTP request (Attempt {RetryAttempt}/{MaxRetryCount}) after {DelaySeconds}s due to: {Reason}",
                        retryAttempt,
                        options.MaxRetryCount,
                        timeSpan.TotalSeconds,
                        outcome.Exception?.Message ?? $"HTTP Status {(int)(outcome.Result?.StatusCode ?? 0)}"
                    );
                });
    }

    private static void EnsureSqliteDirectoryExists(string connectionString)
    {
        var builder = new SqliteConnectionStringBuilder(connectionString);
        if (!string.IsNullOrWhiteSpace(builder.DataSource))
        {
            var directory = Path.GetDirectoryName(builder.DataSource);
            if (!string.IsNullOrEmpty(directory) && !Directory.Exists(directory))
            {
                Directory.CreateDirectory(directory);
            }
        }
    }
}
