namespace X7do0.Portfolio.Models;

public sealed class PortfolioContent
{
    public BrandContent Brand { get; init; } = new();
    public List<string> HomeSections { get; init; } = ["projects", "skills", "technologies", "education", "knowledge", "contact"];
    public HeroContent Hero { get; init; } = new();
    public ProjectsSectionContent ProjectsSection { get; init; } = new();
    public List<ProjectContent> Projects { get; init; } = [];
    public SkillsSectionContent SkillsSection { get; init; } = new();
    public TechnologiesSectionContent TechnologiesSection { get; init; } = new();
    public EducationContent Education { get; init; } = new();
    public KnowledgeContent Knowledge { get; init; } = new();
    public ContactContent Contact { get; init; } = new();
    public ProjectPageContent ProjectPage { get; init; } = new();
    public ResumeContent Resume { get; init; } = new();
}

public sealed class BrandContent { public string Name { get; init; } = string.Empty; public string Role { get; init; } = string.Empty; }
public sealed class HeroContent { public string Eyebrow { get; init; } = string.Empty; public string Title { get; init; } = string.Empty; public string Description { get; init; } = string.Empty; public string PrimaryAction { get; init; } = string.Empty; public string SecondaryAction { get; init; } = string.Empty; public List<string> ProofItems { get; init; } = []; }
public sealed class ProjectsSectionContent { public string Eyebrow { get; init; } = string.Empty; public string Title { get; init; } = string.Empty; public string Description { get; init; } = string.Empty; public string FeaturedLabel { get; init; } = string.Empty; public string ProjectLabel { get; init; } = string.Empty; }

public sealed class ProjectContent
{
    public string Slug { get; init; } = string.Empty;
    public string Title { get; init; } = string.Empty;
    public string Summary { get; init; } = string.Empty;
    public bool Featured { get; init; }
    public string PreviewKind { get; init; } = "generic";
    public string Cta { get; init; } = string.Empty;
    public List<ProjectMediaContent> Media { get; init; } = [];
    public List<ProjectCaseStudySection> CaseStudy { get; init; } = [];
}

public sealed class ProjectMediaContent
{
    public string Type { get; init; } = "image";
    public string Url { get; init; } = string.Empty;
    public string ThumbnailUrl { get; init; } = string.Empty;
    public string Alt { get; init; } = string.Empty;
    public string Caption { get; init; } = string.Empty;
    public bool IsVideo => string.Equals(Type, "video", StringComparison.OrdinalIgnoreCase);
}

public sealed class ProjectCaseStudySection
{
    public string Id { get; init; } = string.Empty;
    public string Eyebrow { get; init; } = string.Empty;
    public string Title { get; init; } = string.Empty;
    public List<string> Paragraphs { get; init; } = [];
    public List<string> Items { get; init; } = [];
    public bool Wide { get; init; }
}

public sealed class SkillsSectionContent { public string Eyebrow { get; init; } = string.Empty; public string Title { get; init; } = string.Empty; public List<string> Items { get; init; } = []; }
public sealed class TechnologiesSectionContent { public string Eyebrow { get; init; } = string.Empty; public string Title { get; init; } = string.Empty; public string Description { get; init; } = string.Empty; public List<TechnologyGroup> Groups { get; init; } = []; }
public sealed class TechnologyGroup { public string Title { get; init; } = string.Empty; public List<string> Items { get; init; } = []; }
public sealed class EducationContent { public string Eyebrow { get; init; } = string.Empty; public string Title { get; init; } = string.Empty; public string Description { get; init; } = string.Empty; public string Institution { get; init; } = string.Empty; }

public sealed class KnowledgeContent
{
    public string Eyebrow { get; init; } = string.Empty;
    public string Title { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public string Action { get; init; } = string.Empty;
    public string PendingLabel { get; init; } = string.Empty;
    public string ChannelUrl { get; init; } = string.Empty;
    public List<VideoContent> Videos { get; init; } = [];
}

public sealed class VideoContent { public string Title { get; init; } = string.Empty; public string Url { get; init; } = string.Empty; public string ThumbnailUrl { get; init; } = string.Empty; public bool Enabled => !string.IsNullOrWhiteSpace(Url); }
public sealed class ContactContent { public string Eyebrow { get; init; } = string.Empty; public string Title { get; init; } = string.Empty; public string Description { get; init; } = string.Empty; public List<ContactLinkContent> PrimaryLinks { get; init; } = []; public List<ContactLinkContent> SocialLinks { get; init; } = []; }
public sealed class ContactLinkContent { public string Id { get; init; } = string.Empty; public string Label { get; init; } = string.Empty; public string Url { get; init; } = string.Empty; public string Kind { get; init; } = "secondary"; public bool Enabled => !string.IsNullOrWhiteSpace(Url); }

public sealed class ProjectPageContent
{
    public string BackAction { get; init; } = string.Empty;
    public string OverviewTitle { get; init; } = string.Empty;
    public string PreviewTitle { get; init; } = string.Empty;
    public string MediaTitle { get; init; } = string.Empty;
    public string DetailsTitle { get; init; } = string.Empty;
    public string DetailsPending { get; init; } = string.Empty;
    public string NotFoundTitle { get; init; } = string.Empty;
    public string NotFoundDescription { get; init; } = string.Empty;
}

public sealed class ResumeContent
{
    public string Eyebrow { get; init; } = string.Empty;
    public string Title { get; init; } = string.Empty;
    public string Intro { get; init; } = string.Empty;
    public string EducationTitle { get; init; } = string.Empty;
    public string SkillsTitle { get; init; } = string.Empty;
    public string TechnologiesTitle { get; init; } = string.Empty;
    public string ProjectsTitle { get; init; } = string.Empty;
    public string ViewLabel { get; init; } = string.Empty;
    public string DownloadLabel { get; init; } = string.Empty;
    public string DownloadPending { get; init; } = string.Empty;
    public string PdfUrl { get; init; } = string.Empty;
    public bool HasPdf => !string.IsNullOrWhiteSpace(PdfUrl);
}