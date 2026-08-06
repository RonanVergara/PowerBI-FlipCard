import { describe, expect, it } from "vitest";

import { calculateCardLayout, calculateFaceLayout, FaceFeatureProfile, FaceLayoutSettings, LayoutSettings } from "../src/layout";

const base: LayoutSettings = {
    cardMode: "multiple", columnCalculation: "automatic", columns: 2, fixedHeight: 160, fixedWidth: 240,
    gap: 8, preferredHeight: 110, preferredWidth: 160, sizing: "fit",
};

describe("calculateCardLayout", () => {
    it("makes strict Single fill the viewport and ignore multi-card dimensions", () => {
        const layout = calculateCardLayout({ width: 333, height: 177 }, 1, { ...base, cardMode: "single", sizing: "fixed", fixedWidth: 500 }, { benchmark: false, flip: false });
        expect(layout).toMatchObject({ cardWidth: 333, cardHeight: 177, columns: 1, rows: 1, isGrid: false, overflowX: "hidden" });
    });

    it("makes Auto with one row use full-viewport single presentation", () => {
        const layout = calculateCardLayout({ width: 300, height: 150 }, 1, { ...base, cardMode: "auto", sizing: "fixed" }, { benchmark: false, flip: false });
        expect(layout).toMatchObject({ cardWidth: 300, cardHeight: 150, isGrid: false });
    });

    it("makes Multiple Fit with one row fill and Multiple Fixed honor dimensions", () => {
        expect(calculateCardLayout({ width: 400, height: 250 }, 1, base, { benchmark: false, flip: false }).isGrid).toBe(false);
        expect(calculateCardLayout({ width: 400, height: 250 }, 1, { ...base, sizing: "fixed" }, { benchmark: false, flip: false })).toMatchObject({ isGrid: true, cardWidth: 240, cardHeight: 160 });
    });

    it.each([[660, 290], [320, 200]])("fits four core cards in an unscrolled 2x2 at %sx%s", (width, height) => {
        const layout = calculateCardLayout({ width, height }, 4, base, { benchmark: false, flip: false });
        expect(layout).toMatchObject({ columns: 2, rows: 2, overflowX: "hidden", overflowY: "hidden", isTooSmall: false });
        expect(layout.cardWidth).toBeGreaterThanOrEqual(96);
        expect(layout.cardHeight).toBeGreaterThanOrEqual(64);
    });

    it("reduces Custom Fit columns before allowing horizontal overflow", () => {
        const layout = calculateCardLayout({ width: 320, height: 200 }, 4, { ...base, columnCalculation: "custom", columns: 4 }, { benchmark: false, flip: false });
        expect(layout.columns).toBeLessThan(4);
        expect(layout.overflowX).toBe("hidden");
    });

    it("allows intentional Fixed overflow", () => {
        const layout = calculateCardLayout({ width: 200, height: 120 }, 4, { ...base, columnCalculation: "custom", columns: 2, sizing: "fixed" }, { benchmark: false, flip: false });
        expect(layout.overflowX).toBe("auto");
        expect(layout.overflowY).toBe("auto");
    });

    it("honors configured Fixed dimensions even when optional content has a larger Fit safety target", () => {
        const layout = calculateCardLayout({ width: 300, height: 180 }, 2, { ...base, fixedWidth: 100, fixedHeight: 70, sizing: "fixed" }, { benchmark: true, flip: true });
        expect(layout).toMatchObject({ cardWidth: 100, cardHeight: 70 });
    });

    it("uses too-small only when one feature-aware card cannot fit, independent of count", () => {
        expect(calculateCardLayout({ width: 95, height: 100 }, 1, base, { benchmark: false, flip: false }).isTooSmall).toBe(true);
        const many = calculateCardLayout({ width: 320, height: 100 }, 100, base, { benchmark: false, flip: false });
        expect(many.isTooSmall).toBe(false);
        expect(many.overflowY).toBe("auto");
    });
});

