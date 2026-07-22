using System.Net;
using DealHunter.Application.Common.Models;
using DealHunter.Infrastructure;
using FluentAssertions;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Polly;
using Xunit;

namespace DealHunter.Tests.Unit.Infrastructure;

public class PollyResiliencePolicyTests
{
    [Fact]
    public async Task GetOlxRetryPolicy_RetriesOnTransient500HttpError_UpToMaxRetryCount()
    {
        // Arrange
        var attemptCount = 0;
        var handler = new DynamicMockHttpMessageHandler((req) =>
        {
            attemptCount++;
            return new HttpResponseMessage(HttpStatusCode.InternalServerError);
        });

        var options = new ResilienceOptions { MaxRetryCount = 3, BaseBackoffSeconds = 0 };
        var serviceProvider = new ServiceCollection()
            .AddSingleton<IOptions<ResilienceOptions>>(Options.Create(options))
            .BuildServiceProvider();

        var policy = DependencyInjection.GetOlxRetryPolicy(serviceProvider, new HttpRequestMessage());
        using var client = new HttpClient(new PolicyHttpMessageHandler(policy, handler));

        // Act
        var response = await client.GetAsync("https://www.olx.pl/test");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.InternalServerError);
        attemptCount.Should().Be(4); // 1 initial request + 3 retries
    }

    [Fact]
    public async Task GetOlxRetryPolicy_DoesNotRetryOn404NotFoundError()
    {
        // Arrange
        var attemptCount = 0;
        var handler = new DynamicMockHttpMessageHandler((req) =>
        {
            attemptCount++;
            return new HttpResponseMessage(HttpStatusCode.NotFound);
        });

        var options = new ResilienceOptions { MaxRetryCount = 3, BaseBackoffSeconds = 0 };
        var serviceProvider = new ServiceCollection()
            .AddSingleton<IOptions<ResilienceOptions>>(Options.Create(options))
            .BuildServiceProvider();

        var policy = DependencyInjection.GetOlxRetryPolicy(serviceProvider, new HttpRequestMessage());
        using var client = new HttpClient(new PolicyHttpMessageHandler(policy, handler));

        // Act
        var response = await client.GetAsync("https://www.olx.pl/test");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
        attemptCount.Should().Be(1); // No retries for 404
    }

    private class PolicyHttpMessageHandler : DelegatingHandler
    {
        private readonly IAsyncPolicy<HttpResponseMessage> _policy;

        public PolicyHttpMessageHandler(IAsyncPolicy<HttpResponseMessage> policy, HttpMessageHandler innerHandler)
            : base(innerHandler)
        {
            _policy = policy;
        }

        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            return _policy.ExecuteAsync((ct) => base.SendAsync(request, ct), cancellationToken);
        }
    }

    private class DynamicMockHttpMessageHandler : HttpMessageHandler
    {
        private readonly Func<HttpRequestMessage, HttpResponseMessage> _handlerFunc;

        public DynamicMockHttpMessageHandler(Func<HttpRequestMessage, HttpResponseMessage> handlerFunc)
        {
            _handlerFunc = handlerFunc;
        }

        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            return Task.FromResult(_handlerFunc(request));
        }
    }
}
