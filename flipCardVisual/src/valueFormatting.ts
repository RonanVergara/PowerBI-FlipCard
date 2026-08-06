import powerbi from "powerbi-visuals-api";
import { displayUnitSystemType, valueFormatter } from "powerbi-visuals-utils-formattingutils";

import DataViewMetadataColumn = powerbi.DataViewMetadataColumn;
import PrimitiveValue = powerbi.PrimitiveValue;

import { getStatusText } from "./kpi";
import { CardViewModel, KpiPresentation, NumberFormattingOptions, NumericFieldValue, VarianceMode } from "./types";

function createFormatter(source: DataViewMetadataColumn | undefined, value: number, locale: string, options: NumberFormattingOptions): valueFormatter.IValueFormatter {
    return valueFormatter.create({
        allowFormatBeautification: true,
        columnType: source?.type,
        cultureSelector: locale,
        displayUnitSystemType: options.displayUnits === 1 ? displayUnitSystemType.DisplayUnitSystemType.Verbose : undefined,
        format: source?.format,
        formatSingleValues: true,
        precision: options.precision,
        value: options.displayUnits === 0 ? value : options.displayUnits,
    });
}

export function formatPrimitiveValue(value: PrimitiveValue | undefined, source: DataViewMetadataColumn | undefined, locale: string, options: NumberFormattingOptions = { displayUnits: 0, precision: undefined }): string {
    if (value === null || value === undefined) { return "Blank"; }
    if (typeof value === "number") {
        if (!Number.isFinite(value)) { return "Invalid numeric value"; }
        return createFormatter(source, value, locale, options).format(value);
    }
    return valueFormatter.format(value, source?.format, true, locale);
}

function signed(value: number, formatted: string): string { return value > 0 ? `+${formatted}` : formatted; }

export function formatAbsoluteVariance(card: CardViewModel, locale: string, options: NumberFormattingOptions): string | undefined {
    const variance = card.kpi.absoluteVariance;
    return variance === undefined ? undefined : signed(variance, createFormatter(card.cardValue.source, variance, locale, options).format(variance));
}

export function formatPercentageVariance(card: CardViewModel, locale: string, precision: number | undefined): string | undefined {
    const variance = card.kpi.percentageVariance;
    if (variance === undefined) { return undefined; }
    const formatter = valueFormatter.create({ allowFormatBeautification: true, cultureSelector: locale, format: "0.00%", formatSingleValues: true, precision, value: variance });
    return signed(variance, formatter.format(variance));
}

export function getVarianceDisplayText(card: CardViewModel, mode: VarianceMode, locale: string, options: NumberFormattingOptions): string | undefined {
    const absolute = formatAbsoluteVariance(card, locale, options);
    const percentage = formatPercentageVariance(card, locale, options.precision);
    if (mode === "absolute") { return absolute; }
    if (mode === "both") {
        if (absolute === undefined) { return undefined; }
        return percentage === undefined ? absolute : `${absolute} · ${percentage}`;
    }
    return percentage ?? absolute;
}

function referenceField(card: CardViewModel, kind: "comparison" | "target" | "none"): NumericFieldValue | undefined {
    if (kind === "comparison") { return card.comparisonValue; }
    if (kind === "target") { return card.targetValue; }
    return undefined;
}

function formattedMagnitude(card: CardViewModel, value: number, locale: string, options: NumberFormattingOptions): string {
    return createFormatter(card.cardValue.source, Math.abs(value), locale, options).format(Math.abs(value));
}

export function createKpiPresentation(
    card: CardViewModel,
    mode: VarianceMode,
    locale: string,
    options: NumberFormattingOptions,
): KpiPresentation {
    const varianceField = referenceField(card, card.kpi.varianceReference);
    const numericVariance = getVarianceDisplayText(card, mode, locale, options);
    const insight = varianceField?.state === "valid" && numericVariance !== undefined ? {
        accessibleText: `${numericVariance} versus ${varianceField.displayName}`,
        referenceName: varianceField.displayName,
        referenceValueText: varianceField.formattedValue,
        text: `${numericVariance} vs ${varianceField.displayName}`,
        tone: card.kpi.varianceStatus,
    } : undefined;

    const statusField = referenceField(card, card.kpi.statusReference);
    const conciseText = getStatusText(card.kpi);
    let statusText = conciseText;
    if (statusField?.state === "valid" && conciseText && card.kpi.statusReference !== card.kpi.varianceReference && card.kpi.statusReference === "target") {
        if (card.kpi.statusRelation === "above" || card.kpi.statusRelation === "below") {
            const difference = card.kpi.statusDifference;
            if (difference !== undefined) {
                statusText = `${formattedMagnitude(card, difference, locale, options)} ${card.kpi.statusRelation} ${statusField.displayName}`;
            }
        } else if (card.kpi.statusRelation === "exact") {
            statusText = `At ${statusField.displayName}`;
        } else if (card.kpi.statusRelation === "withinTolerance") {
            statusText = `Within tolerance of ${statusField.displayName}`;
        }
    }
    const status = statusField?.state === "valid" && conciseText && statusText ? {
        accessibleText: `${statusText}. Status relative to ${statusField.displayName}: ${conciseText}`,
        conciseText,
        referenceName: statusField.displayName,
        text: statusText,
        tone: card.kpi.status,
    } : undefined;
    return { insight, status };
}

export interface TooltipFeatureOptions { readonly benchmark: boolean; readonly detail: boolean; }

export function prepareTooltipItems(card: CardViewModel, features: TooltipFeatureOptions): void {
    const items: powerbi.extensibility.VisualTooltipDataItem[] = [];
    if (card.hasCategory) { items.push({ displayName: card.labelDisplayName, value: card.label }); }
    items.push({ displayName: card.cardValue.displayName, value: card.cardValue.formattedValue });
    if (features.detail && card.detailValue.state === "valid") { items.push({ displayName: card.detailValue.displayName, value: card.detailValue.formattedValue }); }
    if (features.benchmark && card.comparisonValue.state === "valid") { items.push({ displayName: card.comparisonValue.displayName, value: card.comparisonValue.formattedValue }); }
    if (features.benchmark && card.targetValue.state === "valid") { items.push({ displayName: card.targetValue.displayName, value: card.targetValue.formattedValue }); }
    if (features.benchmark && card.presentation?.insight) {
        items.push({ displayName: `Variance vs ${card.presentation.insight.referenceName}`, value: card.presentation.insight.text });
    }
    if (features.benchmark && card.presentation?.status) {
        items.push({ displayName: `Status vs ${card.presentation.status.referenceName}`, value: card.presentation.status.conciseText });
    }
    for (const tooltip of card.tooltipValues) { items.push({ displayName: tooltip.displayName, value: tooltip.formattedValue }); }
    card.tooltipItems = items;
}
