using Microsoft.JSInterop;

namespace X7do0.Portfolio.Services;

public sealed class LanguageState(IJSRuntime jsRuntime)
{
    private bool _initialized;
    public string Code { get; private set; } = "ar";
    public bool IsArabic => Code == "ar";
    public string Direction => IsArabic ? "rtl" : "ltr";
    public event Action? Changed;

    public async Task InitializeAsync()
    {
        if (_initialized) return;
        _initialized = true;
        try
        {
            var savedLanguage = await jsRuntime.InvokeAsync<string?>("portfolioLanguage.get");
            if (savedLanguage is "ar" or "en") Code = savedLanguage;
            await ApplyToDocumentAsync();
            Changed?.Invoke();
        }
        catch (InvalidOperationException) { _initialized = false; }
        catch (JSDisconnectedException) { _initialized = false; }
    }

    public async Task SetAsync(string languageCode)
    {
        var normalizedCode = languageCode == "en" ? "en" : "ar";
        if (Code == normalizedCode) return;
        Code = normalizedCode;
        await jsRuntime.InvokeVoidAsync("portfolioLanguage.set", Code);
        await ApplyToDocumentAsync();
        Changed?.Invoke();
    }

    private ValueTask ApplyToDocumentAsync() => jsRuntime.InvokeVoidAsync("portfolioLanguage.apply", Code, Direction);
}
