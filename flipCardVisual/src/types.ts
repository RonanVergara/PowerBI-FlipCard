import powerbi from "powerbi-visuals-api";

import DataViewMetadataColumn = powerbi.DataViewMetadataColumn;
import ISelectionId = powerbi.visuals.ISelectionId;
import PrimitiveValue = powerbi.PrimitiveValue;
import VisualTooltipDataItem = powerbi.extensibility.VisualTooltipDataItem;

export type NumericValueState = "missing" | "blank" | "invalid" | "valid";
export type KpiDirection = "higher" | "lower";
export type KpiStatus = "positive" | "neutral" | "negative";
export type KpiReferenceKind = "target" | "comparison" | "none";
export type KpiRelation = "exact" | "withinTolerance" | "above" | "below" | "none";
export type VarianceMode = "absolute" | "percentage" | "both";
export type CardFace = "front" | "back";
export type FaceTransitionState = CardFace | "turningToBack" | "turningToFront";
export type VisualDataState = "ready" | "missingCardValue" | "noData" | "invalidValue";
export type VisualRenderState = VisualDataState | "configurationRequired" | "tooSmall";
export type EffectiveCardMode = "single" | "auto" | "multiple";
export type MultipleCardMode = "auto" | "multiple";
export type SizingMode = "fit" | "fixed";
export type ColumnCalculation = "automatic" | "custom";
export type LayoutDensity = "regular" | "compact" | "minimal";
export type FrontPresentationMode = "auto" | "stacked" | "split";
export type ResolvedFrontPresentation = "stacked" | "split";
export type VerticalAlignment = "top" | "center" | "bottom";
export type ResponsivePriority = "automatic" | "insight" | "status";
export type StatusPresentation = "pill" | "text" | "iconOnly";
export type BackLayoutMode = "auto" | "list" | "tiles";
export type ResolvedBackLayout = "list" | "tiles";
export type BackTitleSource = "automatic" | "category" | "custom";
export type DetailEmphasis = "standard" | "strong";
export type ControlIcon = "information" | "rotate" | "chevron";
export type ControlStyle = "ghost" | "outline" | "filled";
export type ControlShape = "circle" | "roundedSquare";
export type MotionStyle = "horizontal" | "vertical" | "fade" | "none";
export type HorizontalDirection = "left" | "right";
export type VerticalDirection = "up" | "down";
export type MotionEasing = "smooth" | "snappy" | "gentle";
export type MotionPerspective = "subtle" | "standard" | "deep";

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
    readonly statusDifference: number | undefined;
    readonly statusRelation: KpiRelation;
    readonly statusReference: KpiReferenceKind;
    readonly statusReferenceValue: number | undefined;
    readonly varianceStatus: KpiStatus;
    readonly varianceReference: KpiReferenceKind;
    readonly varianceReferenceValue: number | undefined;
}

export interface KpiInsightPresentation {
    readonly accessibleText: string;
    readonly referenceName: string;
    readonly referenceValueText: string;
    readonly text: string;
    readonly tone: KpiStatus;
}

export interface KpiStatusPresentation {
    readonly accessibleText: string;
    readonly conciseText: string;
    readonly referenceName: string;
    readonly text: string;
    readonly tone: KpiStatus;
}

export interface KpiPresentation {
    readonly insight: KpiInsightPresentation | undefined;
    readonly status: KpiStatusPresentation | undefined;
}

export interface ConditionalColorOverrides {
    readonly accentColor?: string;
    readonly borderColor?: string;
    readonly frontBackground?: string;
    readonly mainValueColor?: string;
    readonly statusIndicatorColor?: string;
}

export interface CardViewModel {
    readonly cardValue: NumericFieldValue;
    readonly colorOverrides: ConditionalColorOverrides;
    readonly comparisonValue: NumericFieldValue;
    readonly detailValue: NumericFieldValue;
    readonly hasCategory: boolean;
    readonly key: string;
    readonly kpi: KpiResult;
    readonly label: string;
    readonly labelDisplayName: string;
    readonly selectionId: ISelectionId | undefined;
    readonly targetValue: NumericFieldValue;
    readonly tooltipValues: AdditionalTooltipValue[];
    presentation?: KpiPresentation;
    tooltipItems: VisualTooltipDataItem[];
    varianceText: string | undefined;
}

export interface DataExtractionResult {
    readonly cards: CardViewModel[];
    readonly hasCategory: boolean;
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

export interface FeatureProfile {
    readonly benchmark: boolean;
    readonly flip: boolean;
}
