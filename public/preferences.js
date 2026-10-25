/* Apply preferences before the first paint. No network, tracking, or cookies. */
(function () {
  function read(key) {
    try { return window.localStorage.getItem(key); }
    catch (_) { return null; }
  }
  function matches(query) {
    return typeof window.matchMedia === "function" && window.matchMedia(query).matches;
  }
  var root = document.documentElement;
  var savedTheme = read("je-theme");
  // Optional preview links; a visitor's saved preference always takes priority.
  var previewTheme = new URLSearchParams(window.location.search).get("theme");
  var theme = savedTheme === "dark" || savedTheme === "light"
    ? savedTheme
    : previewTheme === "dark" || previewTheme === "light"
      ? previewTheme
      : matches("(prefers-color-scheme: dark)") ? "dark" : "light";
  root.classList.toggle("dark", theme === "dark");
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
  root.dataset.motion = read("je-motion") === "paused" || matches("(prefers-reduced-motion: reduce)")
    ? "paused" : "full";
})();
