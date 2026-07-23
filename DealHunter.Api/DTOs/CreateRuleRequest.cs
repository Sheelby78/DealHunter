namespace DealHunter.Api.DTOs;

public record CreateRuleRequest(string Url, decimal? MaxPrice = null);
