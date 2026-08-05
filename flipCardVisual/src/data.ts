import powerbi from "powerbi-visuals-api";

import DataView = powerbi.DataView;
import DataViewCategoryColumn = powerbi.DataViewCategoryColumn;
import DataViewMetadataColumn = powerbi.DataViewMetadataColumn;
import DataViewValueColumn = powerbi.DataViewValueColumn;
import ISelectionId = powerbi.visuals.ISelectionId;
import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import PrimitiveValue = powerbi.PrimitiveValue;

import { calculateKpi } from "./kpi";
import {
    AdditionalTooltipValue,
    CardViewModel,
    DataExtractionResult,
    KpiCalculationOptions,
    NumberFormattingOptions,
    NumericFieldValue,
} from "./types";
import { formatPrimitiveValue } from "./valueFormatting";

interface ExtractionFormattingOptions {
    readonly detail: NumberFormattingOptions;
    readonly main: NumberFormattingOptions;
}

function hasRole(source: DataViewMetadataColumn, roleName: string): boolean {
    return source.roles?.[roleName] === true;
}

function findCategoryByRole(dataView: DataView, roleName: string): DataViewCategoryColumn | undefined {
    return dataView.categorical?.categories?.find((column) => hasRole(column.source, roleName));
}

function findValuesByRole(dataView: DataView, roleName: string): DataViewValueColumn[] {
    const values = dataView.categorical?.values;
    return values ? values.filter((column) => hasRole(column.source, roleName)) : [];
}

function valueAt(column: DataViewValueColumn | undefined, rowIndex: number): PrimitiveValue | undefined {
    return column?.values?.[rowIndex];
}

function numericField(
    column: DataViewValueColumn | undefined,
    rowIndex: number,
    fallbackName: string,
    locale: string,
    options: NumberFormattingOptions,
): NumericFieldValue {
    if (!column) {
        return {
            displayName: fallbackName,
            formattedValue: "Not assigned",
            rawValue: undefined,
            source: undefined,
            state: "missing",
            value: undefined,
        };
    }

    const rawValue = valueAt(column, rowIndex);
    const displayName = column.source.displayName || fallbackName;

    if (rawValue === null || rawValue === undefined) {
        return {
            displayName,
            formattedValue: "Blank",
            rawValue,
            source: column.source,
            state: "blank",
            value: undefined,
        };
    }

    if (typeof rawValue !== "number" || !Number.isFinite(rawValue)) {
        return {
            displayName,
            formattedValue: "Invalid numeric value",
            rawValue,
            source: column.source,
            state: "invalid",
            value: undefined,
        };
    }

    return {
        displayName,
        formattedValue: formatPrimitiveValue(rawValue, column.source, locale, options),
        rawValue,
        source: column.source,
        state: "valid",
        value: rawValue,
    };
}

function createSelectionId(
    host: IVisualHost,
    category: DataViewCategoryColumn | undefined,
    rowIndex: number,
): ISelectionId | undefined {
    if (!category?.values?.length || rowIndex >= category.values.length) {
        return undefined;
    }

    return host.createSelectionIdBuilder().withCategory(category, rowIndex).createSelectionId();
}

function getLabel(
    category: DataViewCategoryColumn | undefined,
    rowIndex: number,
    cardValueColumn: DataViewValueColumn,
    locale: string,
): readonly [string, string] {
    const rawLabel = category?.values?.[rowIndex];
    if (category && rawLabel !== null && rawLabel !== undefined) {
        return [
            formatPrimitiveValue(rawLabel, category.source, locale),
            category.source.displayName || "Label",
        ];
    }

    const displayName = cardValueColumn.source.displayName || "Card Value";
    return [displayName, "Label"];
}

function tooltipValues(
    columns: DataViewValueColumn[],
    rowIndex: number,
    locale: string,
): AdditionalTooltipValue[] {
    return columns.map((column) => ({
        displayName: column.source.displayName || "Tooltip",
        formattedValue: formatPrimitiveValue(valueAt(column, rowIndex), column.source, locale),
    }));
}

function getRowCount(category: DataViewCategoryColumn | undefined, cardValue: DataViewValueColumn): number {
    if (category) {
        return category.values?.length ?? 0;
    }

    return cardValue.values?.length ? 1 : 0;
}

export function extractDataView(
    dataView: DataView | undefined,
    host: IVisualHost,
    locale: string,
    formatting: ExtractionFormattingOptions,
    kpiOptions: KpiCalculationOptions,
): DataExtractionResult {
    if (!dataView?.categorical) {
        return { cards: [], state: "missingCardValue" };
    }

    const cardValueColumn = findValuesByRole(dataView, "cardValue")[0];
    if (!cardValueColumn) {
        return { cards: [], state: "missingCardValue" };
    }

    const category = findCategoryByRole(dataView, "cardLabel");
    const detailColumn = findValuesByRole(dataView, "detailValue")[0];
    const comparisonColumn = findValuesByRole(dataView, "comparisonValue")[0];
    const targetColumn = findValuesByRole(dataView, "targetValue")[0];
    const tooltipColumns = findValuesByRole(dataView, "tooltips");
    const rowCount = getRowCount(category, cardValueColumn);

    if (rowCount === 0) {
        return { cards: [], state: "noData" };
    }

    const cards: CardViewModel[] = [];
    for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
        const cardValue = numericField(cardValueColumn, rowIndex, "Card Value", locale, formatting.main);
        const detailValue = numericField(detailColumn, rowIndex, "Detail Value", locale, formatting.detail);
        const comparisonValue = numericField(comparisonColumn, rowIndex, "Comparison Value", locale, formatting.detail);
        const targetValue = numericField(targetColumn, rowIndex, "Target Value", locale, formatting.detail);
        const selectionId = createSelectionId(host, category, rowIndex);
        const [label, labelDisplayName] = getLabel(category, rowIndex, cardValueColumn, locale);
        const queryName = cardValueColumn.source.queryName || cardValueColumn.source.displayName || "cardValue";
        const key = selectionId?.getKey() || `measure:${queryName}`;

        cards.push({
            cardValue,
            comparisonValue,
            detailValue,
            key,
            kpi: calculateKpi(cardValue, comparisonValue, targetValue, kpiOptions),
            label,
            labelDisplayName,
            selectionId,
            targetValue,
            tooltipItems: [],
            tooltipValues: tooltipValues(tooltipColumns, rowIndex, locale),
            varianceText: undefined,
        });
    }

    return { cards, state: "ready" };
}
