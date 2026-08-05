import powerbi from "powerbi-visuals-api";

import ISandboxExtendedColorPalette = powerbi.extensibility.ISandboxExtendedColorPalette;

import { getStatusSymbol, getStatusText } from "./kpi";
import { getEnumSettingValue, VisualFormattingSettingsModel } from "./settings";
import { CardFace, CardViewModel, ConditionalColorTarget, KpiStatus } from "./types";

interface DetailRowElements {
    readonly row: HTMLDivElement;
    readonly label: HTMLSpanElement;
    readonly value: HTMLSpanElement;
}

export interface CardElements {
    readonly backFace: HTMLDivElement;
    readonly backFlipButton: HTMLButtonElement;
    readonly backLabel: HTMLDivElement;
    readonly backSelectionButton: HTMLButtonElement;
    readonly comparisonRow: DetailRowElements;
    readonly detailRow: DetailRowElements;
    readonly frontFace: HTMLDivElement;
    readonly frontFlipButton: HTMLButtonElement;
    readonly frontLabel: HTMLDivElement;
    readonly frontSelectionButton: HTMLButtonElement;
    readonly frontStatus: HTMLDivElement;
    readonly frontValue: HTMLDivElement;
    readonly frontVariance: HTMLDivElement;
    readonly inner: HTMLDivElement;
    readonly screenReaderSummary: HTMLSpanElement;
    readonly statusRow: DetailRowElements;
    readonly targetRow: DetailRowElements;
    readonly varianceRow: DetailRowElements;
    readonly wrapper: HTMLElement;
}

export interface CardRenderContext {
    readonly allowInteractions: boolean;
    readonly colorPalette: ISandboxExtendedColorPalette;
    readonly face: CardFace;
    readonly selected: boolean;
    readonly settings: VisualFormattingSettingsModel;
}

function createDiv(className: string): HTMLDivElement {
    const element = document.createElement("div");
    element.className = className;
    return element;
}

function createSelectionButton(className: string): HTMLButtonElement {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `flip-card-selection-surface ${className}`;
    return button;
}

function createFlipButton(className: string): HTMLButtonElement {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `flip-card-flip-button ${className}`;
    button.textContent = "↻";
    return button;
}

function createDetailRow(className: string): DetailRowElements {
    const row = createDiv(`flip-card-detail-row ${className}`);
    const label = document.createElement("span");
    label.className = "flip-card-detail-label";
    const value = document.createElement("span");
    value.className = "flip-card-detail-value";
    row.append(label, value);
    return { row, label, value };
}

export function createCardElements(): CardElements {
    const wrapper = document.createElement("article");
    wrapper.className = "flip-card-wrapper";

    const inner = createDiv("flip-card-inner");
    const frontFace = createDiv("flip-card-face flip-card-front");
    const backFace = createDiv("flip-card-face flip-card-back");

    const frontSelectionButton = createSelectionButton("flip-card-front-content");
    const frontLabel = createDiv("flip-card-label");
    const frontValue = createDiv("flip-card-main-value");
    const frontVariance = createDiv("flip-card-variance");
    const frontStatus = createDiv("flip-card-status");
    const screenReaderSummary = document.createElement("span");
    screenReaderSummary.className = "flip-card-sr-only";
    frontSelectionButton.append(frontLabel, frontValue, frontVariance, frontStatus, screenReaderSummary);

    const frontFlipButton = createFlipButton("flip-card-flip-front");
    frontFace.append(frontSelectionButton, frontFlipButton);

    const backSelectionButton = createSelectionButton("flip-card-back-content");
    const backLabel = createDiv("flip-card-back-label");
    const detailList = createDiv("flip-card-detail-list");
    const detailRow = createDetailRow("flip-card-detail-primary");
    const comparisonRow = createDetailRow("flip-card-detail-comparison");
    const targetRow = createDetailRow("flip-card-detail-target");
    const varianceRow = createDetailRow("flip-card-detail-variance");
    const statusRow = createDetailRow("flip-card-detail-status");
    detailList.append(detailRow.row, comparisonRow.row, targetRow.row, varianceRow.row, statusRow.row);
    backSelectionButton.append(backLabel, detailList);

    const backFlipButton = createFlipButton("flip-card-flip-back");
    backFace.append(backSelectionButton, backFlipButton);

    inner.append(frontFace, backFace);
    wrapper.append(inner);

    return {
        backFace,
        backFlipButton,
        backLabel,
        backSelectionButton,
        comparisonRow,
        detailRow,
        frontFace,
        frontFlipButton,
        frontLabel,
        frontSelectionButton,
        frontStatus,
        frontValue,
        frontVariance,
        inner,
        screenReaderSummary,
        statusRow,
        targetRow,
        varianceRow,
        wrapper,
    };
}

