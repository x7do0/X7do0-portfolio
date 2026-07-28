using System.Collections.Concurrent;
using System.Text.Json;
using X7do0.Portfolio.Models;

namespace X7do0.Portfolio.Services;

public sealed class PortfolioContentService(IWebHostEnvironment environment)
{
    private static readonly HashSet<string> SupportedHomeSections =
        ["projects", "skills", "technologies", "education", "knowledge", "contact"];

    private static readonly HashSet<string> SupportedPreviewKinds =
        ["workflow", "academy", "generic"];

    private readonly ConcurrentDictionary<string, PortfolioContent> _cache = new();
    private readonly JsonSerializerOptions _jsonOptions = new(JsonSerializerDefaults.Web) { PropertyNameCaseInsensitive = true };

    public async Task<PortfolioContent> LoadAsync(string languageCode)
    {
        var normalizedCode = languageCode == "en" ? "en" : "ar";
        if (!environment.IsDevelopment() && _cache.TryGetValue(normalizedCode, out var cachedContent)) return cachedContent;

        var filePath = Path.Combine(environment.ContentRootPath, "Content", $"portfolio.{normalizedCode}.json");
        await using var stream = File.OpenRead(filePath);
        var content = await JsonSerializer.DeserializeAsync<PortfolioContent>(stream, _jsonOptions)
            ?? throw new InvalidDataException($"Could not deserialize portfolio content: {filePath}");

        Validate(content, filePath);
        if (!environment.IsDevelopment()) _cache[normalizedCode] = content;
        return content;
    }

    private static void Validate(PortfolioContent content, string filePath)
    {
        var errors = new List<string>();
        Require(content.Brand.Name, "brand.name", errors);
        Require(content.Brand.Role, "brand.role", errors);
        Require(content.Hero.Title, "hero.title", errors);
        Require(content.Hero.Description, "hero.description", errors);

        if (content.HomeSections.Count == 0) errors.Add("homeSections must contain at least one section");
        var duplicateHomeSections = content.HomeSections
            .Where(section => !string.IsNullOrWhiteSpace(section))
            .GroupBy(section => section, StringComparer.OrdinalIgnoreCase)
            .Where(group => group.Count() > 1)
            .Select(group => group.Key)
            .ToArray();
        if (duplicateHomeSections.Length > 0) errors.Add($"homeSections cannot contain duplicates: {string.Join(", ", duplicateHomeSections)}");

        foreach (var section in content.HomeSections)
        {
            if (!SupportedHomeSections.Contains(section)) errors.Add($"unsupported home section '{section}'");
        }

        if (content.HomeSections.Count > 0 && !string.Equals(content.HomeSections[0], "projects", StringComparison.OrdinalIgnoreCase))
            errors.Add("homeSections must start with 'projects' to preserve the approved page order");

        if (content.Projects.Count == 0) errors.Add("projects must contain at least one item");

        foreach (var project in content.Projects)
        {
            Require(project.Slug, "projects[].slug", errors);
            Require(project.Title, $"projects[{project.Slug}].title", errors);
            Require(project.Summary, $"projects[{project.Slug}].summary", errors);
            Require(project.PreviewKind, $"projects[{project.Slug}].previewKind", errors);

            if (!SupportedPreviewKinds.Contains(project.PreviewKind))
                errors.Add($"project '{project.Slug}' previewKind must be one of: {string.Join(", ", SupportedPreviewKinds)}");

            var duplicateSectionIds = project.CaseStudy
                .Where(section => !string.IsNullOrWhiteSpace(section.Id))
                .GroupBy(section => section.Id, StringComparer.OrdinalIgnoreCase)
                .Where(group => group.Count() > 1)
                .Select(group => group.Key);
            foreach (var id in duplicateSectionIds) errors.Add($"project '{project.Slug}' has duplicate case-study id '{id}'");

            foreach (var media in project.Media)
            {
                Require(media.Url, $"projects[{project.Slug}].media[].url", errors);
                Require(media.Alt, $"projects[{project.Slug}].media[].alt", errors);
                if (media.Type is not ("image" or "video")) errors.Add($"project '{project.Slug}' media type must be 'image' or 'video'");
            }
        }

        var duplicateSlugs = content.Projects.Where(project => !string.IsNullOrWhiteSpace(project.Slug))
            .GroupBy(project => project.Slug, StringComparer.OrdinalIgnoreCase).Where(group => group.Count() > 1).Select(group => group.Key).ToArray();
        if (duplicateSlugs.Length > 0) errors.Add($"project slugs must be unique: {string.Join(", ", duplicateSlugs)}");

        if (content.SkillsSection.Items.Any(string.IsNullOrWhiteSpace)) errors.Add("skillsSection.items cannot contain empty values");
        foreach (var group in content.TechnologiesSection.Groups)
        {
            Require(group.Title, "technologiesSection.groups[].title", errors);
            if (group.Items.Count == 0) errors.Add($"technology group '{group.Title}' must contain at least one item");
        }

        if (errors.Count > 0) throw new InvalidDataException($"Invalid portfolio content in '{filePath}':{Environment.NewLine}- " + string.Join($"{Environment.NewLine}- ", errors));
    }

    private static void Require(string value, string path, ICollection<string> errors)
    {
        if (string.IsNullOrWhiteSpace(value)) errors.Add($"{path} is required");
    }
}
