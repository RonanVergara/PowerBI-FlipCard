import { expect, Page, test, TestInfo } from "@playwright/test";

async function openCase(page: Page, testInfo: TestInfo, name: string, width: number, height: number, parameters = ""): Promise<void> {
    await page.setViewportSize({ width, height });
    await page.goto(`/?case=${name}${parameters}`);
    await expect(page.locator("html")).toHaveAttribute("data-harness-ready", "true");
    await page.waitForFunction(() => document.fonts.status === "loaded" && document.fonts.check("16px Inter"));
    await page.screenshot({ animations: "allow", path: testInfo.outputPath(`${name}${parameters.replaceAll(/[&=]/g, "-")}.png`) });
}

async function expectNoOuterOverflow(page: Page): Promise<void> {
    const overflow = await page.locator("#visual").evaluate((element) => ({ x: element.scrollWidth - element.clientWidth, y: element.scrollHeight - element.clientHeight }));
    expect(overflow.x).toBeLessThanOrEqual(1); expect(overflow.y).toBeLessThanOrEqual(1);
}

test("renders the 320x180 single card with deterministic Auto hierarchy", async ({ page }, testInfo) => {
    await openCase(page, testInfo, "single320", 320, 180);
    await expect(page.locator(".flip-card-wrapper")).toHaveCount(1);
    await expect(page.locator(".flip-card-wrapper")).toHaveAttribute("data-front-layout", "split");
    await expect(page.locator(".flip-card-insight")).toContainText("vs Previous Month");
    await expect(page.locator(".flip-card-status")).toContainText("Target");
    await expectNoOuterOverflow(page);
});

for (const option of [{ name: "four660", width: 660, height: 290 }, { name: "four320", width: 320, height: 200 }]) {
    test(`renders an unscrolled 2x2 grid at ${option.width} x ${option.height}`, async ({ page }, testInfo) => {
        await openCase(page, testInfo, option.name, option.width, option.height);
        await expect(page.locator(".flip-card-wrapper")).toHaveCount(4);
        const boxes = await page.locator(".flip-card-wrapper").evaluateAll((elements) => elements.map((element) => {
            const rect = element.getBoundingClientRect(); return { bottom: rect.bottom, left: rect.left, top: rect.top };
        }));
        expect(new Set(boxes.map((box) => Math.round(box.left))).size).toBe(2);
        expect(new Set(boxes.map((box) => Math.round(box.top))).size).toBe(2);
        expect(Math.max(...boxes.map((box) => box.bottom))).toBeLessThanOrEqual(option.height);
        await expectNoOuterOverflow(page);
    });
}

test("resolves wide Split and narrow Stacked layouts", async ({ page }, testInfo) => {
    await openCase(page, testInfo, "wideSplit", 520, 210);
    await expect(page.locator(".flip-card-wrapper")).toHaveAttribute("data-front-layout", "split");
    await openCase(page, testInfo, "narrowStacked", 260, 200);
    await expect(page.locator(".flip-card-wrapper")).toHaveAttribute("data-front-layout", "stacked");
    await expectNoOuterOverflow(page);
});

test("renders complete List and Tiles backs without discarded semantic items", async ({ page }, testInfo) => {
    for (const option of [{ name: "listBack", width: 260, height: 210, layout: "list" }, { name: "tilesBack", width: 420, height: 230, layout: "tiles" }]) {
        await openCase(page, testInfo, option.name, option.width, option.height);
        await page.locator(".flip-card-flip-front").click();
        await expect(page.locator(".flip-card-wrapper")).toHaveAttribute("data-transition-state", "back");
        await expect(page.locator(".flip-card-wrapper")).toHaveAttribute("data-back-layout", option.layout);
        await expect(page.locator(".flip-card-detail-item")).toHaveCount(5);
        await expect(page.locator(".flip-card-back")).toHaveAttribute("aria-hidden", "false");
        await expect(page.locator(".flip-card-front")).toHaveAttribute("aria-hidden", "true");
        await page.screenshot({ path: testInfo.outputPath(`${option.name}-completed-back.png`) });
        await page.locator(".flip-card-detail-item").last().scrollIntoViewIfNeeded();
        await expect(page.locator(".flip-card-detail-item").last()).toBeInViewport();
        await page.screenshot({ path: testInfo.outputPath(`${option.name}-completed-back-result.png`) });
    }
});

