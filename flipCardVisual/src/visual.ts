"use strict";

import powerbi from "powerbi-visuals-api";
import { select as d3Select } from "d3-selection";
import { FormattingSettingsService } from "powerbi-visuals-utils-formattingmodel";
import {
    createTooltipServiceWrapper,
    ITooltipServiceWrapper,
} from "powerbi-visuals-utils-tooltiputils";

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
import { CardElements, createCardElements, renderCard, updateCardFace } from "./renderer";
import {
    getDecimalPrecision,
    getEnumSettingValue,
    VisualFormattingSettingsModel,
} from "./settings";
import {
    CardFace,
    CardViewModel,
    DataExtractionResult,
    KpiDirection,
    VarianceMode,
    VisualDataState,
} from "./types";
import {
    getVarianceDisplayText,
    prepareTooltipItems,
} from "./valueFormatting";

interface CardInstance {
    face: CardFace;
    readonly elements: CardElements;
    model: CardViewModel;
}

function enumValue<T extends string>(value: string): T {
    return value as T;
}

function numericSetting(value: powerbi.EnumMemberValue): number {
    return typeof value === "number" ? value : Number(value) || 0;
}

export class Visual implements IVisual {
    private readonly target: HTMLElement;
    private readonly host: IVisualHost;
    private readonly events: IVisualEventService;
    private readonly selectionManager: ISelectionManager;
    private readonly tooltipServiceWrapper: ITooltipServiceWrapper;
    private readonly formattingSettingsService: FormattingSettingsService;
    private readonly cardContainer: HTMLDivElement;
    private readonly cardInstances = new Map<string, CardInstance>();
    private formattingSettings = new VisualFormattingSettingsModel();
    private previousDefaultFace: CardFace = "front";
    private hasUpdated = false;
    private destroyed = false;

    private readonly handleRootClick = (event: MouseEvent): void => {
        if (event.defaultPrevented || !this.allowInteractions()) {
            return;
        }

        void this.selectionManager.clear().then((selectionIds) => {
            this.syncSelectionState(selectionIds as unknown as ISelectionId[]);
        });
    };

    private readonly handleRootContextMenu = (event: MouseEvent): void => {
        if (event.defaultPrevented) {
            return;
        }

        event.preventDefault();
        void this.selectionManager.showContextMenu({} as HostSelectionId, {
            x: event.clientX,
            y: event.clientY,
        });
    };

    public constructor(options?: VisualConstructorOptions) {
        if (!options) {
            throw new Error("Visual constructor options are required.");
        }

        this.target = options.element;
        this.host = options.host;
        this.events = options.host.eventService;
        this.selectionManager = options.host.createSelectionManager();
        this.tooltipServiceWrapper = createTooltipServiceWrapper(options.host.tooltipService, options.element);
        this.formattingSettingsService = new FormattingSettingsService();

        this.target.classList.add("flip-card-visual-root");
        this.applyHostColors();
        this.cardContainer = document.createElement("div");
        this.cardContainer.className = "flip-card-container";
        this.target.replaceChildren(this.cardContainer);
        this.target.addEventListener("click", this.handleRootClick);
        this.target.addEventListener("contextmenu", this.handleRootContextMenu);

        this.selectionManager.registerOnSelectCallback((selectionIds: HostSelectionId[]) => {
            if (!this.destroyed) {
                this.syncSelectionState(selectionIds as unknown as ISelectionId[]);
            }
        });
    }

    public update(options: VisualUpdateOptions): void {
        this.events.renderingStarted(options);

        try {
            const dataView = options.dataViews?.[0];
            this.formattingSettings = dataView
                ? this.formattingSettingsService.populateFormattingSettingsModel(
                    VisualFormattingSettingsModel,
                    dataView,
                )
                : new VisualFormattingSettingsModel();

            const defaultFace = enumValue<CardFace>(getEnumSettingValue(this.formattingSettings.flipBehavior.defaultFace));
            if (this.hasUpdated && defaultFace !== this.previousDefaultFace) {
                for (const instance of this.cardInstances.values()) {
                    instance.face = defaultFace;
                }
            }
            this.previousDefaultFace = defaultFace;
            this.hasUpdated = true;

            this.applyHostColors();
            this.applyViewport(options);
            if (this.isVerySmall(options)) {
                this.showEmptyState("Increase the visual size", "The Smart KPI Flip Card needs a little more space to render.");
                this.events.renderingFinished(options);
                return;
            }

            const result = this.extract(dataView);
            if (result.state !== "ready") {
                this.renderDataState(result.state);
                this.events.renderingFinished(options);
                return;
            }

            this.preparePresentation(result.cards);
            this.renderCards(result.cards, defaultFace);
            this.syncSelectionState(this.selectionManager.getSelectionIds() as unknown as ISelectionId[]);
            this.events.renderingFinished(options);
        } catch (error: unknown) {
            this.events.renderingFailed(options, error instanceof Error ? error.message : String(error));
            throw error;
        }
    }

