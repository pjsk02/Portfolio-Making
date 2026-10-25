import { test, expect, openPage, expectAnchor, expectFocusRing, navigationLink, seedPreferences } from "./fixtures";

test("skip link is the first keyboard stop and moves focus into main", { tag: "@compatibility" }, async ({ page }) => {
  await seedPreferences(page, { "je-motion": "paused" });
  await openPage(page);
  await page.keyboard.press("Tab");
  await expectFocusRing(page.getByTestId("link-skip"));
  await page.keyboard.press("Enter");
  await expect(page.locator("main")).toBeFocused();
  await expect(page).toHaveURL(/#main$/);
});

test("mobile menu Escape closes it and restores the trigger's focus", { tag: "@compatibility" }, async ({ page, viewport }) => {
  test.skip(viewport!.width >= 1024, "Desktop primary navigation has no disclosure menu.");
  await openPage(page);
  const trigger = page.getByTestId("button-menu");
  await expect(trigger).toHaveAttribute("aria-controls", "mobile-nav");
  await trigger.focus();
  await page.keyboard.press("Enter");
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Tab");
  await expect(page.getByTestId("link-mnav-story")).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await expect(page.getByRole("navigation", { name: "Mobile", exact: true })).toHaveCount(0);
  await expectFocusRing(trigger);
  await page.keyboard.press("Space");
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Escape");
  await expectFocusRing(trigger);
});

for (const paused of [false, true]) {
  test(`same-page section links close the menu and focus/scroll with motion ${paused ? "paused" : "on"}`, { tag: "@compatibility" }, async ({ page }) => {
    if (paused) await seedPreferences(page, { "je-motion": "paused" });
    await openPage(page);
    const link = await navigationLink(page, "workshop");
    await link.focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#workshop$/);
    await expect(page.getByTestId("button-menu")).toHaveAttribute("aria-expanded", "false");
    await expectAnchor(page, "workshop", paused ? "instant" : "smooth");
    // A repeated link to the same hash must still restore focus and position.
    const repeated = await navigationLink(page, "workshop");
    await repeated.focus();
    await page.keyboard.press("Enter");
    await expectAnchor(page, "workshop", paused ? "instant" : "smooth");
  });
}

test("direct and encoded hash navigation, reload, and hashchange jump without smooth motion", { tag: "@compatibility" }, async ({ page }) => {
  await openPage(page, "./#station%2D03");
  await expectAnchor(page, "station-03", "instant");
  await page.reload();
  await expectAnchor(page, "station-03", "instant");
  await page.evaluate(() => { window.location.hash = "connections"; });
  await expectAnchor(page, "connections", "instant");
  // Bad or missing fragments must not throw or break the rest of the controls.
  await page.goto("./#%E0%A4%A");
  await expect(page.getByTestId("button-theme")).toBeVisible();
  await page.goto("./#not-a-section");
  await expect(page.getByTestId("button-theme")).toBeVisible();
});

test("cross-route section links and browser Back/Forward restore anchor focus", { tag: "@compatibility" }, async ({ page }) => {
  await seedPreferences(page, { "je-motion": "paused" });
  await openPage(page, "./work");
  const homeSection = await navigationLink(page, "story");
  await homeSection.focus();
  await page.keyboard.press("Enter");
  await expectAnchor(page, "story", "instant");
  const workshop = await navigationLink(page, "workshop");
  await workshop.focus();
  await page.keyboard.press("Enter");
  await expectAnchor(page, "workshop", "instant");
  await page.goBack();
  await expectAnchor(page, "story", "instant");
  await page.goForward();
  await expectAnchor(page, "workshop", "instant");
});

test("plain same-page anchors and OS-reduced navigation move focus without motion", { tag: "@compatibility" }, async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await openPage(page);
  await page.getByTestId("link-route-0").focus();
  await page.keyboard.press("Enter");
  await expectAnchor(page, "station-01", "instant");
  await page.getByTestId("link-next-station-01").focus();
  await page.keyboard.press("Enter");
  await expectAnchor(page, "station-02", "instant");
  const link = await navigationLink(page, "research");
  await link.focus();
  await page.keyboard.press("Enter");
  await expectAnchor(page, "research", "instant");
});
