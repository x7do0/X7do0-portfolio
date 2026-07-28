using System.Security;
using System.Text;
using X7do0.Portfolio.Components;
using X7do0.Portfolio.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services
    .AddRazorComponents()
    .AddInteractiveServerComponents();

builder.Services.AddResponseCompression(options =>
{
    options.EnableForHttps = true;
});

builder.Services.AddScoped<LanguageState>();
builder.Services.AddSingleton<PortfolioContentService>();

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseHsts();
}

app.UseResponseCompression();
app.UseHttpsRedirection();

app.Use(async (context, next) =>
{
    context.Response.Headers["X-Content-Type-Options"] = "nosniff";
    context.Response.Headers["X-Frame-Options"] = "DENY";
    context.Response.Headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
    context.Response.Headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()";

    await next();
});

app.UseStaticFiles();
app.UseAntiforgery();

app.MapGet("/robots.txt", (HttpRequest request) =>
{
    var origin = $"{request.Scheme}://{request.Host}";
    var body = $"User-agent: *\nAllow: /\nSitemap: {origin}/sitemap.xml\n";
    return Results.Text(body, "text/plain", Encoding.UTF8);
});

app.MapGet("/sitemap.xml", async (HttpRequest request, PortfolioContentService contentService) =>
{
    var content = await contentService.LoadAsync("ar");
    var origin = $"{request.Scheme}://{request.Host}";
    var paths = new List<string> { "/", "/resume" };
    paths.AddRange(content.Projects.Select(project => $"/projects/{project.Slug}"));

    var urls = string.Join(
        Environment.NewLine,
        paths.Select(path => $"  <url><loc>{SecurityElement.Escape(origin + path)}</loc></url>"));

    var xml = $"<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n{urls}\n</urlset>";
    return Results.Text(xml, "application/xml", Encoding.UTF8);
});

app.MapRazorComponents<App>()
    .AddInteractiveServerRenderMode();

app.Run();
