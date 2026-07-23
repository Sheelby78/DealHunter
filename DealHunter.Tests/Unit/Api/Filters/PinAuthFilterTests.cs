using DealHunter.Api.Configuration;
using DealHunter.Api.Filters;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Abstractions;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Options;
using Xunit;

namespace DealHunter.Tests.Unit.Api.Filters;

public class PinAuthFilterTests
{
    private readonly PanelOptions _options = new() { WebPanelPin = "secret-pin-123", AdminChatId = 100 };

    [Fact]
    public void OnAuthorization_ValidPinHeader_AllowsRequest()
    {
        var filter = new PinAuthFilter(Options.Create(_options));
        var context = CreateFilterContext();
        context.HttpContext.Request.Headers["x-pin"] = "secret-pin-123";

        filter.OnAuthorization(context);

        context.Result.Should().BeNull();
    }

    [Fact]
    public void OnAuthorization_MissingPinHeader_ReturnsUnauthorized()
    {
        var filter = new PinAuthFilter(Options.Create(_options));
        var context = CreateFilterContext();

        filter.OnAuthorization(context);

        context.Result.Should().BeOfType<UnauthorizedResult>();
    }

    [Fact]
    public void OnAuthorization_InvalidPinHeader_ReturnsUnauthorized()
    {
        var filter = new PinAuthFilter(Options.Create(_options));
        var context = CreateFilterContext();
        context.HttpContext.Request.Headers["x-pin"] = "wrong-pin";

        filter.OnAuthorization(context);

        context.Result.Should().BeOfType<UnauthorizedResult>();
    }

    private static AuthorizationFilterContext CreateFilterContext()
    {
        var httpContext = new DefaultHttpContext();
        var actionContext = new ActionContext(httpContext, new RouteData(), new ActionDescriptor());
        return new AuthorizationFilterContext(actionContext, new List<IFilterMetadata>());
    }
}
