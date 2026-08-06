import powerbi from "powerbi-visuals-api";
import { valueFormatter } from "powerbi-visuals-utils-formattingutils";

import DataViewMetadataColumn = powerbi.DataViewMetadataColumn;
import PrimitiveValue = powerbi.PrimitiveValue;

import { getStatusText } from "./kpi";
import { CardViewModel, NumberFormattingOptions, VarianceMode } from "./types";

function createFormatter(source: DataViewMetadataColumn | undefined, value: number, locale: string, options: NumberFormattingOptions): valueFormatter.IValueFormatter {
    return valueFormatter.create({
        allowFormatBeautification: true,
        columnType: source?.type,
        cultureSelector: locale,
        displayUnitSystemType: options.displayUnits === 1 ? 1 : undefined,
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
    const percentageUnavailable = card.kpi.absoluteVariance !== undefined && card.kpi.varianceReferenceValue === 0;
    if (mode === "absolute") { return absolute; }
    if (mode === "both") {
        if (absolute === undefined) { return undefined; }
        return percentage === undefined ? `${absolute} · ${percentageUnavailable ? "Percentage unavailable (zero reference)" : "Percentage unavailable"}` : `${absolute} · ${percentage}`;
    }
    if (percentage !== undefined) { return percentage; }
    return percentageUnavailable ? "Percentage unavailable (zero reference)" : undefined;
}

export interface TooltipFeatureOptions { readonly benchmark: boolean; readonly detail: boolean; }

export function prepareTooltipItems(card: CardViewModel, features: TooltipFeatureOptions): void {
    const items: powerbi.extensibility.VisualTooltipDataItem[] = [];
    if (card.hasCategory) { items.push({ displayName: card.labelDisplayName, value: card.label }); }
    items.push({ displayName: card.cardValue.displayName, value: card.cardValue.formattedValue });
    if (features.detail && card.detailValue.state === "valid") { items.push({ displayName: card.detailValue.displayName, value: card.detailValue.formattedValue }); }
    if (features.benchmark && card.comparisonValue.state === "valid") { items.push({ displayName: card.comparisonValue.displayName, value: card.comparisonValue.formattedValue }); }
    if (features.benchmark && card.targetValue.state === "valid") { items.push({ displayName: card.targetValue.displayName, value: card.targetValue.formattedValue }); }
    if (features.benchmark && card.varianceText !== undefined) {
        const field = card.kpi.varianceReference === "comparison" ? card.comparisonValue : card.targetValue;
        items.push({ displayName: `Variance vs ${field.displayName}`, value: card.varianceText });
    }
    const status = features.benchmark ? getStatusText(card.kpi) : undefined;
    if (status) {
        const field = card.kpi.statusReference === "target" ? card.targetValue : card.comparisonValue;
        items.push({ displayName: `Status vs ${field.displayName}`, value: status });
    }
    for (const tooltip of card.tooltipValues) { items.push({ displayName: tooltip.displayName, value: tooltip.formattedValue }); }
    card.tooltipItems = items;
}
