window.portfolioLanguage = {
    get: function () { return window.localStorage.getItem("x7do0-language"); },
    set: function (language) { window.localStorage.setItem("x7do0-language", language); },
    apply: function (language, direction) {
        document.documentElement.lang = language;
        document.documentElement.dir = direction;
        document.body.dir = direction;
    }
};

document.addEventListener("click", function (event) {
    if (event.target.matches("#blazor-error-ui .dismiss")) {
        document.getElementById("blazor-error-ui").style.display = "none";
    }
});
