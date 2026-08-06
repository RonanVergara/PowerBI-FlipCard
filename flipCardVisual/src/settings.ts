"use strict";

import powerbi from "powerbi-visuals-api";
import { dataViewWildcard } from "powerbi-visuals-utils-dataviewutils";
import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";

import DataView = powerbi.DataView;
import DataViewObjects = powerbi.DataViewObjects;
import ISelectionId = powerbi.visuals.ISelectionId;
import FormattingSettingsCard = formattingSettings.SimpleCard;
import FormattingSettingsModel = formattingSettings.Model;
import FormattingSettingsSlice = formattingSettings.Slice;

import { CardViewModel, EffectiveCardMode } from "./types";

const validatorMinimum = 0 as powerbi.visuals.ValidatorType.Min;
const validatorMaximum = 1 as powerbi.visuals.ValidatorType.Max;

function enumMember(value: string, displayName: string): powerbi.IEnumMember {
    return { value, displayName };
}

function numberOptions(minimum: number, maximum: number): powerbi.visuals.NumUpDownFormat {
    return {
        minValue: { type: validatorMinimum, value: minimum },
        maxValue: { type: validatorMaximum, value: maximum },
    };
}

const alignments = [enumMember("left", "Left"), enumMember("center", "Center"), enumMember("right", "Right")];
const decimalPlaces = ["auto", "0", "1", "2", "3", "4"].map((value) => enumMember(value, value === "auto" ? "Auto" : value));
const instancesAndTotals = 0 as dataViewWildcard.DataViewWildcardMatchingOption;
const constantOrRule = 3 as powerbi.VisualEnumerationInstanceKinds;
const wildcardSelector = dataViewWildcard.createDataViewWildcardSelector(instancesAndTotals);
if (!wildcardSelector?.data?.length) {
    throw new Error("dataViewWildcard.createDataViewWildcardSelector returned no selector");
}

interface FxSliceOptions {
    readonly color: string;
    readonly displayName: string;
    readonly name: string;
    readonly selectionId?: ISelectionId;
}

function fxColor(options: FxSliceOptions): formattingSettings.ColorPicker {
    return new formattingSettings.ColorPicker({
        name: options.name,
        displayName: options.displayName,
        value: { value: options.color },
        selector: wildcardSelector,
        altConstantSelector: options.selectionId?.getSelector() ?? {},
        instanceKind: constantOrRule,
    });
}

function containerItem(displayName: string, slices: FormattingSettingsSlice[]): formattingSettings.ContainerItem {
    const item = new formattingSettings.ContainerItem();
    item.displayName = displayName;
    item.slices = slices;
    return item;
}

export class CardAppearanceSettings extends FormattingSettingsCard {
    public readonly frontBackground = new formattingSettings.ColorPicker({ name: "frontBackground", displayName: "Background", value: { value: "#FFFFFF" } });
    public readonly backBackground = new formattingSettings.ColorPicker({ name: "backBackground", displayName: "Back background", value: { value: "#FFFFFF" } });
    public readonly borderColor = new formattingSettings.ColorPicker({ name: "borderColor", displayName: "Border color", value: { value: "#D1D5DB" } });
    public readonly borderWidth = new formattingSettings.NumUpDown({ name: "borderWidth", displayName: "Border width", value: 1, options: numberOptions(0, 8) });
    public readonly cornerRadius = new formattingSettings.NumUpDown({ name: "cornerRadius", displayName: "Corner radius", value: 8, options: numberOptions(0, 40) });
    public readonly shadow = new formattingSettings.ToggleSwitch({ name: "shadow", displayName: "Shadow", value: false });
    public readonly accentEnabled = new formattingSettings.ToggleSwitch({ name: "accentEnabled", displayName: "Accent strip", value: false });
    public readonly accentColor = new formattingSettings.ColorPicker({ name: "accentColor", displayName: "Accent color", value: { value: "#605E5C" } });
    public readonly padding = new formattingSettings.NumUpDown({ name: "padding", displayName: "Internal padding", value: 16, options: numberOptions(4, 40) });
    public readonly name = "cardAppearance";
    public readonly displayName = "Card";
    public readonly slices: FormattingSettingsSlice[] = [this.frontBackground, this.backBackground, this.borderColor, this.borderWidth, this.cornerRadius, this.shadow, this.accentEnabled, this.accentColor, this.padding];

