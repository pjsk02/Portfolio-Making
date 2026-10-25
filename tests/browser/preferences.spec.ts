import { test, expect, openPage, expectTheme, expectFocusRing, seedPreferences } from "./fixtures";

test("OS theme changes are followed until a keyboard choice is made and saved", { tag: "@compatibility" }, async ({ page, colorScheme }) => {
  const initial = colorScheme === "dark" ? "dark" : "light";
  const opposite = initial === "dark" ? "light" : "dark";
  await openPage(page);
  await expectTheme(page, initial);
  expect(await page.evaluate(() => localStorage.getItem("je-theme"))).toBeNull();
  await page.emulateMedia({ colorScheme: opposite });
  await expectTheme(page, opposite);
  await page.emulateMedia({ colorScheme: initial });
  await expectTheme(page, initial);
  expect(await page.evaluate(() => localStorage.getItem("je-theme"))).toBeNull();

  await page.getByTestId("button-theme").focus();
  await page.keyboard.press("Enter");
  await expectFocusRing(page.getByTestId("button-theme"));
  await expectTheme(page, opposite);
  expect(await page.evaluate(() => localStorage.getItem("je-theme"))).toBe(opposite);
  await page.emulateMedia({ colorScheme: opposite });
  await page.emulateMedia({ colorScheme: initial });
  await expectTheme(page, opposite);
  await page.reload();
  await expectTheme(page, opposite);
});

for (const saved of ["light", "dark"] as const) {
  test(`saved ${saved} wins over preview and changing OS settings`, { tag: "@compatibility" }, async ({ page }) => {
    const opposite = saved === "dark" ? "light" : "dark";
    await seedPreferences(page, { "je-theme": saved });
    await page.emulateMedia({ colorScheme: opposite });
    await openPage(page, `./?theme=${opposite}`);
    await expectTheme(page, saved);
    await page.emulateMedia({ colorScheme: saved });
    await page.emulateMedia({ colorScheme: opposite });
    await expectTheme(page, saved);
    await page.reload();
    await expectTheme(page, saved);
  });
}

test("preview theme is explicit for this visit but not silently saved", async ({ page, colorScheme }) => {
  const preview = colorScheme === "dark" ? "light" : "dark";
  await openPage(page, `./?theme=${preview}`);
  await expectTheme(page, preview);
  await page.emulateMedia({ colorScheme: preview });
  await page.emulateMedia({ colorScheme: preview === "dark" ? "light" : "dark" });
  await expectTheme(page, preview);
  expect(await page.evaluate(() => localStorage.getItem("je-theme"))).toBeNull();
  await page.getByTestId("button-theme").focus();
  await page.keyboard.press("Space");
  await expectTheme(page, preview === "dark" ? "light" : "dark");
  await page.reload();
  await expectTheme(page, preview === "dark" ? "light" : "dark");
});

test("invalid preferences do not become an explicit theme or motion choice", async ({ page, colorScheme }) => {
  await seedPreferences(page, { "je-theme": "sepia", "je-motion": "broken" });
  await openPage(page, "./?theme=invalid");
  const initial = colorScheme === "dark" ? "dark" : "light";
  await expectTheme(page, initial);
  await expect(page.locator("html")).toHaveAttribute("data-motion", "full");
  await page.emulateMedia({ colorScheme: initial === "dark" ? "light" : "dark" });
  await expectTheme(page, initial === "dark" ? "light" : "dark");
});

for (const failure of ["access", "read-and-write", "write-only"] as const) {
  test(`blocked localStorage (${failure}) keeps controls usable for this visit`, async ({ page, colorScheme }) => {
    await page.addInitScript((mode) => {
      const blocked = () => { throw new DOMException("Storage blocked by browser", "SecurityError"); };
      if (mode === "access") {
        Object.defineProperty(window, "localStorage", { configurable: true, get: blocked });
      } else {
        Storage.prototype.setItem = blocked;
        if (mode === "read-and-write") Storage.prototype.getItem = blocked;
      }
    }, failure);
    const initial = colorScheme === "dark" ? "dark" : "light";
    const opposite = initial === "dark" ? "light" : "dark";
    await openPage(page);
    await expectTheme(page, initial);
    await page.emulateMedia({ colorScheme: opposite });
    await expectTheme(page, opposite);
    await page.getByTestId("button-theme").focus();
    await page.keyboard.press("Space");
    await expectTheme(page, initial);
    await page.emulateMedia({ colorScheme: initial });
    await page.emulateMedia({ colorScheme: opposite });
    await expectTheme(page, initial);

    const motion = page.getByTestId("button-workshop-motion");
    await motion.focus();
    await page.keyboard.press("Enter");
    await expect(page.locator("html")).toHaveAttribute("data-motion", "paused");
    await page.reload();
    await expectTheme(page, opposite);
    await expect(page.locator("html")).toHaveAttribute("data-motion", "full");
  });
}