function statusColor(status: KpiStatus, settings: VisualFormattingSettingsModel): string {
    switch (status) {
        case "positive":
            return settings.kpiStatus.positiveColor.value.value;
        case "negative":
            return settings.kpiStatus.negativeColor.value.value;
        default:
            return settings.kpiStatus.neutralColor.value.value;
    }
}

function readableTextColor(background: string): string {
    const match = /^#([0-9a-f]{6})$/i.exec(background);
    if (!match?.[1]) {
        return "#FFFFFF";
    }

    const value = Number.parseInt(match[1], 16);
    const red = (value >> 16) & 255;
    const green = (value >> 8) & 255;
    const blue = value & 255;
    const luminance = (0.2126 * red + 0.7152 * green + 0.0722 * blue) / 255;
    return luminance > 0.55 ? "#111111" : "#FFFFFF";
}

function applyCssVariables(
    elements: CardElements,
    card: CardViewModel,
    context: CardRenderContext,
): void {
    const { settings, colorPalette } = context;
    const style = elements.wrapper.style;
    const computedStatusColor = statusColor(card.kpi.status, settings);
    const conditionalTarget = getEnumSettingValue(settings.kpiStatus.conditionalTarget) as ConditionalColorTarget;
    let frontBackground = settings.cardAppearance.frontBackground.value.value;
    let backBackground = settings.cardAppearance.backBackground.value.value;
    let borderColor = settings.cardAppearance.borderColor.value.value;
    let accentColor = settings.cardAppearance.accentColor.value.value;
    let mainColor = settings.mainValue.fontColor.value.value;
    let labelColor = settings.label.fontColor.value.value;
    let detailLabelColor = settings.detailValues.labelColor.value.value;
    let detailValueColor = settings.detailValues.valueColor.value.value;

    if (settings.kpiStatus.show.value) {
        if (conditionalTarget === "accent") {
            borderColor = computedStatusColor;
            accentColor = computedStatusColor;
        } else if (conditionalTarget === "mainValue") {
            mainColor = computedStatusColor;
        } else if (conditionalTarget === "background") {
            frontBackground = computedStatusColor;
            backBackground = computedStatusColor;
            const readable = readableTextColor(computedStatusColor);
            mainColor = readable;
            labelColor = readable;
            detailLabelColor = readable;
            detailValueColor = readable;
        }
    }

    if (colorPalette.isHighContrast) {
        frontBackground = colorPalette.background.value;
        backBackground = colorPalette.background.value;
        borderColor = colorPalette.foreground.value;
        accentColor = colorPalette.foreground.value;
        mainColor = colorPalette.foreground.value;
        labelColor = colorPalette.foreground.value;
        detailLabelColor = colorPalette.foreground.value;
        detailValueColor = colorPalette.foreground.value;
    }

    style.setProperty("--flip-front-background", frontBackground);
    style.setProperty("--flip-back-background", backBackground);
    style.setProperty("--flip-border-color", borderColor);
    style.setProperty("--flip-border-width", `${settings.cardAppearance.borderWidth.value}px`);
    style.setProperty("--flip-radius", `${settings.cardAppearance.cornerRadius.value}px`);
    style.setProperty("--flip-configured-padding", `${settings.cardAppearance.padding.value}px`);
    style.setProperty("--flip-accent-color", accentColor);
    style.setProperty("--flip-label-family", settings.label.fontFamily.value);
    style.setProperty("--flip-label-size", `${settings.label.fontSize.value}px`);
    style.setProperty("--flip-label-color", labelColor);
    style.setProperty("--flip-label-weight", settings.label.bold.value ? "700" : "400");
    style.setProperty("--flip-label-align", getEnumSettingValue(settings.label.alignment));
    style.setProperty("--flip-main-family", settings.mainValue.fontFamily.value);
    style.setProperty("--flip-main-size", `${settings.mainValue.fontSize.value}px`);
    style.setProperty("--flip-main-color", mainColor);
    style.setProperty("--flip-main-weight", settings.mainValue.bold.value ? "700" : "400");
    style.setProperty("--flip-main-align", getEnumSettingValue(settings.mainValue.alignment));
    style.setProperty("--flip-detail-family", settings.detailValues.fontFamily.value);
    style.setProperty("--flip-detail-size", `${settings.detailValues.fontSize.value}px`);
    style.setProperty("--flip-detail-label-color", detailLabelColor);
    style.setProperty("--flip-detail-value-color", detailValueColor);
    style.setProperty("--flip-detail-spacing", `${settings.detailValues.spacing.value}px`);
    style.setProperty("--flip-status-color", colorPalette.isHighContrast ? colorPalette.foreground.value : computedStatusColor);
    style.setProperty("--flip-button-size", `${settings.flipBehavior.size.value}px`);
    style.setProperty("--flip-button-color", colorPalette.isHighContrast ? colorPalette.hyperlink.value : settings.flipBehavior.buttonColor.value.value);
    style.setProperty("--flip-button-background", colorPalette.isHighContrast ? colorPalette.background.value : settings.flipBehavior.buttonBackground.value.value);
    style.setProperty("--flip-focus-color", colorPalette.isHighContrast ? colorPalette.hyperlink.value : "#FFFFFF");
    style.setProperty("--flip-focus-inset", colorPalette.isHighContrast ? colorPalette.background.value : "#005A9E");
    style.setProperty("--flip-selection-color", colorPalette.isHighContrast ? colorPalette.foregroundSelected.value : "#0078D4");
    style.setProperty("--flip-duration", `${settings.flipBehavior.animationDuration.value}ms`);
    elements.wrapper.classList.toggle("has-shadow", settings.cardAppearance.shadow.value && !colorPalette.isHighContrast);
    elements.wrapper.classList.toggle("label-wrap", settings.label.wrap.value);
}

