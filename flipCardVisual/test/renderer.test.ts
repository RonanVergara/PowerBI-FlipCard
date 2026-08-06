import { describe, expect, it } from "vitest";

import { extractDataView } from "../src/data";
import { calculateFaceLayout } from "../src/layout";
import { createMotionConfiguration } from "../src/motion";
import {
    cardHasMeaningfulBack,
    createCardElements,
    getBackItemCount,
    renderCard,
    updateCardFace,
} from "../src/renderer";
import { getEnumSettingValue, getSectionSpacing, VisualFormattingSettingsModel } from "../src/settings";
import { createKpiPresentation, getVarianceDisplayText } from "../src/valueFormatting";
import { createDataView, createHostFixture } from "./helpers";

const formatting = { detail: { displayUnits: 0, precision: undefined }, main: { displayUnits: 0, precision: undefined } };

function prepared() {
    const fixture = createHostFixture();
    const card = extractDataView(createDataView({
        cardValues: [120],
        comparisonValues: [100],
        detailValues: [42],
        labels: ["Vendor A"],
        targetValues: [115],
        tooltipColumns: [{ displayName: "Owner", values: ["Ada"] }],
    }), fixture.host, "en-US", formatting, { direction: "higher", neutralTolerancePercent: 0 }).cards[0]!;
    card.varianceText = getVarianceDisplayText(card, "percentage", "en-US", formatting.detail);
    card.presentation = createKpiPresentation(card, "percentage", "en-US", formatting.detail);
    return { card, fixture };
}

function context(settings: VisualFormattingSettingsModel, width = 320, height = 180, highContrast = false, reducedMotion = false) {
    const hasBenchmark = settings.benchmark.enabled.value;
    return {
        colorPalette: createHostFixture(highContrast).host.colorPalette,
        face: "front" as const,
        faceLayout: calculateFaceLayout({ width, height }, {
            backLayout: getEnumSettingValue(settings.flip.backLayout) as "auto" | "list" | "tiles",
            configuredPadding: settings.cardAppearance.padding.value,
            controlClusterWidth: settings.flip.showDetailsText.value ? settings.flip.size.value + 54 : settings.flip.size.value,
            frontPresentation: getEnumSettingValue(settings.label.presentationMode) as "auto" | "stacked" | "split",
            responsivePriority: getEnumSettingValue(settings.label.responsivePriority) as "automatic" | "insight" | "status",
            sectionSpacing: getSectionSpacing(settings),
            statusPresentation: getEnumSettingValue(settings.benchmark.statusPresentation) as "pill" | "text" | "iconOnly",
        }, {
            backItemCount: 5,
            hasFlipControl: settings.flip.enabled.value,
            hasInsight: hasBenchmark,
            hasSecondaryReference: hasBenchmark,
            hasStatus: hasBenchmark,
        }),
        motion: createMotionConfiguration(
            getEnumSettingValue(settings.flip.motionStyle) as "horizontal" | "vertical" | "fade" | "none",
            getEnumSettingValue(settings.flip.horizontalDirection) as "left" | "right",
            getEnumSettingValue(settings.flip.verticalDirection) as "up" | "down",
            getEnumSettingValue(settings.flip.easing) as "smooth" | "snappy" | "gentle",
            settings.flip.animationDuration.value,
            getEnumSettingValue(settings.flip.perspective) as "subtle" | "standard" | "deep",
            reducedMotion,
        ),
        selected: false,
        settings,
    };
}

