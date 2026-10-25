import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

// Execute the shipped file, not a second implementation of its precedence rules.
const source = await readFile(new URL("../public/preferences.js", import.meta.url), "utf8");

function bootstrap({
  saved = {}, search = "", dark = false, reduced = false,
  storage = "available", matchMedia = true,
} = {}) {
  const classes = new Set(["dark"]);
  const root = {
    dataset: {},
    style: {},
    classList: {
      toggle(name, on) { if (on) classes.add(name); else classes.delete(name); },
    },
  };
  const window = {
    location: { search },
    get localStorage() {
      if (storage === "blocked-access") throw new Error("SecurityError");
      return {
        getItem(key) {
          if (storage === "blocked-read") throw new Error("SecurityError");
          return saved[key] ?? null;
        },
        setItem() { throw new Error("Bootstrap must not persist inferred preferences"); },
      };
    },
    ...(matchMedia ? {
      matchMedia(query) {
        return { matches: query === "(prefers-color-scheme: dark)" ? dark : reduced };
      },
    } : {}),
  };
  vm.runInNewContext(source, { window, document: { documentElement: root }, URLSearchParams }, { timeout: 100 });
  return {
    theme: root.dataset.theme,
    darkClass: classes.has("dark"),
    colorScheme: root.style.colorScheme,
    motion: root.dataset.motion,
  };
}

const themes = [
  ["OS light by default", {}, "light"],
  ["OS dark by default", { dark: true }, "dark"],
  ["saved light beats dark OS and preview", { dark: true, search: "?theme=dark", saved: { "je-theme": "light" } }, "light"],
  ["saved dark beats light OS and preview", { search: "?theme=light", saved: { "je-theme": "dark" } }, "dark"],
  ["light preview beats dark OS", { dark: true, search: "?theme=light" }, "light"],
  ["dark preview beats light OS", { search: "?theme=dark" }, "dark"],
  ["invalid stored value is ignored", { dark: true, saved: { "je-theme": "sepia" } }, "dark"],
  ["invalid stored value allows preview", { search: "?theme=dark", saved: { "je-theme": "invalid" } }, "dark"],
  ["invalid preview is ignored", { dark: true, search: "?theme=invalid" }, "dark"],
  ["empty preferences are not explicit", { dark: true, search: "?theme=", saved: { "je-theme": "" } }, "dark"],
  ["unavailable matchMedia is safe", { matchMedia: false }, "light"],
  ["saved dark does not need matchMedia", { matchMedia: false, saved: { "je-theme": "dark" } }, "dark"],
];

for (const [name, options, theme] of themes) {
  test(`pre-paint theme: ${name}`, () => {
    assert.deepEqual(bootstrap(options), {
      theme, darkClass: theme === "dark", colorScheme: theme, motion: "full",
    });
  });
}

for (const storage of ["blocked-access", "blocked-read"]) {
  for (const dark of [false, true]) {
    test(`pre-paint ${storage}: uses ${dark ? "dark" : "light"} OS and reduced motion`, () => {
      const theme = dark ? "dark" : "light";
      assert.deepEqual(bootstrap({ storage, dark, reduced: true }), {
        theme, darkClass: dark, colorScheme: theme, motion: "paused",
      });
    });
  }
  test(`pre-paint ${storage}: preview choice still works`, () => {
    assert.equal(bootstrap({ storage, search: "?theme=dark" }).theme, "dark");
  });
}

for (const preference of [undefined, "full", "paused", "invalid"]) {
  for (const reduced of [false, true]) {
    test(`pre-paint motion: saved=${preference ?? "unset"}, OS reduced=${reduced}`, () => {
      const result = bootstrap({ saved: { "je-motion": preference }, reduced });
      assert.equal(result.motion, preference === "paused" || reduced ? "paused" : "full");
    });
  }
}
