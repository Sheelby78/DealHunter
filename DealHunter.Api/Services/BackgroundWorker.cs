using DealHunter.Application.Offers.Commands.ProcessOffers;
using MediatR;

namespace DealHunter.Api.Services;

public class BackgroundWorker : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly IConfiguration _configuration;
    private readonly ILogger<BackgroundWorker> _logger;

    public BackgroundWorker(
        IServiceScopeFactory scopeFactory,
        IConfiguration configuration,
        ILogger<BackgroundWorker> logger)
    {
        _scopeFactory = scopeFactory;
        _configuration = configuration;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var intervalMinutes = _configuration.GetValue<int>("PollingIntervalMinutes", 5);
        var interval = TimeSpan.FromMinutes(Math.Max(1, intervalMinutes));

        using var timer = new PeriodicTimer(interval);

        _logger.LogInformation("BackgroundWorker started with polling interval of {IntervalMinutes} minutes.", intervalMinutes);

        while (!stoppingToken.IsCancellationRequested && await timer.WaitForNextTickAsync(stoppingToken))
        {
            try
            {
                using var scope = _scopeFactory.CreateScope();
                var mediator = scope.ServiceProvider.GetRequiredService<IMediator>();

                var result = await mediator.Send(new ProcessOffersCommand(), stoppingToken);

                _logger.LogInformation(
                    "Cycle completed. Rules processed: {Rules}, Offers parsed: {Parsed}, Alerts sent: {Notified}",
                    result.RulesProcessed,
                    result.OffersParsed,
                    result.NewOffersNotified
                );
            }
            catch (Exception ex) when (ex is not OperationCanceledException)
            {
                _logger.LogError(ex, "An error occurred during the background offer processing cycle.");
            }
        }
    }
}
