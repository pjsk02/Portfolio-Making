import { test, expect, openPage, expectFocusRing, seedPreferences } from "./fixtures";
import type { Locator, Page } from "@playwright/test";

const agents = [
  { stage: "read", label: "Read", name: "Reader", x: 260, y: 244, text: "The Reader only extracts." },
  { stage: "link", label: "Link", name: "Linker", x: 400, y: 234, text: "The Linker records how things relate" },
  { stage: "check", label: "Check", name: "Checker", x: 540, y: 236, text: "The Checker compares a draft" },
] as const;
type Stage = "brief" | typeof agents[number]["stage"];

async function selectRadio(page: Page, stage: Stage) {
  // Click the visible native input label, never dispatch a synthetic change.
  await page.getByTestId(`radio-workshop-${stage}`).locator("..").click();
}

async function expectStage(page: Page, stage: Stage) {
  const svg = page.locator("svg.workshop");
  const agent = agents.find((item) => item.stage === stage);
  await expect(svg).toHaveAttribute("data-stage", stage);
  await expect(page.getByTestId(`radio-workshop-${stage}`)).toBeChecked();
  await expect(page.getByTestId("workshop").locator('input[type="radio"]:checked')).toHaveCount(1);
  await expect(svg.locator(".ws-screen-text")).toHaveText(stage.toUpperCase());
  await expect(page.getByTestId("text-workshop-explain")).toContainText(agent?.text ?? "Before anything moves, Je sets the job");
  for (const item of agents) {
    const selected = item.stage === stage;
    const highlighted = selected || stage === "brief";
    const body = page.getByTestId(`button-workshop-agent-${item.stage}`);
    const cable = page.getByTestId(`button-workshop-cable-${item.stage}`);
    await expect(body).toHaveAttribute("aria-pressed", String(selected));
    await expect(cable).toHaveAttribute("aria-pressed", String(selected));
    expect(await body.evaluate((el) => el.classList.contains("is-on"))).toBe(highlighted);
    expect(await cable.locator(".ws-cable-stroke").evaluate((el) => el.classList.contains("ws-cable-on"))).toBe(highlighted);
  }
}

async function preferences(page: Page) {
  return page.evaluate(() => ({
    review: document.querySelector('[data-testid="switch-workshop-review"]')!.getAttribute("aria-checked"),
    motion: document.documentElement.dataset.motion,
    savedMotion: localStorage.getItem("je-motion"),
    theme: document.documentElement.dataset.theme,
    savedTheme: localStorage.getItem("je-theme"),
    motionSwitch: document.querySelector('[data-testid="button-workshop-motion"]')!.getAttribute("aria-checked"),
  }));
}

async function screenPoint(page: Page, x: number, y: number) {
  const svg = page.locator("svg.workshop");
  await svg.scrollIntoViewIfNeeded();
  return svg.evaluate((el, point) => {
    const p = new DOMPoint(point.x, point.y).matrixTransform((el as SVGSVGElement).getScreenCTM()!);
    return { x: p.x, y: p.y };
  }, { x, y });
}

async function linePoint(path: Locator, fraction: number, gap = false, offset = 0) {
  // Read real rendered geometry; input below still goes through browser hit
  // testing. A dash gap is 8 units into a 5+6 pattern (5 units into 2+7).
  // SVG lives in its own XML namespace, so an unprefixed XPath name won't match.
  await path.locator('xpath=ancestor::*[local-name()="svg"]').scrollIntoViewIfNeeded();
  return path.evaluate((el, options) => {
    const path = el as SVGPathElement;
    const length = path.getTotalLength();
    const review = path.getAttribute("stroke-dasharray") === "2 7";
    const period = review ? 9 : 11;
    const distance = options.gap
      ? Math.floor(length * options.fraction / period) * period + (review ? 5 : 8)
      : length * options.fraction;
    const matrix = path.getScreenCTM()!;
    const p = path.getPointAtLength(distance).matrixTransform(matrix);
    const next = path.getPointAtLength(distance + 1).matrixTransform(matrix);
    const dx = next.x - p.x, dy = next.y - p.y;
    const norm = Math.hypot(dx, dy);
    return { x: p.x - dy / norm * options.offset, y: p.y + dx / norm * options.offset };
  }, { fraction, gap, offset });
}

