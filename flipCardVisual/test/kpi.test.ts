import { describe, expect, it } from "vitest";

import { calculateKpi } from "../src/kpi";
import { NumericFieldValue } from "../src/types";

function field(value: number | undefined, state: NumericFieldValue["state"] = value === undefined ? "missing" : "valid"): NumericFieldValue {
    return {
        displayName: "Value",
        formattedValue: value === undefined ? "Not assigned" : String(value),
        rawValue: value,
        source: undefined,
        state,
        value,
    };
}

describe("calculateKpi", () => {
    it("prioritizes target for status and comparison for variance", () => {
        const result = calculateKpi(field(120), field(100), field(130), {
            direction: "higher",
            neutralTolerancePercent: 0,
        });

        expect(result.statusReference).toBe("target");
        expect(result.varianceReference).toBe("comparison");
        expect(result.status).toBe("negative");
        expect(result.absoluteVariance).toBe(20);
        expect(result.percentageVariance).toBe(0.2);
    });

    it("falls back from an invalid target to comparison", () => {
        const result = calculateKpi(field(120), field(100), field(undefined, "invalid"), {
            direction: "higher",
            neutralTolerancePercent: 0,
        });

        expect(result.statusReference).toBe("comparison");
        expect(result.status).toBe("positive");
    });

    it.each([
        ["higher", 110, "positive"],
        ["higher", 90, "negative"],
        ["lower", 90, "positive"],
        ["lower", 110, "negative"],
    ] as const)("applies %s-is-better direction", (direction, value, status) => {
        expect(calculateKpi(field(value), field(100), field(undefined), {
            direction,
            neutralTolerancePercent: 0,
        }).status).toBe(status);
    });

    it("treats differences inside percentage tolerance as neutral", () => {
        const result = calculateKpi(field(104), field(undefined), field(100), {
            direction: "higher",
            neutralTolerancePercent: 5,
        });

        expect(result.status).toBe("neutral");
    });

    it("uses the absolute reference for tolerance and percentage variance", () => {
        const result = calculateKpi(field(-94), field(-100), field(undefined), {
            direction: "higher",
            neutralTolerancePercent: 5,
        });

        expect(result.status).toBe("positive");
        expect(result.absoluteVariance).toBe(6);
        expect(result.percentageVariance).toBe(0.06);
    });

    it("does not calculate percentage variance when the reference is zero", () => {
        const result = calculateKpi(field(10), field(0), field(undefined), {
            direction: "higher",
            neutralTolerancePercent: 0,
        });

        expect(result.absoluteVariance).toBe(10);
        expect(result.percentageVariance).toBeUndefined();
    });

    it("returns a neutral no-benchmark state without optional fields", () => {
        const result = calculateKpi(field(10), field(undefined), field(undefined), {
            direction: "higher",
            neutralTolerancePercent: 0,
        });

        expect(result.status).toBe("neutral");
        expect(result.statusReference).toBe("none");
        expect(result.absoluteVariance).toBeUndefined();
    });
});
