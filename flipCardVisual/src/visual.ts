"use strict";

import powerbi from "powerbi-visuals-api";
import { select as d3Select } from "d3-selection";
import { FormattingSettingsService } from "powerbi-visuals-utils-formattingmodel";
import { createTooltipServiceWrapper, ITooltipServiceWrapper } from "powerbi-visuals-utils-tooltiputils";

import DataView = powerbi.DataView;
import ISelectionId = powerbi.visuals.ISelectionId;
import HostSelectionId = powerbi.extensibility.ISelectionId;
import ISelectionManager = powerbi.extensibility.ISelectionManager;
import IVisual = powerbi.extensibility.visual.IVisual;
import IVisualEventService = powerbi.extensibility.IVisualEventService;
import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;

import "./../style/visual.less";

import { extractDataView } from "./data";
import { calculateCardLayout, calculateFaceLayout, CardLayout } from "./layout";
import { ActiveFaceTransition, createMotionConfiguration, MotionConfiguration, startFaceTransition } from "./motion";
import { cardHasBenchmark, cardHasMeaningfulBack, CardElements, createCardElements, getBackItemCount, renderCard, setCardFaceVisual, setCardTransitionState, updateCardFace } from "./renderer";
import { applyFormattingMigration, getDecimalPrecision, getEffectiveCardMode, getEnumSettingValue, getSectionSpacing, VisualFormattingSettingsModel } from "./settings";
import { BackLayoutMode, CardFace, CardViewModel, DataExtractionResult, EffectiveCardMode, FrontPresentationMode, HorizontalDirection, KpiDirection, MotionEasing, MotionPerspective, MotionStyle, ResponsivePriority, StatusPresentation, VarianceMode, VerticalDirection, VisualRenderState } from "./types";
import { createKpiPresentation, getVarianceDisplayText, prepareTooltipItems } from "./valueFormatting";

function enumValue<T extends string>(value: string): T { return value as T; }
function numericSetting(value: powerbi.EnumMemberValue): number { return typeof value === "number" ? value : Number(value) || 0; }

interface VisibleCard {
    readonly elements: CardElements;
    readonly model: CardViewModel;
}

interface TransitionRecord {
    readonly controller: ActiveFaceTransition;
    readonly focusOnComplete: boolean;
}

export class Visual implements IVisual {
    private readonly target: HTMLElement;
    private readonly host: IVisualHost;
    private readonly events: IVisualEventService;
    private readonly selectionManager: ISelectionManager;
    private readonly tooltipServiceWrapper: ITooltipServiceWrapper;
    private readonly formattingSettingsService = new FormattingSettingsService();
    private readonly cardContainer: HTMLDivElement;
    private readonly faceStates = new Map<string, CardFace>();
    private readonly transitions = new Map<string, TransitionRecord>();
    private readonly visibleCards = new Map<string, VisibleCard>();
    private readonly pendingFocusKeys = new Set<string>();
    private readonly motionMediaQuery: MediaQueryList | undefined;
    private formattingSettings = new VisualFormattingSettingsModel();
    private destroyed = false;

    private readonly handleRootClick = (event: MouseEvent): void => {
        if (event.defaultPrevented || !this.allowInteractions() || !this.formattingSettings.interactions.selectionEnabled.value) { return; }
        if (event.target !== this.cardContainer && event.target !== this.target) { return; }
        void this.selectionManager.clear().then((ids) => this.syncSelectionState(ids as unknown as ISelectionId[]));
    };

    private readonly handleRootContextMenu = (event: MouseEvent): void => {
        if (event.defaultPrevented) { return; }
        event.preventDefault();
        void this.selectionManager.showContextMenu({} as HostSelectionId, { x: event.clientX, y: event.clientY });
    };

    private readonly handleReducedMotionChange = (): void => {
        if (this.reducedMotion()) {
            for (const transition of [...this.transitions.values()]) { transition.controller.complete(); }
        }
        for (const visible of this.visibleCards.values()) {
            const motion = this.motionConfiguration();
            visible.elements.wrapper.style.setProperty("--flip-duration", `${motion.durationMs}ms`);
        }
    };

