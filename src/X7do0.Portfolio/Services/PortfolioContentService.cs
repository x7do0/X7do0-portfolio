using System.Collections.Concurrent;
using System.Text.Json;
using X7do0.Portfolio.Models;

namespace X7do0.Portfolio.Services;

public sealed class PortfolioContentService(IWebHostEnvironment environment)
{
    private readonly ConcurrentDictionary<string, PortfolioContent> _cache = new();
    private readonly JsonSerializerOptions _jsonOptions = new(JsonSerializerDefaults.Web) { PropertyNameCaseInsensitive = true };

    public async Task<PortfolioContent> LoadAsync(string languageCode)
    {
        var normalizedCode = languageCode == "en" ? "en" : "ar";
        if (_cache.TryGetValue(normalizedCode, out var cachedContent)) return cachedContent;

        var filePath = Path.Combine(environment.ContentRootPath, "Content", $"portfolio.{normalizedCode}.json");
        await using var stream = File.OpenRead(filePath);
        var content = await JsonSerializer.DeserializeAsync<PortfolioContent>(stream, _jsonOptions)
            ?? throw new InvalidOperationException($"Could not load portfolio content: {filePath}");

        _cache[normalizedCode] = content;
        return content;
    }
}
