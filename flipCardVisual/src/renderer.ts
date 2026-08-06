import powerbi from "powerbi-visuals-api";

import ISandboxExtendedColorPalette = powerbi.extensibility.ISandboxExtendedColorPalette;

import { FaceLayoutPlan } from "./layout";
import { getStatusSymbol } from "./kpi";
import { MotionConfiguration } from "./motion";
import { getBackTitle, getEnumSettingValue, VisualFormattingSettingsModel } from "./settings";
import { CardFace, CardViewModel, ControlIcon, KpiStatus } from "./types";

interface BackItem {
    readonly className: string;
    readonly label: string;
    readonly section: "benchmark" | "primary" | "result";
    readonly value: string;
}

export interface CardElements {
    readonly backContent?: HTMLDivElement;
    readonly backFace?: HTMLDivElement;
    readonly backFlipButton?: HTMLButtonElement;
    readonly backHeader?: HTMLElement;
    readonly backSubtitle?: HTMLDivElement;
    readonly backSurface?: HTMLDivElement;
    readonly backTitle?: HTMLHeadingElement;
    readonly frontFace: HTMLDivElement;
    readonly frontFlipButton?: HTMLButtonElement;
    readonly frontInsight: HTMLDivElement;
    readonly frontInsightIcon: HTMLSpanElement;
    readonly frontLabel: HTMLDivElement;
    readonly frontReference: HTMLDivElement;
    readonly frontSelectionButton?: HTMLButtonElement;
    readonly frontStatus: HTMLDivElement;
    readonly frontStatusIcon: HTMLSpanElement;
    readonly frontSurface: HTMLElement;
    readonly frontValue: HTMLDivElement;
    readonly inner: HTMLDivElement;
    readonly screenReaderSummary: HTMLSpanElement;
    readonly wrapper: HTMLElement;
}

export interface CardRenderContext {
    readonly colorPalette: ISandboxExtendedColorPalette;
    readonly face: CardFace;
    readonly faceLayout: FaceLayoutPlan;
    readonly motion: MotionConfiguration;
    readonly selected: boolean;
    readonly settings: VisualFormattingSettingsModel;
}

function div(className: string): HTMLDivElement { const element = document.createElement("div"); element.className = className; return element; }

function svgIcon(icon: ControlIcon): SVGSVGElement {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    const paths: Record<ControlIcon, string> = {
        chevron: "M8.5 4.5 16 12l-7.5 7.5-1.4-1.4 6.1-6.1-6.1-6.1z",
        information: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 15h-2v-6h2v6Zm0-8h-2V7h2v2Z",
        rotate: "M12 4a8 8 0 0 1 7.4 5H22l-3.5 3.5L15 9h2.2A6 6 0 1 0 18 15h2.1A8 8 0 1 1 12 4Z",
    };
    path.setAttribute("d", paths[icon]);
    svg.append(path);
    return svg;
}

function flipButton(className: string): HTMLButtonElement {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `flip-card-flip-button ${className}`;
    return button;
}

function controlCluster(button: HTMLButtonElement, front: boolean): HTMLDivElement {
    const cluster = div(`flip-card-control-cluster ${front ? "flip-card-control-front" : "flip-card-control-back"}`);
    if (front) {
        const cue = document.createElement("span");
        cue.className = "flip-card-details-cue";
        cue.textContent = "Details";
        cue.setAttribute("aria-hidden", "true");
        cluster.append(cue, button);
    } else {
        cluster.append(button);
    }
    return cluster;
}

export function cardHasBenchmark(card: CardViewModel, settings: VisualFormattingSettingsModel): boolean {
    return settings.benchmark.enabled.value && card.cardValue.state === "valid" && card.kpi.statusReference !== "none";
}

