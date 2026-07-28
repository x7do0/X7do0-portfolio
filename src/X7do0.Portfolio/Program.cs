using System.Security;
using System.Text;
using Microsoft.AspNetCore.HttpOverrides;
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

var trustForwardedHeaders = builder.Configuration.GetValue<bool>("Hosting:TrustForwardedHeaders");
if (trustForwardedHeaders)
{
    builder.Services.Configure<ForwardedHeadersOptions>(options =>
    {
        options.ForwardedHeaders = ForwardedHeaders.XForwardedFor |
                                   ForwardedHeaders.XForwardedProto |
                                   ForwardedHeaders.XForwardedHost;
        options.ForwardLimit = 1;
        options.KnownNetworks.Clear();
        options.KnownProxies.Clear();
    });
}

builder.Services.AddScoped<LanguageState>();
builder.Services.AddSingleton<PortfolioContentService>();
builder.Services.AddHealthChecks()
    .AddCheck<PortfolioContentHealthCheck>("portfolio-content");

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseHsts();
}

if (trustForwardedHeaders)
{
    app.UseForwardedHeaders();
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

app.MapHealthChecks("/healthz");

app.MapGet("/robots.txt", (HttpRequest request, HttpResponse response) =>
{
    response.Headers.CacheControl = "public,max-age=3600";
    var origin = GetPublicOrigin(request);
    var body = $"User-agent: *\nAllow: /\nSitemap: {origin}/sitemap.xml\n";
    return Results.Text(body, "text/plain", Encoding.UTF8);
});

app.MapGet("/sitemap.xml", async (
    HttpRequest request,
    HttpResponse response,
    PortfolioContentService contentService) =>
{
    response.Headers.CacheControl = "public,max-age=3600";

    var content = await contentService.LoadAsync("ar");
    var origin = GetPublicOrigin(request);
    var paths = new List<string> { "/", "/resume" };
    paths.AddRange(content.Projects.Select(project => $"/projects/{project.Slug}"));

    var urls = string.Join(
        Environment.NewLine,
        paths.Distinct(StringComparer.OrdinalIgnoreCase)
            .Select(path => $"  <url><loc>{SecurityElement.Escape(origin + path)}</loc></url>"));

    var xml = $"<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n{urls}\n</urlset>";
    return Results.Text(xml, "application/xml", Encoding.UTF8);
});

app.MapRazorComponents<App>()
    .AddInteractiveServerRenderMode();

app.Run();

static string GetPublicOrigin(HttpRequest request)
{
    var host = request.Host;
    if (!host.HasValue)
    {
        throw new InvalidOperationException("The request host is unavailable.");
    }

    var builder = new UriBuilder(request.Scheme, host.Host)
    {
        Port = host.Port ?? -1
    };

    return builder.Uri.GetLeftPart(UriPartial.Authority).TrimEnd('/');
}
