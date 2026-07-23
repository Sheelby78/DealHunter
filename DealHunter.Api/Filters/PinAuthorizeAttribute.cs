using Microsoft.AspNetCore.Mvc;

namespace DealHunter.Api.Filters;

[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public class PinAuthorizeAttribute : TypeFilterAttribute
{
    public PinAuthorizeAttribute() : base(typeof(PinAuthFilter))
    {
    }
}
