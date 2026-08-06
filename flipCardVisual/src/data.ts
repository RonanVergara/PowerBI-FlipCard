import powerbi from "powerbi-visuals-api";

import DataView = powerbi.DataView;
import DataViewCategoryColumn = powerbi.DataViewCategoryColumn;
import DataViewMetadataColumn = powerbi.DataViewMetadataColumn;
import DataViewObject = powerbi.DataViewObject;
import DataViewObjects = powerbi.DataViewObjects;
import DataViewValueColumn = powerbi.DataViewValueColumn;
import ISelectionId = powerbi.visuals.ISelectionId;
import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import PrimitiveValue = powerbi.PrimitiveValue;

import { calculateKpi } from "./kpi";
import { AdditionalTooltipValue, CardViewModel, ConditionalColorOverrides, DataExtractionResult, KpiCalculationOptions, NumberFormattingOptions, NumericFieldValue } from "./types";
import { formatPrimitiveValue } from "./valueFormatting";

interface ExtractionFormattingOptions { readonly detail: NumberFormattingOptions; readonly main: NumberFormattingOptions; }

const colorPaths = [
    ["cardAppearance", "frontBackground", "frontBackground"],
    ["cardAppearance", "borderColor", "borderColor"],
    ["cardAppearance", "accentColor", "accentColor"],
    ["mainValue", "fontColor", "mainValueColor"],
    ["benchmark", "statusIndicatorColor", "statusIndicatorColor"],
] as const;

function hasRole(source: DataViewMetadataColumn, roleName: string): boolean { return source.roles?.[roleName] === true; }
function findCategoryByRole(dataView: DataView, roleName: string): DataViewCategoryColumn | undefined { return dataView.categorical?.categories?.find((column) => hasRole(column.source, roleName)); }
function findValuesByRole(dataView: DataView, roleName: string): DataViewValueColumn[] { return dataView.categorical?.values?.filter((column) => hasRole(column.source, roleName)) ?? []; }
function valueAt(column: DataViewValueColumn | undefined, rowIndex: number): PrimitiveValue | undefined { return column?.values?.[rowIndex]; }

function numericField(column: DataViewValueColumn | undefined, rowIndex: number, fallbackName: string, locale: string, options: NumberFormattingOptions): NumericFieldValue {
    if (!column) { return { displayName: fallbackName, formattedValue: "", rawValue: undefined, source: undefined, state: "missing", value: undefined }; }
    const rawValue = valueAt(column, rowIndex);
    const displayName = column.source.displayName || fallbackName;
    if (rawValue === null || rawValue === undefined) { return { displayName, formattedValue: "Blank", rawValue, source: column.source, state: "blank", value: undefined }; }
    if (typeof rawValue !== "number" || !Number.isFinite(rawValue)) { return { displayName, formattedValue: "Invalid numeric value", rawValue, source: column.source, state: "invalid", value: undefined }; }
    return { displayName, formattedValue: formatPrimitiveValue(rawValue, column.source, locale, options), rawValue, source: column.source, state: "valid", value: rawValue };
}

function createSelectionId(host: IVisualHost, category: DataViewCategoryColumn | undefined, rowIndex: number): ISelectionId | undefined {
    if (!category?.identity?.[rowIndex] || rowIndex >= (category.values?.length ?? 0)) { return undefined; }
    return host.createSelectionIdBuilder().withCategory(category, rowIndex).createSelectionId();
}

function getLabel(category: DataViewCategoryColumn | undefined, rowIndex: number, cardValueColumn: DataViewValueColumn, locale: string): readonly [string, string] {
    const rawLabel = category?.values?.[rowIndex];
    if (category && rawLabel !== null && rawLabel !== undefined) { return [formatPrimitiveValue(rawLabel, category.source, locale), category.source.displayName || "Label"]; }
    const displayName = cardValueColumn.source.displayName || "Card Value";
    return [displayName, displayName];
}

function tooltipValues(columns: DataViewValueColumn[], rowIndex: number, locale: string): AdditionalTooltipValue[] {
    return columns.map((column) => ({ displayName: column.source.displayName || "Tooltip", formattedValue: formatPrimitiveValue(valueAt(column, rowIndex), column.source, locale) }));
}

