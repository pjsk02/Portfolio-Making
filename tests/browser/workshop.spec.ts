import { test, expect, openPage, expectFocusRing, seedPreferences } from "./fixtures";

test("workshop radios and human review work with Tab, arrows, Space, and Enter", async ({ page }) => {
  await seedPreferences(page, { "je-motion": "paused" });
  await openPage(page, "./#workshop");
  const workshop = page.getByTestId("workshop");
  const illustration = workshop.getByRole("img");
  const radios = workshop.getByRole("radio");
  await expect(radios).toHaveCount(4);
  await expect(workshop.getByRole("group", { name: "Turn Je's dial" })).toBeVisible();

  // Enter the group through sequential keyboard navigation, not a mouse click.
  await page.getByTestId("button-workshop-motion").focus();
  await page.keyboard.press("Tab");
  const brief = workshop.getByRole("radio", { name: "Brief", exact: true });
  await expect(brief).toBeFocused();
  await expect(brief).toBeChecked();
  const stages = [
    { key: "ArrowRight", stage: "read", label: "Read", agent: "Reader" },
    { key: "ArrowDown", stage: "link", label: "Link", agent: "Linker" },
    { key: "ArrowRight", stage: "check", label: "Check", agent: "Checker" },
    { key: "ArrowDown", stage: "brief", label: "Brief", agent: "Je, at the console" },
    { key: "ArrowLeft", stage: "check", label: "Check", agent: "Checker" },
    { key: "ArrowUp", stage: "link", label: "Link", agent: "Linker" },
    { key: "ArrowRight", stage: "check", label: "Check", agent: "Checker" },
  ];
  for (const { key, stage, label, agent } of stages) {
    await page.keyboard.press(key);
    const radio = workshop.getByRole("radio", { name: label, exact: true });
    await expect(radio).toBeFocused();
    await expect(radio).toBeChecked();
    await expect(workshop.locator('input[type="radio"]:checked')).toHaveCount(1);
    await expect(illustration).toHaveAttribute("data-stage", stage);
    await expect(page.getByTestId("text-workshop-explain")).toContainText(agent);
    // The actual radio is visually hidden; its label must show keyboard focus.
    const labelElement = radio.locator("..");
    await expect(labelElement).toHaveCSS("outline-style", "solid");
    expect(await labelElement.evaluate((el) => parseFloat(getComputedStyle(el).outlineWidth))).toBeGreaterThanOrEqual(2);
    expect((await labelElement.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  }
  await expect(page.getByTestId("text-workshop-explain")).toHaveAttribute("aria-live", "polite");
  await page.keyboard.press("Tab");
  const review = workshop.getByRole("switch", { name: "Human review" });
  await expectFocusRing(review);
  await expect(review).toHaveAttribute("aria-checked", "true");
  await page.keyboard.press("Space");
  await expect(review).toHaveAttribute("aria-checked", "false");
  await expect(illustration).toHaveAttribute("data-review", "off");
  await expect(page.getByTestId("text-workshop-explain")).toContainText("Human review is off");
  await expect(illustration).toHaveAccessibleName(/Human review is off/);
  await page.keyboard.press("Enter");
  await expect(review).toHaveAttribute("aria-checked", "true");
  await expect(page.getByTestId("text-workshop-explain")).toContainText("Human review is on");
  await expect(illustration).toHaveAccessibleName(/Human review is on/);
  await page.keyboard.press("Shift+Tab");
  await expect(workshop.getByRole("radio", { name: "Check", exact: true })).toBeFocused();

  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(page.viewportSize()!.width);
});
