"use strict";

import powerbi from "powerbi-visuals-api";
import { valueFormatter } from "powerbi-visuals-utils-formattingutils";
import "./../style/visual.less";

import DataView = powerbi.DataView;
import DataViewCategoryColumn = powerbi.DataViewCategoryColumn;
import DataViewValueColumn = powerbi.DataViewValueColumn;
import ISelectionId = powerbi.visuals.ISelectionId;
import ISelectionManager = powerbi.extensibility.ISelectionManager;
import IVisual = powerbi.extensibility.visual.IVisual;
import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;

interface CardData {
    label: string;
    frontTitle: string;
    frontValue: string;
    frontSubtitle: string;
    backTitle: string;
    backValue: string;
    backSubtitle: string;
    selectionId: ISelectionId | undefined;
}

export class Visual implements IVisual {
    private readonly target: HTMLElement;
    private readonly host: IVisualHost;
    private readonly selectionManager: ISelectionManager;

    private readonly cardWrapper: HTMLDivElement;
    private readonly cardInner: HTMLDivElement;

    private readonly frontLabel: HTMLDivElement;
    private readonly frontTitle: HTMLDivElement;
    private readonly frontValue: HTMLDivElement;
    private readonly frontSubtitle: HTMLDivElement;

    private readonly backLabel: HTMLDivElement;
    private readonly backTitle: HTMLDivElement;
    private readonly backValue: HTMLDivElement;
    private readonly backSubtitle: HTMLDivElement;

    private isFlipped: boolean = false;
    private currentSelectionId: ISelectionId | undefined;
    private hasActiveSelection: boolean = false;

    constructor(options: VisualConstructorOptions) {
        this.target = options.element;
        this.host = options.host;
        this.selectionManager = this.host.createSelectionManager();
        this.target.classList.add("flip-card-visual-root");

        this.cardWrapper = document.createElement("div");
        this.cardWrapper.className = "flip-card-wrapper";

        this.cardInner = document.createElement("div");
        this.cardInner.className = "flip-card-inner";

        const frontFace = document.createElement("div");
        frontFace.className = "flip-card-face flip-card-front";

        this.frontLabel = this.createTextElement("flip-card-label", "No label");
        this.frontTitle = this.createTextElement("flip-card-title", "Add a measure");
        this.frontValue = this.createTextElement("flip-card-value", "No value");
        this.frontSubtitle = this.createTextElement("flip-card-subtitle", "Drag a measure into Card Value");

        frontFace.appendChild(this.frontLabel);
        frontFace.appendChild(this.frontTitle);
        frontFace.appendChild(this.frontValue);
        frontFace.appendChild(this.frontSubtitle);

        const backFace = document.createElement("div");
        backFace.className = "flip-card-face flip-card-back";

        this.backLabel = this.createTextElement("flip-card-label", "No label");
        this.backTitle = this.createTextElement("flip-card-title", "Details");
        this.backValue = this.createTextElement("flip-card-value", "No detail");
        this.backSubtitle = this.createTextElement("flip-card-subtitle", "Drag another measure into Detail Value");

        backFace.appendChild(this.backLabel);
        backFace.appendChild(this.backTitle);
        backFace.appendChild(this.backValue);
        backFace.appendChild(this.backSubtitle);

        this.cardInner.appendChild(frontFace);
        this.cardInner.appendChild(backFace);
        this.cardWrapper.appendChild(this.cardInner);
        this.target.appendChild(this.cardWrapper);

        this.cardWrapper.addEventListener("click", (event: MouseEvent) => {
            this.onCardClick(event);
        });
    }

    public update(options: VisualUpdateOptions): void {
        this.resizeCard(options);

        const dataView = options.dataViews && options.dataViews[0];
        const cardData = this.getCardData(dataView);

        if (!cardData) {
            this.currentSelectionId = undefined;
            this.clearSelectionState();
            this.showEmptyState();

            return;
        }

        this.currentSelectionId = cardData.selectionId;
        this.renderCard(cardData);
    }

    private resizeCard(options: VisualUpdateOptions): void {
        this.cardWrapper.style.width = `${options.viewport.width}px`;
        this.cardWrapper.style.height = `${options.viewport.height}px`;
    }

    private clearSelectionState(): void {
        this.hasActiveSelection = false;
        this.cardWrapper.classList.remove("is-selected");
    }

