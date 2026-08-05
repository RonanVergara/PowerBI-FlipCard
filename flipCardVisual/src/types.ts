import powerbi from "powerbi-visuals-api";

import DataViewMetadataColumn = powerbi.DataViewMetadataColumn;
import ISelectionId = powerbi.visuals.ISelectionId;
import PrimitiveValue = powerbi.PrimitiveValue;
import VisualTooltipDataItem = powerbi.extensibility.VisualTooltipDataItem;

export type NumericValueState = "missing" | "blank" | "invalid" | "valid";
export type KpiDirection = "higher" | "lower";
export type KpiStatus = "positive" | "neutral" | "negative";
export type KpiReferenceKind = "target" | "comparison" | "none";
export type VarianceMode = "absolute" | "percentage" | "both";
export type ConditionalColorTarget = "indicator" | "accent" | "mainValue" | "background";
export type CardFace = "front" | "back";
export type VisualDataState = "ready" | "missingCardValue" | "noData";

export interface NumericFieldValue {
    readonly displayName: string;
    readonly formattedValue: string;
    readonly rawValue: PrimitiveValue | undefined;
    readonly source: DataViewMetadataColumn | undefined;
    readonly state: NumericValueState;
    readonly value: number | undefined;
}

export interface AdditionalTooltipValue {
    readonly displayName: string;
    readonly formattedValue: string;
}

export interface KpiResult {
    readonly absoluteVariance: number | undefined;
    readonly percentageVariance: number | undefined;
    readonly status: KpiStatus;
    readonly statusReference: KpiReferenceKind;
    readonly statusReferenceValue: number | undefined;
    readonly varianceReference: KpiReferenceKind;
    readonly varianceReferenceValue: number | undefined;
}

export interface CardViewModel {
    readonly cardValue: NumericFieldValue;
    readonly comparisonValue: NumericFieldValue;
    readonly detailValue: NumericFieldValue;
    readonly key: string;
    readonly kpi: KpiResult;
    readonly label: string;
    readonly labelDisplayName: string;
    readonly selectionId: ISelectionId | undefined;
    readonly targetValue: NumericFieldValue;
    readonly tooltipValues: AdditionalTooltipValue[];
    tooltipItems: VisualTooltipDataItem[];
    varianceText: string | undefined;
}

export interface DataExtractionResult {
    readonly cards: CardViewModel[];
    readonly state: VisualDataState;
}

export interface KpiCalculationOptions {
    readonly direction: KpiDirection;
    readonly neutralTolerancePercent: number;
}

export interface NumberFormattingOptions {
    readonly displayUnits: number;
    readonly precision: number | undefined;
}