function backItems(card: CardViewModel, settings: VisualFormattingSettingsModel): BackItem[] {
    if (!settings.flip.enabled.value || card.cardValue.state !== "valid") { return []; }
    const items: BackItem[] = [];
    if (settings.flip.showDetail.value && card.detailValue.state === "valid") {
        items.push({ className: "flip-card-detail-primary", label: card.detailValue.displayName, section: "primary", value: card.detailValue.formattedValue });
    }
    if (cardHasBenchmark(card, settings)) {
        if (card.comparisonValue.state === "valid") { items.push({ className: "flip-card-detail-comparison", label: card.comparisonValue.displayName, section: "benchmark", value: card.comparisonValue.formattedValue }); }
        if (card.targetValue.state === "valid") { items.push({ className: "flip-card-detail-target", label: card.targetValue.displayName, section: "benchmark", value: card.targetValue.formattedValue }); }
        if (settings.benchmark.showVariance.value && card.presentation?.insight) {
            items.push({ className: "flip-card-detail-variance", label: `Variance vs ${card.presentation.insight.referenceName}`, section: "result", value: card.varianceText ?? card.presentation.insight.text });
        }
        if (settings.benchmark.showStatus.value && card.presentation?.status) {
            items.push({ className: "flip-card-detail-status", label: `Status vs ${card.presentation.status.referenceName}`, section: "result", value: `${getStatusSymbol(card.kpi)} ${card.presentation.status.text}` });
        }
    }
    return items;
}

export function getBackItemCount(card: CardViewModel, settings: VisualFormattingSettingsModel): number { return backItems(card, settings).length; }

export function cardHasMeaningfulBack(card: CardViewModel, settings: VisualFormattingSettingsModel): boolean { return getBackItemCount(card, settings) > 0; }

export function createCardElements(hasBack: boolean, selectable: boolean): CardElements {
    const wrapper = document.createElement("article");
    wrapper.className = "flip-card-wrapper";
    const inner = div("flip-card-inner");
    const frontFace = div("flip-card-face flip-card-front");
    const frontSurface = selectable ? document.createElement("button") : div("flip-card-front-content");
    let frontSelectionButton: HTMLButtonElement | undefined;
    if (selectable) {
        frontSelectionButton = frontSurface as HTMLButtonElement;
        frontSelectionButton.type = "button";
        frontSelectionButton.className = "flip-card-selection-surface flip-card-front-content";
    } else {
        frontSurface.className = "flip-card-static-surface flip-card-front-content";
        frontSurface.setAttribute("role", "group");
    }
    const frontLabel = div("flip-card-label");
    const frontValue = div("flip-card-main-value");
    const frontReference = div("flip-card-reference");
    const frontInsight = div("flip-card-insight");
    const frontInsightIcon = document.createElement("span");
    frontInsightIcon.className = "flip-card-insight-icon";
    frontInsightIcon.setAttribute("aria-hidden", "true");
    const insightText = document.createElement("span"); insightText.className = "flip-card-insight-text";
    frontInsight.append(frontInsightIcon, insightText);
    const frontStatus = div("flip-card-status");
    const frontStatusIcon = document.createElement("span");
    frontStatusIcon.className = "flip-card-status-icon";
    frontStatusIcon.setAttribute("aria-hidden", "true");
    const statusText = document.createElement("span"); statusText.className = "flip-card-status-text";
    frontStatus.append(frontStatusIcon, statusText);
    const screenReaderSummary = document.createElement("span");
    screenReaderSummary.className = "flip-card-sr-only";
    const primary = div("flip-card-front-primary"); primary.append(frontValue);
    const secondary = div("flip-card-front-secondary"); secondary.append(frontInsight, frontReference, frontStatus);
    frontSurface.append(frontLabel, primary, secondary, screenReaderSummary);
    const result: CardElements = { frontFace, frontInsight, frontInsightIcon, frontLabel, frontReference, frontSelectionButton, frontStatus, frontStatusIcon, frontSurface, frontValue, inner, screenReaderSummary, wrapper };

    if (!hasBack) {
        frontFace.append(frontSurface);
        inner.append(frontFace);
        wrapper.append(inner);
        return result;
    }

    const frontFlipButton = flipButton("flip-card-flip-front");
    frontFace.append(frontSurface, controlCluster(frontFlipButton, true));
    const backFace = div("flip-card-face flip-card-back");
    const backSurface = div("flip-card-back-surface");
    backSurface.setAttribute("role", "group");
    const backHeader = document.createElement("header");
    backHeader.className = "flip-card-back-header";
    const backTitle = document.createElement("h3"); backTitle.className = "flip-card-back-title";
    const backSubtitle = div("flip-card-back-subtitle");
    backHeader.append(backTitle, backSubtitle);
    const backContent = div("flip-card-back-content");
    backSurface.append(backHeader, backContent);
    const backFlipButton = flipButton("flip-card-flip-back");
    backFace.append(backSurface, controlCluster(backFlipButton, false));
    inner.append(frontFace, backFace);
    wrapper.append(inner);
    return Object.assign(result, { backContent, backFace, backFlipButton, backHeader, backSubtitle, backSurface, backTitle, frontFlipButton });
}

