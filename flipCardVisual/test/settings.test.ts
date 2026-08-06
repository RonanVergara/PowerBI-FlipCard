import { FormattingSettingsService } from "powerbi-visuals-utils-formattingmodel";
import { describe, expect, it } from "vitest";

import { extractDataView } from "../src/data";
import { applyFormattingMigration, getBackTitle, getDecimalPrecision, getEffectiveCardMode, getSectionSpacing, VisualFormattingSettingsModel } from "../src/settings";
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

function formattingCards(model: powerbi.visuals.FormattingModel): powerbi.visuals.FormattingCard[] {
    return model.cards.filter((card): card is powerbi.visuals.FormattingCard => "uid" in card);
}

function formattingGroups(card: powerbi.visuals.FormattingCard): powerbi.visuals.FormattingGroup[] {
    return card.groups.filter((item): item is powerbi.visuals.FormattingGroup => "uid" in item);
}

function formattingSlices(group: powerbi.visuals.FormattingGroup): powerbi.visuals.FormattingSlice[] {
    return (group.slices ?? []).filter((item): item is powerbi.visuals.FormattingSlice => "uid" in item);
}

function slicePropertyName(slice: powerbi.visuals.FormattingSlice): string {
    const properties = slice.control.properties as unknown as { descriptor?: { propertyName?: string } };
    return properties.descriptor?.propertyName ?? "";
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
        expect(settings.label.presentationMode.value.value).toBe("auto");
        expect(settings.label.verticalAlignment.value.value).toBe("center");
        expect(settings.label.sectionSpacing.value).toBe(8);
        expect(settings.label.sectionSpacing.options?.minValue?.value).toBe(0);
        expect(settings.label.sectionSpacing.options?.maxValue?.value).toBe(40);
        expect(settings.label.responsivePriority.value.value).toBe("automatic");
        expect(settings.benchmark.statusPresentation.value.value).toBe("pill");
        expect(settings.flip.backLayout.value.value).toBe("auto");
        expect(settings.flip.controlIcon.value.value).toBe("rotate");
        expect(settings.flip.controlStyle.value.value).toBe("outline");
        expect(settings.flip.controlShape.value.value).toBe("circle");
        expect(settings.flip.motionStyle.value.value).toBe("horizontal");
        expect(settings.flip.horizontalDirection.value.value).toBe("right");
        expect(settings.flip.verticalDirection.value.value).toBe("up");
        expect(settings.flip.easing.value.value).toBe("smooth");
        expect(settings.flip.animationDuration.value).toBe(450);
        expect(settings.flip.perspective.value.value).toBe("standard");
    });

    it("preserves exact internal card and group identities while showing seven requested display names", () => {
        const model = service.buildFormattingModel(new VisualFormattingSettingsModel());
        expect(formattingCards(model).map((card) => card.uid)).toEqual([
            "cardAppearance-card", "multipleCards-card", "label-card", "mainValue-card", "benchmark-card", "flip-card", "interactions-card",
        ]);
        expect(formattingCards(model).map((card) => card.displayName)).toEqual([
            "Card frame", "Multiple-card layout", "Front — Label", "Front — Callout", "Front — Insight and status", "Back face and flip motion", "Interactions",
        ]);
        const settings = new VisualFormattingSettingsModel(); settings.multipleCards.enabled.value = true; settings.benchmark.enabled.value = true; settings.flip.enabled.value = true;
        const expanded = service.buildFormattingModel(settings);
        expect(formattingCards(expanded).flatMap((card) => formattingGroups(card).map((item) => item.uid))).toEqual([
            "cardAppearanceLayoutGroup-group", "cardAppearanceColorsGroup-group", "cardAppearanceDecorationGroup-group",
            "multipleCardsLayoutGroup-group",
            "frontLabelLayoutGroup-group", "frontLabelTypographyGroup-group", "frontLabelColorsGroup-group",
            "frontCalloutTypographyGroup-group", "frontCalloutNumberFormatGroup-group", "frontCalloutColorsGroup-group",
            "frontInsightStatusLayoutGroup-group", "frontInsightStatusColorsGroup-group",
            "backFaceLayoutGroup-group", "backFaceTypographyGroup-group", "backFaceColorsGroup-group", "flipControlGroup-group", "flipMotionGroup-group",
            "interactionsControlGroup-group",
        ]);
        expect(formattingCards(expanded).find((card) => card.uid === "multipleCards-card")?.topLevelToggle?.control.properties.descriptor.propertyName).toBe("enabled");
        expect(formattingCards(expanded).find((card) => card.uid === "benchmark-card")?.topLevelToggle?.control.properties.descriptor.propertyName).toBe("enabled");
        expect(formattingCards(expanded).find((card) => card.uid === "flip-card")?.topLevelToggle?.control.properties.descriptor.propertyName).toBe("enabled");
    });

    it("applies exact conditional visibility for layout, color, title, and motion slices", () => {
        const settings = new VisualFormattingSettingsModel();
        let model = service.buildFormattingModel(settings);
        expect(formattingCards(model).find((card) => card.uid === "multipleCards-card")?.groups).toHaveLength(0);
        expect(formattingCards(model).find((card) => card.uid === "benchmark-card")?.groups).toHaveLength(0);
        expect(formattingCards(model).find((card) => card.uid === "flip-card")?.groups).toHaveLength(0);

        settings.multipleCards.enabled.value = true;
        settings.multipleCards.sizing.value = settings.multipleCards.sizing.items.find((item) => item.value === "fixed")!;
        settings.multipleCards.columnCalculation.value = settings.multipleCards.columnCalculation.items.find((item) => item.value === "custom")!;
        settings.benchmark.enabled.value = true;
        settings.benchmark.insightBackgroundEnabled.value = false;
        settings.benchmark.statusPresentation.value = settings.benchmark.statusPresentation.items.find((item) => item.value === "text")!;
        settings.label.dividerEnabled.value = false;
        settings.flip.enabled.value = true;
        settings.flip.backTitleSource.value = settings.flip.backTitleSource.items.find((item) => item.value === "custom")!;
        settings.flip.sectionDividers.value = false;
        settings.flip.itemBackgroundEnabled.value = false;
        settings.flip.motionStyle.value = settings.flip.motionStyle.items.find((item) => item.value === "vertical")!;
        model = service.buildFormattingModel(settings);
        const propertyNames = (cardUid: string, groupUid: string): string[] => {
            const card = formattingCards(model).find((item) => item.uid === cardUid);
            const foundGroup = card ? formattingGroups(card).find((item) => item.uid === groupUid) : undefined;
            return foundGroup ? formattingSlices(foundGroup).map(slicePropertyName) : [];
        };
        expect(propertyNames("multipleCards-card", "multipleCardsLayoutGroup-group")).toEqual(expect.arrayContaining(["columns", "fixedWidth", "fixedHeight"]));
        expect(propertyNames("multipleCards-card", "multipleCardsLayoutGroup-group")).not.toEqual(expect.arrayContaining(["preferredWidth", "preferredHeight"]));
        expect(propertyNames("frontLabelColorsGroup-group", "missing")).toEqual([]);
        expect(propertyNames("label-card", "frontLabelColorsGroup-group")).not.toContain("dividerColor");
        expect(propertyNames("benchmark-card", "frontInsightStatusColorsGroup-group")).not.toEqual(expect.arrayContaining(["insightBackground", "statusBackground"]));
        expect(propertyNames("flip-card", "backFaceLayoutGroup-group")).toContain("customBackTitle");
        expect(propertyNames("flip-card", "backFaceColorsGroup-group")).not.toEqual(expect.arrayContaining(["backDividerColor", "itemBackground"]));
        expect(propertyNames("flip-card", "flipMotionGroup-group")).toEqual(["motionStyle", "verticalDirection", "easing", "animationDuration", "perspective"]);

        settings.flip.motionStyle.value = settings.flip.motionStyle.items.find((item) => item.value === "fade")!;
        model = service.buildFormattingModel(settings);
        expect(propertyNames("flip-card", "flipMotionGroup-group")).toEqual(["motionStyle", "easing", "animationDuration"]);
        settings.flip.motionStyle.value = settings.flip.motionStyle.items.find((item) => item.value === "none")!;
        model = service.buildFormattingModel(settings);
        expect(propertyNames("flip-card", "flipMotionGroup-group")).toEqual(["motionStyle"]);
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

    it("migrates explicit legacy back background only into absent independent 1.2 colors", () => {
        const migrated = populated({ cardAppearance: { backBackground: { solid: { color: "#123456" } } } });
        expect(migrated.flip.backHeaderBackground.value.value).toBe("#123456");
        expect(migrated.flip.backContentBackground.value.value).toBe("#123456");
        expect(migrated.benchmark.statusBackground.value.value).toBe("#123456");
        const explicit = populated({
            cardAppearance: { backBackground: { solid: { color: "#123456" } } },
            flip: { backHeaderBackground: { solid: { color: "#ABCDEF" } }, backContentBackground: { solid: { color: "#FEDCBA" } } },
            benchmark: { statusBackground: { solid: { color: "#111111" } } },
        });
        expect(explicit.flip.backHeaderBackground.value.value).toBe("#ABCDEF");
        expect(explicit.flip.backContentBackground.value.value).toBe("#FEDCBA");
        expect(explicit.benchmark.statusBackground.value.value).toBe("#111111");
    });

    it("clamps runtime section spacing and trims custom back titles", () => {
        const settings = new VisualFormattingSettingsModel();
        settings.label.sectionSpacing.value = -5; expect(getSectionSpacing(settings)).toBe(0);
        settings.label.sectionSpacing.value = 100; expect(getSectionSpacing(settings)).toBe(40);
        settings.flip.backTitleSource.value = settings.flip.backTitleSource.items.find((item) => item.value === "custom")!;
        settings.flip.customBackTitle.value = "   "; expect(getBackTitle(settings, "Vendor A")).toBe("Details");
        settings.flip.customBackTitle.value = "  More context  "; expect(getBackTitle(settings, "Vendor A")).toBe("More context");
        settings.flip.backTitleSource.value = settings.flip.backTitleSource.items.find((item) => item.value === "category")!;
        expect(getBackTitle(settings, "Vendor A")).toBe("Vendor A");
    });

    it("emits Reset descriptors for every visible card and the hidden back-background compatibility path", () => {
        const settings = new VisualFormattingSettingsModel(); settings.multipleCards.enabled.value = true; settings.benchmark.enabled.value = true; settings.flip.enabled.value = true;
        const model = service.buildFormattingModel(settings);
        for (const card of formattingCards(model)) { expect(card.revertToDefaultDescriptors?.length, card.uid).toBeGreaterThan(0); }
        const frame = formattingCards(model).find((card) => card.uid === "cardAppearance-card")!;
        expect(frame.revertToDefaultDescriptors).toContainEqual({ objectName: "cardAppearance", propertyName: "backBackground" });
        const frameSlices = formattingGroups(frame).flatMap(formattingSlices).map(slicePropertyName);
        expect(frameSlices).not.toContain("backBackground");
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