async function activatePoint(page: Page, point: { x: number; y: number }, touch: boolean) {
  if (touch) await page.touchscreen.tap(point.x, point.y);
  else await page.mouse.click(point.x, point.y);
}

async function expectDiagramFocus(target: Locator) {
  await expect(target).toBeFocused();
  expect(await target.evaluate((el) => el.matches(":focus-visible"))).toBe(true);
  if (await target.locator(".ws-cable-focus").count()) {
    await expect(target.locator(".ws-cable-focus")).toHaveCSS("opacity", "1");
    await expect(target.locator(".ws-cable-focus")).toHaveCSS("stroke-width", "5px");
  } else {
    const ring = target.locator(".ws-agent-hit").first();
    await expect(ring).toHaveCSS("stroke-width", "2px");
    expect(await ring.evaluate((el) => getComputedStyle(el).stroke)).not.toBe("rgba(0, 0, 0, 0)");
  }
}

test("native workshop radios and human review work with Tab, arrows, Space, and Enter", { tag: "@compatibility" }, async ({ page, browserName }) => {
  await seedPreferences(page, { "je-motion": "paused" });
  await openPage(page, "./#workshop");
  const workshop = page.getByTestId("workshop");
  const illustration = workshop.getByRole("group", { name: "Agent workshop illustration", exact: true });
  const radios = workshop.getByRole("radio");
  await expect(radios).toHaveCount(4);
  await expect(workshop.locator('input[type="radio"]')).toHaveCount(4);
  const names = await radios.evaluateAll((elements) => elements.map((el) => (el as HTMLInputElement).name));
  expect(names[0]).not.toBe("");
  expect(new Set(names).size, "Native arrow navigation needs one shared radio name").toBe(1);
  await expect(workshop.getByRole("group", { name: "Turn Je's dial" })).toBeVisible();

  // Enter the group through sequential keyboard navigation, not a mouse click.
  await page.getByTestId("button-workshop-motion").focus();
  for (const kind of ["cable", "agent"]) {
    for (const { stage } of agents) {
      await page.keyboard.press("Tab");
      await expectDiagramFocus(page.getByTestId(`button-workshop-${kind}-${stage}`));
    }
  }
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
    await expectStage(page, stage as Stage);
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
  await expect(illustration).toHaveAccessibleDescription(/Human review is off/);
  await page.keyboard.press("Enter");
  await expect(review).toHaveAttribute("aria-checked", "true");
  await expect(illustration).toHaveAttribute("data-review", "on");
  await expectFocusRing(review);
  await expect(page.getByTestId("text-workshop-explain")).toContainText("Human review is on");
  await expect(illustration).toHaveAccessibleDescription(/Human review is on/);
  await page.keyboard.press("Shift+Tab");
  await expect(workshop.getByRole("radio", { name: "Check", exact: true })).toBeFocused();

  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(page.viewportSize()!.width);
});

