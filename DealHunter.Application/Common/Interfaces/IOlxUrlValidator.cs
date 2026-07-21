namespace DealHunter.Application.Common.Interfaces;

public interface IOlxUrlValidator
{
    bool IsValidOlxUrl(string url, out string? errorMessage);
}