describe("card renderer", () => {
    it("renders a default core card without flip, back, status, insight, or placeholders", () => {
        const { card } = prepared();
        const settings = new VisualFormattingSettingsModel();
        const elements = createCardElements(false, true);
        renderCard(elements, card, context(settings));
        expect(elements.backFace).toBeUndefined();
        expect(elements.frontFlipButton).toBeUndefined();
        expect(elements.frontStatus.hidden).toBe(true);
        expect(elements.frontReference.hidden).toBe(true);
        expect(elements.frontInsight.hidden).toBe(true);
        expect(elements.wrapper.textContent).not.toContain("No benchmark");
    });

    it("separates the selectable front surface from both flip controls", () => {
        const { card } = prepared();
        const settings = new VisualFormattingSettingsModel();
        settings.flip.enabled.value = true;
        expect(cardHasMeaningfulBack(card, settings)).toBe(true);
        const elements = createCardElements(true, true);
        expect(elements.frontSelectionButton).toBe(elements.frontSurface);
        expect(elements.frontSelectionButton?.parentElement).toBe(elements.frontFace);
        expect(elements.frontFlipButton?.closest(".flip-card-control-cluster")?.parentElement).toBe(elements.frontFace);
        expect(elements.frontSelectionButton?.contains(elements.frontFlipButton!)).toBe(false);
        expect(elements.backSurface?.classList.contains("flip-card-selection-surface")).toBe(false);
    });

    it("renders identity-less cards as non-focusable accessible groups", () => {
        const { card } = prepared();
        const settings = new VisualFormattingSettingsModel();
        const elements = createCardElements(false, false);
        renderCard(elements, card, context(settings));
        expect(elements.frontSelectionButton).toBeUndefined();
        expect(elements.frontSurface.tagName).toBe("DIV");
        expect(elements.frontSurface.getAttribute("role")).toBe("group");
        expect(elements.frontSurface.hasAttribute("tabindex")).toBe(false);
        expect(elements.frontSurface.getAttribute("aria-label")).not.toContain("Select card");
    });

    it("makes the inactive face pointer-inert, focus-inert, and ARIA-hidden", () => {
        const { card } = prepared();
        const settings = new VisualFormattingSettingsModel(); settings.flip.enabled.value = true;
        const elements = createCardElements(true, true); renderCard(elements, card, context(settings));
        expect(elements.frontFace.getAttribute("aria-hidden")).toBe("false");
        expect(elements.backFace?.getAttribute("aria-hidden")).toBe("true");
        expect(elements.backFace?.hasAttribute("inert")).toBe(true);
        expect(elements.backFace?.style.pointerEvents).toBe("none");
        expect(elements.backFlipButton?.tabIndex).toBe(-1);
        updateCardFace(elements, "back");
        expect(elements.frontFace.getAttribute("aria-hidden")).toBe("true");
        expect(elements.frontFace.hasAttribute("inert")).toBe(true);
        expect(elements.frontSelectionButton?.tabIndex).toBe(-1);
        expect(elements.backFace?.getAttribute("aria-hidden")).toBe("false");
        expect(elements.backFace?.hasAttribute("inert")).toBe(false);
        expect(elements.backFlipButton?.tabIndex).toBe(0);
    });

    it("uses explicit bound reference names and avoids duplicate generic wording", () => {
        const { card } = prepared();
        const settings = new VisualFormattingSettingsModel(); settings.benchmark.enabled.value = true; settings.flip.enabled.value = true;
        const elements = createCardElements(true, true); renderCard(elements, card, context(settings));
        expect(elements.frontInsight.textContent).toContain("vs Previous Month");
        expect(elements.frontReference.textContent).toContain("Previous Month");
        expect(elements.frontStatus.textContent).toContain("above Target");
        expect(elements.backContent?.textContent).toContain("Variance vs Previous Month");
        expect(elements.backContent?.textContent).toContain("Status vs Target");
        expect(elements.screenReaderSummary.textContent).toContain("versus Previous Month");
        expect(elements.wrapper.textContent).not.toContain("On track");
    });

    it("counts every valid semantic pair and removes invalid optional sections", () => {
        const { card } = prepared();
        const settings = new VisualFormattingSettingsModel(); settings.flip.enabled.value = true; settings.benchmark.enabled.value = true;
        expect(getBackItemCount(card, settings)).toBe(5);
        const fixture = createHostFixture();
        const invalid = extractDataView(createDataView({ cardValues: [10], detailValues: [Number.NaN], targetValues: [Number.POSITIVE_INFINITY] }), fixture.host, "en-US", formatting, { direction: "higher", neutralTolerancePercent: 0 }).cards[0]!;
        invalid.presentation = createKpiPresentation(invalid, "percentage", "en-US", formatting.detail);
        expect(cardHasMeaningfulBack(invalid, settings)).toBe(false);
        expect(getBackItemCount(invalid, settings)).toBe(0);
    });

    it("maps front and back layout plans without changing the outer card", () => {
        const { card } = prepared();
        const settings = new VisualFormattingSettingsModel(); settings.flip.enabled.value = true; settings.benchmark.enabled.value = true;
        settings.label.presentationMode.value = settings.label.presentationMode.items.find((item) => item.value === "split")!;
        settings.flip.backLayout.value = settings.flip.backLayout.items.find((item) => item.value === "tiles")!;
        const wide = createCardElements(true, true); renderCard(wide, card, context(settings, 420, 180));
        expect(wide.wrapper.dataset.frontLayout).toBe("split");
        expect(wide.wrapper.dataset.backLayout).toBe("tiles");
        expect(wide.wrapper.classList.contains("back-columns-two")).toBe(true);
        const narrow = createCardElements(true, true); renderCard(narrow, card, context(settings, 240, 180));
        expect(narrow.wrapper.dataset.frontLayout).toBe("stacked");
        expect(narrow.wrapper.dataset.backLayout).toBe("list");
    });

    it("renders each icon, control style/shape, and a separate Details cue", () => {
        const { card } = prepared();
        for (const icon of ["information", "rotate", "chevron"] as const) {
            for (const style of ["ghost", "outline", "filled"] as const) {
                for (const shape of ["circle", "roundedSquare"] as const) {
                    const settings = new VisualFormattingSettingsModel(); settings.flip.enabled.value = true; settings.flip.showDetailsText.value = true;
                    settings.flip.controlIcon.value = settings.flip.controlIcon.items.find((item) => item.value === icon)!;
                    settings.flip.controlStyle.value = settings.flip.controlStyle.items.find((item) => item.value === style)!;
                    settings.flip.controlShape.value = settings.flip.controlShape.items.find((item) => item.value === shape)!;
                    const elements = createCardElements(true, true); renderCard(elements, card, context(settings));
                    expect(elements.frontFlipButton?.querySelector("svg path")?.getAttribute("d")).toBeTruthy();
                    expect(elements.wrapper.classList.contains(`control-${style}`)).toBe(true);
                    expect(elements.wrapper.classList.contains(`control-${shape}`)).toBe(true);
                    const cue = elements.wrapper.querySelector<HTMLElement>(".flip-card-details-cue");
                    expect(cue?.textContent).toBe("Details");
                    expect(cue?.closest("button")).toBeNull();
                }
            }
        }
    });

    it("keeps status fx separate from the numeric insight and high contrast overrides all authored colors", () => {
        const { card } = prepared();
        Object.assign(card.colorOverrides, { frontBackground: "#111111", borderColor: "#222222", accentColor: "#333333", mainValueColor: "#444444", statusIndicatorColor: "#555555" });
        const settings = new VisualFormattingSettingsModel(); settings.benchmark.enabled.value = true; settings.flip.enabled.value = true; settings.cardAppearance.accentEnabled.value = true;
        settings.flip.backHeaderBackground.value.value = "#666666"; settings.flip.backContentBackground.value.value = "#777777";
        const normal = createCardElements(true, true); renderCard(normal, card, context(settings));
        expect(normal.wrapper.style.getPropertyValue("--flip-front-background")).toBe("#111111");
        expect(normal.wrapper.style.getPropertyValue("--flip-border-color")).toBe("#222222");
        expect(normal.wrapper.style.getPropertyValue("--flip-accent-color")).toBe("#333333");
        expect(normal.wrapper.style.getPropertyValue("--flip-main-color")).toBe("#444444");
        expect(normal.wrapper.style.getPropertyValue("--flip-status-color")).toBe("#555555");
        expect(normal.wrapper.style.getPropertyValue("--flip-insight-color")).not.toBe("#555555");
        const hc = createCardElements(true, true); renderCard(hc, card, context(settings, 320, 180, true));
        for (const variable of ["--flip-border-color", "--flip-accent-color", "--flip-main-color", "--flip-status-color", "--flip-insight-color", "--flip-back-header-color"]) {
            expect(hc.wrapper.style.getPropertyValue(variable), variable).toBe("#FFFF00");
        }
        for (const variable of ["--flip-front-background", "--flip-back-header-background", "--flip-back-content-background", "--flip-status-background"]) {
            expect(hc.wrapper.style.getPropertyValue(variable), variable).toBe("#000000");
        }
        expect(hc.wrapper.style.getPropertyValue("--flip-button-color")).toBe("#00FFFF");
    });

    it("forces zero-duration changes for reduced-motion users", () => {
        const { card } = prepared(); const settings = new VisualFormattingSettingsModel(); settings.flip.enabled.value = true;
        const elements = createCardElements(true, true); renderCard(elements, card, context(settings, 320, 180, false, true));
        expect(elements.wrapper.style.getPropertyValue("--flip-duration")).toBe("0ms");
    });
});
