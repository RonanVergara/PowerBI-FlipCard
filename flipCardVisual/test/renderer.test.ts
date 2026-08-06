import { describe, expect, it } from "vitest";

import { extractDataView } from "../src/data";
import { cardHasMeaningfulBack, createCardElements, renderCard, updateCardFace } from "../src/renderer";
import { VisualFormattingSettingsModel } from "../src/settings";
import { getVarianceDisplayText } from "../src/valueFormatting";
import { createDataView, createHostFixture } from "./helpers";

const formatting = { detail: { displayUnits: 0, precision: undefined }, main: { displayUnits: 0, precision: undefined } };

function prepared() {
    const fixture = createHostFixture();
    const card = extractDataView(createDataView({ cardValues: [120], comparisonValues: [100], detailValues: [42], labels: ["Vendor A"], targetValues: [115] }), fixture.host, "en-US", formatting, { direction: "higher", neutralTolerancePercent: 0 }).cards[0]!;
    card.varianceText = getVarianceDisplayText(card, "percentage", "en-US", formatting.detail);
    return { card, fixture };
}

function context(settings: VisualFormattingSettingsModel, highContrast = false, reducedMotion = false) {
    return { allowInteractions: true, colorPalette: createHostFixture(highContrast).host.colorPalette, density: "regular" as const, face: "front" as const, reducedMotion, selected: false, settings };
}

describe("card renderer", () => {
    it("renders a default core card without flip, back, status, variance, or benchmark placeholders", () => {
        const { card } = prepared();
        const settings = new VisualFormattingSettingsModel();
        const elements = createCardElements(false);
        renderCard(elements, card, context(settings));
        expect(elements.backFace).toBeUndefined();
        expect(elements.frontFlipButton).toBeUndefined();
        expect(elements.frontStatus.hidden).toBe(true);
        expect(elements.frontReference.hidden).toBe(true);
        expect(elements.frontVariance.hidden).toBe(true);
        expect(elements.wrapper.textContent).not.toContain("No benchmark");
    });

    it("creates separate front selection and flip controls only with meaningful enabled back content", () => {
        const { card } = prepared();
        const settings = new VisualFormattingSettingsModel();
        settings.flip.enabled.value = true;
        expect(cardHasMeaningfulBack(card, settings)).toBe(true);
        const elements = createCardElements(true);
        expect(elements.frontSelectionButton.parentElement).toBe(elements.frontFace);
        expect(elements.frontFlipButton?.parentElement).toBe(elements.frontFace);
        expect(elements.frontSelectionButton.contains(elements.frontFlipButton!)).toBe(false);
        expect(elements.backSurface?.tagName).toBe("DIV");
        expect(elements.backSurface?.classList.contains("flip-card-selection-surface")).toBe(false);
    });

    it("makes the hidden face pointer-inert, focus-inert, and ARIA-hidden in both directions", () => {
        const { card } = prepared();
        const settings = new VisualFormattingSettingsModel(); settings.flip.enabled.value = true;
        const elements = createCardElements(true); renderCard(elements, card, context(settings));
        expect(elements.frontFace.getAttribute("aria-hidden")).toBe("false");
        expect(elements.backFace?.getAttribute("aria-hidden")).toBe("true");
        expect(elements.backFace?.hasAttribute("inert")).toBe(true);
        expect(elements.backFace?.style.pointerEvents).toBe("none");
        expect(elements.backFlipButton?.tabIndex).toBe(-1);
        updateCardFace(elements, "back");
        expect(elements.frontFace.getAttribute("aria-hidden")).toBe("true");
        expect(elements.frontFace.hasAttribute("inert")).toBe(true);
        expect(elements.frontFace.style.pointerEvents).toBe("none");
        expect(elements.frontSelectionButton.tabIndex).toBe(-1);
        expect(elements.backFace?.getAttribute("aria-hidden")).toBe("false");
        expect(elements.backFace?.hasAttribute("inert")).toBe(false);
        expect(elements.backFlipButton?.tabIndex).toBe(0);
    });

    it("uses actual bound field display names for benchmark labels", () => {
        const { card } = prepared();
        const settings = new VisualFormattingSettingsModel(); settings.benchmark.enabled.value = true; settings.flip.enabled.value = true;
        const elements = createCardElements(true); renderCard(elements, card, context(settings));
        expect(elements.frontReference.textContent).toContain("vs Target");
        expect(elements.varianceRow?.label.textContent).toBe("Variance vs Previous Month");
        expect(elements.statusRow?.label.textContent).toBe("Status vs Target");
        expect(elements.frontStatus.textContent).toContain("On track");
    });

    it("does not manufacture back content from invalid optional values", () => {
        const fixture = createHostFixture();
        const card = extractDataView(createDataView({ cardValues: [10], detailValues: [Number.NaN], targetValues: [Number.POSITIVE_INFINITY] }), fixture.host, "en-US", formatting, { direction: "higher", neutralTolerancePercent: 0 }).cards[0]!;
        const settings = new VisualFormattingSettingsModel(); settings.flip.enabled.value = true; settings.benchmark.enabled.value = true;
        expect(cardHasMeaningfulBack(card, settings)).toBe(false);
    });

    it("applies all evaluated colors but lets high contrast override every one", () => {
        const { card } = prepared();
        Object.assign(card.colorOverrides, { frontBackground: "#111111", borderColor: "#222222", accentColor: "#333333", mainValueColor: "#444444", statusIndicatorColor: "#555555" });
        const settings = new VisualFormattingSettingsModel(); settings.benchmark.enabled.value = true; settings.cardAppearance.accentEnabled.value = true;
        const normal = createCardElements(false); renderCard(normal, card, context(settings));
        expect(normal.wrapper.style.getPropertyValue("--flip-front-background")).toBe("#111111");
        expect(normal.wrapper.style.getPropertyValue("--flip-border-color")).toBe("#222222");
        expect(normal.wrapper.style.getPropertyValue("--flip-accent-color")).toBe("#333333");
        expect(normal.wrapper.style.getPropertyValue("--flip-main-color")).toBe("#444444");
        expect(normal.wrapper.style.getPropertyValue("--flip-status-color")).toBe("#555555");
        const hc = createCardElements(false); renderCard(hc, card, context(settings, true));
        expect(hc.wrapper.style.getPropertyValue("--flip-front-background")).toBe("#000000");
        for (const variable of ["--flip-border-color", "--flip-accent-color", "--flip-main-color", "--flip-status-color"]) { expect(hc.wrapper.style.getPropertyValue(variable)).toBe("#FFFF00"); }
    });

    it("forces zero-duration face changes for reduced-motion users", () => {
        const { card } = prepared(); const settings = new VisualFormattingSettingsModel(); settings.flip.enabled.value = true;
        const elements = createCardElements(true); renderCard(elements, card, context(settings, false, true));
        expect(elements.wrapper.style.getPropertyValue("--flip-duration")).toBe("0ms");
    });
});
