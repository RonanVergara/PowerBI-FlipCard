import { afterEach, describe, expect, it, vi } from "vitest";

import { createMotionConfiguration, startFaceTransition } from "../src/motion";

function transitionEvent(type: "transitionend" | "transitioncancel", propertyName: string): Event {
    const event = new Event(type, { bubbles: true });
    Object.defineProperty(event, "propertyName", { value: propertyName });
    return event;
}

function surface() {
    return {
        backFace: document.createElement("div"),
        frontFace: document.createElement("div"),
        inner: document.createElement("div"),
    };
}

describe("motion configuration", () => {
    it.each([
        ["horizontal", "left", "up", -180],
        ["horizontal", "right", "up", 180],
        ["vertical", "right", "up", 180],
        ["vertical", "right", "down", -180],
        ["fade", "right", "up", 180],
        ["none", "right", "up", 180],
    ] as const)("maps %s with supported directions", (style, horizontal, vertical, rotationDegrees) => {
        expect(createMotionConfiguration(style, horizontal, vertical, "smooth", 450, "standard", false)).toMatchObject({
            durationMs: style === "none" ? 0 : 450,
            easing: "cubic-bezier(.22, .61, .36, 1)",
            perspectivePx: 1000,
            rotationDegrees,
            style,
        });
    });

    it.each([
        ["smooth", "cubic-bezier(.22, .61, .36, 1)"],
        ["snappy", "cubic-bezier(.2, .8, .2, 1)"],
        ["gentle", "cubic-bezier(.37, 0, .63, 1)"],
    ] as const)("maps %s easing", (easing, value) => {
        expect(createMotionConfiguration("fade", "right", "up", easing, 450, "standard", false).easing).toBe(value);
    });

    it.each([["subtle", 1600], ["standard", 1000], ["deep", 650]] as const)("maps %s perspective", (perspective, pixels) => {
        expect(createMotionConfiguration("horizontal", "right", "up", "smooth", 450, perspective, false).perspectivePx).toBe(pixels);
    });

    it("clamps duration and eliminates motion for reduced motion", () => {
        expect(createMotionConfiguration("fade", "right", "up", "smooth", -1, "standard", false).durationMs).toBe(0);
        expect(createMotionConfiguration("fade", "right", "up", "smooth", 2500, "standard", false).durationMs).toBe(2000);
        expect(createMotionConfiguration("vertical", "right", "up", "smooth", 450, "standard", true).durationMs).toBe(0);
    });
});

describe("face transition completion", () => {
    afterEach(() => { vi.useRealTimers(); });

    it("filters transform completion by expected target and property and completes exactly once", () => {
        vi.useFakeTimers();
        const elements = surface(); const activate = vi.fn(); const complete = vi.fn();
        const controller = startFaceTransition({ activate, durationMs: 450, from: "front", onComplete: complete, style: "horizontal", surface: elements, to: "back" });
        expect(controller.state).toBe("turningToBack"); expect(activate).toHaveBeenCalledOnce();
        elements.frontFace.dispatchEvent(transitionEvent("transitionend", "transform"));
        elements.inner.dispatchEvent(transitionEvent("transitionend", "opacity"));
        expect(complete).not.toHaveBeenCalled();
        elements.inner.dispatchEvent(transitionEvent("transitionend", "transform"));
        controller.complete(); vi.advanceTimersByTime(1000);
        expect(complete).toHaveBeenCalledOnce();
    });

    it("uses destination opacity for Fade and accepts transitioncancel", () => {
        vi.useFakeTimers();
        const elements = surface(); const complete = vi.fn();
        startFaceTransition({ activate: vi.fn(), durationMs: 300, from: "front", onComplete: complete, style: "fade", surface: elements, to: "back" });
        elements.frontFace.dispatchEvent(transitionEvent("transitioncancel", "opacity"));
        expect(complete).not.toHaveBeenCalled();
        elements.backFace.dispatchEvent(transitionEvent("transitioncancel", "opacity"));
        expect(complete).toHaveBeenCalledOnce();
    });

    it("falls back after duration plus 100 ms", () => {
        vi.useFakeTimers();
        const complete = vi.fn();
        startFaceTransition({ activate: vi.fn(), durationMs: 450, from: "back", onComplete: complete, style: "vertical", surface: surface(), to: "front" });
        vi.advanceTimersByTime(549); expect(complete).not.toHaveBeenCalled();
        vi.advanceTimersByTime(1); expect(complete).toHaveBeenCalledOnce();
    });

    it.each([["none", 450], ["fade", 0]] as const)("completes %s/%d synchronously through the same guard", (style, durationMs) => {
        vi.useFakeTimers();
        const complete = vi.fn();
        const controller = startFaceTransition({ activate: vi.fn(), durationMs, from: "front", onComplete: complete, style, surface: surface(), to: "back" });
        expect(complete).toHaveBeenCalledOnce(); controller.complete(); vi.runAllTimers(); expect(complete).toHaveBeenCalledOnce();
    });

    it("removes event listeners and the fallback when disposed", () => {
        vi.useFakeTimers();
        const elements = surface(); const complete = vi.fn();
        const controller = startFaceTransition({ activate: vi.fn(), durationMs: 450, from: "front", onComplete: complete, style: "horizontal", surface: elements, to: "back" });
        controller.dispose();
        elements.inner.dispatchEvent(transitionEvent("transitionend", "transform")); vi.runAllTimers();
        expect(complete).not.toHaveBeenCalled();
    });
});