    public constructor(options?: VisualConstructorOptions) {
        if (!options) { throw new Error("Visual constructor options are required."); }
        this.target = options.element;
        this.host = options.host;
        this.events = options.host.eventService;
        this.selectionManager = options.host.createSelectionManager();
        this.tooltipServiceWrapper = createTooltipServiceWrapper(options.host.tooltipService, options.element);
        this.target.classList.add("flip-card-visual-root");
        this.cardContainer = document.createElement("div");
        this.cardContainer.className = "flip-card-container";
        this.target.replaceChildren(this.cardContainer);
        this.applyHostColors();
        this.target.addEventListener("click", this.handleRootClick);
        this.target.addEventListener("contextmenu", this.handleRootContextMenu);
        this.selectionManager.registerOnSelectCallback((ids: HostSelectionId[]) => { if (!this.destroyed) { this.syncSelectionState(ids as unknown as ISelectionId[]); } });
        this.motionMediaQuery = typeof window.matchMedia === "function" ? window.matchMedia("(prefers-reduced-motion: reduce)") : undefined;
        this.motionMediaQuery?.addEventListener?.("change", this.handleReducedMotionChange);
    }

    public update(options: VisualUpdateOptions): void {
        this.events.renderingStarted(options);
        this.resolveTransitionsForRerender();
        try {
            const dataView = options.dataViews?.[0];
            this.formattingSettings = dataView ? this.formattingSettingsService.populateFormattingSettingsModel(VisualFormattingSettingsModel, dataView) : new VisualFormattingSettingsModel();
            applyFormattingMigration(this.formattingSettings, dataView);
            this.applyHostColors();
            this.applyViewport(options);
            const result = this.extract(dataView);
            if (result.state !== "ready") {
                this.pendingFocusKeys.clear();
                this.faceStates.clear();
                this.renderState(result.state);
                this.formattingSettings.configureConditionalFormatting([]);
                this.events.renderingFinished(options);
                return;
            }

            const cardMode = getEffectiveCardMode(this.formattingSettings);
            const configurationMessage = this.configurationMessage(result, cardMode);
            if (configurationMessage) {
                this.pendingFocusKeys.clear();
                this.faceStates.clear();
                this.showState("configurationRequired", "Choose a card mode", configurationMessage);
                this.formattingSettings.configureConditionalFormatting(result.cards);
                this.events.renderingFinished(options);
                return;
            }

            this.preparePresentation(result.cards);
            this.reconcileFaces(result.cards);
            this.formattingSettings.configureConditionalFormatting(result.cards);
            const profile = {
                benchmark: result.cards.some((card) => cardHasBenchmark(card, this.formattingSettings)),
                flip: result.cards.some((card) => cardHasMeaningfulBack(card, this.formattingSettings)),
            };
            const layout = calculateCardLayout(options.viewport, result.cards.length, {
                cardMode,
                columnCalculation: enumValue(getEnumSettingValue(this.formattingSettings.multipleCards.columnCalculation)),
                columns: this.formattingSettings.multipleCards.columns.value,
                fixedHeight: this.formattingSettings.multipleCards.fixedHeight.value,
                fixedWidth: this.formattingSettings.multipleCards.fixedWidth.value,
                gap: this.formattingSettings.multipleCards.gap.value,
                preferredHeight: this.formattingSettings.multipleCards.preferredHeight.value,
                preferredWidth: this.formattingSettings.multipleCards.preferredWidth.value,
                sizing: enumValue(getEnumSettingValue(this.formattingSettings.multipleCards.sizing)),
            }, profile);
            if (layout.isTooSmall) {
                this.showState("tooSmall", "Increase the visual size", "The visual cannot render one usable card at this size.");
                this.events.renderingFinished(options);
                return;
            }

            this.renderReady(result.cards, layout);
            this.syncSelectionState(this.selectionManager.getSelectionIds() as unknown as ISelectionId[]);
            this.events.renderingFinished(options);
        } catch (error: unknown) {
            this.events.renderingFailed(options, error instanceof Error ? error.message : String(error));
            throw error;
        }
    }

