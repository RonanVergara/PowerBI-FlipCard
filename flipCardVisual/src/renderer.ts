import powerbi from "powerbi-visuals-api";

import ISandboxExtendedColorPalette = powerbi.extensibility.ISandboxExtendedColorPalette;

import { getStatusSymbol, getStatusText } from "./kpi";
import { getEnumSettingValue, VisualFormattingSettingsModel } from "./settings";
import { CardFace, CardViewModel, KpiStatus, LayoutDensity } from "./types";

interface DetailRowElements { readonly row: HTMLDivElement; readonly label: HTMLSpanElement; readonly value: HTMLSpanElement; }

export interface CardElements {
    readonly backFace?: HTMLDivElement;
    readonly backFlipButton?: HTMLButtonElement;
    readonly backLabel?: HTMLDivElement;
    readonly backSurface?: HTMLDivElement;
    readonly comparisonRow?: DetailRowElements;
    readonly detailRow?: DetailRowElements;
    readonly frontFace: HTMLDivElement;
    readonly frontFlipButton?: HTMLButtonElement;
    readonly frontLabel: HTMLDivElement;
    readonly frontReference: HTMLDivElement;
    readonly frontSelectionButton: HTMLButtonElement;
    readonly frontStatus: HTMLDivElement;
    readonly frontValue: HTMLDivElement;
    readonly frontVariance: HTMLDivElement;
    readonly inner: HTMLDivElement;
    readonly screenReaderSummary: HTMLSpanElement;
    readonly statusRow?: DetailRowElements;
    readonly targetRow?: DetailRowElements;
    readonly varianceRow?: DetailRowElements;
    readonly wrapper: HTMLElement;
}

export interface CardRenderContext {
    readonly allowInteractions: boolean;
    readonly colorPalette: ISandboxExtendedColorPalette;
    readonly density: LayoutDensity;
    readonly face: CardFace;
    readonly reducedMotion: boolean;
    readonly selected: boolean;
    readonly settings: VisualFormattingSettingsModel;
}

function div(className: string): HTMLDivElement { const element = document.createElement("div"); element.className = className; return element; }
function flipButton(className: string): HTMLButtonElement { const button = document.createElement("button"); button.type = "button"; button.className = `flip-card-flip-button ${className}`; button.textContent = "↻"; return button; }
function detailRow(className: string): DetailRowElements { const row = div(`flip-card-detail-row ${className}`); const label = document.createElement("span"); label.className = "flip-card-detail-label"; const value = document.createElement("span"); value.className = "flip-card-detail-value"; row.append(label, value); return { row, label, value }; }

export function cardHasBenchmark(card: CardViewModel, settings: VisualFormattingSettingsModel): boolean {
    return settings.benchmark.enabled.value && card.cardValue.state === "valid" && card.kpi.statusReference !== "none";
}

export function cardHasMeaningfulBack(card: CardViewModel, settings: VisualFormattingSettingsModel): boolean {
    if (!settings.flip.enabled.value || card.cardValue.state !== "valid") { return false; }
    return (settings.flip.showDetail.value && card.detailValue.state === "valid") || cardHasBenchmark(card, settings);
}

