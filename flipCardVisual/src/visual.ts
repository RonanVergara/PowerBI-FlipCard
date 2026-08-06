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
import { calculateCardLayout, CardLayout } from "./layout";
import { cardHasBenchmark, cardHasMeaningfulBack, CardElements, createCardElements, renderCard, updateCardFace } from "./renderer";
import { applyFormattingMigration, getDecimalPrecision, getEffectiveCardMode, getEnumSettingValue, VisualFormattingSettingsModel } from "./settings";
import { CardFace, CardViewModel, DataExtractionResult, EffectiveCardMode, KpiDirection, VarianceMode, VisualRenderState } from "./types";
import { getVarianceDisplayText, prepareTooltipItems } from "./valueFormatting";

function enumValue<T extends string>(value: string): T { return value as T; }
function numericSetting(value: powerbi.EnumMemberValue): number { return typeof value === "number" ? value : Number(value) || 0; }

export class Visual implements IVisual {
    private readonly target: HTMLElement;
    private readonly host: IVisualHost;
    private readonly events: IVisualEventService;
    private readonly selectionManager: ISelectionManager;
    private readonly tooltipServiceWrapper: ITooltipServiceWrapper;
    private readonly formattingSettingsService = new FormattingSettingsService();
    private readonly cardContainer: HTMLDivElement;
    private readonly faceStates = new Map<string, CardFace>();
    private readonly visibleCards = new Map<string, { elements: CardElements; model: CardViewModel }>();
    private formattingSettings = new VisualFormattingSettingsModel();
    private destroyed = false;

    private readonly handleRootClick = (event: MouseEvent): void => {
        if (event.defaultPrevented || !this.allowInteractions() || !this.formattingSettings.interactions.selectionEnabled.value) { return; }
        void this.selectionManager.clear().then((ids) => this.syncSelectionState(ids as unknown as ISelectionId[]));
    };

    private readonly handleRootContextMenu = (event: MouseEvent): void => {
        if (event.defaultPrevented) { return; }
        event.preventDefault();
        void this.selectionManager.showContextMenu({} as HostSelectionId, { x: event.clientX, y: event.clientY });
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
    }

    public update(options: VisualUpdateOptions): void {
        this.events.renderingStarted(options);
        try {
            const dataView = options.dataViews?.[0];
            this.formattingSettings = dataView ? this.formattingSettingsService.populateFormattingSettingsModel(VisualFormattingSettingsModel, dataView) : new VisualFormattingSettingsModel();
            applyFormattingMigration(this.formattingSettings, dataView);
            this.applyHostColors();
            this.applyViewport(options);
            const result = this.extract(dataView);
            if (result.state !== "ready") {
                this.faceStates.clear();
                this.renderState(result.state);
                this.formattingSettings.configureConditionalFormatting([]);
                this.events.renderingFinished(options);
                return;
            }

            const cardMode = getEffectiveCardMode(this.formattingSettings);
            const configurationMessage = this.configurationMessage(result, cardMode);
            if (configurationMessage) {
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
            const elements = createCardElements(hasBack);
            elements.wrapper.style.width = `${layout.cardWidth}px`;
            elements.wrapper.style.height = `${layout.cardHeight}px`;
            elements.wrapper.style.setProperty("--flip-callout-ceiling", `${layout.calloutSizeCeiling}px`);
            const face = hasBack ? this.faceStates.get(card.key) ?? "front" : "front";
            renderCard(elements, card, {
                allowInteractions: this.allowInteractions(), colorPalette: this.host.colorPalette, density: layout.density,
                face, reducedMotion: this.reducedMotion(), selected: false, settings: this.formattingSettings,
            });
            this.attachEvents(card, elements);
            this.attachTooltip(card, elements);
            this.visibleCards.set(card.key, { elements, model: card });
            fragment.append(elements.wrapper);
        }
        this.cardContainer.replaceChildren(fragment);
        this.cardContainer.dataset.visualState = "ready";
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
        elements.frontSelectionButton.addEventListener("click", (event) => { event.stopPropagation(); this.selectCard(card, event.ctrlKey || event.metaKey); });
        elements.frontFlipButton?.addEventListener("click", (event) => { event.preventDefault(); event.stopPropagation(); this.setFace(card.key, "back", true); });
        elements.backFlipButton?.addEventListener("click", (event) => { event.preventDefault(); event.stopPropagation(); this.setFace(card.key, "front", true); });
        elements.backSurface?.addEventListener("click", (event) => { event.preventDefault(); event.stopPropagation(); this.setFace(card.key, "front", true); });
        elements.wrapper.addEventListener("contextmenu", (event) => {
            event.preventDefault(); event.stopPropagation();
            void this.selectionManager.showContextMenu(card.selectionId ?? ({} as HostSelectionId), { x: event.clientX, y: event.clientY });
        });
    }

    private attachTooltip(card: CardViewModel, elements: CardElements): void {
        const surfaces: HTMLElement[] = [elements.frontSelectionButton];
        if (elements.backSurface) { surfaces.push(elements.backSurface); }
        for (const surface of surfaces) {
            this.tooltipServiceWrapper.addTooltip<CardViewModel>(d3Select(surface).datum(card), (model) => model.tooltipItems, (model) => model.selectionId as unknown as HostSelectionId, true);
        }
    }

    private setFace(key: string, face: CardFace, moveFocus: boolean): void {
        const visible = this.visibleCards.get(key);
        if (!visible || !cardHasMeaningfulBack(visible.model, this.formattingSettings)) { this.faceStates.set(key, "front"); return; }
        this.faceStates.set(key, face);
        updateCardFace(visible.elements, face);
        if (moveFocus) { (face === "back" ? visible.elements.backFlipButton : visible.elements.frontFlipButton)?.focus(); }
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
            elements.frontSelectionButton.setAttribute("aria-pressed", String(selected));
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
        const element = document.createElement("div");
        element.className = "flip-card-state";
        element.setAttribute("role", "status");
        const heading = document.createElement("div"); heading.className = "flip-card-state-title"; heading.textContent = title;
        const body = document.createElement("div"); body.className = "flip-card-state-message"; body.textContent = message;
        element.append(heading, body);
        this.cardContainer.replaceChildren(element);
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

    private reducedMotion(): boolean { return typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches; }
    private allowInteractions(): boolean { return this.host.hostCapabilities?.allowInteractions !== false; }
}