function automaticStatusColor(status: KpiStatus, settings: VisualFormattingSettingsModel): string {
    if (status === "positive") { return settings.benchmark.positiveColor.value.value; }
    if (status === "negative") { return settings.benchmark.negativeColor.value.value; }
    return settings.benchmark.neutralColor.value.value;
}

function applyCssVariables(elements: CardElements, card: CardViewModel, context: CardRenderContext): void {
    const { settings, colorPalette, faceLayout, motion } = context;
    const highContrast = colorPalette.isHighContrast;
    const authored = card.colorOverrides;
    const finalColor = (normal: string): string => highContrast ? colorPalette.foreground.value : normal;
    const finalBackground = (normal: string): string => highContrast ? colorPalette.background.value : normal;
    const style = elements.wrapper.style;
    style.setProperty("--flip-front-background", finalBackground(authored.frontBackground ?? settings.cardAppearance.frontBackground.value.value));
    style.setProperty("--flip-back-header-background", finalBackground(settings.flip.backHeaderBackground.value.value));
    style.setProperty("--flip-back-content-background", finalBackground(settings.flip.backContentBackground.value.value));
    style.setProperty("--flip-back-header-color", finalColor(settings.flip.backHeaderTextColor.value.value));
    style.setProperty("--flip-border-color", finalColor(authored.borderColor ?? settings.cardAppearance.borderColor.value.value));
    style.setProperty("--flip-accent-color", finalColor(authored.accentColor ?? settings.cardAppearance.accentColor.value.value));
    style.setProperty("--flip-main-color", finalColor(authored.mainValueColor ?? settings.mainValue.fontColor.value.value));
    style.setProperty("--flip-label-color", finalColor(settings.label.fontColor.value.value));
    style.setProperty("--flip-detail-label-color", finalColor(settings.flip.labelColor.value.value));
    style.setProperty("--flip-detail-value-color", finalColor(settings.flip.valueColor.value.value));
    style.setProperty("--flip-insight-color", finalColor(automaticStatusColor(card.kpi.varianceStatus, settings)));
    style.setProperty("--flip-status-color", finalColor(authored.statusIndicatorColor ?? automaticStatusColor(card.kpi.status, settings)));
    style.setProperty("--flip-insight-background", settings.benchmark.insightBackgroundEnabled.value ? finalBackground(settings.benchmark.insightBackground.value.value) : "transparent");
    style.setProperty("--flip-status-background", finalBackground(settings.benchmark.statusBackground.value.value));
    style.setProperty("--flip-divider-color", finalColor(settings.label.dividerColor.value.value));
    style.setProperty("--flip-back-divider-color", finalColor(settings.flip.backDividerColor.value.value));
    style.setProperty("--flip-item-background", finalBackground(settings.flip.itemBackground.value.value));
    style.setProperty("--flip-border-width", `${settings.cardAppearance.borderWidth.value}px`);
    style.setProperty("--flip-radius", `${settings.cardAppearance.cornerRadius.value}px`);
    style.setProperty("--flip-padding", `${faceLayout.contentPadding}px`);
    style.setProperty("--flip-section-spacing", `${faceLayout.sectionSpacing}px`);
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
    style.setProperty("--flip-back-label-align", getEnumSettingValue(settings.flip.backLabelAlignment));
    style.setProperty("--flip-back-value-align", getEnumSettingValue(settings.flip.backValueAlignment));
    style.setProperty("--flip-button-size", `${settings.flip.size.value}px`);
    style.setProperty("--flip-button-color", highContrast ? colorPalette.hyperlink.value : settings.flip.buttonColor.value.value);
    style.setProperty("--flip-button-background", finalBackground(settings.flip.buttonBackground.value.value));
    style.setProperty("--flip-focus-color", highContrast ? colorPalette.hyperlink.value : "#005A9E");
    style.setProperty("--flip-selection-color", highContrast ? colorPalette.foregroundSelected.value : "#0078D4");
    style.setProperty("--flip-duration", `${motion.durationMs}ms`);
    style.setProperty("--flip-easing", motion.easing);
    style.setProperty("--flip-perspective", `${motion.perspectivePx}px`);
    style.setProperty("--flip-rotation", `${motion.rotationDegrees}deg`);
    style.setProperty("--flip-callout-ceiling", `${faceLayout.calloutSizeCeiling}px`);
    style.setProperty("--flip-vertical-align", getEnumSettingValue(settings.label.verticalAlignment) === "top" ? "flex-start" : getEnumSettingValue(settings.label.verticalAlignment) === "bottom" ? "flex-end" : "center");
    elements.wrapper.classList.toggle("has-shadow", settings.cardAppearance.shadow.value && !highContrast);
    elements.wrapper.classList.toggle("has-accent", settings.cardAppearance.accentEnabled.value);
    elements.wrapper.classList.toggle("has-front-divider", settings.label.dividerEnabled.value);
    elements.wrapper.classList.toggle("has-back-dividers", settings.flip.sectionDividers.value && faceLayout.density === "regular");
    elements.wrapper.classList.toggle("has-item-background", settings.flip.itemBackgroundEnabled.value && faceLayout.density === "regular");
    elements.wrapper.classList.toggle("label-wrap", settings.label.wrap.value);
    elements.wrapper.classList.toggle("density-compact", faceLayout.density === "compact");
    elements.wrapper.classList.toggle("density-minimal", faceLayout.density === "minimal");
    elements.wrapper.classList.toggle("is-high-contrast", highContrast);
    elements.wrapper.classList.toggle("front-layout-split", faceLayout.frontPresentation === "split");
    elements.wrapper.classList.toggle("front-layout-stacked", faceLayout.frontPresentation === "stacked");
    elements.wrapper.classList.toggle("back-layout-tiles", faceLayout.backLayout === "tiles");
    elements.wrapper.classList.toggle("back-layout-list", faceLayout.backLayout === "list");
    elements.wrapper.classList.toggle("back-columns-two", faceLayout.backColumns === 2);
    elements.wrapper.classList.toggle("detail-emphasis-strong", getEnumSettingValue(settings.flip.detailEmphasis) === "strong");
    elements.wrapper.classList.toggle("show-details-cue", settings.flip.showDetailsText.value);
    for (const value of ["horizontal", "vertical", "fade", "none"]) { elements.wrapper.classList.toggle(`motion-${value}`, motion.style === value); }
    for (const value of ["ghost", "outline", "filled"]) { elements.wrapper.classList.toggle(`control-${value}`, getEnumSettingValue(settings.flip.controlStyle) === value); }
    for (const value of ["circle", "roundedSquare"]) { elements.wrapper.classList.toggle(`control-${value}`, getEnumSettingValue(settings.flip.controlShape) === value); }
}