    public getFormattingModel(): powerbi.visuals.FormattingModel { return this.formattingSettingsService.buildFormattingModel(this.formattingSettings); }

    public destroy(): void {
        this.destroyed = true;
        for (const transition of this.transitions.values()) { transition.controller.dispose(); }
        this.transitions.clear();
        this.pendingFocusKeys.clear();
        this.motionMediaQuery?.removeEventListener?.("change", this.handleReducedMotionChange);
        this.tooltipServiceWrapper.hide();
        this.target.removeEventListener("click", this.handleRootClick);
        this.target.removeEventListener("contextmenu", this.handleRootContextMenu);
        this.faceStates.clear();
        this.visibleCards.clear();
        this.target.replaceChildren();
    }

    private extract(dataView: DataView | undefined): DataExtractionResult {
        return extractDataView(dataView, this.host, this.host.locale, {
            main: { displayUnits: numericSetting(this.formattingSettings.mainValue.displayUnits.value), precision: getDecimalPrecision(this.formattingSettings.mainValue.decimalPlaces) },
            detail: { displayUnits: numericSetting(this.formattingSettings.flip.displayUnits.value), precision: getDecimalPrecision(this.formattingSettings.flip.decimalPlaces) },
        }, {
            direction: enumValue<KpiDirection>(getEnumSettingValue(this.formattingSettings.benchmark.direction)),
            neutralTolerancePercent: this.formattingSettings.benchmark.tolerance.value,
        });
    }

    private configurationMessage(result: DataExtractionResult, mode: EffectiveCardMode): string | undefined {
        if (mode === "single" && result.cards.length > 1) { return "Single mode received multiple Label rows. Enable Multiple cards and choose Auto or Multiple, or filter Label to one item."; }
        if (mode === "auto" && result.cards.length > 1 && result.cards.some((card) => !card.selectionId)) { return "Auto mode needs identified Label rows to render multiple cards."; }
        if (mode === "multiple" && !result.hasCategory) { return "Multiple mode requires a bound Label category."; }
        return undefined;
    }

    private preparePresentation(cards: CardViewModel[]): void {
        const benchmark = this.formattingSettings.benchmark.enabled.value;
        const detail = this.formattingSettings.flip.enabled.value && this.formattingSettings.flip.showDetail.value;
        const varianceMode = enumValue<VarianceMode>(getEnumSettingValue(this.formattingSettings.benchmark.varianceMode));
        const detailFormatting = { displayUnits: numericSetting(this.formattingSettings.flip.displayUnits.value), precision: getDecimalPrecision(this.formattingSettings.flip.decimalPlaces) };
        for (const card of cards) {
            card.varianceText = benchmark ? getVarianceDisplayText(card, varianceMode, this.host.locale, detailFormatting) : undefined;
            card.presentation = benchmark ? createKpiPresentation(card, varianceMode, this.host.locale, detailFormatting) : { insight: undefined, status: undefined };
            prepareTooltipItems(card, { benchmark: benchmark && cardHasBenchmark(card, this.formattingSettings), detail });
        }
    }

    private reconcileFaces(cards: CardViewModel[]): void {
        const retained = new Set(cards.map((card) => card.key));
        for (const key of this.faceStates.keys()) { if (!retained.has(key)) { this.faceStates.delete(key); } }
        for (const card of cards) {
            if (!this.faceStates.has(card.key)) { this.faceStates.set(card.key, "front"); }
            if (!cardHasMeaningfulBack(card, this.formattingSettings)) { this.faceStates.set(card.key, "front"); }
        }
    }

