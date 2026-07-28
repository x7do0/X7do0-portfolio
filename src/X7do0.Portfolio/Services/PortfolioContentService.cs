using System.Collections.Concurrent;
using System.Text.Json;
using X7do0.Portfolio.Models;

namespace X7do0.Portfolio.Services;

public sealed class PortfolioContentService(IWebHostEnvironment environment)
{
    private readonly ConcurrentDictionary<string, PortfolioContent> _cache = new();
    private readonly JsonSerializerOptions _jsonOptions = new(JsonSerializerDefaults.Web)
    {
        PropertyNameCaseInsensitive = true
    };

    public async Task<PortfolioContent> LoadAsync(string languageCode)
    {
        var normalizedCode = languageCode == "en" ? "en" : "ar";

        if (!environment.IsDevelopment() &&
            _cache.TryGetValue(normalizedCode, out var cachedContent))
        {
            return cachedContent;
        }

        var filePath = Path.Combine(
            environment.ContentRootPath,
            "Content",
            $"portfolio.{normalizedCode}.json");

        await using var stream = File.OpenRead(filePath);
        var content = await JsonSerializer.DeserializeAsync<PortfolioContent>(stream, _jsonOptions)
            ?? throw new InvalidDataException($"Could not deserialize portfolio content: {filePath}");

        Validate(content, filePath);

        if (!environment.IsDevelopment())
        {
            _cache[normalizedCode] = content;
        }

        return content;
    }

    private static void Validate(PortfolioContent content, string filePath)
    {
        var errors = new List<string>();

        Require(content.Brand.Name, "brand.name", errors);
        Require(content.Brand.Role, "brand.role", errors);
        Require(content.Hero.Title, "hero.title", errors);
        Require(content.Hero.Description, "hero.description", errors);

        if (content.Projects.Count == 0)
        {
            errors.Add("projects must contain at least one item");
        }

        foreach (var project in content.Projects)
        {
            Require(project.Slug, "projects[].slug", errors);
            Require(project.Title, $"projects[{project.Slug}].title", errors);
            Require(project.Summary, $"projects[{project.Slug}].summary", errors);
        }

        var duplicateSlugs = content.Projects
            .Where(project => !string.IsNullOrWhiteSpace(project.Slug))
            .GroupBy(project => project.Slug, StringComparer.OrdinalIgnoreCase)
            .Where(group => group.Count() > 1)
            .Select(group => group.Key)
            .ToArray();

        if (duplicateSlugs.Length > 0)
        {
            errors.Add($"project slugs must be unique: {string.Join(", ", duplicateSlugs)}");
        }

        if (content.SkillsSection.Items.Any(string.IsNullOrWhiteSpace))
        {
            errors.Add("skillsSection.items cannot contain empty values");
        }

        foreach (var group in content.TechnologiesSection.Groups)
        {
            Require(group.Title, "technologiesSection.groups[].title", errors);
            if (group.Items.Count == 0)
            {
                errors.Add($"technology group '{group.Title}' must contain at least one item");
            }
        }

        if (errors.Count > 0)
        {
            throw new InvalidDataException(
                $"Invalid portfolio content in '{filePath}':{Environment.NewLine}- " +
                string.Join($"{Environment.NewLine}- ", errors));
        }
    }

    private static void Require(string value, string path, ICollection<string> errors)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            errors.Add($"{path} is required");
        }
    }
}