function colorFromObject(object: DataViewObject | undefined, propertyName: string): string | undefined {
    if (!object || !Object.prototype.hasOwnProperty.call(object, propertyName)) { return undefined; }
    const value = object[propertyName] as unknown;
    if (typeof value === "string") { return value; }
    if (typeof value === "object" && value !== null) {
        const theme = value as { value?: unknown; solid?: { color?: unknown } };
        if (typeof theme.value === "string") { return theme.value; }
        if (typeof theme.solid?.color === "string") { return theme.solid.color; }
    }
    return undefined;
}

function rowColor(objects: DataViewObjects[] | undefined, rowIndex: number, objectName: string, propertyName: string): string | undefined {
    const row = objects?.[rowIndex];
    const nested = row?.[objectName] as unknown;
    if (typeof nested === "object" && nested !== null) { return colorFromObject(nested as DataViewObject, propertyName); }
    return colorFromObject(row, propertyName);
}

function staticColor(dataView: DataView, objectName: string, propertyName: string): string | undefined { return colorFromObject(dataView.metadata.objects?.[objectName], propertyName); }

function resolveColors(dataView: DataView, category: DataViewCategoryColumn | undefined, valueColumns: DataViewValueColumn[], rowIndex: number): ConditionalColorOverrides {
    const result: Record<string, string> = {};
    for (const [objectName, propertyName, resultName] of colorPaths) {
        let color = rowColor(category?.objects, rowIndex, objectName, propertyName);
        if (!color) {
            for (const column of valueColumns) {
                color = rowColor(column.objects, rowIndex, objectName, propertyName);
                if (color) { break; }
            }
        }
        color ??= staticColor(dataView, objectName, propertyName);
        if (color) { result[resultName] = color; }
    }
    return result;
}

export function extractDataView(dataView: DataView | undefined, host: IVisualHost, locale: string, formatting: ExtractionFormattingOptions, kpiOptions: KpiCalculationOptions): DataExtractionResult {
    if (!dataView?.categorical) { return { cards: [], hasCategory: false, state: "missingCardValue" }; }
    const cardValueColumn = findValuesByRole(dataView, "cardValue")[0];
    const category = findCategoryByRole(dataView, "cardLabel");
    const hasCategory = category !== undefined;
    if (!cardValueColumn) { return { cards: [], hasCategory, state: "missingCardValue" }; }
    const detailColumn = findValuesByRole(dataView, "detailValue")[0];
    const comparisonColumn = findValuesByRole(dataView, "comparisonValue")[0];
    const targetColumn = findValuesByRole(dataView, "targetValue")[0];
    const tooltipColumns = findValuesByRole(dataView, "tooltips");
    const allValueColumns = [cardValueColumn, detailColumn, comparisonColumn, targetColumn, ...tooltipColumns].filter((column): column is DataViewValueColumn => column !== undefined);
    const rowCount = category ? category.values?.length ?? 0 : cardValueColumn.values?.length ?? 0;
    if (rowCount === 0) { return { cards: [], hasCategory, state: "noData" }; }

    const cards: CardViewModel[] = [];
    for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
        const cardValue = numericField(cardValueColumn, rowIndex, "Card Value", locale, formatting.main);
        const detailValue = numericField(detailColumn, rowIndex, "Detail Value", locale, formatting.detail);
        const comparisonValue = numericField(comparisonColumn, rowIndex, "Comparison Value", locale, formatting.detail);
        const targetValue = numericField(targetColumn, rowIndex, "Target Value", locale, formatting.detail);
        const selectionId = createSelectionId(host, category, rowIndex);
        const [label, labelDisplayName] = getLabel(category, rowIndex, cardValueColumn, locale);
        const queryName = cardValueColumn.source.queryName || cardValueColumn.source.displayName || "cardValue";
        const key = selectionId?.getKey() || (category
            ? `category-row:${rowIndex}:${String(category.values?.[rowIndex])}`
            : `measure:${queryName}${rowCount > 1 ? `:${rowIndex}` : ""}`);
        cards.push({
            cardValue,
            colorOverrides: resolveColors(dataView, category, allValueColumns, rowIndex),
            comparisonValue,
            detailValue,
            hasCategory,
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
    return { cards, hasCategory, state: cards.some((card) => card.cardValue.state === "valid") ? "ready" : "invalidValue" };
}