    private renderReady(cards: CardViewModel[], layout: CardLayout): void {
        this.visibleCards.clear();
        this.tooltipServiceWrapper.hide();
        const fragment = document.createDocumentFragment();
        this.configureContainer(layout);
        for (const card of cards) {
            const hasBack = cardHasMeaningfulBack(card, this.formattingSettings);
            const selectable = card.selectionId !== undefined && this.allowInteractions() && this.formattingSettings.interactions.selectionEnabled.value;
            const elements = createCardElements(hasBack, selectable);
            elements.wrapper.style.width = `${layout.cardWidth}px`;
            elements.wrapper.style.height = `${layout.cardHeight}px`;
            const presentation = card.presentation;
            const faceLayout = calculateFaceLayout({ width: layout.cardWidth, height: layout.cardHeight }, {
                backLayout: enumValue<BackLayoutMode>(getEnumSettingValue(this.formattingSettings.flip.backLayout)),
                configuredPadding: this.formattingSettings.cardAppearance.padding.value,
                controlClusterWidth: hasBack ? this.formattingSettings.flip.size.value + (this.formattingSettings.flip.showDetailsText.value ? 58 : 6) : 0,
                frontPresentation: enumValue<FrontPresentationMode>(getEnumSettingValue(this.formattingSettings.label.presentationMode)),
                responsivePriority: enumValue<ResponsivePriority>(getEnumSettingValue(this.formattingSettings.label.responsivePriority)),
                sectionSpacing: getSectionSpacing(this.formattingSettings),
                statusPresentation: enumValue<StatusPresentation>(getEnumSettingValue(this.formattingSettings.benchmark.statusPresentation)),
            }, {
                backItemCount: getBackItemCount(card, this.formattingSettings),
                hasFlipControl: hasBack,
                hasInsight: Boolean(cardHasBenchmark(card, this.formattingSettings) && this.formattingSettings.benchmark.showVariance.value && presentation?.insight),
                hasSecondaryReference: Boolean(cardHasBenchmark(card, this.formattingSettings) && this.formattingSettings.benchmark.showReference.value && presentation?.insight),
                hasStatus: Boolean(cardHasBenchmark(card, this.formattingSettings) && this.formattingSettings.benchmark.showStatus.value && presentation?.status),
                heroCharacterCount: card.cardValue.formattedValue.length,
            });
            const face = hasBack ? this.faceStates.get(card.key) ?? "front" : "front";
            const motion = this.motionConfiguration();
            renderCard(elements, card, { colorPalette: this.host.colorPalette, face, faceLayout, motion, selected: false, settings: this.formattingSettings });
            this.attachEvents(card, elements);
            this.attachTooltip(card, elements);
            this.visibleCards.set(card.key, { elements, model: card });
            fragment.append(elements.wrapper);
        }
        this.cardContainer.replaceChildren(fragment);
        this.cardContainer.dataset.visualState = "ready";
        for (const key of this.pendingFocusKeys) {
            const visible = this.visibleCards.get(key);
            const face = this.faceStates.get(key) ?? "front";
            (face === "back" ? visible?.elements.backFlipButton : visible?.elements.frontFlipButton)?.focus();
        }
        this.pendingFocusKeys.clear();
    }

    private configureContainer(layout: CardLayout): void {
        this.cardContainer.className = `flip-card-container ${layout.isGrid ? "is-grid" : "is-single"}`;
        this.cardContainer.style.display = layout.isGrid ? "grid" : "flex";
        this.cardContainer.style.gap = layout.isGrid ? `${this.formattingSettings.multipleCards.gap.value}px` : "0";
        this.cardContainer.style.padding = `${layout.padding}px`;
        this.cardContainer.style.overflowX = layout.overflowX;
        this.cardContainer.style.overflowY = layout.overflowY;
        this.cardContainer.style.gridTemplateColumns = layout.isGrid ? `repeat(${layout.columns}, ${layout.cardWidth}px)` : "";
        this.cardContainer.style.gridAutoRows = layout.isGrid ? `${layout.cardHeight}px` : "";
    }

