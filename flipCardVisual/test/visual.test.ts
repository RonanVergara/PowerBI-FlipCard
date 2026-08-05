import { beforeEach, describe, expect, it, vi } from "vitest";

const tooltipMocks = vi.hoisted(() => ({
    addTooltip: vi.fn(),
    hide: vi.fn(),
}));

vi.mock("powerbi-visuals-utils-tooltiputils", () => ({
    createTooltipServiceWrapper: () => ({
        addTooltip: tooltipMocks.addTooltip,
        hide: tooltipMocks.hide,
    }),
}));

import powerbi from "powerbi-visuals-api";

import { CardViewModel } from "../src/types";
import { Visual } from "../src/visual";
import {
    createDataView,
    createHostFixture,
    createUpdateOptions,
    flushPromises,
} from "./helpers";

function createVisual(highContrast = false) {
    const target = document.createElement("div");
    const fixture = createHostFixture(highContrast);
    const visual = new Visual({ element: target, host: fixture.host });
    return { fixture, target, visual };
}

function click(element: Element, options: MouseEventInit = {}): void {
    element.dispatchEvent(new MouseEvent("click", { bubbles: true, ...options }));
}

describe("Visual", () => {
    beforeEach(() => {
        tooltipMocks.addTooltip.mockReset();
        tooltipMocks.hide.mockReset();
    });

    it("separates selection, multi-selection, click-again clearing, and blank-space clearing", async () => {
        const { fixture, target, visual } = createVisual();
        const dataView = createDataView({ cardValues: [10, 20], labels: ["A", "B"] });
        visual.update(createUpdateOptions(dataView));
        const buttons = target.querySelectorAll(".flip-card-front-content");

        click(buttons[0]!);
        await flushPromises();
        expect(target.querySelectorAll(".flip-card-wrapper.is-selected")).toHaveLength(1);

        click(buttons[1]!, { ctrlKey: true });
        await flushPromises();
        expect(fixture.selectionManager.getSelectionIds()).toHaveLength(2);
        expect(target.querySelectorAll(".flip-card-wrapper.is-selected")).toHaveLength(2);

        click(buttons[0]!);
        await flushPromises();
        click(buttons[0]!);
        await flushPromises();
        expect(fixture.selectionManager.getSelectionIds()).toHaveLength(0);

        click(buttons[1]!);
        await flushPromises();
        click(target.querySelector(".flip-card-container")!);
        await flushPromises();
        expect(fixture.selectionManager.getSelectionIds()).toHaveLength(0);

        click(buttons[0]!);
        await flushPromises();
        click(buttons[1]!, { metaKey: true });
        await flushPromises();
        expect(fixture.selectionManager.getSelectionIds()).toHaveLength(2);
    });

    it("restores host selection styling after an update", async () => {
        const { target, visual } = createVisual();
        const dataView = createDataView({ cardValues: [10], labels: ["A"] });
        visual.update(createUpdateOptions(dataView));
        click(target.querySelector(".flip-card-front-content")!);
        await flushPromises();

        visual.update(createUpdateOptions(dataView, 400, 220));
        expect(target.querySelector(".flip-card-wrapper")?.classList.contains("is-selected")).toBe(true);
    });

    it("flips only from the dedicated button, persists by identity, and resets for a new identity", async () => {
        const { fixture, target, visual } = createVisual();
        const original = createDataView({ cardValues: [10], comparisonValues: [8], labels: ["A"] });
        visual.update(createUpdateOptions(original));
        const inner = target.querySelector(".flip-card-inner")!;

        click(target.querySelector(".flip-card-flip-front")!);
        expect(inner.classList.contains("is-flipped")).toBe(true);
        expect(fixture.selectionManager.getSelectionIds()).toHaveLength(0);

        visual.update(createUpdateOptions(original, 360, 200));
        expect(target.querySelector(".flip-card-inner")?.classList.contains("is-flipped")).toBe(true);

        visual.update(createUpdateOptions(createDataView({ cardValues: [10], comparisonValues: [8], labels: ["B"] })));
        expect(target.querySelector(".flip-card-inner")?.classList.contains("is-flipped")).toBe(false);

        click(target.querySelector(".flip-card-front-content")!);
        await flushPromises();
        expect(target.querySelector(".flip-card-inner")?.classList.contains("is-flipped")).toBe(false);
        expect(fixture.selectionManager.getSelectionIds()).toHaveLength(1);
    });

    it("resets when Default Face changes and honors the configured face when the button is hidden", () => {
        const { target, visual } = createVisual();
        visual.update(createUpdateOptions(createDataView({ cardValues: [10], labels: ["A"] })));
        visual.update(createUpdateOptions(createDataView({
            cardValues: [10],
            labels: ["A"],
            metadataObjects: { flipBehavior: { defaultFace: "back", showButton: false } },
        })));

        expect(target.querySelector(".flip-card-inner")?.classList.contains("is-flipped")).toBe(true);
        expect((target.querySelector(".flip-card-flip-front") as HTMLButtonElement).hidden).toBe(true);
    });

    it("opens native card and blank-space context menus without flipping", () => {
        const { fixture, target, visual } = createVisual();
        visual.update(createUpdateOptions(createDataView({ cardValues: [10], labels: ["A"] })));
        const wrapper = target.querySelector(".flip-card-wrapper")!;
        wrapper.dispatchEvent(new MouseEvent("contextmenu", { bubbles: true, clientX: 12, clientY: 34 }));

        expect(fixture.spies.contextMenu).toHaveBeenCalledTimes(1);
        expect(fixture.spies.contextMenu.mock.calls[0]?.[0].getKey()).toBe("category:A");
        expect(target.querySelector(".flip-card-inner")?.classList.contains("is-flipped")).toBe(false);

        target.querySelector(".flip-card-container")!.dispatchEvent(new MouseEvent("contextmenu", {
            bubbles: true,
            clientX: 1,
            clientY: 2,
        }));
        expect(fixture.spies.contextMenu).toHaveBeenCalledTimes(2);
    });

    it("attaches native tooltip data including calculated and extra fields", () => {
        const { visual } = createVisual();
        visual.update(createUpdateOptions(createDataView({
            cardValues: [120],
            comparisonValues: [100],
            detailValues: [42],
            labels: ["Revenue"],
            targetValues: [115],
            tooltipColumns: [{ displayName: "Owner", values: ["Finance"] }],
        })));

        expect(tooltipMocks.addTooltip).toHaveBeenCalledTimes(2);
        const firstCall = tooltipMocks.addTooltip.mock.calls[0] as unknown as [
            { datum(): CardViewModel },
            (card: CardViewModel) => powerbi.extensibility.VisualTooltipDataItem[],
        ];
        const items = firstCall[1](firstCall[0].datum());
        expect(items.map((item) => item.displayName)).toEqual(expect.arrayContaining([
            "KPI",
            "Revenue",
            "Orders",
            "Previous",
            "Target",
            "Variance vs Comparison",
            "KPI status",
            "Owner",
        ]));
    });

    it("renders missing, no-data, blank, invalid, compact, and tiny states", () => {
        const { target, visual } = createVisual();
        visual.update(createUpdateOptions(undefined));
        expect(target.textContent).toContain("Add Card Value");

        visual.update(createUpdateOptions(createDataView({ cardValues: [] })));
        expect(target.textContent).toContain("No data available");

        visual.update(createUpdateOptions(createDataView({ cardValues: [null] })));
        expect(target.textContent).toContain("Card Value is blank");

        visual.update(createUpdateOptions(createDataView({ cardValues: ["bad"] })));
        expect(target.textContent).toContain("Card Value must be numeric");

        visual.update(createUpdateOptions(createDataView(), 200, 120));
        expect(target.classList.contains("is-compact")).toBe(true);

        visual.update(createUpdateOptions(createDataView(), 119, 71));
        expect(target.textContent).toContain("Increase the visual size");
    });

    it("renders high-contrast and accessible ARIA state", () => {
        const { target, visual } = createVisual(true);
        visual.update(createUpdateOptions(createDataView({ cardValues: [10], labels: ["A"] })));

        const wrapper = target.querySelector(".flip-card-wrapper")!;
        const selectButton = target.querySelector(".flip-card-front-content")!;
        const flipButton = target.querySelector(".flip-card-flip-front")!;
        expect(wrapper.classList.contains("is-high-contrast")).toBe(true);
        expect(selectButton.getAttribute("aria-label")).toContain("Status No benchmark");
        expect(selectButton.getAttribute("aria-pressed")).toBe("false");
        expect(flipButton.getAttribute("aria-label")).toBe("Show details for A");
        expect(flipButton.getAttribute("aria-pressed")).toBe("false");
    });

    it("signals rendering lifecycle exactly once on success and reports unexpected failures", () => {
        const successful = createVisual();
        const options = createUpdateOptions(createDataView());
        successful.visual.update(options);
        expect(successful.fixture.spies.renderingStarted).toHaveBeenCalledTimes(1);
        expect(successful.fixture.spies.renderingFinished).toHaveBeenCalledTimes(1);
        expect(successful.fixture.spies.renderingFailed).not.toHaveBeenCalled();

        const failing = createVisual();
        vi.spyOn(failing.fixture.selectionManager, "getSelectionIds").mockImplementation(() => {
            throw new Error("Host selection failure");
        });
        expect(() => failing.visual.update(options)).toThrow("Host selection failure");
        expect(failing.fixture.spies.renderingStarted).toHaveBeenCalledTimes(1);
        expect(failing.fixture.spies.renderingFinished).not.toHaveBeenCalled();
        expect(failing.fixture.spies.renderingFailed).toHaveBeenCalledWith(options, "Host selection failure");
    });

    it("exposes the populated formatting model and cleans up on destroy", () => {
        const { target, visual } = createVisual();
        visual.update(createUpdateOptions(createDataView({
            metadataObjects: { cardAppearance: { cornerRadius: 22 } },
        })));

        expect(visual.getFormattingModel().cards).toHaveLength(6);
        visual.destroy();
        expect(target.childElementCount).toBe(0);
        expect(tooltipMocks.hide).toHaveBeenCalledTimes(1);
    });
});