function setRow(
    elements: DetailRowElements,
    displayName: string,
    value: string,
    visible: boolean,
): void {
    elements.label.textContent = displayName;
    elements.value.textContent = value;
    elements.row.hidden = !visible;
}

function positionFlipButtons(elements: CardElements, position: string): void {
    const classNames = ["position-topLeft", "position-topRight", "position-bottomLeft", "position-bottomRight"];
    elements.frontFlipButton.classList.remove(...classNames);
    elements.backFlipButton.classList.remove(...classNames);
    elements.frontFlipButton.classList.add(`position-${position}`);
    elements.backFlipButton.classList.add(`position-${position}`);
    elements.wrapper.classList.toggle("flip-button-left", position.endsWith("Left"));
    elements.wrapper.classList.toggle("flip-button-right", position.endsWith("Right"));
}

export function updateCardFace(elements: CardElements, face: CardFace): void {
    const isBack = face === "back";
    elements.inner.classList.toggle("is-flipped", isBack);
    elements.frontFace.setAttribute("aria-hidden", String(isBack));
    elements.backFace.setAttribute("aria-hidden", String(!isBack));
    elements.frontSelectionButton.tabIndex = isBack ? -1 : 0;
    elements.frontFlipButton.tabIndex = isBack ? -1 : 0;
    elements.backSelectionButton.tabIndex = isBack ? 0 : -1;
    elements.backFlipButton.tabIndex = isBack ? 0 : -1;
    elements.frontFlipButton.setAttribute("aria-pressed", String(isBack));
    elements.backFlipButton.setAttribute("aria-pressed", String(isBack));
}

