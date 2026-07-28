using X7do0.Portfolio.Models;

namespace X7do0.Portfolio.Services;

public static class PortfolioReadinessEvaluator
{
    public static PortfolioReadinessReport Evaluate(PortfolioContent arabic, PortfolioContent english)
    {
        var items = new List<PortfolioReadinessItem>();

        AddLinkChecks(items, "ar", arabic);
        AddLinkChecks(items, "en", english);
        AddProjectChecks(items, "ar", arabic);
        AddProjectChecks(items, "en", english);
        AddResumeChecks(items, "ar", arabic);
        AddResumeChecks(items, "en", english);
        AddKnowledgeChecks(items, "ar", arabic);
        AddKnowledgeChecks(items, "en", english);

        var pending = items.Where(item => !item.Complete).ToArray();

        return new PortfolioReadinessReport(
            IsReady: pending.Length == 0,
            CompletedChecks: items.Count - pending.Length,
            TotalChecks: items.Count,
            Pending: pending);
    }

    private static void AddLinkChecks(List<PortfolioReadinessItem> items, string language, PortfolioContent content)
    {
        Add(items, language, "contact.email", content.Contact.PrimaryLinks.ElementAtOrDefault(0)?.Enabled == true,
            "Add the approved email contact URL.");
        Add(items, language, "contact.linkedin", content.Contact.PrimaryLinks.ElementAtOrDefault(1)?.Enabled == true,
            "Add the approved LinkedIn profile URL.");
        Add(items, language, "social.youtube", content.Contact.SocialLinks.Any(link =>
                link.Label.Contains("YouTube", StringComparison.OrdinalIgnoreCase) && link.Enabled),
            "Add the approved YouTube channel URL.");
        Add(items, language, "social.instagram", content.Contact.SocialLinks.Any(link =>
                link.Label.Contains("Instagram", StringComparison.OrdinalIgnoreCase) && link.Enabled),
            "Add the approved Instagram profile URL.");
    }

    private static void AddProjectChecks(List<PortfolioReadinessItem> items, string language, PortfolioContent content)
    {
        foreach (var project in content.Projects)
        {
            Add(items, language, $"project.{project.Slug}.case-study", project.CaseStudy.Count > 0,
                $"Add approved case-study content for {project.Title}.");
            Add(items, language, $"project.{project.Slug}.media", project.Media.Count > 0,
                $"Add approved screenshots or videos for {project.Title}.");
        }
    }

    private static void AddResumeChecks(List<PortfolioReadinessItem> items, string language, PortfolioContent content)
    {
        Add(items, language, "resume.pdf", content.Resume.HasPdf,
            "Add the approved resume PDF URL.");
    }

    private static void AddKnowledgeChecks(List<PortfolioReadinessItem> items, string language, PortfolioContent content)
    {
        Add(items, language, "knowledge.channel", !string.IsNullOrWhiteSpace(content.Knowledge.ChannelUrl),
            "Add the approved knowledge-sharing channel URL.");
        Add(items, language, "knowledge.videos", content.Knowledge.Videos.Count(video => video.Enabled) >= 2,
            "Add at least two approved featured videos.");
    }

    private static void Add(
        List<PortfolioReadinessItem> items,
        string language,
        string key,
        bool complete,
        string action)
    {
        items.Add(new PortfolioReadinessItem(language, key, complete, action));
    }
}

public sealed record PortfolioReadinessReport(
    bool IsReady,
    int CompletedChecks,
    int TotalChecks,
    IReadOnlyList<PortfolioReadinessItem> Pending);

public sealed record PortfolioReadinessItem(
    string Language,
    string Key,
    bool Complete,
    string Action);