    private getCardData( dataView: DataView | undefined): CardData | undefined {
        if (!dataView || !dataView.categorical) {
            return undefined
        }
        const labelColumn = this.findCategoryByRole(dataView, "cardLabel");
        const cardMeasure = this.findMeasureByRole(dataView, "cardValue");
        const detailMeasure = this.findMeasureByRole(dataView, "detailValue");

        if (!cardMeasure) {
            return undefined
        }

        const rowIndex = 0;
        const labelText = this.getCategoryLabel(labelColumn, rowIndex);

        const cardMeasureName = cardMeasure.source.displayName || "Card Value";
        const cardMeasureValue = this.getFirstValue(cardMeasure);
        const formattedCardMeasureValue = this.formatValue(cardMeasureValue, cardMeasure);

        const selectionId = this.createCategorySelectionId(labelColumn, rowIndex);

        if (!detailMeasure) {
            return {
                label: labelText,
                frontTitle: cardMeasureName,
                frontValue: formattedCardMeasureValue,
                frontSubtitle: "Click card to view details",
                backTitle: "Details",
                backValue: cardMeasureName,
                backSubtitle: `Current value: ${formattedCardMeasureValue}`,
                selectionId: selectionId
            };
        }

        const detailMeasureName = detailMeasure.source.displayName || "Detail Value";
        const detailMeasureValue = this.getFirstValue(detailMeasure);
        const formattedDetailMeasureValue = this.formatValue(detailMeasureValue, detailMeasure);

        return {
                label: labelText,
                frontTitle: cardMeasureName,
                frontValue: formattedCardMeasureValue,
                frontSubtitle: "Click card to view details",
                backTitle: detailMeasureName,
                backValue: formattedDetailMeasureValue,
                backSubtitle: `Front value: ${formattedCardMeasureValue}`,
                selectionId: selectionId
        };
    }

    private renderCard(cardData: CardData): void {
        this.frontLabel.textContent = cardData.label;
        this.frontTitle.textContent = cardData.frontTitle;
        this.frontValue.textContent = cardData.frontValue;
        this.frontSubtitle.textContent = cardData.frontSubtitle;

        this.backLabel.textContent = cardData.label;
        this.backTitle.textContent = cardData.backTitle;
        this.backValue.textContent = cardData.backValue;
        this.backSubtitle.textContent = cardData.backSubtitle;
    }

    private onCardClick(event: MouseEvent): void {
        this.isFlipped = !this.isFlipped;
        this.cardInner.classList.toggle("is-flipped", this.isFlipped);
        
        if (!this.currentSelectionId) {
            return;
        }

        if (this.hasActiveSelection) {
            void this.selectionManager.clear().then(() => {
                this.clearSelectionState();
            });
            return;
        }
        
        const multiSelect = event.ctrlKey || event.metaKey;

        void this.selectionManager
            .select(this.currentSelectionId, multiSelect)
            .then((selectionIds: ISelectionId[]) => {
                this.hasActiveSelection = selectionIds.length > 0;
                this.cardWrapper.classList.toggle("is-selected", this.hasActiveSelection);
            });
    }

    private showEmptyState(): void {
        this.frontLabel.textContent = "No label";
        this.frontTitle.textContent = "Add a measure";
        this.frontValue.textContent = "No value";
        this.frontSubtitle.textContent = "Drag a measure into Card Value";

        this.backLabel.textContent = "No label";
        this.backTitle.textContent = "Details";
        this.backValue.textContent = "No detail";
        this.backSubtitle.textContent = "Optional: drag another measure into Detail Value";
    }

    private createTextElement(className: string, text: string): HTMLDivElement {
        const element = document.createElement("div");
        element.className = className;
        element.textContent = text;

        return element;
    }

    private findCategoryByRole(dataView: DataView, roleName: string): DataViewCategoryColumn | undefined {
        const categories = dataView.categorical && dataView.categorical.categories;

        if (!categories) {
            return undefined;
        }

        for (let index = 0; index < categories.length; index++) {
            const categoryColumn = categories[index];

            if (categoryColumn.source.roles && categoryColumn.source.roles[roleName]) {
                return categoryColumn;
            }
        }

        return undefined;
    }

    private findMeasureByRole(dataView: DataView, roleName: string): DataViewValueColumn | undefined {
        const values = dataView.categorical && dataView.categorical.values;

        if (!values) {
            return undefined;
        }

        for (let index = 0; index < values.length; index++) {
            const valueColumn = values[index];

            if (valueColumn.source.roles && valueColumn.source.roles[roleName]) {
                return valueColumn;
            }
        }

        return undefined;
    }

    private createCategorySelectionId(categoryColumn: DataViewCategoryColumn | undefined, rowIndex: number): ISelectionId | undefined {
        if (!categoryColumn || !categoryColumn.values || categoryColumn.values.length === 0) {
            return undefined;
        }

        return this.host
            .createSelectionIdBuilder()
            .withCategory(categoryColumn, rowIndex)
            .createSelectionId();
    }

    private getCategoryLabel(categoryColumn: DataViewCategoryColumn | undefined, rowIndex: number): string {
        if (!categoryColumn || !categoryColumn.values || categoryColumn.values.length === 0) {
            return "All";
        }

        return this.formatValue(categoryColumn.values[rowIndex]);
    }

    private getFirstValue(valueColumn: DataViewValueColumn): unknown {
        if (!valueColumn.values || valueColumn.values.length === 0) {
            return undefined;
        }

        return valueColumn.values[0];
    }

    private formatValue(value: unknown, valueColumn?: DataViewValueColumn): string {
        if (value === null || value === undefined) {
            return "No value";
        }

        if (typeof value === "number") {
            const formatString = valueColumn && valueColumn.source ? valueColumn.source.format : undefined;

            const formatter = valueFormatter.create({
                format: formatString,
                value: value,
                formatSingleValues: true,
                allowFormatBeautification: true,
                cultureSelector: "en-US"
            });

            return formatter.format(value);
        }

        return String(value);
    }
}