test("diagram buttons expose selection and activate with Enter and Space without changing preferences", async ({ page }) => {
  await seedPreferences(page, { "je-motion": "paused" });
  await openPage(page, "./#workshop");
  await page.getByTestId("switch-workshop-review").click();
  const before = await preferences(page);
  const svg = page.getByRole("group", { name: "Agent workshop illustration", exact: true });
  const accessibility = await svg.ariaSnapshot();
  for (const { name } of agents) {
    expect(accessibility).toContain(`button "${name} — select`);
    expect(accessibility).toContain(`button "${name} cable — select`);
  }
  await expect(svg.getByRole("button")).toHaveCount(6);
  await expect(page.getByTestId("text-workshop-explain")).toHaveAttribute("aria-live", "polite");
  await expect(page.getByTestId("text-workshop-explain")).toHaveAttribute("aria-atomic", "true");

  await page.getByTestId("button-workshop-motion").focus();
  for (const kind of ["cable", "agent"]) {
    for (const { stage, label, name } of agents) {
      const target = page.getByTestId(`button-workshop-${kind}-${stage}`);
      await page.keyboard.press("Tab");
      await expectDiagramFocus(target);
      await expect(target).toHaveAccessibleName(`${name}${kind === "cable" ? " cable" : ""} — select ${label} stage`);
      await expect(target).toHaveCSS("cursor", "pointer");
      for (const key of ["Enter", "Space"]) {
        await selectRadio(page, "brief");
        await target.focus();
        await page.keyboard.press(key);
        await expectDiagramFocus(target);
        await expectStage(page, stage);
        await expect(svg).toHaveAccessibleDescription(new RegExp(`${name} is highlighted`));
        expect(await preferences(page)).toEqual(before);
      }
      const scroll = await page.evaluate(() => window.scrollY);
      await page.keyboard.press("Space");
      expect(await page.evaluate(() => window.scrollY)).toBe(scroll);
    }
  }
  await page.keyboard.press("Tab");
  await expect(page.getByTestId("radio-workshop-check")).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await expectStage(page, "brief");

  // The return control joins the tab order only when both review and Check are on.
  await page.getByTestId("switch-workshop-review").click();
  await selectRadio(page, "check");
  await page.getByTestId("button-workshop-cable-check").focus();
  await page.keyboard.press("Tab");
  const reviewLine = page.getByRole("button", { name: "Human review return line — select Check stage" });
  await expectDiagramFocus(reviewLine);
  await expect(reviewLine).toHaveAttribute("aria-pressed", "true");
  for (const key of ["Enter", "Space"]) {
    await page.keyboard.press(key);
    await expectStage(page, "check");
    await expect(page.getByTestId("switch-workshop-review")).toHaveAttribute("aria-checked", "true");
  }
  await page.keyboard.press("Tab");
  await expect(page.getByTestId("button-workshop-agent-read")).toBeFocused();
});

