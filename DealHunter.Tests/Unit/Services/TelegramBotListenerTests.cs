using DealHunter.Api.Services;
using DealHunter.Application.Common.Interfaces;
using FluentAssertions;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using NSubstitute;
using Telegram.Bot;
using Telegram.Bot.Exceptions;
using Xunit;

namespace DealHunter.Tests.Unit.Services;

public class TelegramBotListenerTests
{
    private readonly ITelegramBotClient _botClient = Substitute.For<ITelegramBotClient>();
    private readonly IServiceScopeFactory _scopeFactory = Substitute.For<IServiceScopeFactory>();
    private readonly ITelegramCommandParser _commandParser = Substitute.For<ITelegramCommandParser>();
    private readonly ITelegramMessageFormatter _messageFormatter = Substitute.For<ITelegramMessageFormatter>();
    private readonly ILogger<TelegramBotListener> _logger = Substitute.For<ILogger<TelegramBotListener>>();

    private readonly TelegramBotListener _sut;

    public TelegramBotListenerTests()
    {
        _sut = new TelegramBotListener(
            _botClient,
            _scopeFactory,
            _commandParser,
            _messageFormatter,
            _logger);
    }

    [Fact]
    public async Task HandleErrorAsync_ShouldLogWarningAndBackoff_WhenConflictExceptionOccurs()
    {
        var exception = new ApiRequestException("Conflict: terminated by other getUpdates request", 409);
        using var cts = new CancellationTokenSource();
        cts.Cancel();

        var act = () => _sut.HandleErrorAsync(_botClient, exception, cts.Token);

        await act.Should().NotThrowAsync();
        _logger.ReceivedWithAnyArgs(1).Log(
            LogLevel.Warning,
            Arg.Any<EventId>(),
            Arg.Any<Arg.AnyType>(),
            Arg.Any<Exception>(),
            Arg.Any<Func<Arg.AnyType, Exception?, string>>());
    }

    [Fact]
    public async Task HandleErrorAsync_ShouldLogInformation_WhenOperationCanceledExceptionOccurs()
    {
        var exception = new OperationCanceledException();

        await _sut.HandleErrorAsync(_botClient, exception, CancellationToken.None);

        _logger.ReceivedWithAnyArgs(1).Log(
            LogLevel.Information,
            Arg.Any<EventId>(),
            Arg.Any<Arg.AnyType>(),
            Arg.Any<Exception>(),
            Arg.Any<Func<Arg.AnyType, Exception?, string>>());
    }

    [Fact]
    public async Task HandleErrorAsync_ShouldLogError_WhenGeneralExceptionOccurs()
    {
        var exception = new InvalidOperationException("Something failed");

        await _sut.HandleErrorAsync(_botClient, exception, CancellationToken.None);

        _logger.ReceivedWithAnyArgs(1).Log(
            LogLevel.Error,
            Arg.Any<EventId>(),
            Arg.Any<Arg.AnyType>(),
            exception,
            Arg.Any<Func<Arg.AnyType, Exception?, string>>());
    }
}
