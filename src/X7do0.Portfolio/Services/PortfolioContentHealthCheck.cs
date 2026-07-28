using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace X7do0.Portfolio.Services;

public sealed class PortfolioContentHealthCheck(PortfolioContentService contentService) : IHealthCheck
{
    public async Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var arabic = await contentService.LoadAsync("ar");
            var english = await contentService.LoadAsync("en");

            if (arabic.Projects.Count != english.Projects.Count)
            {
                return HealthCheckResult.Degraded(
                    "Arabic and English project counts do not match.");
            }

            var arabicSlugs = arabic.Projects.Select(project => project.Slug)
                .OrderBy(slug => slug, StringComparer.OrdinalIgnoreCase);
            var englishSlugs = english.Projects.Select(project => project.Slug)
                .OrderBy(slug => slug, StringComparer.OrdinalIgnoreCase);

            if (!arabicSlugs.SequenceEqual(englishSlugs, StringComparer.OrdinalIgnoreCase))
            {
                return HealthCheckResult.Degraded(
                    "Arabic and English project slugs do not match.");
            }

            return HealthCheckResult.Healthy("Bilingual portfolio content loaded successfully.");
        }
        catch (Exception exception)
        {
            return HealthCheckResult.Unhealthy(
                "Portfolio content could not be loaded.",
                exception);
        }
    }
}
