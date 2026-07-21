using Microsoft.Extensions.DependencyInjection;

namespace DealHunter.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        services.AddMediatR(cfg =>
        {
            cfg.RegisterServicesFromAssembly(typeof(DependencyInjection).Assembly);
        });

        services.AddSingleton<Common.Interfaces.IOlxUrlValidator, Common.Validators.OlxUrlValidator>();

        return services;
    }
}