test.describe("actual pointer and touch hit testing", () => {
  test.use({ hasTouch: true });

  for (const mode of ["running", "paused", "reduced"] as const) {
    test(`agent bodies, names, and continuous cables select their stages with motion ${mode}`, async ({ page }) => {
      await seedPreferences(page, { "je-motion": mode === "paused" ? "paused" : "full" });
      if (mode === "reduced") await page.emulateMedia({ reducedMotion: "reduce" });
      await openPage(page, "./#workshop");
      const svg = page.locator("svg.workshop");
      await svg.scrollIntoViewIfNeeded();
      await expect(svg).toHaveAttribute("data-active", "true");
      if (mode === "reduced") await expect(svg.locator(".bob").first()).toHaveCSS("animation-name", "none");
      else await expect(svg.locator(".bob").first()).toHaveCSS("animation-play-state", mode === "paused" ? "paused" : "running");
      const before = await preferences(page);
      const touch = page.viewportSize()!.width < 768;

      for (const agent of agents) {
        // Body and label each have to work while the agent is inactive.
        for (const y of [agent.y, 340]) {
          await selectRadio(page, agent.stage === "check" ? "read" : "check");
          await activatePoint(page, await screenPoint(page, agent.x, y), touch);
          await expectStage(page, agent.stage);
          expect(await preferences(page)).toEqual(before);
        }
      }

      for (const { stage } of agents) {
        const stroke = page.getByTestId(`button-workshop-cable-${stage}`).locator(".ws-cable-stroke");
        const hit = svg.locator(`.ws-cable-hit[data-cable="${stage}"]`);
        await expect(stroke).toHaveAttribute("stroke-dasharray", "5 6");
        await expect(stroke).toHaveAttribute("stroke-width", "2");
        await expect(hit).toHaveCSS("stroke-dasharray", "none");
        await expect(hit).toHaveCSS("stroke-width", "24px");
        await expect(hit).toHaveCSS("vector-effect", "non-scaling-stroke");
        // Multiple real curve positions, including an unpainted dash gap.
        // Shared origins and literal curve crossings are inherently ambiguous.
        for (const [fraction, gap] of [[0.35, false], [0.55, true], [0.9, false]] as const) {
          await selectRadio(page, stage === "check" ? "read" : "check");
          await activatePoint(page, await linePoint(stroke, fraction, gap), touch);
          await expectStage(page, stage);
          expect(await preferences(page)).toEqual(before);
        }
      }

      // A real click/tap ten screen pixels off the isolated Reader arc proves
      // the generous target isn't just a continuous but still hairline stroke.
      await selectRadio(page, "link");
      const readerStroke = page.getByTestId("button-workshop-cable-read").locator(".ws-cable-stroke");
      await activatePoint(page, await linePoint(readerStroke, 0.35, false, -10), touch);
      await expectStage(page, "read");
      expect(await preferences(page)).toEqual(before);
      for (const stage of ["link", "check", "brief"] as const) {
        await selectRadio(page, stage);
        await expectStage(page, stage);
      }
      expect(await preferences(page)).toEqual(before);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(page.viewportSize()!.width);
    });
  }

  test("review return is actionable only while visible and decorations never select a stage", async ({ page }) => {
    await seedPreferences(page, { "je-motion": "paused" });
    await openPage(page, "./#workshop");
    const touch = page.viewportSize()!.width < 768;
    const svg = page.locator("svg.workshop");
    const reviewLine = page.getByTestId("button-workshop-cable-review");
    const review = page.getByTestId("switch-workshop-review");
    await expect(reviewLine).toHaveCount(0);
    await expect(svg.locator('[data-cable="review"]')).toHaveCount(0);
    await selectRadio(page, "check");
    const before = await preferences(page);
    const returnStroke = reviewLine.locator(".ws-cable-stroke");
    await expect(returnStroke).toHaveCSS("opacity", "1");
    for (const [fraction, gap] of [[0.3, false], [0.55, true], [0.8, false]] as const) {
      const point = await linePoint(returnStroke, fraction, gap);
      const hit = await page.evaluate(({ x, y }) => {
        const el = document.elementFromPoint(x, y);
        return el?.closest('[role="button"]')?.getAttribute("data-testid") ?? el?.getAttribute("data-cable");
      }, point);
      expect(["button-workshop-cable-review", "review"]).toContain(hit);
      await activatePoint(page, point, touch);
      await expect(reviewLine).toBeFocused();
      await expectStage(page, "check");
      expect(await preferences(page)).toEqual(before);
    }
    // Near Je the return curve has space clear of every other cable's padding,
    // even at 320px. Its middle can legitimately overlap a live 24px hit area.
    const hiddenPoint = await returnStroke.evaluate((el) => {
      const path = el as SVGPathElement;
      const p = path.getPointAtLength(path.getTotalLength() * 0.9);
      return { x: p.x, y: p.y };
    });
    await selectRadio(page, "read");
    await expect(reviewLine).toHaveCount(0);
    await expect(svg.locator('[data-cable="review"]')).toHaveCount(0);
    const point = await screenPoint(page, hiddenPoint.x, hiddenPoint.y);
    expect(await page.evaluate(({ x, y }) => document.elementFromPoint(x, y)?.closest("[data-workshop-stage]")?.getAttribute("data-workshop-stage") ?? null, point)).toBeNull();
    await activatePoint(page, point, touch);
    await expectStage(page, "read");

    await selectRadio(page, "check");
    await review.click();
    await expect(reviewLine).toHaveCount(0);
    await expect(svg.locator('[data-cable="review"]')).toHaveCount(0);
    const off = await preferences(page);
    await activatePoint(page, await screenPoint(page, 260, 244), touch);
    await expectStage(page, "read");
    await activatePoint(page, await screenPoint(page, hiddenPoint.x, hiddenPoint.y), touch);
    await expectStage(page, "read");
    for (const [x, y] of [[260, 298], [400, 298], [540, 298], [260, 318], [400, 318], [540, 318], [132, 256], [620, 40]]) {
      const p = await screenPoint(page, x, y);
      const hit = await page.evaluate(({ x, y }) => {
        const el = document.elementFromPoint(x, y);
        return el?.closest('[role="button"]')?.getAttribute("data-testid") ?? el?.getAttribute("data-cable") ?? null;
      }, p);
      expect(hit, `decorative point ${x},${y}`).toBeNull();
      const focusBefore = await page.evaluate(() => document.activeElement?.getAttribute("data-testid"));
      await activatePoint(page, p, touch);
      await expectStage(page, "read");
      if (touch) expect(await page.evaluate(() => document.activeElement?.getAttribute("data-testid"))).toBe(focusBefore);
    }
    expect(await preferences(page)).toEqual(off);
    await expect(svg.getByRole("button")).toHaveCount(6);
    await expect(page.getByTestId("text-workshop-label")).toHaveText("Illustration, not running agents");
    await expect(page.getByTestId("workshop")).toContainText("not the startup's actual architecture or a live system.");
  });
});