    public setFxItems(cards: CardViewModel[]): void {
        this.container = new formattingSettings.Container({
            displayName: "Data colors",
            isEditable: false,
            containerItems: cards.map((card) => containerItem(card.label, [
                fxColor({ name: "frontBackground", displayName: "Background", color: card.colorOverrides.frontBackground ?? this.frontBackground.value.value, selectionId: card.selectionId }),
                fxColor({ name: "borderColor", displayName: "Border", color: card.colorOverrides.borderColor ?? this.borderColor.value.value, selectionId: card.selectionId }),
                fxColor({ name: "accentColor", displayName: "Accent", color: card.colorOverrides.accentColor ?? this.accentColor.value.value, selectionId: card.selectionId }),
            ])),
        });
        this.frontBackground.visible = false;
        this.borderColor.visible = false;
        this.accentColor.visible = false;
        this.accentEnabled.visible = true;
    }
}

export class MultipleCardsSettings extends FormattingSettingsCard {
    private readonly modes = [enumMember("auto", "Auto"), enumMember("multiple", "Multiple")];
    private readonly sizingModes = [enumMember("fit", "Fit to space"), enumMember("fixed", "Fixed size")];
    private readonly columnModes = [enumMember("automatic", "Automatic"), enumMember("custom", "Custom")];
    public readonly enabled = new formattingSettings.ToggleSwitch({ name: "enabled", displayName: "Multiple cards", description: "Off is strict Single mode. Enable to choose Auto or Multiple.", value: false });
    public readonly mode = new formattingSettings.ItemDropdown({ name: "mode", displayName: "Card mode", description: "Auto fills the viewport for one row and grids identified rows. Multiple requires Label and always applies layout sizing.", items: this.modes, value: this.modes[0]! });
    public readonly sizing = new formattingSettings.ItemDropdown({ name: "sizing", displayName: "Sizing", description: "Fit shrinks and compacts without horizontal overflow. Fixed honors card dimensions and may scroll.", items: this.sizingModes, value: this.sizingModes[0]! });
    public readonly columnCalculation = new formattingSettings.ItemDropdown({ name: "columnCalculation", displayName: "Columns", items: this.columnModes, value: this.columnModes[0]! });
    public readonly columns = new formattingSettings.NumUpDown({ name: "columns", displayName: "Column count", value: 2, options: numberOptions(1, 20) });
    public readonly gap = new formattingSettings.NumUpDown({ name: "gap", displayName: "Card gap", value: 8, options: numberOptions(0, 40) });
    public readonly preferredWidth = new formattingSettings.NumUpDown({ name: "preferredWidth", displayName: "Preferred width", value: 160, options: numberOptions(96, 600) });
    public readonly preferredHeight = new formattingSettings.NumUpDown({ name: "preferredHeight", displayName: "Preferred height", value: 110, options: numberOptions(64, 500) });
    public readonly fixedWidth = new formattingSettings.NumUpDown({ name: "fixedWidth", displayName: "Card width", value: 240, options: numberOptions(96, 800) });
    public readonly fixedHeight = new formattingSettings.NumUpDown({ name: "fixedHeight", displayName: "Card height", value: 160, options: numberOptions(64, 600) });
    public readonly name = "multipleCards";
    public readonly displayName = "Layout";
    public readonly topLevelSlice = this.enabled;
    public readonly slices: FormattingSettingsSlice[] = [this.mode, this.sizing, this.columnCalculation, this.columns, this.gap, this.preferredWidth, this.preferredHeight, this.fixedWidth, this.fixedHeight];

    public onPreProcess(): void {
        const show = this.enabled.value;
        this.mode.visible = show;
        this.sizing.visible = show;
        this.columnCalculation.visible = show;
        this.columns.visible = show && getEnumSettingValue(this.columnCalculation) === "custom";
        this.gap.visible = show;
        this.preferredWidth.visible = show && getEnumSettingValue(this.sizing) === "fit";
        this.preferredHeight.visible = show && getEnumSettingValue(this.sizing) === "fit";
        this.fixedWidth.visible = show && getEnumSettingValue(this.sizing) === "fixed";
        this.fixedHeight.visible = show && getEnumSettingValue(this.sizing) === "fixed";
    }
}

