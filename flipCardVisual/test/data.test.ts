import { describe, expect, it } from "vitest";

import { extractDataView } from "../src/data";
import { createKpiPresentation, getVarianceDisplayText, prepareTooltipItems } from "../src/valueFormatting";
import { createDataView, createHostFixture, fill, setCategoryObjects, setValueObjects } from "./helpers";

const formatting = { detail: { displayUnits: 0, precision: undefined }, main: { displayUnits: 0, precision: undefined } };
const kpiOptions = { direction: "higher" as const, neutralTolerancePercent: 0 };
const extract = (view: powerbi.DataView, locale = "en-US", custom: { detail: { displayUnits: number; precision: number | undefined }; main: { displayUnits: number; precision: number | undefined } } = formatting) => extractDataView(view, createHostFixture(false, locale).host, locale, custom, kpiOptions);

describe("extractDataView and model formatting", () => {
    it("extracts every row, binding, display name, identity, and tooltip", () => {
        const result = extract(createDataView({ cardValues: [125.5], comparisonValues: [100], detailValues: [42], labels: ["Vendor A"], targetValues: [120], tooltipColumns: [{ displayName: "Owner", values: ["Finance"] }] }));
        expect(result).toMatchObject({ state: "ready", hasCategory: true });
        expect(result.cards).toHaveLength(1);
        expect(result.cards[0]).toMatchObject({ label: "Vendor A", hasCategory: true });
        expect(result.cards[0]!.selectionId?.getKey()).toBe("category:Vendor A");
        expect(result.cards[0]!.tooltipValues[0]).toEqual({ displayName: "Owner", formattedValue: "Finance" });
    });

    it("uses Card Value source display name when Label is unbound", () => {
        const card = extract(createDataView({ cardName: "Net Sales", cardValues: [77] })).cards[0]!;
        expect(card.label).toBe("Net Sales");
        expect(card.labelDisplayName).toBe("Net Sales");
        expect(card.selectionId).toBeUndefined();
    });

    it("returns missing, no-data, and all-invalid states while retaining mixed rows", () => {
        expect(extractDataView(undefined, createHostFixture().host, "en-US", formatting, kpiOptions).state).toBe("missingCardValue");
        expect(extract(createDataView({ cardValues: [] })).state).toBe("noData");
        expect(extract(createDataView({ cardValues: [null, Number.NaN, Number.POSITIVE_INFINITY], labels: ["A", "B", "C"] })).state).toBe("invalidValue");
        const mixed = extract(createDataView({ cardValues: [10, null, "bad"], labels: ["A", "B", "C"] }));
        expect(mixed.state).toBe("ready");
        expect(mixed.cards.map((card) => card.cardValue.state)).toEqual(["valid", "blank", "invalid"]);
    });

    it("preserves percentage, currency, and model decimal precision", () => {
        expect(extract(createDataView({ cardFormat: "0.0%", cardValues: [0.125] })).cards[0]!.cardValue.formattedValue).toContain("12.5%");
        const currency = extract(createDataView({ cardFormat: "$#,0.00", cardValues: [1234.5] }), "en-US", { ...formatting, main: { displayUnits: 1, precision: undefined } }).cards[0]!.cardValue.formattedValue;
        expect(currency).toContain("$");
        expect(currency).toContain("1,234.50");
        expect(extract(createDataView({ cardFormat: "#,0.000", cardValues: [1.2] })).cards[0]!.cardValue.formattedValue).toContain("1.200");
    });

    it("honors explicit decimal overrides and display units", () => {
        const custom = { ...formatting, main: { displayUnits: 1000, precision: 1 } };
        const value = extract(createDataView({ cardFormat: "#,0.00", cardValues: [12500] }), "en-US", custom).cards[0]!.cardValue.formattedValue;
        expect(value).toMatch(/12\.5.*K/i);
    });

    it("formats using culture-aware separators", () => {
        const view = createDataView({ cardFormat: "#,0.00", cardValues: [1234.5] });
        const fixedUnits = { ...formatting, main: { displayUnits: 1, precision: undefined } };
        expect(extract(view, "en-US", fixedUnits).cards[0]!.cardValue.formattedValue).toContain("1,234.50");
        expect(extract(view, "de-DE", fixedUnits).cards[0]!.cardValue.formattedValue).toContain("1.234,50");
    });

    it("resolves every fx color from category objects before value-column and static constants", () => {
        const view = createDataView({ cardValues: [10], labels: ["A"], metadataObjects: {
            cardAppearance: { frontBackground: fill("#100000"), borderColor: fill("#200000"), accentColor: fill("#300000") },
            mainValue: { fontColor: fill("#400000") }, benchmark: { statusIndicatorColor: fill("#500000") },
        } });
        setValueObjects(view, [{ cardAppearance: { frontBackground: fill("#110000"), borderColor: fill("#220000") }, mainValue: { fontColor: fill("#440000") } }]);
        setCategoryObjects(view, [{ cardAppearance: { frontBackground: fill("#111111"), accentColor: fill("#333333") }, benchmark: { statusIndicatorColor: fill("#555555") } }]);
        expect(extract(view).cards[0]!.colorOverrides).toEqual({ frontBackground: "#111111", borderColor: "#220000", accentColor: "#333333", mainValueColor: "#440000", statusIndicatorColor: "#555555" });
    });

    it("supports identity-less static fx evaluation and restores static constants after a rule is cleared", () => {
        const cases = [
            ["cardAppearance", "frontBackground", "frontBackground"], ["cardAppearance", "borderColor", "borderColor"],
            ["cardAppearance", "accentColor", "accentColor"], ["mainValue", "fontColor", "mainValueColor"],
            ["benchmark", "statusIndicatorColor", "statusIndicatorColor"],
        ] as const;
        for (const [objectName, propertyName, resultName] of cases) {
            const view = createDataView({ cardValues: [10], metadataObjects: { [objectName]: { [propertyName]: fill("#ABCDEF") } } });
            setValueObjects(view, [{ [objectName]: { [propertyName]: fill("#FEDCBA") } }]);
            expect(extract(view).cards[0]!.colorOverrides[resultName]).toBe("#FEDCBA");
            setValueObjects(view, []);
            expect(extract(view).cards[0]!.colorOverrides[resultName]).toBe("#ABCDEF");
        }
    });

    it("builds zero-safe variance and meaningful feature-gated tooltips", () => {
        const card = extract(createDataView({ cardValues: [10], comparisonValues: [0], detailValues: [4], targetValues: [8] })).cards[0]!;
        card.varianceText = getVarianceDisplayText(card, "percentage", "en-US", formatting.detail);
        card.presentation = createKpiPresentation(card, "percentage", "en-US", formatting.detail);
        prepareTooltipItems(card, { benchmark: false, detail: false });
        expect(card.tooltipItems.map((item) => item.displayName)).toEqual(["Revenue"]);
        prepareTooltipItems(card, { benchmark: true, detail: true });
        expect(card.presentation.insight?.text).toContain("vs Previous Month");
        expect(card.presentation.insight?.text).not.toMatch(/NaN|Infinity|unavailable/);
        expect(card.tooltipItems.map((item) => item.displayName)).toEqual(expect.arrayContaining(["Orders", "Previous Month", "Target"]));
    });

    it("builds viewport-independent reference-aware presentation without duplicating references", () => {
        const card = extract(createDataView({ cardValues: [125.5], comparisonValues: [112], targetValues: [120] })).cards[0]!;
        card.presentation = createKpiPresentation(card, "percentage", "en-US", formatting.detail);
        expect(card.presentation.insight?.text).toMatch(/vs Previous Month$/);
        expect(card.presentation.status?.text).toContain("Target");
        expect(card.presentation.status?.referenceName).toBe("Target");
    });

    it("formats large negative and negative-reference variance safely", () => {
        const card = extract(createDataView({ cardFormat: "$#,0.00", cardValues: [-94000], comparisonValues: [-100000] })).cards[0]!;
        card.presentation = createKpiPresentation(card, "both", "en-US", { displayUnits: 1000, precision: 1 });
        expect(card.presentation.insight?.text).toMatch(/6\.0.*K.*6\.0%.*Previous Month/i);
    });
});
