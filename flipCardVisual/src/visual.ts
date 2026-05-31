"use strict";

import powerbi from "powerbi-visuals-api";
import { valueFormatter } from "powerbi-visuals-utils-formattingutils";
import "./../style/visual.less";

import DataView = powerbi.DataView;
import DataViewCategoryColumn = powerbi.DataViewCategoryColumn;
import DataViewValueColumn = powerbi.DataViewValueColumn;
import IVisual = powerbi.extensibility.visual.IVisual;
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;

export class Visual implements IVisual {
    private readonly target: HTMLElement;
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

    constructor(options: VisualConstructorOptions) {
        this.target = options.element;
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

        this.cardWrapper.addEventListener("click", () => {
            this.isFlipped = !this.isFlipped;
            this.cardInner.classList.toggle("is-flipped", this.isFlipped);
        });
    }

    public update(options: VisualUpdateOptions): void {
        this.cardWrapper.style.width = `${options.viewport.width}px`;
        this.cardWrapper.style.height = `${options.viewport.height}px`;

        const dataView = options.dataViews && options.dataViews[0];

        if (!dataView || !dataView.categorical) {
            this.showEmptyState();

            return;
        }

        const labelColumn = this.findCategoryByRole(dataView, "cardLabel");
        const cardMeasure = this.findMeasureByRole(dataView, "cardValue");
        const detailMeasure = this.findMeasureByRole(dataView, "detailValue");

        if (!cardMeasure) {
            this.showEmptyState();

            return;
        }

        const labelText = this.getCategoryLabel(labelColumn);
        const cardMeasureName = cardMeasure.source.displayName || "Card Value";
        const cardMeasureValue = this.getFirstValue(cardMeasure);
        const formattedCardMeasureValue = this.formatValue(cardMeasureValue, cardMeasure);

        this.frontLabel.textContent = labelText;
        this.frontTitle.textContent = cardMeasureName;
        this.frontValue.textContent = formattedCardMeasureValue;
        this.frontSubtitle.textContent = "Click card to view details";

        this.backLabel.textContent = labelText;

        if (!detailMeasure) {
            this.backTitle.textContent = "Details";
            this.backValue.textContent = cardMeasureName;
            this.backSubtitle.textContent = `Current value: ${formattedCardMeasureValue}`;

            return;
        }

        const detailMeasureName = detailMeasure.source.displayName || "Detail Value";
        const detailMeasureValue = this.getFirstValue(detailMeasure);
        const formattedDetailMeasureValue = this.formatValue(detailMeasureValue, detailMeasure);

        this.backTitle.textContent = detailMeasureName;
        this.backValue.textContent = formattedDetailMeasureValue;
        this.backSubtitle.textContent = `Front value: ${formattedCardMeasureValue}`;
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

    private getCategoryLabel(categoryColumn: DataViewCategoryColumn | undefined): string {
        if (!categoryColumn || !categoryColumn.values || categoryColumn.values.length === 0) {
            return "All";
        }

        return this.formatValue(categoryColumn.values[0]);
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