export function renderCard(
    elements: CardElements,
    card: CardViewModel,
    context: CardRenderContext,
): void {
    applyCssVariables(elements, card, context);
    elements.wrapper.dataset.cardKey = card.key;
    elements.wrapper.classList.toggle("is-selected", context.selected);
    elements.wrapper.classList.toggle("is-high-contrast", context.colorPalette.isHighContrast);
    elements.wrapper.classList.toggle("has-value-error", card.cardValue.state !== "valid");
    elements.frontLabel.hidden = !context.settings.label.show.value;
    elements.frontLabel.textContent = card.label;
    elements.frontValue.textContent = card.cardValue.state === "invalid" ? "Invalid value" : card.cardValue.formattedValue;
    const cardValueMessage = card.cardValue.state === "blank"
        ? "Card Value is blank"
        : card.cardValue.state === "invalid"
            ? "Card Value must be numeric"
            : undefined;
    elements.frontVariance.textContent = cardValueMessage ?? card.varianceText ?? "";
    elements.frontVariance.hidden = cardValueMessage === undefined && (
        !context.settings.detailValues.showVariance.value || card.varianceText === undefined
    );

    const statusText = getStatusText(card.kpi);
    elements.frontStatus.textContent = `${getStatusSymbol(card.kpi)} ${statusText}`;
    elements.frontStatus.hidden = !context.settings.kpiStatus.show.value || card.cardValue.state !== "valid";

    elements.backLabel.textContent = card.label;
    setRow(
        elements.detailRow,
        card.detailValue.displayName,
        card.detailValue.formattedValue,
        context.settings.detailValues.showDetail.value && card.detailValue.state !== "missing",
    );
    setRow(
        elements.comparisonRow,
        card.comparisonValue.displayName,
        card.comparisonValue.formattedValue,
        context.settings.detailValues.showComparison.value && card.comparisonValue.state !== "missing",
    );
    setRow(
        elements.targetRow,
        card.targetValue.displayName,
        card.targetValue.formattedValue,
        context.settings.detailValues.showTarget.value && card.targetValue.state !== "missing",
    );
    setRow(
        elements.varianceRow,
        card.kpi.varianceReference === "comparison" ? "Variance vs Comparison" : "Variance vs Target",
        card.varianceText ?? "Not available",
        context.settings.detailValues.showVariance.value && card.kpi.varianceReference !== "none",
    );
    setRow(
        elements.statusRow,
        "KPI status",
        `${getStatusSymbol(card.kpi)} ${statusText}`,
        context.settings.kpiStatus.show.value,
    );

    const isSelectable = card.selectionId !== undefined && context.allowInteractions;
    const summary = [
        card.label,
        card.cardValue.displayName,
        card.cardValue.formattedValue,
        card.varianceText ? `Variance ${card.varianceText}` : undefined,
        `Status ${statusText}`,
    ].filter((part): part is string => part !== undefined).join(". ");
    elements.screenReaderSummary.textContent = summary;
    elements.frontSelectionButton.setAttribute("aria-label", `${summary}. Select card.`);
    elements.backSelectionButton.setAttribute("aria-label", `${summary}. Select card.`);
    elements.frontSelectionButton.setAttribute("aria-pressed", String(context.selected));
    elements.backSelectionButton.setAttribute("aria-pressed", String(context.selected));
    elements.frontSelectionButton.setAttribute("aria-disabled", String(!isSelectable));
    elements.backSelectionButton.setAttribute("aria-disabled", String(!isSelectable));
    elements.frontFlipButton.setAttribute("aria-label", `Show details for ${card.label}`);
    elements.backFlipButton.setAttribute("aria-label", `Return to the front of ${card.label}`);

    const hasBackContent = [
        !elements.detailRow.row.hidden,
        !elements.comparisonRow.row.hidden,
        !elements.targetRow.row.hidden,
        !elements.varianceRow.row.hidden,
        !elements.statusRow.row.hidden,
    ].some(Boolean);
    const showFlip = context.settings.flipBehavior.showButton.value && hasBackContent;
    elements.wrapper.classList.toggle("has-flip-button", showFlip);
    elements.frontFlipButton.hidden = !showFlip;
    elements.backFlipButton.hidden = !showFlip;
    positionFlipButtons(elements, getEnumSettingValue(context.settings.flipBehavior.position));
    updateCardFace(elements, hasBackContent ? context.face : "front");
}
