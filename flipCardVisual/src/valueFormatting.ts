import powerbi from "powerbi-visuals-api";
import { valueFormatter } from "powerbi-visuals-utils-formattingutils";

import DataViewMetadataColumn = powerbi.DataViewMetadataColumn;
import PrimitiveValue = powerbi.PrimitiveValue;

import { CardViewModel, NumberFormattingOptions, VarianceMode } from "./types";
import { getStatusText } from "./kpi";

function createFormatter(
    source: DataViewMetadataColumn | undefined,
    value: number,
    locale: string,
    options: NumberFormattingOptions,
): valueFormatter.IValueFormatter {
    const displayUnitValue = options.displayUnits === 0 ? value : options.displayUnits;

    return valueFormatter.create({
        allowFormatBeautification: true,
        columnType: source?.type,
        cultureSelector: locale,
        format: source?.format,
        formatSingleValues: true,
        precision: options.precision,
        value: displayUnitValue,
    });
}

export function formatPrimitiveValue(
    value: PrimitiveValue | undefined,
    source: DataViewMetadataColumn | undefined,
    locale: string,
    options: NumberFormattingOptions = { displayUnits: 0, precision: undefined },
): string {
    if (value === null || value === undefined) {
        return "Blank";
    }

    if (typeof value === "number") {
        if (!Number.isFinite(value)) {
            return "Invalid numeric value";
        }

        return createFormatter(source, value, locale, options).format(value);
    }

    return valueFormatter.format(value, source?.format, true, locale);
}

function signed(value: number, formatted: string): string {
    return value > 0 ? `+${formatted}` : formatted;
}

export function formatAbsoluteVariance(
    card: CardViewModel,
    locale: string,
    options: NumberFormattingOptions,
): string | undefined {
    const variance = card.kpi.absoluteVariance;
    if (variance === undefined) {
        return undefined;
    }

    const formatted = createFormatter(card.cardValue.source, variance, locale, options).format(variance);
    return signed(variance, formatted);
}

export function formatPercentageVariance(
    card: CardViewModel,
    locale: string,
    precision: number | undefined,
): string | undefined {
    const variance = card.kpi.percentageVariance;
    if (variance === undefined) {
        return undefined;
    }

    const formatter = valueFormatter.create({
        allowFormatBeautification: true,
        cultureSelector: locale,
        format: "0.00%",
        formatSingleValues: true,
        precision,
        value: variance,
    });

    return signed(variance, formatter.format(variance));
}

export function getVarianceDisplayText(
    card: CardViewModel,
    mode: VarianceMode,
    locale: string,
    options: NumberFormattingOptions,
): string | undefined {
    const absolute = formatAbsoluteVariance(card, locale, options);
    const percentage = formatPercentageVariance(card, locale, options.precision);
    const percentageUnavailable = card.kpi.absoluteVariance !== undefined
        && card.kpi.varianceReferenceValue === 0;

    switch (mode) {
        case "absolute":
            return absolute;
        case "both":
            if (absolute === undefined) {
                return undefined;
            }
            return percentage === undefined
                ? `${absolute} · ${percentageUnavailable ? "Percentage unavailable (zero reference)" : "Percentage unavailable"}`
                : `${absolute} · ${percentage}`;
        default:
            if (percentage !== undefined) {
                return percentage;
            }
            return percentageUnavailable ? "Percentage unavailable (zero reference)" : undefined;
    }
}

export function prepareTooltipItems(card: CardViewModel): void {
    const items: powerbi.extensibility.VisualTooltipDataItem[] = [
        { displayName: card.labelDisplayName, value: card.label },
        { displayName: card.cardValue.displayName, value: card.cardValue.formattedValue },
    ];

    if (card.detailValue.state !== "missing") {
        items.push({ displayName: card.detailValue.displayName, value: card.detailValue.formattedValue });
    }
    if (card.comparisonValue.state !== "missing") {
        items.push({ displayName: card.comparisonValue.displayName, value: card.comparisonValue.formattedValue });
    }
    if (card.targetValue.state !== "missing") {
        items.push({ displayName: card.targetValue.displayName, value: card.targetValue.formattedValue });
    }
    if (card.varianceText !== undefined) {
        const basis = card.kpi.varianceReference === "comparison" ? "Comparison" : "Target";
        items.push({ displayName: `Variance vs ${basis}`, value: card.varianceText });
    }

    items.push({ displayName: "KPI status", value: getStatusText(card.kpi) });
    for (const tooltip of card.tooltipValues) {
        items.push({ displayName: tooltip.displayName, value: tooltip.formattedValue });
    }

    card.tooltipItems = items;
}
