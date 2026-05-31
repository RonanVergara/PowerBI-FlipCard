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
    private isFlipped: boolean = false;

    constructor(options: VisualConstructorOptions) {
        this.target = options.element;
        this.target.classList.add("flip-card-visual-root");

        this.cardWrapper = document.createElement("div");
        this.cardWrapper.className = "flip-card-wrapper";

        this.cardInner = document.createElement("div");
        this.cardInner.className = "flip-card-inner";

        const frontFace = this.createCardFace(
            "front",
            "Total Volume",
            "12,345",
            "Click card to view details"
        );

        const backFace = this.createCardFace(
            "back",
            "Details",
            "Clicked / flipped",
            "This is the back face"
        );

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
    }

    private createCardFace(
        side: "front" | "back",
        titleText: string,
        valueText: string,
        subtitleText: string
    ): HTMLDivElement {
        const face = document.createElement("div");
        face.className = `flip-card-face flip-card-${side}`;

        const title = document.createElement("div");
        title.className = "flip-card-title";
        title.textContent = titleText;

        const value = document.createElement("div");
        value.className = "flip-card-value";
        value.textContent = valueText;

        const subtitle = document.createElement("div");
        subtitle.className = "flip-card-subtitle";
        subtitle.textContent = subtitleText;

        face.appendChild(title);
        face.appendChild(value);
        face.appendChild(subtitle);

        return face;
    }
}