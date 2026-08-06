import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const tooltipMocks = vi.hoisted(() => ({ addTooltip: vi.fn(), hide: vi.fn() }));
vi.mock("powerbi-visuals-utils-tooltiputils", () => ({ createTooltipServiceWrapper: () => ({ addTooltip: tooltipMocks.addTooltip, hide: tooltipMocks.hide }) }));

import powerbi from "powerbi-visuals-api";
import { CardViewModel } from "../src/types";
import { Visual } from "../src/visual";
import { createDataView, createHostFixture, createUpdateOptions, flushPromises } from "./helpers";

const multipleFit = { multipleCards: { enabled: true, mode: "multiple", sizing: "fit" } } as powerbi.DataViewObjects;
const autoFit = { multipleCards: { enabled: true, mode: "auto", sizing: "fit" } } as powerbi.DataViewObjects;
const flipDetail = { flip: { enabled: true, motionStyle: "none" } } as powerbi.DataViewObjects;

function createVisual(highContrast = false) {
    const target = document.createElement("div");
    const fixture = createHostFixture(highContrast);
    const visual = new Visual({ element: target, host: fixture.host });
    return { fixture, target, visual };
}

function click(element: Element, options: MouseEventInit = {}): void { element.dispatchEvent(new MouseEvent("click", { bubbles: true, ...options })); }
function wrappers(target: HTMLElement): NodeListOf<HTMLElement> { return target.querySelectorAll<HTMLElement>(".flip-card-wrapper"); }
function finishTransition(element: Element, propertyName: "opacity" | "transform", type: "transitioncancel" | "transitionend" = "transitionend"): void {
    const event = new Event(type, { bubbles: true }); Object.defineProperty(event, "propertyName", { value: propertyName }); element.dispatchEvent(event);
}