export class LabelSettings extends FormattingSettingsCard {
    public readonly show = new formattingSettings.ToggleSwitch({ name: "show", displayName: "Show", value: true });
    public readonly fontFamily = new formattingSettings.FontPicker({ name: "fontFamily", displayName: "Font family", value: "Segoe UI" });
    public readonly fontSize = new formattingSettings.NumUpDown({ name: "fontSize", displayName: "Font size", value: 13, options: numberOptions(8, 48) });
    public readonly fontColor = new formattingSettings.ColorPicker({ name: "fontColor", displayName: "Font color", value: { value: "#605E5C" } });
    public readonly bold = new formattingSettings.ToggleSwitch({ name: "bold", displayName: "Bold", value: false });
    public readonly alignment = new formattingSettings.ItemDropdown({ name: "alignment", displayName: "Alignment", items: alignments, value: alignments[0]! });
    public readonly wrap = new formattingSettings.ToggleSwitch({ name: "wrap", displayName: "Text wrapping", value: true });
    public readonly name = "label";
    public readonly displayName = "Label";
    public readonly slices: FormattingSettingsSlice[] = [this.show, this.fontFamily, this.fontSize, this.fontColor, this.bold, this.alignment, this.wrap];
}

export class MainValueSettings extends FormattingSettingsCard {
    public readonly fontFamily = new formattingSettings.FontPicker({ name: "fontFamily", displayName: "Font family", value: "Segoe UI" });
    public readonly fontSize = new formattingSettings.NumUpDown({ name: "fontSize", displayName: "Maximum font size", value: 40, options: numberOptions(12, 96) });
    public readonly fontColor = new formattingSettings.ColorPicker({ name: "fontColor", displayName: "Font color", value: { value: "#242424" } });
    public readonly bold = new formattingSettings.ToggleSwitch({ name: "bold", displayName: "Bold", value: true });
    public readonly alignment = new formattingSettings.ItemDropdown({ name: "alignment", displayName: "Alignment", items: alignments, value: alignments[0]! });
    public readonly displayUnits = new formattingSettings.AutoDropdown({ name: "displayUnits", displayName: "Display units", value: 0 });
    public readonly decimalPlaces = new formattingSettings.ItemDropdown({ name: "decimalPlaces", displayName: "Decimal places", items: decimalPlaces, value: decimalPlaces[0]! });
    public readonly name = "mainValue";
    public readonly displayName = "Callout value";
    public readonly slices: FormattingSettingsSlice[] = [this.fontFamily, this.fontSize, this.fontColor, this.bold, this.alignment, this.displayUnits, this.decimalPlaces];

    public setFxItems(cards: CardViewModel[]): void {
        this.container = new formattingSettings.Container({ displayName: "Data colors", isEditable: false, containerItems: cards.map((card) => containerItem(card.label, [
            fxColor({ name: "fontColor", displayName: "Font color", color: card.colorOverrides.mainValueColor ?? this.fontColor.value.value, selectionId: card.selectionId }),
        ])) });
        this.fontColor.visible = false;
    }
}