function positionFlipControls(elements: CardElements, position: string): void {
    const clusters = elements.wrapper.querySelectorAll<HTMLElement>(".flip-card-control-cluster");
    for (const cluster of Array.from(clusters)) {
        cluster.classList.remove("position-topLeft", "position-topRight", "position-bottomLeft", "position-bottomRight");
        cluster.classList.add(`position-${position}`);
    }
    elements.wrapper.classList.toggle("flip-button-left", position.endsWith("Left"));
    elements.wrapper.classList.toggle("flip-button-right", position.endsWith("Right"));
}

function setInert(element: HTMLElement, inert: boolean): void {
    element.inert = inert;
    if (inert) { element.setAttribute("inert", ""); } else { element.removeAttribute("inert"); }
    element.style.pointerEvents = inert ? "none" : "auto";
}

export function setCardFaceVisual(elements: CardElements, face: CardFace): void {
    elements.inner.classList.toggle("is-back", face === "back" && elements.backFace !== undefined);
}

export function updateCardFace(elements: CardElements, face: CardFace): void {
    const isBack = face === "back" && elements.backFace !== undefined;
    setCardFaceVisual(elements, isBack ? "back" : "front");
    elements.wrapper.dataset.transitionState = isBack ? "back" : "front";
    elements.frontFace.setAttribute("aria-hidden", String(isBack));
    setInert(elements.frontFace, isBack);
    if (elements.frontSelectionButton) { elements.frontSelectionButton.tabIndex = isBack ? -1 : 0; }
    if (elements.frontFlipButton) { elements.frontFlipButton.tabIndex = isBack ? -1 : 0; }
    if (elements.backFace) { elements.backFace.setAttribute("aria-hidden", String(!isBack)); setInert(elements.backFace, !isBack); }
    if (elements.backFlipButton) { elements.backFlipButton.tabIndex = isBack ? 0 : -1; }
}