export function createCardElements(hasBack: boolean): CardElements {
    const wrapper = document.createElement("article");
    wrapper.className = "flip-card-wrapper";
    const inner = div("flip-card-inner");
    const frontFace = div("flip-card-face flip-card-front");
    const frontSelectionButton = document.createElement("button");
    frontSelectionButton.type = "button";
    frontSelectionButton.className = "flip-card-selection-surface flip-card-front-content";
    const frontLabel = div("flip-card-label");
    const frontValue = div("flip-card-main-value");
    const frontReference = div("flip-card-reference");
    const frontVariance = div("flip-card-variance");
    const frontStatus = div("flip-card-status");
    const screenReaderSummary = document.createElement("span");
    screenReaderSummary.className = "flip-card-sr-only";
    frontSelectionButton.append(frontLabel, frontValue, frontReference, frontVariance, frontStatus, screenReaderSummary);
    const result: CardElements = { frontFace, frontLabel, frontReference, frontSelectionButton, frontStatus, frontValue, frontVariance, inner, screenReaderSummary, wrapper };

    if (!hasBack) {
        frontFace.append(frontSelectionButton);
        inner.append(frontFace);
        wrapper.append(inner);
        return result;
    }

    const frontFlipButton = flipButton("flip-card-flip-front");
    frontFace.append(frontSelectionButton, frontFlipButton);
    const backFace = div("flip-card-face flip-card-back");
    const backSurface = div("flip-card-back-content");
    const backLabel = div("flip-card-back-label");
    const detailList = div("flip-card-detail-list");
    const primary = detailRow("flip-card-detail-primary");
    const comparison = detailRow("flip-card-detail-comparison");
    const target = detailRow("flip-card-detail-target");
    const variance = detailRow("flip-card-detail-variance");
    const status = detailRow("flip-card-detail-status");
    detailList.append(primary.row, comparison.row, target.row, variance.row, status.row);
    backSurface.append(backLabel, detailList);
    const backFlipButton = flipButton("flip-card-flip-back");
    backFace.append(backSurface, backFlipButton);
    inner.append(frontFace, backFace);
    wrapper.append(inner);
    return Object.assign(result, { backFace, backFlipButton, backLabel, backSurface, comparisonRow: comparison, detailRow: primary, frontFlipButton, statusRow: status, targetRow: target, varianceRow: variance });
}

function automaticStatusColor(status: KpiStatus, settings: VisualFormattingSettingsModel): string {
    if (status === "positive") { return settings.benchmark.positiveColor.value.value; }
    if (status === "negative") { return settings.benchmark.negativeColor.value.value; }
    return settings.benchmark.neutralColor.value.value;
}

function applyCssVariables(elements: CardElements, card: CardViewModel, context: CardRenderContext): void {
    const { settings, colorPalette } = context;
    const highContrast = colorPalette.isHighContrast;
    const authored = card.colorOverrides;
    const finalColor = (normal: string): string => highContrast ? colorPalette.foreground.value : normal;
    const finalBackground = (normal: string): string => highContrast ? colorPalette.background.value : normal;
    const style = elements.wrapper.style;
    style.setProperty("--flip-front-background", finalBackground(authored.frontBackground ?? settings.cardAppearance.frontBackground.value.value));
    style.setProperty("--flip-back-background", finalBackground(settings.cardAppearance.backBackground.value.value));
    style.setProperty("--flip-border-color", finalColor(authored.borderColor ?? settings.cardAppearance.borderColor.value.value));
    style.setProperty("--flip-accent-color", finalColor(authored.accentColor ?? settings.cardAppearance.accentColor.value.value));
    style.setProperty("--flip-main-color", finalColor(authored.mainValueColor ?? settings.mainValue.fontColor.value.value));
    style.setProperty("--flip-label-color", finalColor(settings.label.fontColor.value.value));
    style.setProperty("--flip-detail-label-color", finalColor(settings.flip.labelColor.value.value));
    style.setProperty("--flip-detail-value-color", finalColor(settings.flip.valueColor.value.value));
    style.setProperty("--flip-status-color", finalColor(authored.statusIndicatorColor ?? automaticStatusColor(card.kpi.status, settings)));
    style.setProperty("--flip-border-width", `${settings.cardAppearance.borderWidth.value}px`);
    style.setProperty("--flip-radius", `${settings.cardAppearance.cornerRadius.value}px`);
    style.setProperty("--flip-configured-padding", `${settings.cardAppearance.padding.value}px`);
    style.setProperty("--flip-label-family", settings.label.fontFamily.value);
    style.setProperty("--flip-label-size", `${settings.label.fontSize.value}px`);
    style.setProperty("--flip-label-weight", settings.label.bold.value ? "700" : "400");
    style.setProperty("--flip-label-align", getEnumSettingValue(settings.label.alignment));
    style.setProperty("--flip-main-family", settings.mainValue.fontFamily.value);
    style.setProperty("--flip-main-size", `${settings.mainValue.fontSize.value}px`);
    style.setProperty("--flip-main-weight", settings.mainValue.bold.value ? "700" : "400");
    style.setProperty("--flip-main-align", getEnumSettingValue(settings.mainValue.alignment));
    style.setProperty("--flip-detail-family", settings.flip.fontFamily.value);
    style.setProperty("--flip-detail-size", `${settings.flip.fontSize.value}px`);
    style.setProperty("--flip-detail-spacing", `${settings.flip.spacing.value}px`);
    style.setProperty("--flip-button-size", `${settings.flip.size.value}px`);
    style.setProperty("--flip-button-color", highContrast ? colorPalette.hyperlink.value : settings.flip.buttonColor.value.value);
    style.setProperty("--flip-button-background", finalBackground(settings.flip.buttonBackground.value.value));
    style.setProperty("--flip-focus-color", highContrast ? colorPalette.hyperlink.value : "#005A9E");
    style.setProperty("--flip-selection-color", highContrast ? colorPalette.foregroundSelected.value : "#0078D4");
    style.setProperty("--flip-duration", `${context.reducedMotion ? 0 : settings.flip.animationDuration.value}ms`);
    elements.wrapper.classList.toggle("has-shadow", settings.cardAppearance.shadow.value && !highContrast);
    elements.wrapper.classList.toggle("has-accent", settings.cardAppearance.accentEnabled.value);
    elements.wrapper.classList.toggle("label-wrap", settings.label.wrap.value);
    elements.wrapper.classList.toggle("density-compact", context.density === "compact");
    elements.wrapper.classList.toggle("density-minimal", context.density === "minimal");
    elements.wrapper.classList.toggle("is-high-contrast", highContrast);
}

