import { test as base, expect, type Page, type Locator } from "@playwright/test";

declare global {
  interface Window {
    __portfolioScrollCalls: { id: string; behavior?: ScrollBehavior }[];
  }
}

// Every test gets a fresh browser context from Playwright. Capture real browser
// failures without bypassing the CSP, faking application state, or using sleeps.
export const test = base.extend<{ browserHealth: void }>({
  browserHealth: [async ({ page, baseURL }, use) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    page.on("request", (request) => {
      if (/^https?:/.test(request.url()) && new URL(request.url()).origin !== new URL(baseURL!).origin) {
        errors.push(`Unexpected third-party request: ${request.url()}`);
      }
    });
    await page.addInitScript(() => {
      window.__portfolioScrollCalls = [];
      const scroll = Element.prototype.scrollIntoView;
      Element.prototype.scrollIntoView = function (options) {
        window.__portfolioScrollCalls.push({
          id: this.id,
          behavior: typeof options === "object" ? options.behavior : undefined,
        });
        return scroll.call(this, options);
      };
      document.addEventListener("securitypolicyviolation", (event) => {
        console.error(`CSP violation: ${event.violatedDirective} ${event.blockedURI}`);
      });
    });
    await use();
    expect(errors, "Uncaught errors, console errors, external requests, and CSP violations").toEqual([]);
  }, { auto: true }],
});
export { expect };

export async function seedPreferences(page: Page, values: Record<string, string>) {
  // Seed once, before bootstrap. A reload must read what the app actually saved,
  // rather than an init script silently restoring the initial test value.
  await page.addInitScript((preferences) => {
    if (sessionStorage.getItem("portfolio-test-seeded")) return;
    for (const [key, value] of Object.entries(preferences)) localStorage.setItem(key, value);
    sessionStorage.setItem("portfolio-test-seeded", "true");
  }, values);
}

export async function openPage(page: Page, path = "./") {
  await page.goto(path);
  await expect(page.getByTestId("button-theme")).toBeVisible();
  // This is set by a mounted provider effect: avoid interacting before listeners.
  await expect(page.locator("html")).toHaveAttribute("data-hidden", "false");
}

export async function expectTheme(page: Page, theme: "light" | "dark") {
  const root = page.locator("html");
  await expect(root).toHaveAttribute("data-theme", theme);
  await expect(root).toHaveCSS("color-scheme", theme);
  expect(await root.evaluate((el) => el.classList.contains("dark"))).toBe(theme === "dark");
  await expect(page.getByTestId("button-theme")).toHaveAttribute("aria-pressed", String(theme === "dark"));
  await expect(page.getByTestId("button-theme")).toHaveAccessibleName(
    theme === "dark" ? "Dark theme on. Switch to light theme" : "Light theme on. Switch to dark theme",
  );
}

export async function expectMotion(page: Page, paused: boolean, system = false) {
  await expect(page.locator("html")).toHaveAttribute("data-motion", paused ? "paused" : "full");
  for (const id of ["button-workshop-motion", "button-connections-motion", "button-footer-motion"]) {
    const control = page.getByTestId(id);
    await expect(control).toHaveAttribute("aria-checked", String(!paused));
    if (system) await expect(control).toBeDisabled();
    else await expect(control).toBeEnabled();
    await expect(control).toHaveAccessibleName(system
      ? "Decorative animations off: your device requests reduced motion"
      : "Decorative animations");
  }
}

export async function expectFocusRing(control: Locator, ring: Locator = control) {
  await expect(control).toBeFocused();
  await expect.poll(() => control.evaluate((el) => el.matches(":focus-visible"))).toBe(true);
  await expect(ring).toBeVisible();
  await expect(ring).toHaveCSS("outline-style", "solid");
  await expect(ring).not.toHaveCSS("outline-color", /^(transparent|rgba\([^)]*,\s*0\))$/);
  expect(await ring.evaluate((el) => Number.parseFloat(getComputedStyle(el).outlineWidth))).toBeGreaterThanOrEqual(2);
}

export async function expectAnchor(page: Page, id: string, behavior: ScrollBehavior) {
  const target = page.locator(`[id="${id}"]`);
  await expect(target).toBeFocused();
  await expect(target).toHaveAttribute("data-scroll-target", "");
  await expect.poll(() => page.evaluate((targetId) => {
    return window.__portfolioScrollCalls.filter((call) => call.id === targetId).at(-1)?.behavior;
  }, id)).toBe(behavior);
  // Check actual geometry, not just the hash. Targets must clear the sticky nav.
  await expect.poll(() => page.evaluate((targetId) => {
    const top = document.getElementById(targetId)!.getBoundingClientRect().top;
    const headerBottom = document.querySelector("header")!.getBoundingClientRect().bottom;
    return {
      top,
      headerBottom,
      // 64px scroll margins sit beside a 64px header plus its 1px border.
      // Allow that border and subpixel rounding, not an obscured heading.
      clearsHeader: top >= headerBottom - 2,
      inViewport: top < window.innerHeight,
    };
  }, id), { message: `${id} must land below the sticky header and inside the viewport` })
    .toMatchObject({ clearsHeader: true, inViewport: true });
}

export async function navigationLink(page: Page, section: string) {
  const menu = page.getByTestId("button-menu");
  if (await menu.isVisible()) {
    await menu.focus();
    await page.keyboard.press("Enter");
    await expect(menu).toHaveAttribute("aria-expanded", "true");
    return page.getByTestId(`link-mnav-${section}`);
  }
  return page.getByTestId(`link-nav-${section}`);
}