export function setCardTransitionState(elements: CardElements, state: "turningToBack" | "turningToFront"): void { elements.wrapper.dataset.transitionState = state; }

function appendBackSections(elements: CardElements, card: CardViewModel, settings: VisualFormattingSettingsModel): void {
    if (!elements.backContent) { return; }
    const items = backItems(card, settings);
    const sections: HTMLElement[] = [];
    for (const sectionName of ["primary", "benchmark", "result"] as const) {
        const sectionItems = items.filter((item) => item.section === sectionName);
        if (sectionItems.length === 0) { continue; }
        const section = document.createElement("section");
        section.className = `flip-card-back-section flip-card-back-section-${sectionName}`;
        const list = document.createElement("dl"); list.className = "flip-card-detail-list";
        for (const item of sectionItems) {
            const row = div(`flip-card-detail-item ${item.className}`);
            const label = document.createElement("dt"); label.className = "flip-card-detail-label"; label.textContent = item.label;
            const value = document.createElement("dd"); value.className = "flip-card-detail-value"; value.textContent = item.value;
            row.append(label, value); list.append(row);
        }
        section.append(list); sections.push(section);
    }
    elements.backContent.replaceChildren(...sections);
}

export function renderCard(elements: CardElements, card: CardViewModel, context: CardRenderContext): void {
    const benchmark = cardHasBenchmark(card, context.settings);
    const presentation = card.presentation;
    applyCssVariables(elements, card, context);
    elements.wrapper.dataset.cardKey = card.key;
    elements.wrapper.classList.toggle("is-selected", context.selected);
    elements.wrapper.classList.toggle("has-value-error", card.cardValue.state !== "valid");
    elements.wrapper.dataset.frontLayout = context.faceLayout.frontPresentation;
    elements.wrapper.dataset.backLayout = context.faceLayout.backLayout;
    elements.frontLabel.hidden = !context.settings.label.show.value;
    elements.frontLabel.textContent = card.label;
    elements.frontLabel.style.setProperty("--flip-label-lines", String(context.faceLayout.labelLineLimit));
    elements.frontValue.textContent = card.cardValue.state === "valid" ? card.cardValue.formattedValue : card.cardValue.state === "blank" ? "Blank" : "Invalid value";
    const insightText = elements.frontInsight.querySelector<HTMLElement>(".flip-card-insight-text")!;
    insightText.textContent = card.cardValue.state === "blank" ? "Card Value is blank" : card.cardValue.state === "invalid" ? "Card Value must be numeric" : presentation?.insight?.text ?? "";
    elements.frontInsightIcon.textContent = card.kpi.absoluteVariance === undefined || card.kpi.absoluteVariance === 0 ? "–" : card.kpi.absoluteVariance > 0 ? "▲" : "▼";
    elements.frontInsightIcon.hidden = !context.settings.benchmark.insightIcon.value || !presentation?.insight;
    elements.frontInsight.hidden = card.cardValue.state === "valid" && (!benchmark || !context.settings.benchmark.showVariance.value || !presentation?.insight || !context.faceLayout.showInsight);
    elements.frontReference.textContent = presentation?.insight ? `${presentation.insight.referenceName}: ${presentation.insight.referenceValueText}` : "";
    elements.frontReference.hidden = !benchmark || !context.settings.benchmark.showReference.value || !presentation?.insight || !context.faceLayout.showSecondaryReference;
    const statusText = elements.frontStatus.querySelector<HTMLElement>(".flip-card-status-text")!;
    statusText.textContent = presentation?.status?.text ?? "";
    elements.frontStatusIcon.textContent = getStatusSymbol(card.kpi);
    elements.frontStatus.hidden = !benchmark || !context.settings.benchmark.showStatus.value || !presentation?.status || !context.faceLayout.showStatus;
    elements.frontStatus.className = `flip-card-status status-presentation-${context.faceLayout.statusPresentation}`;
    elements.frontStatus.setAttribute("aria-label", presentation?.status?.accessibleText ?? "");

    if (elements.backFace) {
        const title = getBackTitle(context.settings, card.label);
        if (elements.backTitle) { elements.backTitle.textContent = title; }
        if (elements.backSubtitle) {
            const titleSource = getEnumSettingValue(context.settings.flip.backTitleSource);
            const showSubtitle = context.faceLayout.density === "regular" && card.hasCategory && titleSource !== "category" && title !== card.label;
            elements.backSubtitle.textContent = showSubtitle ? card.label : "";
            elements.backSubtitle.hidden = !showSubtitle;
        }
        appendBackSections(elements, card, context.settings);
    }

    const summaryParts = card.label === card.cardValue.displayName
        ? [`${card.label} ${elements.frontValue.textContent}`]
        : [card.label, `${card.cardValue.displayName} ${elements.frontValue.textContent}`];
    if (benchmark && context.settings.benchmark.showVariance.value && presentation?.insight) { summaryParts.push(presentation.insight.accessibleText); }
    if (benchmark && context.settings.benchmark.showReference.value && presentation?.insight) { summaryParts.push(`${presentation.insight.referenceName} ${presentation.insight.referenceValueText}`); }
    if (benchmark && context.settings.benchmark.showStatus.value && presentation?.status) { summaryParts.push(presentation.status.accessibleText); }
    const summary = summaryParts.join(". ");
    elements.screenReaderSummary.textContent = summary;
    elements.frontSurface.setAttribute("aria-label", elements.frontSelectionButton ? `${summary}. Select card.` : summary);
    if (elements.frontSelectionButton) { elements.frontSelectionButton.setAttribute("aria-pressed", String(context.selected)); }
    const icon = getEnumSettingValue(context.settings.flip.controlIcon) as ControlIcon;
    if (elements.frontFlipButton) { elements.frontFlipButton.replaceChildren(svgIcon(icon)); elements.frontFlipButton.setAttribute("aria-label", `Show details for ${card.label}`); }
    if (elements.backFlipButton) { elements.backFlipButton.replaceChildren(svgIcon(icon)); elements.backFlipButton.setAttribute("aria-label", `Return to front for ${card.label}`); }
    positionFlipControls(elements, getEnumSettingValue(context.settings.flip.position));
    updateCardFace(elements, context.face);
}
