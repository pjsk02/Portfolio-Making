import { test, expect, openPage, expectMotion, seedPreferences } from "./fixtures";

test("motion switches share a saved pause, stop CSS loops, and leave controls working", async ({ page }) => {
  await openPage(page, "./#workshop");
  await expectMotion(page, false);
  const workshop = page.locator("svg.workshop");
  await workshop.scrollIntoViewIfNeeded();
  await expect(workshop).toHaveAttribute("data-active", "true");
  await expect(workshop.locator(".bob").first()).toHaveCSS("animation-play-state", "running");

  const motion = page.getByTestId("button-workshop-motion");
  await motion.focus();
  await page.keyboard.press("Space");
  await expectMotion(page, true);
  await expect(workshop.locator(".bob").first()).toHaveCSS("animation-play-state", "paused");
  await expect(page.locator(".ambient .w1").first()).toHaveCSS("animation-play-state", "paused");
  await expect(page.locator("html")).toHaveCSS("scroll-behavior", "auto");
  await expect(page.locator(".reveal").first()).toHaveCSS("opacity", "1");
  expect(await page.evaluate(() => localStorage.getItem("je-motion"))).toBe("paused");

  await page.getByRole("radio", { name: "Brief", exact: true }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(workshop).toHaveAttribute("data-stage", "read");
  await page.reload();
  await expectMotion(page, true);
  const footer = page.getByTestId("button-footer-motion");
  await footer.focus();
  await page.keyboard.press("Enter");
  await expectMotion(page, false);
  expect(await page.evaluate(() => localStorage.getItem("je-motion"))).toBe("full");
  await page.reload();
  await expectMotion(page, false);
});

for (const saved of ["full", "paused"] as const) {
  test(`OS reduced motion overrides saved ${saved} without overwriting user intent`, async ({ page }) => {
    await seedPreferences(page, { "je-motion": saved });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await openPage(page, "./#workshop");
    await expectMotion(page, true, true);
    await expect(page.locator(".workshop .bob").first()).toHaveCSS("animation-name", "none");
    await expect(page.locator(".reveal").first()).toHaveCSS("opacity", "1");
    await expect(page.locator("html")).toHaveCSS("scroll-behavior", "auto");
    expect(await page.evaluate(() => localStorage.getItem("je-motion"))).toBe(saved);
    // Disabled switches must not let a visitor override the OS request.
    await page.getByTestId("button-workshop-motion").evaluate((el) => (el as HTMLButtonElement).click());
    await expectMotion(page, true, true);
    expect(await page.evaluate(() => localStorage.getItem("je-motion"))).toBe(saved);

    await page.emulateMedia({ reducedMotion: "no-preference" });
    await expectMotion(page, saved === "paused");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expectMotion(page, true, true);
    await page.reload();
    await expectMotion(page, true, true);
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await expectMotion(page, saved === "paused");
  });
}

test("an OS-only reduced-motion preference is not mistaken for a saved pause", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await openPage(page);
  await expectMotion(page, true, true);
  expect(await page.evaluate(() => localStorage.getItem("je-motion"))).toBeNull();
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expectMotion(page, false);
  expect(await page.evaluate(() => localStorage.getItem("je-motion"))).toBeNull();
});

test("decorative loops pause offscreen and on visibilitychange without changing preferences", async ({ page }) => {
  await openPage(page, "./#workshop");
  const workshop = page.locator("svg.workshop");
  const bob = workshop.locator(".bob").first();
  await workshop.scrollIntoViewIfNeeded();
  await expect(workshop).toHaveAttribute("data-active", "true");
  await expect(bob).toHaveCSS("animation-play-state", "running");
  // Headless tabs don't reliably background one another. Deliver the browser's
  // visibility event deterministically; verify the real provider and CSS result.
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", { configurable: true, get: () => true });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(page.locator("html")).toHaveAttribute("data-hidden", "true");
  await expect(bob).toHaveCSS("animation-play-state", "paused");
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", { configurable: true, get: () => false });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(bob).toHaveCSS("animation-play-state", "running");
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await expect(workshop).toHaveAttribute("data-active", "false");
  await expect(bob).toHaveCSS("animation-play-state", "paused");
  expect(await page.evaluate(() => localStorage.getItem("je-motion"))).toBeNull();
});
