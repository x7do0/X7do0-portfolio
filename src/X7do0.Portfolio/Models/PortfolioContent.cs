namespace X7do0.Portfolio.Models;

public sealed class PortfolioContent
{
    public BrandContent Brand { get; init; } = new();
    public HeroContent Hero { get; init; } = new();
    public ProjectsSectionContent ProjectsSection { get; init; } = new();
    public List<ProjectContent> Projects { get; init; } = [];
    public SkillsSectionContent SkillsSection { get; init; } = new();
    public TechnologiesSectionContent TechnologiesSection { get; init; } = new();
    public EducationContent Education { get; init; } = new();
    public KnowledgeContent Knowledge { get; init; } = new();
    public ContactContent Contact { get; init; } = new();
}

public sealed class BrandContent { public string Name { get; init; } = string.Empty; public string Role { get; init; } = string.Empty; }
public sealed class HeroContent { public string Eyebrow { get; init; } = string.Empty; public string Title { get; init; } = string.Empty; public string Description { get; init; } = string.Empty; public string PrimaryAction { get; init; } = string.Empty; public string SecondaryAction { get; init; } = string.Empty; public List<string> ProofItems { get; init; } = []; }
public sealed class ProjectsSectionContent { public string Eyebrow { get; init; } = string.Empty; public string Title { get; init; } = string.Empty; public string Description { get; init; } = string.Empty; public string FeaturedLabel { get; init; } = string.Empty; public string ProjectLabel { get; init; } = string.Empty; }
public sealed class ProjectContent { public string Slug { get; init; } = string.Empty; public string Title { get; init; } = string.Empty; public string Summary { get; init; } = string.Empty; public bool Featured { get; init; } public string Cta { get; init; } = string.Empty; }
public sealed class SkillsSectionContent { public string Eyebrow { get; init; } = string.Empty; public string Title { get; init; } = string.Empty; public List<string> Items { get; init; } = []; }
public sealed class TechnologiesSectionContent { public string Eyebrow { get; init; } = string.Empty; public string Title { get; init; } = string.Empty; public string Description { get; init; } = string.Empty; public List<TechnologyGroup> Groups { get; init; } = []; }
public sealed class TechnologyGroup { public string Title { get; init; } = string.Empty; public List<string> Items { get; init; } = []; }
public sealed class EducationContent { public string Eyebrow { get; init; } = string.Empty; public string Title { get; init; } = string.Empty; public string Description { get; init; } = string.Empty; public string Institution { get; init; } = string.Empty; }
public sealed class KnowledgeContent { public string Eyebrow { get; init; } = string.Empty; public string Title { get; init; } = string.Empty; public string Description { get; init; } = string.Empty; public string Action { get; init; } = string.Empty; public string PendingLabel { get; init; } = string.Empty; }
public sealed class ContactContent { public string Eyebrow { get; init; } = string.Empty; public string Title { get; init; } = string.Empty; public string Description { get; init; } = string.Empty; public string EmailAction { get; init; } = string.Empty; public string LinkedInAction { get; init; } = string.Empty; public List<string> SocialLinks { get; init; } = []; }