const faceSettings: FaceLayoutSettings = {
    backLayout: "auto", configuredPadding: 16, controlClusterWidth: 0, frontPresentation: "auto",
    responsivePriority: "automatic", sectionSpacing: 8, statusPresentation: "pill",
};
const faceProfile: FaceFeatureProfile = { backItemCount: 4, hasFlipControl: false, hasInsight: true, hasSecondaryReference: true, hasStatus: true };

describe("calculateFaceLayout", () => {
    it("selects Split only when real secondary content and the exact safety limits are met", () => {
        expect(calculateFaceLayout({ width: 320, height: 180 }, faceSettings, faceProfile).frontPresentation).toBe("split");
        expect(calculateFaceLayout({ width: 320, height: 180 }, faceSettings, { ...faceProfile, hasInsight: false, hasStatus: false }).frontPresentation).toBe("stacked");
        expect(calculateFaceLayout({ width: 299, height: 180 }, faceSettings, faceProfile).frontPresentation).toBe("stacked");
        expect(calculateFaceLayout({ width: 320, height: 119 }, faceSettings, faceProfile).frontPresentation).toBe("stacked");
    });

    it.each(["auto", "stacked", "split"] as const)("supports %s front presentation", (frontPresentation) => {
        const result = calculateFaceLayout({ width: 360, height: 180 }, { ...faceSettings, frontPresentation }, faceProfile);
        expect(result.frontPresentation).toBe(frontPresentation === "stacked" ? "stacked" : "split");
    });

    it("falls back safely when forced Split is unusable", () => {
        expect(calculateFaceLayout({ width: 220, height: 180 }, { ...faceSettings, frontPresentation: "split" }, faceProfile).frontPresentation).toBe("stacked");
    });

    it.each([
        ["auto", 320, 180, "tiles", 2],
        ["list", 320, 180, "list", 1],
        ["tiles", 320, 180, "tiles", 2],
        ["tiles", 240, 180, "list", 1],
    ] as const)("resolves %s back layout at %sx%s", (backLayout, width, height, expected, columns) => {
        expect(calculateFaceLayout({ width, height }, { ...faceSettings, backLayout }, faceProfile)).toMatchObject({ backLayout: expected, backColumns: columns });
    });

    it("compacts in the required order and honors responsive priority", () => {
        const compact = calculateFaceLayout({ width: 150, height: 90 }, faceSettings, faceProfile);
        expect(compact).toMatchObject({ density: "compact", showSecondaryReference: false, statusPresentation: "text" });
        const insight = calculateFaceLayout({ width: 100, height: 70 }, { ...faceSettings, responsivePriority: "insight" }, faceProfile);
        expect(insight).toMatchObject({ density: "minimal", showInsight: true, showStatus: false, statusPresentation: "iconOnly" });
        const status = calculateFaceLayout({ width: 100, height: 70 }, { ...faceSettings, responsivePriority: "status" }, faceProfile);
        expect(status).toMatchObject({ showInsight: false, showStatus: true });
    });

    it("clamps runtime spacing and padding", () => {
        expect(calculateFaceLayout({ width: 320, height: 180 }, { ...faceSettings, configuredPadding: 100, sectionSpacing: 100 }, faceProfile)).toMatchObject({ contentPadding: 40, sectionSpacing: 40 });
        expect(calculateFaceLayout({ width: 320, height: 180 }, { ...faceSettings, configuredPadding: -1, sectionSpacing: -1 }, faceProfile)).toMatchObject({ contentPadding: 0, sectionSpacing: 0 });
    });

    it("lowers the callout ceiling deterministically for long formatted values", () => {
        const short = calculateFaceLayout({ width: 320, height: 180 }, faceSettings, { ...faceProfile, heroCharacterCount: 5 });
        const long = calculateFaceLayout({ width: 320, height: 180 }, faceSettings, { ...faceProfile, heroCharacterCount: 18 });
        expect(long.calloutSizeCeiling).toBeLessThan(short.calloutSizeCeiling);
        expect(long.calloutSizeCeiling).toBeGreaterThanOrEqual(12);
    });
});
