namespace DealHunter.Application.Common.Models;

public class ResilienceOptions
{
    public const string SectionName = "Resilience";

    public int MaxRetryCount { get; set; } = 3;

    public int BaseBackoffSeconds { get; set; } = 2;

    public int InterRequestDelaySeconds { get; set; } = 3;
}
