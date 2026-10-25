import type { Page } from "@playwright/test";
import { test, expect, openPage, seedPreferences } from "./fixtures";

async function expectFits(page: Page) {
  await page.evaluate(() => document.fonts.ready);
  expect(await page.evaluate(() => ({
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    clippedHeadings: [...document.querySelectorAll<HTMLElement>("h1,h2,h3")]
      .filter((el) => el.getClientRects().length && el.scrollWidth > el.clientWidth + 1)
      .map((el) => el.textContent),
  }))).toEqual({ overflow: 0, clippedHeadings: [] });
}

async function responsiveJourney(page: Page) {
  await openPage(page);
  await expectFits(page);
  const width = page.viewportSize()!.width;

  if (width < 1024) {
    for (let station = 1; station <= 5; station++) {
      const link = page.getByTestId(`link-station-0${station}`);
      await expect(link).toBeVisible();
      const box = (await link.boundingBox())!;
      expect(box.width).toBeGreaterThanOrEqual(44);
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
    await page.getByTestId("link-station-02").click();
    await expect(page.getByTestId("link-station-02")).toHaveAttribute("aria-current", "step");
    expect(await page.locator(".workshop-grid").evaluate((el) =>
      getComputedStyle(el).gridTemplateColumns.split(" ").length,
    )).toBe(1);
  }

  expect(await page.locator(".rag-flow").evaluate((el) =>
    getComputedStyle(el).gridTemplateColumns.split(" ").length,
  )).toBe(width < 640 ? 1 : width < 1280 ? 3 : 7);

  await page.getByTestId("button-field-energy").click();
  await expect(page.getByTestId("button-field-energy")).toHaveAttribute("aria-pressed", "true");
  if (width < 1024) {
    const card = (await page.getByTestId("button-field-energy").boundingBox())!;
    const panel = (await page.getByTestId("panel-connections-hub").boundingBox())!;
    expect(panel.y).toBeGreaterThanOrEqual(card.y + card.height);
  }
  await expectFits(page);

  if (width < 1024) {
    await page.getByTestId("button-menu").click();
    const menu = page.locator("#mobile-nav");
    const bounds = (await menu.boundingBox())!;
    expect(bounds.y + bounds.height).toBeLessThanOrEqual(page.viewportSize()!.height + 1);
    await page.getByTestId("link-mnav-contact").click();
    await expect(menu).not.toBeVisible();
    await expect(page.locator("#contact")).toBeFocused();
  }

  await openPage(page, "./work");
  await expectFits(page);
  for (const button of await page.getByRole("group", { name: "Filter projects" }).getByRole("button").all()) {
    expect((await button.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  }

  await openPage(page, "./work/airline-system");
  await expectFits(page);
  const image = page.locator("article > img");
  await image.scrollIntoViewIfNeeded();
  await expect.poll(() => image.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
  expect(await image.evaluate((el: HTMLImageElement) => el.currentSrc)).toContain("/images/responsive/airline-");
}

test("responsive reading and navigation fit the configured viewport", async ({ page }) => {
  await seedPreferences(page, { "je-motion": "paused" });
  await responsiveJourney(page);
});

test("tablet and landscape layouts keep controls and evidence usable", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-light", "One explicit viewport matrix; other projects cover their own size and theme.");
  test.setTimeout(90_000);
  await seedPreferences(page, { "je-motion": "paused" });
  for (const viewport of [
    { width: 360, height: 800 },
    { width: 768, height: 1024 },
    { width: 820, height: 1180 },
    { width: 1024, height: 768 },
    { width: 844, height: 390 },
  ]) {
    await test.step(`${viewport.width} × ${viewport.height}`, async () => {
      await page.setViewportSize(viewport);
      await responsiveJourney(page);
    });
  }
});