export class BenchmarkSettings extends FormattingSettingsCard {
    private readonly directions = [enumMember("higher", "Higher values are better"), enumMember("lower", "Lower values are better")];
    private readonly varianceModes = [enumMember("absolute", "Absolute"), enumMember("percentage", "Percentage"), enumMember("both", "Both")];
    public readonly enabled = new formattingSettings.ToggleSwitch({ name: "enabled", displayName: "Benchmark and status", value: false });
    public readonly showReference = new formattingSettings.ToggleSwitch({ name: "showReference", displayName: "Show reference", value: true });
    public readonly showStatus = new formattingSettings.ToggleSwitch({ name: "showStatus", displayName: "Show status", value: true });
    public readonly showVariance = new formattingSettings.ToggleSwitch({ name: "showVariance", displayName: "Show variance", value: true });
    public readonly direction = new formattingSettings.ItemDropdown({ name: "direction", displayName: "Preferred direction", description: "Controls whether values above or below the reference are favorable.", items: this.directions, value: this.directions[0]! });
    public readonly tolerance = new formattingSettings.NumUpDown({ name: "tolerance", displayName: "Neutral tolerance (%)", description: "Differences within this percentage of the reference are neutral.", value: 0, options: numberOptions(0, 100) });
    public readonly positiveColor = new formattingSettings.ColorPicker({ name: "positiveColor", displayName: "Positive color", value: { value: "#107C10" } });
    public readonly neutralColor = new formattingSettings.ColorPicker({ name: "neutralColor", displayName: "Neutral color", value: { value: "#8A6D1D" } });
    public readonly negativeColor = new formattingSettings.ColorPicker({ name: "negativeColor", displayName: "Negative color", value: { value: "#C50F1F" } });
    public readonly varianceMode = new formattingSettings.ItemDropdown({ name: "varianceMode", displayName: "Variance display", items: this.varianceModes, value: this.varianceModes[1]! });
    public readonly statusIndicatorColor = new formattingSettings.ColorPicker({ name: "statusIndicatorColor", displayName: "Status indicator color", value: { value: "#8A6D1D" }, visible: false });
    public readonly name = "benchmark";
    public readonly displayName = "Benchmark and status";
    public readonly topLevelSlice = this.enabled;
    public readonly slices: FormattingSettingsSlice[] = [this.showReference, this.showStatus, this.showVariance, this.direction, this.tolerance, this.positiveColor, this.neutralColor, this.negativeColor, this.varianceMode, this.statusIndicatorColor];

    public onPreProcess(): void {
        for (const slice of this.slices) {
            slice.visible = this.enabled.value && slice !== this.statusIndicatorColor;
        }
    }

    public setFxItems(cards: CardViewModel[]): void {
        this.container = this.enabled.value ? new formattingSettings.Container({ displayName: "Status data color", isEditable: false, containerItems: cards.map((card) => containerItem(card.label, [
            fxColor({ name: "statusIndicatorColor", displayName: "Status indicator color", color: card.colorOverrides.statusIndicatorColor ?? this.statusIndicatorColor.value.value, selectionId: card.selectionId }),
        ])) }) : undefined;
    }
}

export class FlipSettings extends FormattingSettingsCard {
    private readonly positions = [enumMember("topLeft", "Top left"), enumMember("topRight", "Top right"), enumMember("bottomLeft", "Bottom left"), enumMember("bottomRight", "Bottom right")];
    public readonly enabled = new formattingSettings.ToggleSwitch({ name: "enabled", displayName: "Flip and details", description: "A flip control appears only when valid detail or enabled benchmark content exists.", value: false });
    public readonly showDetail = new formattingSettings.ToggleSwitch({ name: "showDetail", displayName: "Show Detail Value", value: true });
    public readonly position = new formattingSettings.ItemDropdown({ name: "position", displayName: "Button position", items: this.positions, value: this.positions[1]! });
    public readonly size = new formattingSettings.NumUpDown({ name: "size", displayName: "Button size", value: 28, options: numberOptions(20, 48) });
    public readonly buttonColor = new formattingSettings.ColorPicker({ name: "buttonColor", displayName: "Button icon color", value: { value: "#323130" } });
    public readonly buttonBackground = new formattingSettings.ColorPicker({ name: "buttonBackground", displayName: "Button background", value: { value: "#FFFFFF" } });
    public readonly animationDuration = new formattingSettings.NumUpDown({ name: "animationDuration", displayName: "Animation duration (ms)", value: 450, options: numberOptions(0, 2000) });
    public readonly fontFamily = new formattingSettings.FontPicker({ name: "fontFamily", displayName: "Detail font family", value: "Segoe UI" });
    public readonly fontSize = new formattingSettings.NumUpDown({ name: "fontSize", displayName: "Detail font size", value: 13, options: numberOptions(8, 40) });
    public readonly labelColor = new formattingSettings.ColorPicker({ name: "labelColor", displayName: "Detail label color", value: { value: "#605E5C" } });
    public readonly valueColor = new formattingSettings.ColorPicker({ name: "valueColor", displayName: "Detail value color", value: { value: "#242424" } });
    public readonly displayUnits = new formattingSettings.AutoDropdown({ name: "displayUnits", displayName: "Detail display units", value: 0 });
    public readonly decimalPlaces = new formattingSettings.ItemDropdown({ name: "decimalPlaces", displayName: "Detail decimal places", items: decimalPlaces, value: decimalPlaces[0]! });
    public readonly spacing = new formattingSettings.NumUpDown({ name: "spacing", displayName: "Detail spacing", value: 8, options: numberOptions(0, 32) });
    public readonly name = "flip";
    public readonly displayName = "Flip and details";
    public readonly topLevelSlice = this.enabled;
    public readonly slices: FormattingSettingsSlice[] = [this.showDetail, this.position, this.size, this.buttonColor, this.buttonBackground, this.animationDuration, this.fontFamily, this.fontSize, this.labelColor, this.valueColor, this.displayUnits, this.decimalPlaces, this.spacing];
    public onPreProcess(): void { for (const slice of this.slices) { slice.visible = this.enabled.value; } }
}

