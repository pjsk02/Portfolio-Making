import { test, expect, openPage, expectFocusRing, seedPreferences } from "./fixtures";

test("native workshop radios and human review work with Tab, arrows, Space, and Enter", { tag: "@compatibility" }, async ({ page, browserName }) => {
  await seedPreferences(page, { "je-motion": "paused" });
  await openPage(page, "./#workshop");
  const workshop = page.getByTestId("workshop");
  const illustration = workshop.getByRole("img");
  const radios = workshop.getByRole("radio");
  await expect(radios).toHaveCount(4);
  await expect(workshop.locator('input[type="radio"]')).toHaveCount(4);
  const names = await radios.evaluateAll((elements) => elements.map((el) => (el as HTMLInputElement).name));
  expect(names[0]).not.toBe("");
  expect(new Set(names).size, "Native arrow navigation needs one shared radio name").toBe(1);
  await expect(workshop.getByRole("group", { name: "Turn Je's dial" })).toBeVisible();

  // Enter the group through sequential keyboard navigation, not a mouse click.
  await page.getByTestId("button-workshop-motion").focus();
  await page.keyboard.press("Tab");
  const brief = workshop.getByRole("radio", { name: "Brief", exact: true });
  await expect(brief).toBeFocused();
  await expect(brief).toBeChecked();
  const states = {
    brief: { label: "Brief", agent: "Je, at the console" },
    read: { label: "Read", agent: "Reader" },
    link: { label: "Link", agent: "Linker" },
    check: { label: "Check", agent: "Checker" },
  } as const;
  const pressStage = (key: string, stage: keyof typeof states) => test.step(`${key} selects ${stage}`, async () => {
    const { label, agent } = states[stage];
    await page.keyboard.press(key);
    const radio = workshop.getByRole("radio", { name: label, exact: true });
    await expect(radio).toBeFocused();
    await expect(radio).toBeChecked();
    await expect(workshop.locator('input[type="radio"]:checked')).toHaveCount(1);
    await expect(illustration).toHaveAttribute("data-stage", stage);
    await expect(page.getByTestId("text-workshop-explain")).toContainText(agent);
    // The actual radio is visually hidden; its label must show keyboard focus.
    const labelElement = radio.locator("..");
    await expectFocusRing(radio, labelElement);
    expect((await labelElement.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  });
  const forwardToCheck = async () => {
    await pressStage("ArrowRight", "read");
    await pressStage("ArrowRight", "link");
    await pressStage("ArrowRight", "check");
  };
  await pressStage("ArrowRight", "read");
  await pressStage("ArrowDown", "link");
  await pressStage("ArrowRight", "check");
  await pressStage("ArrowLeft", "link");
  await pressStage("ArrowUp", "read");
  await pressStage("ArrowLeft", "brief");

  // Native WebKit clamps at the group boundaries; Chromium/Firefox wrap.
  // Assert both outcomes precisely instead of skipping an engine or adding
  // application key handlers to impose another browser's native behavior.
  await pressStage("ArrowLeft", browserName === "webkit" ? "brief" : "check");
  if (browserName === "webkit") await forwardToCheck();
  await pressStage("ArrowDown", browserName === "webkit" ? "check" : "brief");
  if (browserName !== "webkit") await forwardToCheck();

  // Brief is unchecked in every engine here. Space must really select it,
  // rather than merely leave an already-selected radio checked.
  await brief.focus();
  await page.keyboard.press("Space");
  await expect(brief).toBeChecked();
  await expect(illustration).toHaveAttribute("data-stage", "brief");
  await expect(page.getByTestId("text-workshop-explain")).toContainText("Je, at the console");
  await expect(workshop.locator('input[type="radio"]:checked')).toHaveCount(1);
  await expectFocusRing(brief, brief.locator(".."));
  await forwardToCheck();
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
  await expect(illustration).toHaveAttribute("data-review", "on");
  await expectFocusRing(review);
  await expect(page.getByTestId("text-workshop-explain")).toContainText("Human review is on");
  await expect(illustration).toHaveAccessibleName(/Human review is on/);
  await page.keyboard.press("Shift+Tab");
  await expect(workshop.getByRole("radio", { name: "Check", exact: true })).toBeFocused();

  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(page.viewportSize()!.width);
});
