import { KpiCalculationOptions, KpiReferenceKind, KpiRelation, KpiResult, KpiStatus, NumericFieldValue } from "./types";

function validValue(field: NumericFieldValue): number | undefined { return field.state === "valid" ? field.value : undefined; }
function chooseReference(preferred: readonly [KpiReferenceKind, number | undefined], fallback: readonly [KpiReferenceKind, number | undefined]): readonly [KpiReferenceKind, number | undefined] {
    if (preferred[1] !== undefined) { return preferred; }
    if (fallback[1] !== undefined) { return fallback; }
    return ["none", undefined];
}
function calculateStatus(cardValue: number, referenceValue: number | undefined, options: KpiCalculationOptions): KpiStatus {
    if (referenceValue === undefined) { return "neutral"; }
    const tolerance = Math.abs(referenceValue) * Math.max(0, options.neutralTolerancePercent) / 100;
    const difference = cardValue - referenceValue;
    if (Math.abs(difference) <= tolerance) { return "neutral"; }
    return (options.direction === "higher" ? difference > 0 : difference < 0) ? "positive" : "negative";
}

function calculateRelation(cardValue: number, referenceValue: number | undefined, options: KpiCalculationOptions): KpiRelation {
    if (referenceValue === undefined) { return "none"; }
    const difference = cardValue - referenceValue;
    if (difference === 0) { return "exact"; }
    const tolerance = Math.abs(referenceValue) * Math.max(0, options.neutralTolerancePercent) / 100;
    if (Math.abs(difference) <= tolerance) { return "withinTolerance"; }
    return difference > 0 ? "above" : "below";
}

export function calculateKpi(cardValueField: NumericFieldValue, comparisonField: NumericFieldValue, targetField: NumericFieldValue, options: KpiCalculationOptions): KpiResult {
    const cardValue = validValue(cardValueField);
    const comparison = validValue(comparisonField);
    const target = validValue(targetField);
    const [statusReference, statusReferenceValue] = chooseReference(["target", target], ["comparison", comparison]);
    const [varianceReference, varianceReferenceValue] = chooseReference(["comparison", comparison], ["target", target]);
    const absoluteVariance = cardValue === undefined || varianceReferenceValue === undefined ? undefined : cardValue - varianceReferenceValue;
    const percentageVariance = absoluteVariance === undefined || varianceReferenceValue === undefined || varianceReferenceValue === 0 ? undefined : absoluteVariance / Math.abs(varianceReferenceValue);
    const statusDifference = cardValue === undefined || statusReferenceValue === undefined ? undefined : cardValue - statusReferenceValue;
    return {
        absoluteVariance,
        percentageVariance,
        status: cardValue === undefined ? "neutral" : calculateStatus(cardValue, statusReferenceValue, options),
        statusDifference,
        statusRelation: cardValue === undefined ? "none" : calculateRelation(cardValue, statusReferenceValue, options),
        statusReference,
        statusReferenceValue,
        varianceStatus: cardValue === undefined ? "neutral" : calculateStatus(cardValue, varianceReferenceValue, options),
        varianceReference,
        varianceReferenceValue,
    };
}

export function getStatusText(result: KpiResult): string | undefined {
    if (result.statusReference === "none") { return undefined; }
    if (result.statusReference === "comparison") {
        if (result.status === "positive") { return "Improved"; }
        if (result.status === "negative") { return "Declined"; }
        return "Unchanged";
    }
    if (result.statusRelation === "exact") { return "At target"; }
    if (result.statusRelation === "withinTolerance") { return "Within tolerance"; }
    if (result.statusRelation === "above") { return "Above target"; }
    if (result.statusRelation === "below") { return "Below target"; }
    return undefined;
}

export function getStatusSymbol(result: KpiResult): string {
    if (result.statusReference === "none" || result.status === "neutral") { return "–"; }
    return result.status === "positive" ? "✓" : "!";
}