function setRow(row: DetailRowElements | undefined, displayName: string, value: string, visible: boolean): void {
    if (!row) { return; }
    row.label.textContent = displayName;
    row.value.textContent = value;
    row.row.hidden = !visible;
}

function positionFlipButtons(elements: CardElements, position: string): void {
    const buttons = [elements.frontFlipButton, elements.backFlipButton].filter((item): item is HTMLButtonElement => item !== undefined);
    for (const button of buttons) { button.classList.remove("position-topLeft", "position-topRight", "position-bottomLeft", "position-bottomRight"); button.classList.add(`position-${position}`); }
    elements.wrapper.classList.toggle("flip-button-left", position.endsWith("Left"));
    elements.wrapper.classList.toggle("flip-button-right", position.endsWith("Right"));
}

function setInert(element: HTMLElement, inert: boolean): void {
    element.inert = inert;
    if (inert) { element.setAttribute("inert", ""); } else { element.removeAttribute("inert"); }
    element.style.pointerEvents = inert ? "none" : "auto";
}

export function updateCardFace(elements: CardElements, face: CardFace): void {
    const isBack = face === "back" && elements.backFace !== undefined;
    elements.inner.classList.toggle("is-flipped", isBack);
    elements.frontFace.setAttribute("aria-hidden", String(isBack));
    setInert(elements.frontFace, isBack);
    elements.frontSelectionButton.tabIndex = isBack ? -1 : 0;
    if (elements.frontFlipButton) { elements.frontFlipButton.tabIndex = isBack ? -1 : 0; elements.frontFlipButton.setAttribute("aria-pressed", String(isBack)); }
    if (elements.backFace) { elements.backFace.setAttribute("aria-hidden", String(!isBack)); setInert(elements.backFace, !isBack); }
    if (elements.backFlipButton) { elements.backFlipButton.tabIndex = isBack ? 0 : -1; elements.backFlipButton.setAttribute("aria-pressed", String(isBack)); }
}

