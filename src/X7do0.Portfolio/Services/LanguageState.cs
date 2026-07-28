using Microsoft.AspNetCore.WebUtilities;
using Microsoft.JSInterop;

namespace X7do0.Portfolio.Services;

public sealed class LanguageState(
    IJSRuntime jsRuntime,
    NavigationManager navigationManager)
{
    private bool _initialized;

    public string Code { get; private set; } = "ar";
    public bool IsArabic => Code == "ar";
    public string Direction => IsArabic ? "rtl" : "ltr";
    public event Action? Changed;

    public async Task InitializeAsync()
    {
        if (_initialized)
        {
            return;
        }

        _initialized = true;

        try
        {
            var requestedLanguage = GetLanguageFromUrl();
            var savedLanguage = await jsRuntime.InvokeAsync<string?>("portfolioLanguage.get");

            Code = requestedLanguage ?? (savedLanguage is "ar" or "en" ? savedLanguage : "ar");

            await jsRuntime.InvokeVoidAsync("portfolioLanguage.set", Code);
            await ApplyToDocumentAsync();
            Changed?.Invoke();
        }
        catch (InvalidOperationException)
        {
            _initialized = false;
        }
        catch (JSDisconnectedException)
        {
            _initialized = false;
        }
    }

    public async Task SetAsync(string languageCode)
    {
        var normalizedCode = languageCode == "en" ? "en" : "ar";
        if (Code == normalizedCode)
        {
            return;
        }

        Code = normalizedCode;
        UpdateLanguageUrl();
        await jsRuntime.InvokeVoidAsync("portfolioLanguage.set", Code);
        await ApplyToDocumentAsync();
        Changed?.Invoke();
    }

    private string? GetLanguageFromUrl()
    {
        var uri = navigationManager.ToAbsoluteUri(navigationManager.Uri);
        var query = QueryHelpers.ParseQuery(uri.Query);
        var requestedLanguage = query["lang"].FirstOrDefault();

        return requestedLanguage is "ar" or "en" ? requestedLanguage : null;
    }

    private void UpdateLanguageUrl()
    {
        var currentUri = navigationManager.ToAbsoluteUri(navigationManager.Uri);
        var builder = new UriBuilder(currentUri)
        {
            Query = Code == "en" ? "lang=en" : string.Empty
        };

        navigationManager.NavigateTo(builder.Uri.ToString(), replace: true);
    }

    private ValueTask ApplyToDocumentAsync() =>
        jsRuntime.InvokeVoidAsync("portfolioLanguage.apply", Code, Direction);
}
