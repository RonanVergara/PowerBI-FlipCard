import { FormattingSettingsService } from "powerbi-visuals-utils-formattingmodel";
import { describe, expect, it } from "vitest";

import { extractDataView } from "../src/data";
import { applyFormattingMigration, getDecimalPrecision, getEffectiveCardMode, VisualFormattingSettingsModel } from "../src/settings";
import { createDataView, createHostFixture } from "./helpers";

const service = new FormattingSettingsService();
const formatting = { detail: { displayUnits: 0, precision: undefined }, main: { displayUnits: 0, precision: undefined } };
const kpi = { direction: "higher" as const, neutralTolerancePercent: 0 };

function populated(objects?: powerbi.DataViewObjects): VisualFormattingSettingsModel {
    const view = createDataView({ metadataObjects: objects });
    const settings = service.populateFormattingSettingsModel(VisualFormattingSettingsModel, view);
    applyFormattingMigration(settings, view);
    return settings;
}

function descriptors(value: unknown): Array<Record<string, unknown>> {
    const found: Array<Record<string, unknown>> = [];
    const visit = (current: unknown): void => {
        if (!current || typeof current !== "object") { return; }
        const record = current as Record<string, unknown>;
        if ("objectName" in record && "propertyName" in record) { found.push(record); }
        for (const child of Object.values(record)) { if (Array.isArray(child)) { child.forEach(visit); } else { visit(child); } }
    };
    visit(value);
    return found;
}

describe("formatting settings", () => {
    it("uses neutral simple-card defaults", () => {
        const settings = new VisualFormattingSettingsModel();
        expect(settings.cardAppearance.frontBackground.value.value).toBe("#FFFFFF");
        expect(settings.cardAppearance.shadow.value).toBe(false);
        expect(settings.cardAppearance.accentEnabled.value).toBe(false);
        expect(settings.flip.enabled.value).toBe(false);
        expect(settings.benchmark.enabled.value).toBe(false);
        expect(getEffectiveCardMode(settings)).toBe("single");
        expect(settings.interactions.selectionEnabled.value).toBe(true);
        expect(getDecimalPrecision(settings.mainValue.decimalPlaces)).toBeUndefined();
    });

    it("shows exactly seven progressive Format pane cards", () => {
        const model = service.buildFormattingModel(new VisualFormattingSettingsModel());
        expect(model.cards.map((card) => "displayName" in card ? card.displayName : undefined)).toEqual(["Card", "Layout", "Label", "Callout value", "Benchmark and status", "Flip and details", "Interactions"]);
    });

    it("preserves unchanged saved constants", () => {
        const settings = populated({ cardAppearance: { cornerRadius: 24 }, mainValue: { decimalPlaces: "2" } });
        expect(settings.cardAppearance.cornerRadius.value).toBe(24);
        expect(getDecimalPrecision(settings.mainValue.decimalPlaces)).toBe(2);
    });

    it("applies explicit new values before explicit legacy values", () => {
        const settings = populated({ flip: { enabled: false }, flipBehavior: { showButton: true }, benchmark: { enabled: false }, kpiStatus: { show: true } });
        expect(settings.flip.enabled.value).toBe(false);
        expect(settings.benchmark.enabled.value).toBe(false);
    });

    it("uses compatible explicit legacy metadata only when the new property is absent", () => {
        const settings = populated({ flipBehavior: { showButton: true, position: "bottomLeft" }, kpiStatus: { show: true, direction: "lower" }, detailValues: { showVariance: false } });
        expect(settings.flip.enabled.value).toBe(true);
        expect(settings.benchmark.enabled.value).toBe(true);
        expect(settings.flip.position.value.value).toBe("bottomLeft");
        expect(settings.benchmark.direction.value.value).toBe("lower");
        expect(settings.benchmark.showVariance.value).toBe(false);
    });

    it("uses new defaults when neither property is saved and ignores unsaved legacy defaults", () => {
        const settings = populated();
        expect(settings.flip.enabled.value).toBe(false);
        expect(settings.benchmark.enabled.value).toBe(false);
    });

    it("gives legacy showButton precedence over legacy enableFlip", () => {
        expect(populated({ flipBehavior: { showButton: false }, interactions: { enableFlip: true } }).flip.enabled.value).toBe(false);
        expect(populated({ flipBehavior: { showButton: true }, interactions: { enableFlip: false } }).flip.enabled.value).toBe(true);
    });

    it("keeps absent new multi-card metadata in strict Single and ignores Default Face", () => {
        const settings = populated({ flipBehavior: { defaultFace: "back" } });
        expect(getEffectiveCardMode(settings)).toBe("single");
        expect(settings.flip.enabled.value).toBe(false);
        expect(JSON.stringify(service.buildFormattingModel(settings))).not.toContain("defaultFace");
    });

    it("emits ConstantOrRule descriptors with wildcard and alternate constant selectors for all five fx paths", () => {
        const view = createDataView({ cardValues: [10], labels: ["A"] });
        const settings = populated();
        const card = extractDataView(view, createHostFixture().host, "en-US", formatting, kpi).cards[0]!;
        settings.benchmark.enabled.value = true;
        settings.configureConditionalFormatting([card]);
        const found = descriptors(service.buildFormattingModel(settings));
        const expected = [
            ["cardAppearance", "frontBackground"], ["cardAppearance", "borderColor"], ["cardAppearance", "accentColor"],
            ["mainValue", "fontColor"], ["benchmark", "statusIndicatorColor"],
        ];
        for (const [objectName, propertyName] of expected) {
            const descriptor = found.find((item) => item.objectName === objectName && item.propertyName === propertyName);
            expect(descriptor, `${objectName}.${propertyName}`).toBeDefined();
            expect(descriptor?.selector).toBeDefined();
            expect(descriptor?.altConstantValueSelector).toEqual(card.selectionId?.getSelector());
        }
    });

    it("uses {} as the valid alternate selector for an identity-less card", () => {
        const view = createDataView({ cardValues: [10] });
        const settings = populated();
        settings.configureConditionalFormatting(extractDataView(view, createHostFixture().host, "en-US", formatting, kpi).cards);
        const descriptor = descriptors(service.buildFormattingModel(settings)).find((item) => item.objectName === "mainValue" && item.propertyName === "fontColor");
        expect(descriptor?.altConstantValueSelector).toEqual({});
    });
});
