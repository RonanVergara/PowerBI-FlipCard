import {
    KpiCalculationOptions,
    KpiReferenceKind,
    KpiResult,
    KpiStatus,
    NumericFieldValue,
} from "./types";

function validValue(field: NumericFieldValue): number | undefined {
    return field.state === "valid" ? field.value : undefined;
}

function chooseReference(
    preferred: readonly [KpiReferenceKind, number | undefined],
    fallback: readonly [KpiReferenceKind, number | undefined],
): readonly [KpiReferenceKind, number | undefined] {
    if (preferred[1] !== undefined) {
        return preferred;
    }

    if (fallback[1] !== undefined) {
        return fallback;
    }

    return ["none", undefined];
}

function calculateStatus(
    cardValue: number,
    referenceValue: number | undefined,
    options: KpiCalculationOptions,
): KpiStatus {
    if (referenceValue === undefined) {
        return "neutral";
    }

    const tolerance = Math.abs(referenceValue) * Math.max(0, options.neutralTolerancePercent) / 100;
    const difference = cardValue - referenceValue;

    if (Math.abs(difference) <= tolerance) {
        return "neutral";
    }

    const isFavorable = options.direction === "higher" ? difference > 0 : difference < 0;
    return isFavorable ? "positive" : "negative";
}

export function calculateKpi(
    cardValueField: NumericFieldValue,
    comparisonField: NumericFieldValue,
    targetField: NumericFieldValue,
    options: KpiCalculationOptions,
): KpiResult {
    const cardValue = validValue(cardValueField);
    const comparison = validValue(comparisonField);
    const target = validValue(targetField);
    const [statusReference, statusReferenceValue] = chooseReference(
        ["target", target],
        ["comparison", comparison],
    );
    const [varianceReference, varianceReferenceValue] = chooseReference(
        ["comparison", comparison],
        ["target", target],
    );

    if (cardValue === undefined) {
        return {
            absoluteVariance: undefined,
            percentageVariance: undefined,
            status: "neutral",
            statusReference,
            statusReferenceValue,
            varianceReference,
            varianceReferenceValue,
        };
    }

    const absoluteVariance = varianceReferenceValue === undefined
        ? undefined
        : cardValue - varianceReferenceValue;
    const percentageVariance = absoluteVariance === undefined
        || varianceReferenceValue === undefined
        || varianceReferenceValue === 0
        ? undefined
        : absoluteVariance / Math.abs(varianceReferenceValue);

    return {
        absoluteVariance,
        percentageVariance,
        status: calculateStatus(cardValue, statusReferenceValue, options),
        statusReference,
        statusReferenceValue,
        varianceReference,
        varianceReferenceValue,
    };
}

export function getStatusText(result: KpiResult): string {
    if (result.statusReference === "none") {
        return "No benchmark";
    }

    switch (result.status) {
        case "positive":
            return "Positive · On track";
        case "negative":
            return "Negative · Off track";
        default:
            return "Neutral · Near target";
    }
}

export function getStatusSymbol(result: KpiResult): string {
    if (result.statusReference === "none" || result.status === "neutral") {
        return "–";
    }

    return result.status === "positive" ? "✓" : "!";
}
