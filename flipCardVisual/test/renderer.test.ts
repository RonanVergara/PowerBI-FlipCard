import { describe, expect, it } from "vitest";

import { extractDataView } from "../src/data";
import { createCardElements, renderCard, updateCardFace } from "../src/renderer";
import { VisualFormattingSettingsModel } from "../src/settings";
import { getVarianceDisplayText } from "../src/valueFormatting";
import { createDataView, createHostFixture } from "./helpers";

const formatting = {
    detail: { displayUnits: 0, precision: undefined },
    main: { displayUnits: 0, precision: undefined },
};

function preparedCard() {
    const fixture = createHostFixture();
    const card = extractDataView(createDataView({
        cardValues: [120],
        comparisonValues: [100],
        detailValues: [42],
        labels: ["Customer satisfaction score with a long label"],
        targetValues: [115],
    }), fixture.host, "en-US", formatting, {
        direction: "higher",
        neutralTolerancePercent: 0,
    }).cards[0]!;
    card.varianceText = getVarianceDisplayText(card, "percentage", "en-US", formatting.detail);
    return { card, fixture };
}

describe("card renderer", () => {
    it("creates sibling selection and flip controls with safe accessible content", () => {
        const elements = createCardElements();

        expect(elements.frontSelectionButton.parentElement).toBe(elements.frontFace);
        expect(elements.frontFlipButton.parentElement).toBe(elements.frontFace);
        expect(elements.frontSelectionButton.contains(elements.frontFlipButton)).toBe(false);
        expect(elements.frontSelectionButton.type).toBe("button");
        expect(elements.frontFlipButton.type).toBe("button");
    });

    it("renders both faces, status text, conditional styling, and logical tab order", () => {
        const { card, fixture } = preparedCard();
        const settings = new VisualFormattingSettingsModel();
        const elements = createCardElements();
        renderCard(elements, card, {
            allowInteractions: true,
            colorPalette: fixture.host.colorPalette,
            face: "front",
            selected: true,
            settings,
        });

        expect(elements.frontLabel.textContent).toContain("Customer satisfaction");
        expect(elements.frontStatus.textContent).toContain("Positive");
        expect(elements.detailRow.row.hidden).toBe(false);
        expect(elements.comparisonRow.row.hidden).toBe(false);
        expect(elements.targetRow.row.hidden).toBe(false);
        expect(elements.varianceRow.row.hidden).toBe(false);
        expect(elements.frontSelectionButton.getAttribute("aria-pressed")).toBe("true");
        expect(elements.frontSelectionButton.getAttribute("aria-label")).toContain("Status Positive");
        expect(elements.frontSelectionButton.tabIndex).toBe(0);
        expect(elements.backSelectionButton.tabIndex).toBe(-1);

        updateCardFace(elements, "back");
        expect(elements.frontFace.getAttribute("aria-hidden")).toBe("true");
        expect(elements.backFace.getAttribute("aria-hidden")).toBe("false");
        expect(elements.frontSelectionButton.tabIndex).toBe(-1);
        expect(elements.backSelectionButton.tabIndex).toBe(0);
        expect(elements.backFlipButton.getAttribute("aria-pressed")).toBe("true");
    });

    it("hides unassigned optional sections without leaving rows", () => {
        const fixture = createHostFixture();
        const card = extractDataView(createDataView({ cardValues: [10] }), fixture.host, "en-US", formatting, {
            direction: "higher",
            neutralTolerancePercent: 0,
        }).cards[0]!;
        const elements = createCardElements();
        renderCard(elements, card, {
            allowInteractions: true,
            colorPalette: fixture.host.colorPalette,
            face: "front",
            selected: false,
            settings: new VisualFormattingSettingsModel(),
        });

        expect(elements.detailRow.row.hidden).toBe(true);
        expect(elements.comparisonRow.row.hidden).toBe(true);
        expect(elements.targetRow.row.hidden).toBe(true);
        expect(elements.varianceRow.row.hidden).toBe(true);
        expect(elements.statusRow.row.hidden).toBe(false);
    });

    it("uses host high-contrast palette and keeps textual status", () => {
        const { card } = preparedCard();
        const fixture = createHostFixture(true);
        const elements = createCardElements();
        renderCard(elements, card, {
            allowInteractions: true,
            colorPalette: fixture.host.colorPalette,
            face: "front",
            selected: false,
            settings: new VisualFormattingSettingsModel(),
        });

        expect(elements.wrapper.classList.contains("is-high-contrast")).toBe(true);
        expect(elements.wrapper.style.getPropertyValue("--flip-front-background")).toBe("#000000");
        expect(elements.wrapper.style.getPropertyValue("--flip-main-color")).toBe("#FFFF00");
        expect(elements.frontStatus.textContent).toContain("On track");
    });
});
