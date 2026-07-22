using DealHunter.Application.Common.Interfaces;
using DealHunter.Application.Common.Models;
using DealHunter.Application.Rules.Commands.AddSearchRule;
using DealHunter.Application.Rules.Commands.DeleteSearchRule;
using DealHunter.Application.Rules.Queries.GetSearchRules;
using MediatR;
using Telegram.Bot;
using Telegram.Bot.Polling;
using Telegram.Bot.Types;
using Telegram.Bot.Types.Enums;

namespace DealHunter.Api.Services;

public class TelegramBotListener : BackgroundService
{
    private readonly ITelegramBotClient _botClient;
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ITelegramCommandParser _commandParser;
    private readonly ITelegramMessageFormatter _messageFormatter;
    private readonly ILogger<TelegramBotListener> _logger;

    public TelegramBotListener(
        ITelegramBotClient botClient,
        IServiceScopeFactory scopeFactory,
        ITelegramCommandParser commandParser,
        ITelegramMessageFormatter messageFormatter,
        ILogger<TelegramBotListener> logger)
    {
        _botClient = botClient;
        _scopeFactory = scopeFactory;
        _commandParser = commandParser;
        _messageFormatter = messageFormatter;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var receiverOptions = new ReceiverOptions
        {
            AllowedUpdates = new[] { UpdateType.Message }
        };

        _logger.LogInformation("TelegramBotListener started receiving updates.");

        _botClient.StartReceiving(
            updateHandler: HandleUpdateAsync,
            errorHandler: HandleErrorAsync,
            receiverOptions: receiverOptions,
            cancellationToken: stoppingToken
        );

        await Task.Delay(Timeout.Infinite, stoppingToken);
    }

    private async Task HandleUpdateAsync(ITelegramBotClient botClient, Update update, CancellationToken cancellationToken)
    {
        if (update.Message is not { Text: { } text } message)
        {
            return;
        }

        var chatId = message.Chat.Id;

        try
        {
            var command = _commandParser.Parse(text);

            using var scope = _scopeFactory.CreateScope();
            var mediator = scope.ServiceProvider.GetRequiredService<IMediator>();

            switch (command.Type)
            {
                case TelegramCommandType.Start:
                    await SendHtmlReplyAsync(chatId, _messageFormatter.FormatWelcomeMessage(chatId), cancellationToken);
                    break;

                case TelegramCommandType.Help:
                    await SendHtmlReplyAsync(chatId, _messageFormatter.FormatHelpMessage(), cancellationToken);
                    break;

                case TelegramCommandType.Add:
                    if (!string.IsNullOrWhiteSpace(command.ErrorMessage))
                    {
                        await SendHtmlReplyAsync(chatId, _messageFormatter.FormatErrorMessage(command.ErrorMessage), cancellationToken);
                        break;
                    }

                    try
                    {
                        var rule = await mediator.Send(new AddSearchRuleCommand(chatId, command.Url!, command.MaxPrice), cancellationToken);
                        await SendHtmlReplyAsync(chatId, _messageFormatter.FormatRuleAddedSuccess(rule), cancellationToken);
                    }
                    catch (Exception ex)
                    {
                        await SendHtmlReplyAsync(chatId, _messageFormatter.FormatErrorMessage(ex.Message), cancellationToken);
                    }
                    break;

                case TelegramCommandType.List:
                    var rules = await mediator.Send(new GetSearchRulesQuery(chatId), cancellationToken);
                    await SendHtmlReplyAsync(chatId, _messageFormatter.FormatRulesList(rules), cancellationToken);
                    break;

                case TelegramCommandType.Delete:
                    if (!string.IsNullOrWhiteSpace(command.ErrorMessage))
                    {
                        await SendHtmlReplyAsync(chatId, _messageFormatter.FormatErrorMessage(command.ErrorMessage), cancellationToken);
                        break;
                    }

                    var deleted = await mediator.Send(new DeleteSearchRuleCommand(chatId, command.RuleIdentifier!), cancellationToken);
                    if (deleted)
                    {
                        await SendHtmlReplyAsync(chatId, _messageFormatter.FormatRuleDeletedSuccess(command.RuleIdentifier!), cancellationToken);
                    }
                    else
                    {
                        await SendHtmlReplyAsync(chatId, _messageFormatter.FormatErrorMessage("Nie znaleziono reguły o podanym numerze lub ID."), cancellationToken);
                    }
                    break;

                default:
                    await SendHtmlReplyAsync(chatId, _messageFormatter.FormatHelpMessage(), cancellationToken);
                    break;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error handling Telegram message from ChatId {ChatId}: {Text}", chatId, text);
            await SendHtmlReplyAsync(chatId, _messageFormatter.FormatErrorMessage("Wystąpił nieoczekiwany błąd podczas przetwarzania polecenia."), cancellationToken);
        }
    }

    private Task HandleErrorAsync(ITelegramBotClient botClient, Exception exception, CancellationToken cancellationToken)
    {
        _logger.LogError(exception, "Telegram Bot API error: {Message}", exception.Message);
        return Task.CompletedTask;
    }

    private async Task SendHtmlReplyAsync(long chatId, string htmlText, CancellationToken cancellationToken)
    {
        try
        {
            await _botClient.SendMessage(
                chatId: chatId,
                text: htmlText,
                parseMode: ParseMode.Html,
                cancellationToken: cancellationToken
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send Telegram reply to ChatId {ChatId}", chatId);
        }
    }
}