describe("Visual state, interactions, and combinations", () => {
    beforeEach(() => { tooltipMocks.addTooltip.mockReset(); tooltipMocks.hide.mockReset(); });
    afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

    it("atomically transitions missing Card Value to ready", () => {
        const { target, visual } = createVisual();
        visual.update(createUpdateOptions(undefined));
        expect(target.textContent).toContain("Add Card Value"); expect(wrappers(target)).toHaveLength(0);
        visual.update(createUpdateOptions(createDataView()));
        expect(wrappers(target)).toHaveLength(1); expect(target.querySelectorAll(".flip-card-state")).toHaveLength(0);
    });

    it("atomically transitions no data to ready", () => {
        const { target, visual } = createVisual();
        visual.update(createUpdateOptions(createDataView({ cardValues: [] })));
        expect(target.textContent).toContain("No data available"); expect(wrappers(target)).toHaveLength(0);
        visual.update(createUpdateOptions(createDataView({ cardValues: [10] })));
        expect(wrappers(target)).toHaveLength(1); expect(target.querySelector(".flip-card-state")).toBeNull();
    });

    it("handles ready → missing/no-data → ready without mixing states or wrapper counts", () => {
        const { target, visual } = createVisual();
        visual.update(createUpdateOptions(createDataView())); expect(wrappers(target)).toHaveLength(1);
        visual.update(createUpdateOptions(undefined)); expect(wrappers(target)).toHaveLength(0);
        visual.update(createUpdateOptions(createDataView({ cardValues: [] }))); expect(wrappers(target)).toHaveLength(0);
        visual.update(createUpdateOptions(createDataView())); expect(wrappers(target)).toHaveLength(1); expect(target.textContent).not.toContain("Add Card Value");
    });

    it("uses one invalid full-visual state for all-blank/invalid input and row-local messages for mixed Multiple input", () => {
        const { target, visual } = createVisual();
        visual.update(createUpdateOptions(createDataView({ cardValues: [null, "bad"], labels: ["A", "B"], metadataObjects: multipleFit })));
        expect(target.textContent).toContain("contains only blank or invalid"); expect(wrappers(target)).toHaveLength(0);
        visual.update(createUpdateOptions(createDataView({ cardValues: [10, null, "bad"], labels: ["A", "B", "C"], metadataObjects: multipleFit })));
        expect(wrappers(target)).toHaveLength(3); expect(target.textContent).toContain("Card Value is blank"); expect(target.textContent).toContain("Card Value must be numeric");
    });

    it("renders four vendors as exactly 2x2 at both acceptance viewports without stale state or scrollbars", () => {
        const { target, visual } = createVisual();
        const view = createDataView({ cardValues: [10, 20, 30, 40], labels: ["A", "B", "C", "D"], metadataObjects: multipleFit });
        for (const [width, height] of [[660, 290], [320, 200]]) {
            visual.update(createUpdateOptions(view, width, height));
            const container = target.querySelector<HTMLElement>(".flip-card-container")!;
            expect(wrappers(target)).toHaveLength(4);
            expect(container.style.gridTemplateColumns).toContain("repeat(2");
            expect(container.style.overflowX).toBe("hidden");
            expect(container.style.overflowY).toBe("hidden");
            expect(target.textContent).not.toContain("Add Card Value");
        }
    });

    it("applies deterministic Single, Auto, and Multiple configuration behavior", () => {
        const { target, visual } = createVisual();
        visual.update(createUpdateOptions(createDataView({ cardValues: [1, 2], labels: ["A", "B"] })));
        expect(target.textContent).toContain("Single mode received multiple"); expect(wrappers(target)).toHaveLength(0);
        visual.update(createUpdateOptions(createDataView({ cardValues: [1, 2], labels: ["A", "B"], metadataObjects: autoFit })));
        expect(wrappers(target)).toHaveLength(2);
        visual.update(createUpdateOptions(createDataView({ cardValues: [1, 2], labels: ["A", "B"], categoryIdentities: false, metadataObjects: autoFit })));
        expect(target.textContent).toContain("identified Label rows"); expect(wrappers(target)).toHaveLength(0);
        visual.update(createUpdateOptions(createDataView({ metadataObjects: multipleFit })));
        expect(target.textContent).toContain("requires a bound Label"); expect(wrappers(target)).toHaveLength(0);
        visual.update(createUpdateOptions(createDataView({ cardValues: [1, 2] })));
        expect(target.textContent).toContain("Single mode received multiple"); expect(wrappers(target)).toHaveLength(0);
    });

    it("enforces sizing precedence for Auto one row and Multiple Fixed one row", () => {
        const { target, visual } = createVisual();
        visual.update(createUpdateOptions(createDataView({ cardValues: [1], labels: ["A"], metadataObjects: { multipleCards: { enabled: true, mode: "auto", sizing: "fixed", fixedWidth: 240, fixedHeight: 160 } } }), 400, 250));
        expect(wrappers(target)[0]!.style.width).toBe("400px");
        visual.update(createUpdateOptions(createDataView({ cardValues: [1], labels: ["A"], metadataObjects: { multipleCards: { enabled: true, mode: "multiple", sizing: "fixed", fixedWidth: 240, fixedHeight: 160 } } }), 200, 120));
        expect(wrappers(target)[0]!.style.width).toBe("240px");
        expect(target.querySelector<HTMLElement>(".flip-card-container")!.style.overflowX).toBe("auto");
    });

    it("performs front → back → front with one click, real controls, inert faces, and no selection calls", () => {
        const { fixture, target, visual } = createVisual();
        document.body.append(target);
        const view = createDataView({ cardValues: [10], detailValues: [4], labels: ["A"], metadataObjects: flipDetail });
        visual.update(createUpdateOptions(view));
        click(target.querySelector(".flip-card-flip-front")!);
        expect(target.querySelector(".flip-card-inner")!.classList.contains("is-back")).toBe(true);
        expect(target.querySelector(".flip-card-front")!.hasAttribute("inert")).toBe(true);
        expect(target.querySelector(".flip-card-back")!.hasAttribute("inert")).toBe(false);
        expect(document.activeElement).not.toBe(target.querySelector(".flip-card-flip-back"));
        click(target.querySelector(".flip-card-flip-back")!);
        expect(target.querySelector(".flip-card-inner")!.classList.contains("is-back")).toBe(false);
        expect(target.querySelector(".flip-card-back")!.hasAttribute("inert")).toBe(true);
        expect(document.activeElement).not.toBe(target.querySelector(".flip-card-flip-front"));
        expect(fixture.spies.select).not.toHaveBeenCalled(); expect(fixture.spies.selectionClear).not.toHaveBeenCalled();
        visual.destroy();
        target.remove();
    });

    it("locks horizontal motion, completes only on the expected event, and transfers keyboard focus afterward", () => {
        const { fixture, target, visual } = createVisual(); document.body.append(target);
        const view = createDataView({ cardValues: [10], detailValues: [4], labels: ["A"], metadataObjects: { flip: { enabled: true, animationDuration: 450, motionStyle: "horizontal" } } });
        visual.update(createUpdateOptions(view));
        const frontButton = target.querySelector<HTMLButtonElement>(".flip-card-flip-front")!; frontButton.focus();
        frontButton.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, key: "Enter" })); click(frontButton);
        const wrapper = wrappers(target)[0]!; const inner = target.querySelector<HTMLElement>(".flip-card-inner")!;
        expect(wrapper.dataset.transitionState).toBe("turningToBack"); expect(inner.classList.contains("is-back")).toBe(true);
        click(frontButton); expect(wrapper.dataset.transitionState).toBe("turningToBack");
        finishTransition(inner, "opacity"); expect(wrapper.dataset.transitionState).toBe("turningToBack");
        finishTransition(inner, "transform");
        expect(wrapper.dataset.transitionState).toBe("back"); expect(target.querySelector(".flip-card-front")?.hasAttribute("inert")).toBe(true);
        expect(document.activeElement).toBe(target.querySelector(".flip-card-flip-back"));
        expect(fixture.spies.select).not.toHaveBeenCalled();
        visual.destroy(); target.remove();
    });

    it("completes Fade on destination opacity and does not steal focus after pointer activation", () => {
        const { target, visual } = createVisual(); document.body.append(target);
        visual.update(createUpdateOptions(createDataView({ cardValues: [10], detailValues: [4], labels: ["A"], metadataObjects: { flip: { enabled: true, motionStyle: "fade", animationDuration: 300 } } })));
        const button = target.querySelector<HTMLButtonElement>(".flip-card-flip-front")!;
        button.dispatchEvent(new Event("pointerdown", { bubbles: true })); click(button, { detail: 1 });
        expect(wrappers(target)[0]!.dataset.transitionState).toBe("turningToBack");
        finishTransition(target.querySelector(".flip-card-back")!, "opacity");
        expect(wrappers(target)[0]!.dataset.transitionState).toBe("back");
        expect(document.activeElement).not.toBe(target.querySelector(".flip-card-flip-back"));
        visual.destroy(); target.remove();
    });

    it("uses the guarded fallback timer when no transition event arrives", () => {
        vi.useFakeTimers();
        const { target, visual } = createVisual();
        visual.update(createUpdateOptions(createDataView({ cardValues: [10], detailValues: [4], labels: ["A"], metadataObjects: { flip: { enabled: true, motionStyle: "vertical", animationDuration: 300 } } })));
        click(target.querySelector(".flip-card-flip-front")!);
        vi.advanceTimersByTime(399); expect(wrappers(target)[0]!.dataset.transitionState).toBe("turningToBack");
        vi.advanceTimersByTime(1); expect(wrappers(target)[0]!.dataset.transitionState).toBe("back");
        visual.destroy();
    });

    it("resolves an in-flight transition to its intended face during rerender", () => {
        const { target, visual } = createVisual();
        const view = createDataView({ cardValues: [10], detailValues: [4], labels: ["A"], metadataObjects: { flip: { enabled: true, motionStyle: "horizontal", animationDuration: 450 } } });
        visual.update(createUpdateOptions(view)); click(target.querySelector(".flip-card-flip-front")!);
        expect(wrappers(target)[0]!.dataset.transitionState).toBe("turningToBack");
        visual.update(createUpdateOptions(view, 420, 220));
        expect(wrappers(target)[0]!.dataset.transitionState).toBe("back"); expect(target.querySelector(".flip-card-inner")?.classList.contains("is-back")).toBe(true);
        visual.destroy();
    });

    it("preserves keyboard focus intent across rerender and too-small recovery", () => {
        const { target, visual } = createVisual(); document.body.append(target);
        const view = createDataView({ cardValues: [10], detailValues: [4], labels: ["A"], metadataObjects: { flip: { enabled: true, motionStyle: "horizontal", animationDuration: 450 } } });
        visual.update(createUpdateOptions(view));
        const front = target.querySelector<HTMLButtonElement>(".flip-card-flip-front")!; front.focus();
        front.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, key: "Enter" })); click(front);
        visual.update(createUpdateOptions(view, 80, 50)); expect(target.textContent).toContain("cannot render one usable card");
        visual.update(createUpdateOptions(view, 420, 220));
        expect(wrappers(target)[0]!.dataset.transitionState).toBe("back"); expect(document.activeElement).toBe(target.querySelector(".flip-card-flip-back"));
        visual.destroy(); target.remove();
    });

    it("immediately resolves active motion when reduced motion becomes enabled and cleans up matchMedia", () => {
        let matches = false; let listener: (() => void) | undefined;
        const add = vi.fn((_type: string, callback: () => void) => { listener = callback; });
        const remove = vi.fn();
        vi.stubGlobal("matchMedia", vi.fn(() => ({ addEventListener: add, get matches() { return matches; }, removeEventListener: remove })));
        const { target, visual } = createVisual();
        visual.update(createUpdateOptions(createDataView({ cardValues: [10], detailValues: [4], labels: ["A"], metadataObjects: { flip: { enabled: true, motionStyle: "horizontal", animationDuration: 450 } } })));
        click(target.querySelector(".flip-card-flip-front")!); expect(wrappers(target)[0]!.dataset.transitionState).toBe("turningToBack");
        matches = true; listener?.();
        expect(wrappers(target)[0]!.dataset.transitionState).toBe("back"); expect(wrappers(target)[0]!.style.getPropertyValue("--flip-duration")).toBe("0ms");
        visual.destroy(); expect(remove).toHaveBeenCalledOnce();
    });

    it("returns from unused back background without selection", () => {
        const { fixture, target, visual } = createVisual();
        visual.update(createUpdateOptions(createDataView({ cardValues: [10], detailValues: [4], labels: ["A"], metadataObjects: flipDetail })));
        click(target.querySelector(".flip-card-flip-front")!); click(target.querySelector(".flip-card-back-content")!);
        expect(target.querySelector(".flip-card-inner")!.classList.contains("is-back")).toBe(false);
        expect(fixture.spies.select).not.toHaveBeenCalled();
    });

    it("preserves face through resize and formatting updates, including too-small DOM reconstruction", () => {
        const { target, visual } = createVisual();
        const base = createDataView({ cardValues: [10], detailValues: [4], labels: ["A"], metadataObjects: flipDetail });
        visual.update(createUpdateOptions(base)); click(target.querySelector(".flip-card-flip-front")!);
        visual.update(createUpdateOptions(base, 420, 220)); expect(target.querySelector(".flip-card-inner")!.classList.contains("is-back")).toBe(true);
        const formatted = createDataView({ cardValues: [10], detailValues: [4], labels: ["A"], metadataObjects: { flip: { enabled: true, motionStyle: "none" }, cardAppearance: { cornerRadius: 20 } } });
        visual.update(createUpdateOptions(formatted, 420, 220)); expect(target.querySelector(".flip-card-inner")!.classList.contains("is-back")).toBe(true);
        visual.update(createUpdateOptions(formatted, 80, 50)); expect(wrappers(target)).toHaveLength(0); expect(target.textContent).toContain("cannot render one usable card");
        visual.update(createUpdateOptions(formatted, 420, 220)); expect(wrappers(target)).toHaveLength(1); expect(target.querySelector(".flip-card-inner")!.classList.contains("is-back")).toBe(true);
    });

    it("starts changed identities on front and immediately removes back DOM when Flip is disabled", () => {
        const { target, visual } = createVisual();
        visual.update(createUpdateOptions(createDataView({ cardValues: [10], detailValues: [4], labels: ["A"], metadataObjects: flipDetail })));
        click(target.querySelector(".flip-card-flip-front")!);
        visual.update(createUpdateOptions(createDataView({ cardValues: [10], detailValues: [4], labels: ["B"], metadataObjects: flipDetail })));
        expect(target.querySelector(".flip-card-inner")!.classList.contains("is-back")).toBe(false);
        visual.update(createUpdateOptions(createDataView({ cardValues: [10], detailValues: [4], labels: ["B"] })));
        expect(target.querySelector(".flip-card-back")).toBeNull(); expect(target.querySelector(".flip-card-flip-front")).toBeNull();
    });

    it("keeps default core output free of all optional UI", () => {
        const { target, visual } = createVisual();
        visual.update(createUpdateOptions(createDataView({ cardValues: [10], comparisonValues: [8], detailValues: [4], targetValues: [12] })));
        expect(target.textContent).toContain("Revenue"); expect(target.textContent).toContain("10");
        expect(target.querySelector(".flip-card-back")).toBeNull(); expect(target.querySelector(".flip-card-status")).not.toBeNull();
        expect((target.querySelector(".flip-card-status") as HTMLElement).hidden).toBe(true);
        expect(target.textContent).not.toContain("No benchmark"); expect(target.textContent).not.toContain("Previous Month");
    });

    it.each([
        ["core only", {}, false, false],
        ["core + benchmark", { benchmark: { enabled: true } }, true, false],
        ["core + flip/detail", { flip: { enabled: true } }, false, true],
        ["multiple only", { multipleCards: { enabled: true, mode: "multiple" } }, false, false],
        ["multiple + benchmark", { multipleCards: { enabled: true, mode: "multiple" }, benchmark: { enabled: true } }, true, false],
        ["multiple + benchmark + flip", { multipleCards: { enabled: true, mode: "multiple" }, benchmark: { enabled: true }, flip: { enabled: true } }, true, true],
    ] as const)("renders the %s feature combination independently", (_name, metadataObjects, expectBenchmark, expectFlip) => {
        const { target, visual } = createVisual();
        visual.update(createUpdateOptions(createDataView({ cardValues: [10], comparisonValues: [8], detailValues: [4], labels: ["A"], metadataObjects: metadataObjects as powerbi.DataViewObjects })));
        expect(wrappers(target)).toHaveLength(1);
        expect(!(target.querySelector<HTMLElement>(".flip-card-insight")?.hidden ?? true)).toBe(expectBenchmark);
        expect(target.querySelector(".flip-card-flip-front") !== null).toBe(expectFlip);
    });

    it("preserves native selection, toggle-clear, multi-select, blank clear, and selection restoration", async () => {
        const { fixture, target, visual } = createVisual();
        const view = createDataView({ cardValues: [10, 20], labels: ["A", "B"], metadataObjects: multipleFit });
        visual.update(createUpdateOptions(view)); const buttons = target.querySelectorAll(".flip-card-front-content");
        click(buttons[0]!); await flushPromises(); click(buttons[1]!, { ctrlKey: true }); await flushPromises();
        expect(fixture.selectionManager.getSelectionIds()).toHaveLength(2);
        click(buttons[0]!); await flushPromises(); click(buttons[0]!); await flushPromises(); expect(fixture.selectionManager.getSelectionIds()).toHaveLength(0);
        click(buttons[1]!); await flushPromises(); visual.update(createUpdateOptions(view, 400, 220)); expect(wrappers(target)[1]!.classList.contains("is-selected")).toBe(true);
        click(target.querySelector(".flip-card-container")!); await flushPromises(); expect(fixture.selectionManager.getSelectionIds()).toHaveLength(0);
    });

    it("does not clear selection for clicks that land inside a transitioning card", async () => {
        const { fixture, target, visual } = createVisual();
        visual.update(createUpdateOptions(createDataView({ cardValues: [10], detailValues: [4], labels: ["A"], metadataObjects: { flip: { enabled: true, motionStyle: "horizontal" } } })));
        click(target.querySelector(".flip-card-flip-front")!);
        click(target.querySelector(".flip-card-inner")!);
        await flushPromises();
        expect(fixture.spies.selectionClear).not.toHaveBeenCalled(); expect(fixture.spies.select).not.toHaveBeenCalled();
        visual.destroy();
    });

    it("disables selection when requested but retains context menus", async () => {
        const { fixture, target, visual } = createVisual();
        visual.update(createUpdateOptions(createDataView({ cardValues: [10], labels: ["A"], metadataObjects: { interactions: { selectionEnabled: false } } })));
        click(target.querySelector(".flip-card-front-content")!); await flushPromises(); expect(fixture.spies.select).not.toHaveBeenCalled();
        target.querySelector(".flip-card-wrapper")!.dispatchEvent(new MouseEvent("contextmenu", { bubbles: true, clientX: 3, clientY: 4 }));
        expect(fixture.spies.contextMenu).toHaveBeenCalledTimes(1);
    });

    it("attaches native tooltips with only meaningful enabled feature content", () => {
        const { visual } = createVisual();
        visual.update(createUpdateOptions(createDataView({ cardValues: [120], comparisonValues: [100], detailValues: [42], labels: ["A"], targetValues: [115], tooltipColumns: [{ displayName: "Owner", values: ["Finance"] }], metadataObjects: { benchmark: { enabled: true }, flip: { enabled: true } } })));
        expect(tooltipMocks.addTooltip).toHaveBeenCalledTimes(2);
        const call = tooltipMocks.addTooltip.mock.calls[0] as unknown as [{ datum(): CardViewModel }, (card: CardViewModel) => powerbi.extensibility.VisualTooltipDataItem[]];
        const names = call[1](call[0].datum()).map((item) => item.displayName);
        expect(names).toEqual(expect.arrayContaining(["Vendor", "Revenue", "Orders", "Previous Month", "Target", "Owner"]));
        expect(names.some((name) => name.includes("No benchmark"))).toBe(false);
    });

    it("applies high contrast and reports rendering lifecycle", () => {
        const { fixture, target, visual } = createVisual(true); const options = createUpdateOptions(createDataView());
        visual.update(options);
        expect(wrappers(target)[0]!.classList.contains("is-high-contrast")).toBe(true);
        expect(wrappers(target)[0]!.style.getPropertyValue("--flip-front-background")).toBe("#000000");
        expect(fixture.spies.renderingStarted).toHaveBeenCalledOnce(); expect(fixture.spies.renderingFinished).toHaveBeenCalledOnce(); expect(fixture.spies.renderingFailed).not.toHaveBeenCalled();
    });

    it("reports unexpected rendering failures without a false finished event", () => {
        const { fixture, visual } = createVisual();
        vi.spyOn(fixture.selectionManager, "getSelectionIds").mockImplementation(() => { throw new Error("Host selection failure"); });
        const options = createUpdateOptions(createDataView());
        expect(() => visual.update(options)).toThrow("Host selection failure");
        expect(fixture.spies.renderingFailed).toHaveBeenCalledWith(options, "Host selection failure");
        expect(fixture.spies.renderingFinished).not.toHaveBeenCalled();
    });

    it("exposes seven Format cards and cleans up", () => {
        const { target, visual } = createVisual(); visual.update(createUpdateOptions(createDataView()));
        expect(visual.getFormattingModel().cards).toHaveLength(7);
        visual.destroy(); expect(target.childElementCount).toBe(0); expect(tooltipMocks.hide).toHaveBeenCalled();
    });
});