export class InteractionsSettings extends FormattingSettingsCard {
    public readonly selectionEnabled = new formattingSettings.ToggleSwitch({ name: "selectionEnabled", displayName: "Selection and filtering", description: "Effective only when the Label category supplies a Power BI identity.", value: true });
    public readonly enableFlip = new formattingSettings.ToggleSwitch({ name: "enableFlip", displayName: "Legacy enable flip", value: false, visible: false });
    public readonly name = "interactions";
    public readonly displayName = "Interactions";
    public readonly slices: FormattingSettingsSlice[] = [this.selectionEnabled, this.enableFlip];
}

class HiddenLegacyCard extends FormattingSettingsCard {
    public readonly name: string;
    public readonly displayName = "Legacy compatibility";
    public readonly visible = false;
    public readonly slices: FormattingSettingsSlice[] = [];
    public constructor(name: string) { super(); this.name = name; }
}

export class VisualFormattingSettingsModel extends FormattingSettingsModel {
    public readonly cardAppearance = new CardAppearanceSettings();
    public readonly multipleCards = new MultipleCardsSettings();
    public readonly label = new LabelSettings();
    public readonly mainValue = new MainValueSettings();
    public readonly benchmark = new BenchmarkSettings();
    public readonly flip = new FlipSettings();
    public readonly interactions = new InteractionsSettings();
    private readonly legacyDetail = new HiddenLegacyCard("detailValues");
    private readonly legacyKpi = new HiddenLegacyCard("kpiStatus");
    private readonly legacyFlip = new HiddenLegacyCard("flipBehavior");
    public readonly cards = [this.cardAppearance, this.multipleCards, this.label, this.mainValue, this.benchmark, this.flip, this.interactions, this.legacyDetail, this.legacyKpi, this.legacyFlip];

    public configureConditionalFormatting(cards: CardViewModel[]): void {
        this.cardAppearance.setFxItems(cards);
        this.mainValue.setFxItems(cards);
        this.benchmark.setFxItems(cards);
    }
}

function objectHas(objects: DataViewObjects | undefined, objectName: string, propertyName: string): boolean {
    const object = objects?.[objectName];
    return object !== undefined && Object.prototype.hasOwnProperty.call(object, propertyName);
}

function objectValue<T>(objects: DataViewObjects | undefined, objectName: string, propertyName: string): T | undefined {
    return objectHas(objects, objectName, propertyName) ? objects?.[objectName]?.[propertyName] as T : undefined;
}

function migrateSetting(setting: { value: unknown; items?: powerbi.IEnumMember[] }, value: unknown): void {
    if (setting.items) {
        const item = setting.items.find((candidate) => candidate.value === value);
        if (item) { setting.value = item; }
        return;
    }
    if (typeof value === "object" && value !== null) {
        const fill = value as { solid?: { color?: unknown }; value?: unknown };
        const color = typeof fill.solid?.color === "string" ? fill.solid.color : typeof fill.value === "string" ? fill.value : undefined;
        if (color !== undefined) { setting.value = { value: color }; return; }
    }
    setting.value = value;
}

export function hasExplicitProperty(dataView: DataView | undefined, objectName: string, propertyName: string): boolean {
    return objectHas(dataView?.metadata?.objects, objectName, propertyName);
}