test("captures a deterministic paused mid-flip and completes both directions exactly once", async ({ page }, testInfo) => {
    await openCase(page, testInfo, "single320", 320, 180, "&motion=horizontal&direction=left");
    const interactionCount = (): Promise<number> => page.evaluate(() => window.flipHarness.selectionCalls + window.flipHarness.selectionClears);
    expect(await interactionCount()).toBe(0);
    const front = page.locator(".flip-card-flip-front");
    await front.click(); expect(await interactionCount()).toBe(0);
    await front.click({ force: true }); expect(await interactionCount()).toBe(0);
    await expect(page.locator(".flip-card-wrapper")).toHaveAttribute("data-transition-state", "turningToBack");
    const animationCount = await page.locator(".flip-card-inner").evaluate((element) => {
        const animations = element.getAnimations();
        for (const animation of animations) { animation.pause(); animation.currentTime = 300; }
        return animations.length;
    });
    expect(animationCount).toBeGreaterThan(0);
    await page.screenshot({ animations: "allow", path: testInfo.outputPath("horizontal-left-mid-flip.png") });
    await page.locator(".flip-card-inner").evaluate((element) => element.getAnimations().forEach((animation) => animation.finish()));
    await expect(page.locator(".flip-card-wrapper")).toHaveAttribute("data-transition-state", "back");
    expect(await interactionCount()).toBe(0);
    await page.locator(".flip-card-flip-back").click(); expect(await interactionCount()).toBe(0);
    await page.locator(".flip-card-inner").evaluate((element) => element.getAnimations().forEach((animation) => animation.finish()));
    await expect(page.locator(".flip-card-wrapper")).toHaveAttribute("data-transition-state", "front");
    expect(await interactionCount()).toBe(0);
    await page.screenshot({ path: testInfo.outputPath("horizontal-left-return-complete.png") });
});

test("supports Vertical, Fade, and None completion with both supported direction families", async ({ page }) => {
    for (const motion of ["vertical", "fade", "none"] as const) {
        for (const direction of motion === "vertical" ? ["up", "down"] : ["right"] as const) {
            await page.goto(`/?case=single320&motion=${motion}&direction=${direction}`);
            await expect(page.locator("html")).toHaveAttribute("data-harness-ready", "true");
            await page.locator(".flip-card-flip-front").click();
            if (motion !== "none") {
                const target = motion === "fade" ? page.locator(".flip-card-back") : page.locator(".flip-card-inner");
                await target.evaluate((element) => element.getAnimations().forEach((animation) => animation.finish()));
            }
            await expect(page.locator(".flip-card-wrapper")).toHaveAttribute("data-transition-state", "back");
            expect(await page.evaluate(() => window.flipHarness.selectionCalls)).toBe(0);
        }
    }
});

test("keeps long and negative content contained", async ({ page }, testInfo) => {
    await openCase(page, testInfo, "longNegative", 320, 180);
    await expect(page.locator(".flip-card-main-value")).toContainText("-");
    await expectNoOuterOverflow(page);
    const clipped = await page.locator(".flip-card-main-value").evaluate((element) => element.scrollWidth > element.clientWidth + 1 || element.scrollHeight > element.clientHeight + 1);
    expect(clipped).toBe(false);
});

test("shows keyboard focus, transfers it after completion, and applies high contrast", async ({ page }, testInfo) => {
    await openCase(page, testInfo, "single320", 320, 180, "&motion=none");
    await page.keyboard.press("Tab");
    await expect(page.locator(".flip-card-selection-surface")).toBeFocused();
    await page.keyboard.press("Tab"); await expect(page.locator(".flip-card-flip-front")).toBeFocused();
    await page.keyboard.press("Enter"); await expect(page.locator(".flip-card-flip-back")).toBeFocused();
    await page.screenshot({ path: testInfo.outputPath("back-control-focus.png") });
    await openCase(page, testInfo, "highContrast", 320, 180, "&motion=none");
    await expect(page.locator(".flip-card-wrapper")).toHaveClass(/is-high-contrast/);
    expect(await page.locator(".flip-card-wrapper").evaluate((element) => getComputedStyle(element).getPropertyValue("--flip-front-background").trim())).toBe("#000000");
});
