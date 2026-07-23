using System.Security.Cryptography;
using System.Text;
using DealHunter.Api.Configuration;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.Options;

namespace DealHunter.Api.Filters;

public class PinAuthFilter : IAuthorizationFilter
{
    private readonly PanelOptions _options;

    public PinAuthFilter(IOptions<PanelOptions> options)
    {
        _options = options.Value;
    }

    public void OnAuthorization(AuthorizationFilterContext context)
    {
        var hasHeader = context.HttpContext.Request.Headers.TryGetValue("x-pin", out var pinHeader);
        
        if (!hasHeader ||
            string.IsNullOrWhiteSpace(pinHeader) ||
            !CryptographicOperations.FixedTimeEquals(
                Encoding.UTF8.GetBytes(pinHeader.ToString()),
                Encoding.UTF8.GetBytes(_options.WebPanelPin)))
        {
            context.Result = new UnauthorizedResult();
        }
    }
}
