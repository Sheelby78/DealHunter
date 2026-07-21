using DealHunter.Application.Common.Interfaces;

namespace DealHunter.Application.Common.Validators;

public class OlxUrlValidator : IOlxUrlValidator
{
    public bool IsValidOlxUrl(string url, out string? errorMessage)
    {
        errorMessage = null;

        if (string.IsNullOrWhiteSpace(url))
        {
            errorMessage = "Adres URL nie może być pusty.";
            return false;
        }

        var trimmedUrl = url.Trim();

        if (!Uri.TryCreate(trimmedUrl, UriKind.Absolute, out var uri))
        {
            errorMessage = "Podany adres URL ma nieprawidłową strukturę.";
            return false;
        }

        if (uri.Scheme != Uri.UriSchemeHttps && uri.Scheme != Uri.UriSchemeHttp)
        {
            errorMessage = "Adres URL musi używać bezpiecznego protokołu HTTP lub HTTPS.";
            return false;
        }

        var host = uri.Host.ToLowerInvariant();
        if (!host.Equals("olx.pl", StringComparison.OrdinalIgnoreCase) &&
            !host.EndsWith(".olx.pl", StringComparison.OrdinalIgnoreCase))
        {
            errorMessage = "Adres URL musi prowadzić do serwisu OLX.pl.";
            return false;
        }

        if (uri.AbsolutePath == "/" && string.IsNullOrWhiteSpace(uri.Query))
        {
            errorMessage = "Adres URL musi prowadzić do konkretnej kategorii lub wyników wyszukiwania, a nie do strony głównej.";
            return false;
        }

        return true;
    }
}