    public getFormattingModel(): powerbi.visuals.FormattingModel {
        return this.formattingSettingsService.buildFormattingModel(this.formattingSettings);
    }

    public destroy(): void {
        this.destroyed = true;
        this.tooltipServiceWrapper.hide();
        this.target.removeEventListener("click", this.handleRootClick);
        this.target.removeEventListener("contextmenu", this.handleRootContextMenu);
        this.cardInstances.clear();
        this.target.replaceChildren();
    }

    private extract(dataView: DataView | undefined): DataExtractionResult {
        return extractDataView(
            dataView,
            this.host,
            this.host.locale,
            {
                main: {
                    displayUnits: numericSetting(this.formattingSettings.mainValue.displayUnits.value),
                    precision: getDecimalPrecision(this.formattingSettings.mainValue.decimalPlaces),
                },
                detail: {
                    displayUnits: numericSetting(this.formattingSettings.detailValues.displayUnits.value),
                    precision: getDecimalPrecision(this.formattingSettings.detailValues.decimalPlaces),
                },
            },
            {
                direction: enumValue<KpiDirection>(getEnumSettingValue(this.formattingSettings.kpiStatus.direction)),
                neutralTolerancePercent: this.formattingSettings.kpiStatus.tolerance.value,
            },
        );
    }

    private preparePresentation(cards: CardViewModel[]): void {
        const varianceMode = enumValue<VarianceMode>(getEnumSettingValue(this.formattingSettings.kpiStatus.varianceMode));
        const detailFormatting = {
            displayUnits: numericSetting(this.formattingSettings.detailValues.displayUnits.value),
            precision: getDecimalPrecision(this.formattingSettings.detailValues.decimalPlaces),
        };

        for (const card of cards) {
            card.varianceText = getVarianceDisplayText(
                card,
                varianceMode,
                this.host.locale,
                detailFormatting,
            );
            prepareTooltipItems(card);
        }
    }

    private applyViewport(options: VisualUpdateOptions): void {
        this.cardContainer.style.width = `${Math.max(0, options.viewport.width)}px`;
        this.cardContainer.style.height = `${Math.max(0, options.viewport.height)}px`;
        this.target.classList.toggle("is-compact", options.viewport.width < 280 || options.viewport.height < 160);
        this.target.classList.toggle("is-very-small", this.isVerySmall(options));
    }

    private applyHostColors(): void {
        const palette = this.host.colorPalette;
        this.target.classList.toggle("is-high-contrast", palette.isHighContrast);
        this.target.style.setProperty("--flip-host-background", palette.isHighContrast ? palette.background.value : "#FFFFFF");
        this.target.style.setProperty("--flip-host-foreground", palette.isHighContrast ? palette.foreground.value : "#1F2937");
    }

    private isVerySmall(options: VisualUpdateOptions): boolean {
        return options.viewport.width < 120 || options.viewport.height < 72;
    }

    private renderDataState(state: VisualDataState): void {
        if (state === "missingCardValue") {
            this.showEmptyState("Add Card Value", "Drag a numeric measure into the Card Value field well.");
            return;
        }

        this.showEmptyState("No data available", "No rows are available for the current filters.");
    }

    private showEmptyState(title: string, message: string): void {
        this.cardInstances.clear();
        this.cardContainer.classList.remove("is-multi-card", "has-active-selection");
        const emptyState = document.createElement("div");
        emptyState.className = "flip-card-empty-state";
        emptyState.setAttribute("role", "status");
        const titleElement = document.createElement("div");
        titleElement.className = "flip-card-empty-title";
        titleElement.textContent = title;
        const messageElement = document.createElement("div");
        messageElement.className = "flip-card-empty-message";
        messageElement.textContent = message;
        emptyState.append(titleElement, messageElement);
        this.cardContainer.replaceChildren(emptyState);
    }

