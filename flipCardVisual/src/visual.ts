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

interface CardDomElements {
    wrapper: HTMLDivElement;
    inner: HTMLDivElement;

    frontLabel: HTMLDivElement;
    frontTitle: HTMLDivElement;
    frontValue: HTMLDivElement;
    frontSubtitle: HTMLDivElement;

    backLabel: HTMLDivElement;
    backTitle: HTMLDivElement;
    backValue: HTMLDivElement;
    backSubtitle: HTMLDivElement;
}

export class Visual implements IVisual {
    private readonly target: HTMLElement;
    private readonly host: IVisualHost;
    private readonly selectionManager: ISelectionManager;

    private readonly cardContainer: HTMLDivElement;
    private readonly cardElements: CardDomElements;

    private isFlipped: boolean = false;
    private currentSelectionId: ISelectionId | undefined;
    private hasActiveSelection: boolean = false;

    constructor(options: VisualConstructorOptions) {
        this.target = options.element;
        this.host = options.host;
        this.selectionManager = this.host.createSelectionManager();
        this.target.classList.add("flip-card-visual-root");

        this.cardContainer = document.createElement("div");
        this.cardContainer.className = "flip-card-container";

        this.cardElements = this.createCardElements();

        this.cardContainer.appendChild(this.cardElements.wrapper);
        this.target.appendChild(this.cardContainer);

        this.cardElements.wrapper.addEventListener("click", (event: MouseEvent) => {
            this.onCardClick(event, this.cardElements, this.currentSelectionId);
        });
    }

    public update(options: VisualUpdateOptions): void {
        this.resizeCard(options);

        const dataView = options.dataViews && options.dataViews[0];
        const rowCount = this.getCategoryRowCount(dataView);
        const cardData = rowCount > 0 ? this.getCardDataForRow(dataView, 0) : undefined;

        if (!cardData) {
            this.currentSelectionId = undefined;
            this.clearSelectionState();
            this.showEmptyState(this.cardElements);

            return;
        }

        this.currentSelectionId = cardData.selectionId;
        this.renderCard(cardData, this.cardElements);
    }

        private resizeCard(options: VisualUpdateOptions): void {
            this.cardElements.wrapper.style.width = `${options.viewport.width}px`;
            this.cardElements.wrapper.style.height = `${options.viewport.height}px`;
        }

        private clearSelectionState(): void {
            this.hasActiveSelection = false;
            this.cardElements.wrapper.classList.remove("is-selected");
        }
    private getCardDataForRow(dataView: DataView | undefined, rowIndex: number): CardData | undefined {
        if (!dataView || !dataView.categorical) {
            return undefined
        }
        const labelColumn = this.findCategoryByRole(dataView, "cardLabel");
        const cardMeasure = this.findMeasureByRole(dataView, "cardValue");
        const detailMeasure = this.findMeasureByRole(dataView, "detailValue");

        if (!cardMeasure) {
            return undefined
        }

        const labelText = this.getCategoryLabel(labelColumn, rowIndex);

        const cardMeasureName = cardMeasure.source.displayName || "Card Value";
        const cardMeasureValue = this.getValueAtRow(cardMeasure, rowIndex);
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
        const detailMeasureValue = this.getValueAtRow(detailMeasure, rowIndex);
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

    
    private getCategoryRowCount(dataView: DataView | undefined): number {
        const labelColumn = dataView ? this.findCategoryByRole(dataView, "cardLabel") : undefined;

        if (!labelColumn || !labelColumn.values) {
            return 1;
        }

        return labelColumn.values.length;
    }

    private renderCard(cardData: CardData, cardElements: CardDomElements): void {
        cardElements.frontLabel.textContent = cardData.label;
        cardElements.frontTitle.textContent = cardData.frontTitle;
        cardElements.frontValue.textContent = cardData.frontValue;
        cardElements.frontSubtitle.textContent = cardData.frontSubtitle;

        cardElements.backLabel.textContent = cardData.label;
        cardElements.backTitle.textContent = cardData.backTitle;
        cardElements.backValue.textContent = cardData.backValue;
        cardElements.backSubtitle.textContent = cardData.backSubtitle;
    }

    private onCardClick(
        event: MouseEvent,
        cardElements: CardDomElements,
        selectionId: ISelectionId | undefined
    ): void {
        this.isFlipped = !this.isFlipped;
        cardElements.inner.classList.toggle("is-flipped", this.isFlipped);

        if (!selectionId) {
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
            .select(selectionId, multiSelect)
            .then((selectionIds: ISelectionId[]) => {
                this.hasActiveSelection = selectionIds.length > 0;
                cardElements.wrapper.classList.toggle("is-selected", this.hasActiveSelection);
            });
    }

        private showEmptyState(cardElements: CardDomElements): void {
            cardElements.frontLabel.textContent = "No label";
            cardElements.frontTitle.textContent = "Add a measure";
            cardElements.frontValue.textContent = "No value";
            cardElements.frontSubtitle.textContent = "Drag a measure into Card Value";

            cardElements.backLabel.textContent = "No label";
            cardElements.backTitle.textContent = "Details";
            cardElements.backValue.textContent = "No detail";
            cardElements.backSubtitle.textContent = "Optional: drag another measure into Detail Value";
        }

    private createCardElements(): CardDomElements {
        const wrapper = document.createElement("div");
        wrapper.className = "flip-card-wrapper";

        const inner = document.createElement("div");
        inner.className = "flip-card-inner";

        const frontFace = document.createElement("div");
        frontFace.className = "flip-card-face flip-card-front";

        const frontLabel = this.createTextElement("flip-card-label", "No label");
        const frontTitle = this.createTextElement("flip-card-title", "Add a measure");
        const frontValue = this.createTextElement("flip-card-value", "No value");
        const frontSubtitle = this.createTextElement("flip-card-subtitle", "Drag a measure into Card Value");

        frontFace.appendChild(frontLabel);
        frontFace.appendChild(frontTitle);
        frontFace.appendChild(frontValue);
        frontFace.appendChild(frontSubtitle);

        const backFace = document.createElement("div");
        backFace.className = "flip-card-face flip-card-back";

        const backLabel = this.createTextElement("flip-card-label", "No label");
        const backTitle = this.createTextElement("flip-card-title", "Details");
        const backValue = this.createTextElement("flip-card-value", "No detail");
        const backSubtitle = this.createTextElement("flip-card-subtitle", "Drag another measure into Detail Value");

        backFace.appendChild(backLabel);
        backFace.appendChild(backTitle);
        backFace.appendChild(backValue);
        backFace.appendChild(backSubtitle);

        inner.appendChild(frontFace);
        inner.appendChild(backFace);
        wrapper.appendChild(inner);

        return {
            wrapper,
            inner,
            frontLabel,
            frontTitle,
            frontValue,
            frontSubtitle,
            backLabel,
            backTitle,
            backValue,
            backSubtitle
        };
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

    private getValueAtRow(valueColumn: DataViewValueColumn, rowIndex: number): unknown {
        if (!valueColumn.values || valueColumn.values.length <= rowIndex) {
            return undefined;
        }

        return valueColumn.values[rowIndex];
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