    private attachEvents(card: CardViewModel, elements: CardElements): void {
        elements.frontSelectionButton?.addEventListener("click", (event) => { event.stopPropagation(); this.selectCard(card, event.ctrlKey || event.metaKey); });
        if (elements.frontFlipButton) { this.attachFlipControl(card.key, elements.frontFlipButton, "back"); }
        if (elements.backFlipButton) { this.attachFlipControl(card.key, elements.backFlipButton, "front"); }
        elements.backSurface?.addEventListener("click", (event) => { event.preventDefault(); event.stopPropagation(); this.setFace(card.key, "front", false); });
        elements.wrapper.addEventListener("contextmenu", (event) => {
            event.preventDefault(); event.stopPropagation();
            void this.selectionManager.showContextMenu(card.selectionId ?? ({} as HostSelectionId), { x: event.clientX, y: event.clientY });
        });
    }

    private attachFlipControl(key: string, button: HTMLButtonElement, destination: CardFace): void {
        let pointerOriginHadFocus = false;
        let keyboardActivation = false;
        button.addEventListener("pointerdown", () => { pointerOriginHadFocus = document.activeElement === button; keyboardActivation = false; });
        button.addEventListener("keydown", (event) => { if (event.key === "Enter" || event.key === " ") { keyboardActivation = true; } });
        button.addEventListener("click", (event) => {
            event.preventDefault(); event.stopPropagation();
            const focusOnComplete = keyboardActivation || pointerOriginHadFocus || (event.detail === 0 && document.activeElement === button);
            keyboardActivation = false; pointerOriginHadFocus = false;
            this.setFace(key, destination, focusOnComplete);
        });
        button.addEventListener("contextmenu", (event) => { event.preventDefault(); event.stopPropagation(); });
    }

    private attachTooltip(card: CardViewModel, elements: CardElements): void {
        const surfaces: HTMLElement[] = [elements.frontSurface];
        if (elements.backSurface) { surfaces.push(elements.backSurface); }
        for (const surface of surfaces) {
            this.tooltipServiceWrapper.addTooltip<CardViewModel>(d3Select(surface).datum(card), (model) => model.tooltipItems, (model) => model.selectionId as unknown as HostSelectionId, true);
        }
    }

    private setFace(key: string, face: CardFace, focusOnComplete: boolean): void {
        if (this.transitions.has(key)) { return; }
        const visible = this.visibleCards.get(key);
        if (!visible || !cardHasMeaningfulBack(visible.model, this.formattingSettings) || !visible.elements.backFace) {
            this.faceStates.set(key, "front");
            return;
        }
        const from = this.faceStates.get(key) ?? "front";
        if (from === face) { return; }
        this.faceStates.set(key, face);
        const motion = this.motionConfiguration();
        if (motion.durationMs === 0 || motion.style === "none") {
            updateCardFace(visible.elements, face);
            if (focusOnComplete) { (face === "back" ? visible.elements.backFlipButton : visible.elements.frontFlipButton)?.focus(); }
            return;
        }
        setCardTransitionState(visible.elements, face === "back" ? "turningToBack" : "turningToFront");
        const controller = startFaceTransition({
            activate: () => setCardFaceVisual(visible.elements, face),
            durationMs: motion.durationMs,
            from,
            onComplete: () => {
                const current = this.transitions.get(key);
                if (!current || current.controller !== controller) { return; }
                this.transitions.delete(key);
                const latest = this.visibleCards.get(key);
                if (!latest) { return; }
                updateCardFace(latest.elements, face);
                if (focusOnComplete) { (face === "back" ? latest.elements.backFlipButton : latest.elements.frontFlipButton)?.focus(); }
            },
            style: motion.style,
            surface: { backFace: visible.elements.backFace, frontFace: visible.elements.frontFace, inner: visible.elements.inner },
            to: face,
        });
        this.transitions.set(key, { controller, focusOnComplete });
    }

