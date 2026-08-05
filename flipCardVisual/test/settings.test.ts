import { FormattingSettingsService } from "powerbi-visuals-utils-formattingmodel";
import { describe, expect, it } from "vitest";

import {
    getDecimalPrecision,
    getEnumSettingValue,
    VisualFormattingSettingsModel,
} from "../src/settings";
import { createDataView } from "./helpers";

describe("formatting settings", () => {
    it("uses polished production defaults and model-format Auto precision", () => {
        const settings = new VisualFormattingSettingsModel();

        expect(settings.cardAppearance.frontBackground.value.value).toBe("#0F6CBD");
        expect(settings.cardAppearance.cornerRadius.value).toBe(16);
        expect(settings.mainValue.fontSize.value).toBe(40);
        expect(getDecimalPrecision(settings.mainValue.decimalPlaces)).toBeUndefined();
        expect(getEnumSettingValue(settings.kpiStatus.varianceMode)).toBe("percentage");
        expect(getEnumSettingValue(settings.flipBehavior.defaultFace)).toBe("front");
    });

    it("populates saved properties and generates all six Format pane cards", () => {
        const service = new FormattingSettingsService();
        const dataView = createDataView({
            metadataObjects: {
                cardAppearance: { cornerRadius: 24 },
                kpiStatus: { direction: "lower", tolerance: 5 },
                mainValue: { decimalPlaces: "2" },
            },
        });
        const settings = service.populateFormattingSettingsModel(VisualFormattingSettingsModel, dataView);
        const model = service.buildFormattingModel(settings);

        expect(settings.cardAppearance.cornerRadius.value).toBe(24);
        expect(getEnumSettingValue(settings.kpiStatus.direction)).toBe("lower");
        expect(settings.kpiStatus.tolerance.value).toBe(5);
        expect(getDecimalPrecision(settings.mainValue.decimalPlaces)).toBe(2);
        expect(model.cards.map((card) => "displayName" in card ? card.displayName : undefined)).toEqual([
            "Card appearance",
            "Label",
            "Main value",
            "Detail values",
            "KPI status",
            "Flip behavior",
        ]);
    });
});
