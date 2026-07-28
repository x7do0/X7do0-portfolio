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
            var consistencyErrors = BilingualContentConsistencyValidator.Validate(arabic, english);

            if (consistencyErrors.Count > 0)
            {
                return HealthCheckResult.Degraded(
                    "Arabic and English content structures do not match.",
                    data: new Dictionary<string, object>
                    {
                        ["errors"] = consistencyErrors.ToArray()
                    });
            }

            return HealthCheckResult.Healthy(
                "Bilingual portfolio content loaded and matched successfully.",
                new Dictionary<string, object>
                {
                    ["projects"] = arabic.Projects.Count,
                    ["homeSections"] = arabic.HomeSections.Count,
                    ["skills"] = arabic.SkillsSection.Items.Count
                });
        }
        catch (Exception exception)
        {
            return HealthCheckResult.Unhealthy(
                "Portfolio content could not be loaded.",
                exception);
        }
    }
}
