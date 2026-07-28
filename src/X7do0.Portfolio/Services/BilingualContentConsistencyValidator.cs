using X7do0.Portfolio.Models;

namespace X7do0.Portfolio.Services;

public static class BilingualContentConsistencyValidator
{
    public static IReadOnlyList<string> Validate(
        PortfolioContent arabic,
        PortfolioContent english)
    {
        var errors = new List<string>();

        CompareSequence(
            arabic.HomeSections,
            english.HomeSections,
            "homeSections",
            errors);

        CompareCount(
            arabic.SkillsSection.Items.Count,
            english.SkillsSection.Items.Count,
            "skillsSection.items",
            errors);

        CompareCount(
            arabic.TechnologiesSection.Groups.Count,
            english.TechnologiesSection.Groups.Count,
            "technologiesSection.groups",
            errors);

        CompareSequence(
            arabic.Contact.PrimaryLinks.Select(link => link.Id),
            english.Contact.PrimaryLinks.Select(link => link.Id),
            "contact.primaryLinks ids",
            errors);

        CompareSequence(
            arabic.Contact.SocialLinks.Select(link => link.Id),
            english.Contact.SocialLinks.Select(link => link.Id),
            "contact.socialLinks ids",
            errors);

        CompareProjects(arabic.Projects, english.Projects, errors);

        return errors;
    }

    private static void CompareProjects(
        IReadOnlyList<ProjectContent> arabicProjects,
        IReadOnlyList<ProjectContent> englishProjects,
        ICollection<string> errors)
    {
        CompareCount(
            arabicProjects.Count,
            englishProjects.Count,
            "projects",
            errors);

        var maxCount = Math.Min(arabicProjects.Count, englishProjects.Count);
        for (var index = 0; index < maxCount; index++)
        {
            var arabic = arabicProjects[index];
            var english = englishProjects[index];
            var path = $"projects[{index}]";

            if (!string.Equals(arabic.Slug, english.Slug, StringComparison.OrdinalIgnoreCase))
            {
                errors.Add($"{path}.slug differs: '{arabic.Slug}' vs '{english.Slug}'");
                continue;
            }

            if (!string.Equals(arabic.PreviewKind, english.PreviewKind, StringComparison.OrdinalIgnoreCase))
            {
                errors.Add($"project '{arabic.Slug}' previewKind differs between languages");
            }

            CompareSequence(
                arabic.CaseStudy.Select(section => section.Id),
                english.CaseStudy.Select(section => section.Id),
                $"project '{arabic.Slug}' caseStudy ids",
                errors);

            CompareCount(
                arabic.Media.Count,
                english.Media.Count,
                $"project '{arabic.Slug}' media",
                errors);
        }
    }

    private static void CompareCount(
        int arabicCount,
        int englishCount,
        string path,
        ICollection<string> errors)
    {
        if (arabicCount != englishCount)
        {
            errors.Add($"{path} count differs: Arabic={arabicCount}, English={englishCount}");
        }
    }

    private static void CompareSequence(
        IEnumerable<string> arabicValues,
        IEnumerable<string> englishValues,
        string path,
        ICollection<string> errors)
    {
        var arabic = arabicValues.ToArray();
        var english = englishValues.ToArray();

        if (!arabic.SequenceEqual(english, StringComparer.OrdinalIgnoreCase))
        {
            errors.Add($"{path} order or identifiers differ between languages");
        }
    }
}