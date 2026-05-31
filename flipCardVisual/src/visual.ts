"use strict";

import powerbi from "powerbi-visuals-api";
import "./../style/visual.less";

import IVisual = powerbi.extensibility.visual.IVisual;
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;

export class Visual implements IVisual {
    private readonly target: HTMLElement;
    private readonly cardWrapper: HTMLDivElement;
    private readonly cardInner: HTMLDivElement;

    private readonly frontTitle: HTMLDivElement;
    private readonly frontValue: HTMLDivElement;
    private readonly frontSubtitle: HTMLDivElement;

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

        this.frontTitle = this.createTextElement("flip-card-title", "Add a measure");
        this.frontValue = this.createTextElement("flip-card-value", "No value");
        this.frontSubtitle = this.createTextElement("flip-card-subtitle", "Drag a measure into Card Value");

        frontFace.appendChild(this.frontTitle);
        frontFace.appendChild(this.frontValue);
        frontFace.appendChild(this.frontSubtitle);

        const backFace = document.createElement("div");
        backFace.className = "flip-card-face flip-card-back";

        this.backTitle = this.createTextElement("flip-card-title", "Details");
        this.backValue = this.createTextElement("flip-card-value", "No measure");
        this.backSubtitle = this.createTextElement("flip-card-subtitle", "Click again to return");

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

        if (!dataView || !dataView.single) {
            this.frontTitle.textContent = "Add a measure";
            this.frontValue.textContent = "No value";
            this.frontSubtitle.textContent = "Drag a measure into Card Value";

            this.backTitle.textContent = "Details";
            this.backValue.textContent = "No measure";
            this.backSubtitle.textContent = "Waiting for Power BI data";

            return;
        }

        const measureName = dataView.metadata.columns[0]?.displayName || "Measure";
        const measureValue = dataView.single.value;

        this.frontTitle.textContent = measureName;
        this.frontValue.textContent = this.formatValue(measureValue);
        this.frontSubtitle.textContent = "Click card to view details";

        this.backTitle.textContent = "Details";
        this.backValue.textContent = measureName;
        this.backSubtitle.textContent = `Current value: ${this.formatValue(measureValue)}`;
    }

    private createTextElement(className: string, text: string): HTMLDivElement {
        const element = document.createElement("div");
        element.className = className;
        element.textContent = text;

        return element;
    }

    private formatValue(value: unknown): string {
        if (value === null || value === undefined) {
            return "No value";
        }

        if (typeof value === "number") {
            return new Intl.NumberFormat("en-US", {
                maximumFractionDigits: 2
            }).format(value);
        }

        return String(value);
    }
}