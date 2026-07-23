namespace DealHunter.Api.Configuration;

public class PanelOptions
{
    public const string SectionName = "Panel";

    public string WebPanelPin { get; set; } = string.Empty;

    public long AdminChatId { get; set; }
}