export function renderCard(elements: CardElements, card: CardViewModel, context: CardRenderContext): void {
    const benchmark = cardHasBenchmark(card, context.settings);
    const statusText = benchmark ? getStatusText(card.kpi) : undefined;
    const statusReference = card.kpi.statusReference === "target" ? card.targetValue : card.comparisonValue;
    const varianceReference = card.kpi.varianceReference === "comparison" ? card.comparisonValue : card.targetValue;
    applyCssVariables(elements, card, context);
    elements.wrapper.dataset.cardKey = card.key;
    elements.wrapper.classList.toggle("is-selected", context.selected);
    elements.wrapper.classList.toggle("has-value-error", card.cardValue.state !== "valid");
    elements.frontLabel.hidden = !context.settings.label.show.value;
    elements.frontLabel.textContent = card.label;
    elements.frontValue.textContent = card.cardValue.state === "valid" ? card.cardValue.formattedValue : card.cardValue.state === "blank" ? "Blank" : "Invalid value";
    elements.frontReference.textContent = benchmark ? `vs ${statusReference.displayName}: ${statusReference.formattedValue}` : "";
    elements.frontReference.hidden = !benchmark || !context.settings.benchmark.showReference.value;
    elements.frontVariance.textContent = card.cardValue.state === "blank" ? "Card Value is blank" : card.cardValue.state === "invalid" ? "Card Value must be numeric" : card.varianceText ?? "";
    elements.frontVariance.hidden = card.cardValue.state === "valid" && (!benchmark || !context.settings.benchmark.showVariance.value || !card.varianceText);
    elements.frontStatus.textContent = statusText ? `${getStatusSymbol(card.kpi)} ${statusText}` : "";
    elements.frontStatus.hidden = !benchmark || !context.settings.benchmark.showStatus.value || !statusText;

    if (elements.backFace) {
        if (elements.backLabel) { elements.backLabel.textContent = card.label; }
        setRow(elements.detailRow, card.detailValue.displayName, card.detailValue.formattedValue, context.settings.flip.showDetail.value && card.detailValue.state === "valid");
        setRow(elements.comparisonRow, card.comparisonValue.displayName, card.comparisonValue.formattedValue, benchmark && card.comparisonValue.state === "valid");
        setRow(elements.targetRow, card.targetValue.displayName, card.targetValue.formattedValue, benchmark && card.targetValue.state === "valid");
        setRow(elements.varianceRow, `Variance vs ${varianceReference.displayName}`, card.varianceText ?? "", benchmark && Boolean(card.varianceText));
        setRow(elements.statusRow, `Status vs ${statusReference.displayName}`, statusText ? `${getStatusSymbol(card.kpi)} ${statusText}` : "", benchmark && Boolean(statusText));
    }

    const selectable = card.selectionId !== undefined && context.allowInteractions && context.settings.interactions.selectionEnabled.value;
    const summaryParts = [card.label, `${card.cardValue.displayName} ${elements.frontValue.textContent}`];
    if (benchmark && card.varianceText) { summaryParts.push(`Variance vs ${varianceReference.displayName} ${card.varianceText}`); }
    if (benchmark && statusText) { summaryParts.push(`Status vs ${statusReference.displayName} ${statusText}`); }
    const summary = summaryParts.join(". ");
    elements.screenReaderSummary.textContent = summary;
    elements.frontSelectionButton.setAttribute("aria-label", selectable ? `${summary}. Select card.` : summary);
    elements.frontSelectionButton.setAttribute("aria-pressed", String(context.selected));
    elements.frontSelectionButton.setAttribute("aria-disabled", String(!selectable));
    if (elements.frontFlipButton) { elements.frontFlipButton.setAttribute("aria-label", `Show details for ${card.label}`); }
    if (elements.backFlipButton) { elements.backFlipButton.setAttribute("aria-label", `Return to the front of ${card.label}`); }
    positionFlipButtons(elements, getEnumSettingValue(context.settings.flip.position));
    updateCardFace(elements, context.face);
}