    private resolveTransitionsForRerender(): void {
        for (const [key, transition] of this.transitions) {
            transition.controller.dispose();
            if (transition.focusOnComplete) { this.pendingFocusKeys.add(key); }
        }
        this.transitions.clear();
    }

    private selectCard(card: CardViewModel, multiSelect: boolean): void {
        if (!card.selectionId || !this.allowInteractions() || !this.formattingSettings.interactions.selectionEnabled.value) { return; }
        const current = this.selectionManager.getSelectionIds() as unknown as ISelectionId[];
        const clear = !multiSelect && current.length === 1 && current[0]?.equals(card.selectionId) === true;
        const operation = clear ? this.selectionManager.clear() : this.selectionManager.select(card.selectionId, multiSelect);
        void operation.then((ids) => this.syncSelectionState(ids as unknown as ISelectionId[]));
    }

    private syncSelectionState(selectionIds: ISelectionId[]): void {
        this.cardContainer.classList.toggle("has-active-selection", selectionIds.length > 0);
        for (const { elements, model } of this.visibleCards.values()) {
            const selected = model.selectionId !== undefined && selectionIds.some((selectionId) => selectionId.includes(model.selectionId!));
            elements.wrapper.classList.toggle("is-selected", selected);
            elements.frontSelectionButton?.setAttribute("aria-pressed", String(selected));
        }
    }

    private renderState(state: VisualRenderState): void {
        if (state === "missingCardValue") { this.showState(state, "Add Card Value", "Drag a numeric measure into the Card Value field well."); }
        else if (state === "noData") { this.showState(state, "No data available", "No rows are available for the current filters."); }
        else { this.showState(state, "Card Value is invalid", "Card Value contains only blank or invalid values."); }
    }

    private showState(state: VisualRenderState, title: string, message: string): void {
        this.visibleCards.clear();
        this.tooltipServiceWrapper.hide();
        this.cardContainer.className = "flip-card-container is-state";
        this.cardContainer.removeAttribute("style");
        this.cardContainer.style.width = "100%";
        this.cardContainer.style.height = "100%";
        this.cardContainer.dataset.visualState = state;
        const element = document.createElement("div"); element.className = "flip-card-state"; element.setAttribute("role", "status");
        const heading = document.createElement("div"); heading.className = "flip-card-state-title"; heading.textContent = title;
        const body = document.createElement("div"); body.className = "flip-card-state-message"; body.textContent = message;
        element.append(heading, body); this.cardContainer.replaceChildren(element);
    }

    private applyViewport(options: VisualUpdateOptions): void {
        this.cardContainer.style.width = `${Math.max(0, options.viewport.width)}px`;
        this.cardContainer.style.height = `${Math.max(0, options.viewport.height)}px`;
    }

    private applyHostColors(): void {
        const palette = this.host.colorPalette;
        this.target.classList.toggle("is-high-contrast", palette.isHighContrast);
        this.target.style.setProperty("--flip-host-background", palette.isHighContrast ? palette.background.value : "#FFFFFF");
        this.target.style.setProperty("--flip-host-foreground", palette.isHighContrast ? palette.foreground.value : "#242424");
    }

    private motionConfiguration(): MotionConfiguration {
        return createMotionConfiguration(
            enumValue<MotionStyle>(getEnumSettingValue(this.formattingSettings.flip.motionStyle)),
            enumValue<HorizontalDirection>(getEnumSettingValue(this.formattingSettings.flip.horizontalDirection)),
            enumValue<VerticalDirection>(getEnumSettingValue(this.formattingSettings.flip.verticalDirection)),
            enumValue<MotionEasing>(getEnumSettingValue(this.formattingSettings.flip.easing)),
            this.formattingSettings.flip.animationDuration.value,
            enumValue<MotionPerspective>(getEnumSettingValue(this.formattingSettings.flip.perspective)),
            this.reducedMotion(),
        );
    }

    private reducedMotion(): boolean { return this.motionMediaQuery?.matches === true; }
    private allowInteractions(): boolean { return this.host.hostCapabilities?.allowInteractions !== false; }
}
