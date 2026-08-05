import { describe, expect, it } from "vitest";

import { extractDataView } from "../src/data";
import { getVarianceDisplayText, prepareTooltipItems } from "../src/valueFormatting";
import { createDataView, createHostFixture } from "./helpers";

const formatting = {
    detail: { displayUnits: 0, precision: undefined },
    main: { displayUnits: 0, precision: undefined },
};
const kpiOptions = { direction: "higher" as const, neutralTolerancePercent: 0 };

describe("extractDataView", () => {
    it("extracts every field, display name, format, identity, and tooltip", () => {
        const host = createHostFixture().host;
        const result = extractDataView(createDataView({
            cardValues: [125.5],
            comparisonValues: [100],
            detailValues: [42],
            labels: ["CSAT Score"],
            targetValues: [120],
            tooltipColumns: [
                { displayName: "Owner", values: ["Customer Success"] },
                { displayName: "Confidence", format: "0.0%", values: [0.975] },
            ],
        }), host, "en-US", formatting, kpiOptions);

        expect(result.state).toBe("ready");
        expect(result.cards).toHaveLength(1);
        const card = result.cards[0]!;
        expect(card.label).toBe("CSAT Score");
        expect(card.cardValue.displayName).toBe("Revenue");
        expect(card.cardValue.source?.format).toBe("$#,0.00");
        expect(card.cardValue.formattedValue).toContain("125.50");
        expect(card.detailValue.value).toBe(42);
        expect(card.comparisonValue.value).toBe(100);
        expect(card.targetValue.value).toBe(120);
        expect(card.tooltipValues.map((value) => value.displayName)).toEqual(["Owner", "Confidence"]);
        expect(card.selectionId?.getKey()).toBe("category:CSAT Score");
    });

    it("supports Card Value alone without a selection identity", () => {
        const result = extractDataView(createDataView({ cardValues: [77] }), createHostFixture().host, "en-US", formatting, kpiOptions);
        const card = result.cards[0]!;

        expect(card.label).toBe("Revenue");
        expect(card.selectionId).toBeUndefined();
        expect(card.detailValue.state).toBe("missing");
        expect(card.comparisonValue.state).toBe("missing");
        expect(card.targetValue.state).toBe("missing");
    });

    it.each([
        [null, "blank"],
        ["not numeric", "invalid"],
        [Number.NaN, "invalid"],
        [Number.POSITIVE_INFINITY, "invalid"],
    ] as const)("classifies %s Card Value as %s", (value, expectedState) => {
        const result = extractDataView(createDataView({ cardValues: [value] }), createHostFixture().host, "en-US", formatting, kpiOptions);
        expect(result.cards[0]?.cardValue.state).toBe(expectedState);
    });

    it("returns author-facing states for missing bindings and filtered rows", () => {
        expect(extractDataView(undefined, createHostFixture().host, "en-US", formatting, kpiOptions).state).toBe("missingCardValue");
        expect(extractDataView(createDataView({ cardValues: [] }), createHostFixture().host, "en-US", formatting, kpiOptions).state).toBe("noData");
    });

    it("uses multiple category rows only when Label is assigned", () => {
        const withCategory = extractDataView(createDataView({ cardValues: [1, 2], labels: ["A", "B"] }), createHostFixture().host, "en-US", formatting, kpiOptions);
        const withoutCategory = extractDataView(createDataView({ cardValues: [1, 2] }), createHostFixture().host, "en-US", formatting, kpiOptions);

        expect(withCategory.cards.map((card) => card.label)).toEqual(["A", "B"]);
        expect(withoutCategory.cards).toHaveLength(1);
    });

    it("builds absolute, percentage, both, and zero-reference tooltip variance", () => {
        const card = extractDataView(createDataView({ cardValues: [120], comparisonValues: [100] }), createHostFixture().host, "en-US", formatting, kpiOptions).cards[0]!;
        expect(getVarianceDisplayText(card, "absolute", "en-US", formatting.detail)).toContain("20.00");
        expect(getVarianceDisplayText(card, "percentage", "en-US", formatting.detail)).toContain("20.00%");
        expect(getVarianceDisplayText(card, "both", "en-US", formatting.detail)).toMatch(/20\.00.*20\.00%/);

        const zeroReference = extractDataView(createDataView({ cardValues: [10], comparisonValues: [0] }), createHostFixture().host, "en-US", formatting, kpiOptions).cards[0]!;
        zeroReference.varianceText = getVarianceDisplayText(zeroReference, "percentage", "en-US", formatting.detail);
        prepareTooltipItems(zeroReference);
        expect(zeroReference.varianceText).toBe("Percentage unavailable (zero reference)");
        expect(zeroReference.tooltipItems.some((item) => item.value.includes("zero reference"))).toBe(true);
    });
});
