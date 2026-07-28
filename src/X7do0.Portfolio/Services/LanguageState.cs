using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Routing;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.JSInterop;

namespace X7do0.Portfolio.Services;

public sealed class LanguageState : IDisposable
{
    private readonly IJSRuntime _jsRuntime;
    private readonly NavigationManager _navigationManager;
    private bool _initialized;
    private bool _updatingUrl;

    public LanguageState(
        IJSRuntime jsRuntime,
        NavigationManager navigationManager)
    {
        _jsRuntime = jsRuntime;
        _navigationManager = navigationManager;
        _navigationManager.LocationChanged += HandleLocationChanged;
    }

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
            var savedLanguage = await _jsRuntime.InvokeAsync<string?>("portfolioLanguage.get");

            Code = requestedLanguage ?? (savedLanguage is "ar" or "en" ? savedLanguage : "ar");

            EnsureLanguageUrl();
            await _jsRuntime.InvokeVoidAsync("portfolioLanguage.set", Code);
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
        await _jsRuntime.InvokeVoidAsync("portfolioLanguage.set", Code);
        await ApplyToDocumentAsync();
        Changed?.Invoke();
    }

    private string? GetLanguageFromUrl()
    {
        var uri = _navigationManager.ToAbsoluteUri(_navigationManager.Uri);
        var query = QueryHelpers.ParseQuery(uri.Query);
        var requestedLanguage = query["lang"].FirstOrDefault();

        return requestedLanguage is "ar" or "en" ? requestedLanguage : null;
    }

    private void HandleLocationChanged(object? sender, LocationChangedEventArgs args)
    {
        if (!_initialized || _updatingUrl)
        {
            return;
        }

        EnsureLanguageUrl();
    }

    private void EnsureLanguageUrl()
    {
        var requestedLanguage = GetLanguageFromUrl();
        var urlMatchesLanguage = Code == "en"
            ? requestedLanguage == "en"
            : requestedLanguage is null or "ar";

        if (!urlMatchesLanguage)
        {
            UpdateLanguageUrl();
        }
    }

    private void UpdateLanguageUrl()
    {
        var currentUri = _navigationManager.ToAbsoluteUri(_navigationManager.Uri);
        var builder = new UriBuilder(currentUri)
        {
            Query = Code == "en" ? "lang=en" : string.Empty
        };

        _updatingUrl = true;
        try
        {
            _navigationManager.NavigateTo(builder.Uri.ToString(), replace: true);
        }
        finally
        {
            _updatingUrl = false;
        }
    }

    private ValueTask ApplyToDocumentAsync() =>
        _jsRuntime.InvokeVoidAsync("portfolioLanguage.apply", Code, Direction);

    public void Dispose() =>
        _navigationManager.LocationChanged -= HandleLocationChanged;
}