export function applyFormattingMigration(settings: VisualFormattingSettingsModel, dataView: DataView | undefined): void {
    const objects = dataView?.metadata?.objects;
    if (!objectHas(objects, "flip", "enabled")) {
        if (objectHas(objects, "flipBehavior", "showButton")) {
            settings.flip.enabled.value = objectValue<boolean>(objects, "flipBehavior", "showButton") === true;
        } else if (objectHas(objects, "interactions", "enableFlip")) {
            settings.flip.enabled.value = objectValue<boolean>(objects, "interactions", "enableFlip") === true;
        } else {
            settings.flip.enabled.value = false;
        }
    }
    if (!objectHas(objects, "benchmark", "enabled")) {
        settings.benchmark.enabled.value = objectHas(objects, "kpiStatus", "show")
            ? objectValue<boolean>(objects, "kpiStatus", "show") === true
            : false;
    }
    if (!objectHas(objects, "multipleCards", "enabled")) {
        settings.multipleCards.enabled.value = false;
    }

    const legacyMappings: Array<readonly [string, string, { value: unknown }]> = [
        ["flipBehavior", "position", settings.flip.position], ["flipBehavior", "size", settings.flip.size],
        ["flipBehavior", "buttonColor", settings.flip.buttonColor], ["flipBehavior", "buttonBackground", settings.flip.buttonBackground],
        ["flipBehavior", "animationDuration", settings.flip.animationDuration], ["detailValues", "showDetail", settings.flip.showDetail],
        ["detailValues", "fontFamily", settings.flip.fontFamily], ["detailValues", "fontSize", settings.flip.fontSize],
        ["detailValues", "labelColor", settings.flip.labelColor], ["detailValues", "valueColor", settings.flip.valueColor],
        ["detailValues", "displayUnits", settings.flip.displayUnits], ["detailValues", "decimalPlaces", settings.flip.decimalPlaces],
        ["detailValues", "spacing", settings.flip.spacing], ["kpiStatus", "direction", settings.benchmark.direction],
        ["kpiStatus", "tolerance", settings.benchmark.tolerance], ["kpiStatus", "positiveColor", settings.benchmark.positiveColor],
        ["kpiStatus", "neutralColor", settings.benchmark.neutralColor], ["kpiStatus", "negativeColor", settings.benchmark.negativeColor],
        ["kpiStatus", "varianceMode", settings.benchmark.varianceMode],
    ];
    for (const [legacyObject, property, setting] of legacyMappings) {
        const newObject = legacyObject === "flipBehavior" || legacyObject === "detailValues" ? "flip" : "benchmark";
        if (!objectHas(objects, newObject, property) && objectHas(objects, legacyObject, property)) {
            const value = objectValue<unknown>(objects, legacyObject, property);
            if (value !== undefined) { migrateSetting(setting, value); }
        }
    }

    if (!objectHas(objects, "benchmark", "showVariance") && objectHas(objects, "detailValues", "showVariance")) {
        settings.benchmark.showVariance.value = objectValue<boolean>(objects, "detailValues", "showVariance") === true;
    }
    if (!objectHas(objects, "benchmark", "showReference")) {
        const hasComparison = objectHas(objects, "detailValues", "showComparison");
        const hasTarget = objectHas(objects, "detailValues", "showTarget");
        if (hasComparison || hasTarget) {
            settings.benchmark.showReference.value = (hasComparison && objectValue<boolean>(objects, "detailValues", "showComparison") === true)
                || (hasTarget && objectValue<boolean>(objects, "detailValues", "showTarget") === true);
        }
    }
}

export function getEnumSettingValue(setting: formattingSettings.ItemDropdown): string { return String(setting.value.value); }
export function getDecimalPrecision(setting: formattingSettings.ItemDropdown): number | undefined { const value = getEnumSettingValue(setting); return value === "auto" ? undefined : Number(value); }
export function getEffectiveCardMode(settings: VisualFormattingSettingsModel): EffectiveCardMode { return settings.multipleCards.enabled.value ? getEnumSettingValue(settings.multipleCards.mode) as EffectiveCardMode : "single"; }