    private renderCards(cards: CardViewModel[], defaultFace: CardFace): void {
        const retainedKeys = new Set(cards.map((card) => card.key));
        for (const [key, instance] of this.cardInstances) {
            if (!retainedKeys.has(key)) {
                instance.elements.wrapper.remove();
                this.cardInstances.delete(key);
            }
        }

        this.cardContainer.classList.toggle("is-multi-card", cards.length > 1);
        for (const card of cards) {
            let instance = this.cardInstances.get(card.key);
            if (!instance) {
                instance = {
                    elements: createCardElements(),
                    face: defaultFace,
                    model: card,
                };
                this.cardInstances.set(card.key, instance);
                this.attachCardEvents(card.key, instance.elements);
            } else {
                instance.model = card;
            }

            if (!this.formattingSettings.flipBehavior.showButton.value) {
                instance.face = defaultFace;
            }

            renderCard(instance.elements, card, {
                allowInteractions: this.allowInteractions(),
                colorPalette: this.host.colorPalette,
                face: instance.face,
                selected: false,
                settings: this.formattingSettings,
            });
            this.cardContainer.append(instance.elements.wrapper);
            this.attachTooltip(instance.elements, card);
        }
    }

    private attachCardEvents(key: string, elements: CardElements): void {
        const selectCard = (event: MouseEvent): void => {
            event.stopPropagation();
            this.selectCard(key, event.ctrlKey || event.metaKey);
        };
        const flipCard = (event: MouseEvent): void => {
            event.preventDefault();
            event.stopPropagation();
            this.flipCard(key);
        };

        elements.frontSelectionButton.addEventListener("click", selectCard);
        elements.backSelectionButton.addEventListener("click", selectCard);
        elements.frontFlipButton.addEventListener("click", flipCard);
        elements.backFlipButton.addEventListener("click", flipCard);
        elements.wrapper.addEventListener("contextmenu", (event: MouseEvent) => {
            event.preventDefault();
            event.stopPropagation();
            const selectionId = this.cardInstances.get(key)?.model.selectionId;
            void this.selectionManager.showContextMenu(selectionId ?? ({} as HostSelectionId), {
                x: event.clientX,
                y: event.clientY,
            });
        });
    }

    private attachTooltip(elements: CardElements, card: CardViewModel): void {
        const selection = d3Select(elements.frontSelectionButton).datum(card);
        const backSelection = d3Select(elements.backSelectionButton).datum(card);
        this.tooltipServiceWrapper.addTooltip<CardViewModel>(
            selection,
            (dataPoint: CardViewModel) => dataPoint.tooltipItems,
            (dataPoint: CardViewModel) => dataPoint.selectionId as unknown as HostSelectionId,
            true,
        );
        this.tooltipServiceWrapper.addTooltip<CardViewModel>(
            backSelection,
            (dataPoint: CardViewModel) => dataPoint.tooltipItems,
            (dataPoint: CardViewModel) => dataPoint.selectionId as unknown as HostSelectionId,
            true,
        );
    }

    private selectCard(key: string, multiSelect: boolean): void {
        const instance = this.cardInstances.get(key);
        const selectionId = instance?.model.selectionId;
        if (!selectionId || !this.allowInteractions()) {
            return;
        }

        const current = this.selectionManager.getSelectionIds() as unknown as ISelectionId[];
        const isOnlySelected = !multiSelect
            && current.length === 1
            && current[0]?.equals(selectionId) === true;
        if (isOnlySelected) {
            void this.selectionManager.clear().then((selectionIds) => {
                this.syncSelectionState(selectionIds as unknown as ISelectionId[]);
            });
            return;
        }

        void this.selectionManager.select(selectionId, multiSelect).then((selectionIds) => {
            this.syncSelectionState(selectionIds as unknown as ISelectionId[]);
        });
    }

    private flipCard(key: string): void {
        const instance = this.cardInstances.get(key);
        if (!instance || !this.formattingSettings.flipBehavior.showButton.value) {
            return;
        }

        instance.face = instance.face === "front" ? "back" : "front";
        updateCardFace(instance.elements, instance.face);
    }

    private syncSelectionState(selectionIds: ISelectionId[]): void {
        const hasSelection = selectionIds.length > 0;
        this.cardContainer.classList.toggle("has-active-selection", hasSelection);

        for (const instance of this.cardInstances.values()) {
            const identity = instance.model.selectionId;
            const selected = identity !== undefined && selectionIds.some((selectionId) => selectionId.includes(identity));
            instance.elements.wrapper.classList.toggle("is-selected", selected);
            instance.elements.frontSelectionButton.setAttribute("aria-pressed", String(selected));
            instance.elements.backSelectionButton.setAttribute("aria-pressed", String(selected));
        }
    }

    private allowInteractions(): boolean {
        return this.host.hostCapabilities?.allowInteractions !== false;
    }
}
