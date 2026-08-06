"use strict";

import powerbi from "powerbi-visuals-api";
import { dataViewWildcard } from "powerbi-visuals-utils-dataviewutils";
import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";

import DataView = powerbi.DataView;
import DataViewObjects = powerbi.DataViewObjects;
import ISelectionId = powerbi.visuals.ISelectionId;
import FormattingSettingsCard = formattingSettings.CompositeCard;
import FormattingSettingsGroup = formattingSettings.Group;
import FormattingSettingsModel = formattingSettings.Model;
import FormattingSettingsSimpleCard = formattingSettings.SimpleCard;
import FormattingSettingsSlice = formattingSettings.Slice;

import { CardViewModel, EffectiveCardMode } from "./types";

function enumMember(value: string, displayName: string): powerbi.IEnumMember { return { value, displayName }; }

// These Power BI enums are declaration-only const enums and are not present at runtime.
const validatorMinimum = 0 as powerbi.visuals.ValidatorType.Min;
const validatorMaximum = 1 as powerbi.visuals.ValidatorType.Max;
const instancesAndTotals = 0 as dataViewWildcard.DataViewWildcardMatchingOption;
const constantOrRule = 3 as powerbi.VisualEnumerationInstanceKinds;

function numberOptions(minimum: number, maximum: number): powerbi.visuals.NumUpDownFormat {
    return {
        minValue: { type: validatorMinimum, value: minimum },
        maxValue: { type: validatorMaximum, value: maximum },
    };
}

const alignments = [enumMember("left", "Left"), enumMember("center", "Center"), enumMember("right", "Right")];
const decimalPlaces = ["auto", "0", "1", "2", "3", "4"].map((value) => enumMember(value, value === "auto" ? "Auto" : value));
const wildcardSelector = dataViewWildcard.createDataViewWildcardSelector(instancesAndTotals);
if (!wildcardSelector?.data?.length) { throw new Error("dataViewWildcard.createDataViewWildcardSelector returned no selector"); }

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

function group(name: string, displayName: string, slices: FormattingSettingsSlice[]): FormattingSettingsGroup {
    return new formattingSettings.Group({ name, displayName, slices });
}

export class CardAppearanceSettings extends FormattingSettingsCard {
    public readonly frontBackground = new formattingSettings.ColorPicker({ name: "frontBackground", displayName: "Background", value: { value: "#FFFFFF" } });
    public readonly backBackground = new formattingSettings.ColorPicker({ name: "backBackground", displayName: "Legacy back background", value: { value: "#FFFFFF" }, visible: false });
    public readonly borderColor = new formattingSettings.ColorPicker({ name: "borderColor", displayName: "Border color", value: { value: "#D1D5DB" } });
    public readonly borderWidth = new formattingSettings.NumUpDown({ name: "borderWidth", displayName: "Border width", value: 1, options: numberOptions(0, 8) });
    public readonly cornerRadius = new formattingSettings.NumUpDown({ name: "cornerRadius", displayName: "Corner radius", value: 8, options: numberOptions(0, 40) });
    public readonly shadow = new formattingSettings.ToggleSwitch({ name: "shadow", displayName: "Shadow", value: false });
    public readonly accentEnabled = new formattingSettings.ToggleSwitch({ name: "accentEnabled", displayName: "Accent strip", value: false });
    public readonly accentColor = new formattingSettings.ColorPicker({ name: "accentColor", displayName: "Accent color", value: { value: "#605E5C" } });
    public readonly padding = new formattingSettings.NumUpDown({ name: "padding", displayName: "Internal padding", value: 16, options: numberOptions(4, 40) });
    public readonly name = "cardAppearance";
    public readonly displayName = "Card frame";
    public readonly layoutGroup = group("cardAppearanceLayoutGroup", "Layout", [this.borderWidth, this.cornerRadius, this.padding]);
    public readonly colorsGroup = group("cardAppearanceColorsGroup", "Colors", [this.frontBackground, this.backBackground, this.borderColor, this.accentColor]);
    public readonly decorationGroup = group("cardAppearanceDecorationGroup", "Decoration", [this.shadow, this.accentEnabled]);
    public readonly groups = [this.layoutGroup, this.colorsGroup, this.decorationGroup];

    public setFxItems(cards: CardViewModel[]): void {
        this.colorsGroup.container = new formattingSettings.Container({
            displayName: "Data colors",
            isEditable: false,
            containerItems: cards.map((card) => containerItem(card.label, [
                fxColor({ name: "frontBackground", displayName: "Background", color: card.colorOverrides.frontBackground ?? this.frontBackground.value.value, selectionId: card.selectionId }),
                fxColor({ name: "borderColor", displayName: "Border", color: card.colorOverrides.borderColor ?? this.borderColor.value.value, selectionId: card.selectionId }),
                fxColor({ name: "accentColor", displayName: "Accent", color: card.colorOverrides.accentColor ?? this.accentColor.value.value, selectionId: card.selectionId }),
            ])),
        });
        this.frontBackground.visible = false;
        this.backBackground.visible = false;
        this.borderColor.visible = false;
        this.accentColor.visible = false;
    }
}

export class MultipleCardsSettings extends FormattingSettingsCard {
    private readonly modes = [enumMember("auto", "Auto"), enumMember("multiple", "Multiple")];
    private readonly sizingModes = [enumMember("fit", "Fit to space"), enumMember("fixed", "Fixed size")];
    private readonly columnModes = [enumMember("automatic", "Automatic"), enumMember("custom", "Custom")];
    public readonly enabled = new formattingSettings.ToggleSwitch({ name: "enabled", displayName: "Multiple cards", description: "Off is strict Single mode. Enable to choose Auto or Multiple.", value: false });
    public readonly mode = new formattingSettings.ItemDropdown({ name: "mode", displayName: "Card mode", items: this.modes, value: this.modes[0]! });
    public readonly sizing = new formattingSettings.ItemDropdown({ name: "sizing", displayName: "Sizing", items: this.sizingModes, value: this.sizingModes[0]! });
    public readonly columnCalculation = new formattingSettings.ItemDropdown({ name: "columnCalculation", displayName: "Columns", items: this.columnModes, value: this.columnModes[0]! });
    public readonly columns = new formattingSettings.NumUpDown({ name: "columns", displayName: "Column count", value: 2, options: numberOptions(1, 20) });
    public readonly gap = new formattingSettings.NumUpDown({ name: "gap", displayName: "Card gap", value: 8, options: numberOptions(0, 40) });
    public readonly preferredWidth = new formattingSettings.NumUpDown({ name: "preferredWidth", displayName: "Preferred width", value: 160, options: numberOptions(96, 600) });
    public readonly preferredHeight = new formattingSettings.NumUpDown({ name: "preferredHeight", displayName: "Preferred height", value: 110, options: numberOptions(64, 500) });
    public readonly fixedWidth = new formattingSettings.NumUpDown({ name: "fixedWidth", displayName: "Card width", value: 240, options: numberOptions(96, 800) });
    public readonly fixedHeight = new formattingSettings.NumUpDown({ name: "fixedHeight", displayName: "Card height", value: 160, options: numberOptions(64, 600) });
    public readonly name = "multipleCards";
    public readonly displayName = "Multiple-card layout";
    public readonly topLevelSlice = this.enabled;
    public readonly layoutGroup = group("multipleCardsLayoutGroup", "Layout", [this.mode, this.sizing, this.columnCalculation, this.columns, this.gap, this.preferredWidth, this.preferredHeight, this.fixedWidth, this.fixedHeight]);
    public readonly groups = [this.layoutGroup];

    public onPreProcess(): void {
        const show = this.enabled.value;
        this.layoutGroup.visible = show;
        this.columns.visible = getEnumSettingValue(this.columnCalculation) === "custom";
        this.preferredWidth.visible = getEnumSettingValue(this.sizing) === "fit";
        this.preferredHeight.visible = getEnumSettingValue(this.sizing) === "fit";
        this.fixedWidth.visible = getEnumSettingValue(this.sizing) === "fixed";
        this.fixedHeight.visible = getEnumSettingValue(this.sizing) === "fixed";
    }
}

export class LabelSettings extends FormattingSettingsCard {
    private readonly presentationModes = [enumMember("auto", "Auto"), enumMember("stacked", "Stacked"), enumMember("split", "Split")];
    private readonly verticalAlignments = [enumMember("top", "Top"), enumMember("center", "Center"), enumMember("bottom", "Bottom")];
    private readonly priorities = [enumMember("automatic", "Automatic"), enumMember("insight", "Insight"), enumMember("status", "Status")];
    public readonly presentationMode = new formattingSettings.ItemDropdown({ name: "presentationMode", displayName: "Presentation", items: this.presentationModes, value: this.presentationModes[0]! });
    public readonly verticalAlignment = new formattingSettings.ItemDropdown({ name: "verticalAlignment", displayName: "Vertical alignment", items: this.verticalAlignments, value: this.verticalAlignments[1]! });
    public readonly sectionSpacing = new formattingSettings.NumUpDown({ name: "sectionSpacing", displayName: "Section spacing", value: 8, options: numberOptions(0, 40) });
    public readonly dividerEnabled = new formattingSettings.ToggleSwitch({ name: "dividerEnabled", displayName: "Divider", value: false });
    public readonly dividerColor = new formattingSettings.ColorPicker({ name: "dividerColor", displayName: "Divider color", value: { value: "#E5E7EB" } });
    public readonly responsivePriority = new formattingSettings.ItemDropdown({ name: "responsivePriority", displayName: "Responsive priority", items: this.priorities, value: this.priorities[0]! });
    public readonly show = new formattingSettings.ToggleSwitch({ name: "show", displayName: "Show", value: true });
    public readonly fontFamily = new formattingSettings.FontPicker({ name: "fontFamily", displayName: "Font family", value: "Segoe UI" });
    public readonly fontSize = new formattingSettings.NumUpDown({ name: "fontSize", displayName: "Font size", value: 13, options: numberOptions(8, 48) });
    public readonly fontColor = new formattingSettings.ColorPicker({ name: "fontColor", displayName: "Font color", value: { value: "#605E5C" } });
    public readonly bold = new formattingSettings.ToggleSwitch({ name: "bold", displayName: "Bold", value: false });
    public readonly alignment = new formattingSettings.ItemDropdown({ name: "alignment", displayName: "Alignment", items: alignments, value: alignments[0]! });
    public readonly wrap = new formattingSettings.ToggleSwitch({ name: "wrap", displayName: "Text wrapping", value: true });
    public readonly name = "label";
    public readonly displayName = "Front — Label";
    public readonly layoutGroup = group("frontLabelLayoutGroup", "Layout", [this.presentationMode, this.verticalAlignment, this.sectionSpacing, this.dividerEnabled, this.responsivePriority]);
    public readonly typographyGroup = group("frontLabelTypographyGroup", "Typography", [this.show, this.fontFamily, this.fontSize, this.bold, this.alignment, this.wrap]);
    public readonly colorsGroup = group("frontLabelColorsGroup", "Colors", [this.fontColor, this.dividerColor]);
    public readonly groups = [this.layoutGroup, this.typographyGroup, this.colorsGroup];
    public onPreProcess(): void { this.dividerColor.visible = this.dividerEnabled.value; }
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
    public readonly displayName = "Front — Callout";
    public readonly typographyGroup = group("frontCalloutTypographyGroup", "Typography", [this.fontFamily, this.fontSize, this.bold, this.alignment]);
    public readonly numberFormatGroup = group("frontCalloutNumberFormatGroup", "Number format", [this.displayUnits, this.decimalPlaces]);
    public readonly colorsGroup = group("frontCalloutColorsGroup", "Colors", [this.fontColor]);
    public readonly groups = [this.typographyGroup, this.numberFormatGroup, this.colorsGroup];

    public setFxItems(cards: CardViewModel[]): void {
        this.colorsGroup.container = new formattingSettings.Container({ displayName: "Data colors", isEditable: false, containerItems: cards.map((card) => containerItem(card.label, [
            fxColor({ name: "fontColor", displayName: "Font color", color: card.colorOverrides.mainValueColor ?? this.fontColor.value.value, selectionId: card.selectionId }),
        ])) });
        this.fontColor.visible = false;
    }
}

export class BenchmarkSettings extends FormattingSettingsCard {
    private readonly directions = [enumMember("higher", "Higher values are better"), enumMember("lower", "Lower values are better")];
    private readonly varianceModes = [enumMember("absolute", "Absolute"), enumMember("percentage", "Percentage"), enumMember("both", "Both")];
    private readonly statusPresentations = [enumMember("pill", "Pill"), enumMember("text", "Text"), enumMember("iconOnly", "Icon only")];
    public readonly enabled = new formattingSettings.ToggleSwitch({ name: "enabled", displayName: "Benchmark and status", value: false });
    public readonly showReference = new formattingSettings.ToggleSwitch({ name: "showReference", displayName: "Show secondary reference", value: true });
    public readonly showStatus = new formattingSettings.ToggleSwitch({ name: "showStatus", displayName: "Show status", value: true });
    public readonly showVariance = new formattingSettings.ToggleSwitch({ name: "showVariance", displayName: "Show insight", value: true });
    public readonly insightIcon = new formattingSettings.ToggleSwitch({ name: "insightIcon", displayName: "Insight icon", value: false });
    public readonly statusPresentation = new formattingSettings.ItemDropdown({ name: "statusPresentation", displayName: "Status presentation", items: this.statusPresentations, value: this.statusPresentations[0]! });
    public readonly direction = new formattingSettings.ItemDropdown({ name: "direction", displayName: "Preferred direction", items: this.directions, value: this.directions[0]! });
    public readonly tolerance = new formattingSettings.NumUpDown({ name: "tolerance", displayName: "Neutral tolerance (%)", value: 0, options: numberOptions(0, 100) });
    public readonly varianceMode = new formattingSettings.ItemDropdown({ name: "varianceMode", displayName: "Variance display", items: this.varianceModes, value: this.varianceModes[1]! });
    public readonly positiveColor = new formattingSettings.ColorPicker({ name: "positiveColor", displayName: "Positive color", value: { value: "#107C10" } });
    public readonly neutralColor = new formattingSettings.ColorPicker({ name: "neutralColor", displayName: "Neutral color", value: { value: "#8A6D1D" } });
    public readonly negativeColor = new formattingSettings.ColorPicker({ name: "negativeColor", displayName: "Negative color", value: { value: "#C50F1F" } });
    public readonly insightBackgroundEnabled = new formattingSettings.ToggleSwitch({ name: "insightBackgroundEnabled", displayName: "Insight background", value: false });
    public readonly insightBackground = new formattingSettings.ColorPicker({ name: "insightBackground", displayName: "Insight background color", value: { value: "#F3F2F1" } });
    public readonly statusBackground = new formattingSettings.ColorPicker({ name: "statusBackground", displayName: "Status background", value: { value: "#FFFFFF" } });
    public readonly statusIndicatorColor = new formattingSettings.ColorPicker({ name: "statusIndicatorColor", displayName: "Status indicator color", value: { value: "#8A6D1D" }, visible: false });
    public readonly name = "benchmark";
    public readonly displayName = "Front — Insight and status";
    public readonly topLevelSlice = this.enabled;
    public readonly layoutGroup = group("frontInsightStatusLayoutGroup", "Layout", [this.showReference, this.showStatus, this.showVariance, this.insightIcon, this.statusPresentation, this.direction, this.tolerance, this.varianceMode]);
    public readonly colorsGroup = group("frontInsightStatusColorsGroup", "Colors", [this.positiveColor, this.neutralColor, this.negativeColor, this.insightBackgroundEnabled, this.insightBackground, this.statusBackground, this.statusIndicatorColor]);
    public readonly groups = [this.layoutGroup, this.colorsGroup];

    public onPreProcess(): void {
        this.layoutGroup.visible = this.enabled.value;
        this.colorsGroup.visible = this.enabled.value;
        this.insightBackground.visible = this.insightBackgroundEnabled.value;
        this.statusBackground.visible = getEnumSettingValue(this.statusPresentation) === "pill";
        this.statusIndicatorColor.visible = false;
    }

    public setFxItems(cards: CardViewModel[]): void {
        this.colorsGroup.container = this.enabled.value ? new formattingSettings.Container({ displayName: "Status data color", isEditable: false, containerItems: cards.map((card) => containerItem(card.label, [
            fxColor({ name: "statusIndicatorColor", displayName: "Status indicator color", color: card.colorOverrides.statusIndicatorColor ?? this.statusIndicatorColor.value.value, selectionId: card.selectionId }),
        ])) }) : undefined;
    }
}

export class FlipSettings extends FormattingSettingsCard {
    private readonly positions = [enumMember("topLeft", "Top left"), enumMember("topRight", "Top right"), enumMember("bottomLeft", "Bottom left"), enumMember("bottomRight", "Bottom right")];
    private readonly backLayouts = [enumMember("auto", "Auto"), enumMember("list", "List"), enumMember("tiles", "Tiles")];
    private readonly titleSources = [enumMember("automatic", "Automatic — Details"), enumMember("category", "Category label"), enumMember("custom", "Custom text")];
    private readonly emphasisModes = [enumMember("standard", "Standard"), enumMember("strong", "Strong")];
    private readonly controlIcons = [enumMember("information", "Information"), enumMember("rotate", "Rotate"), enumMember("chevron", "Chevron")];
    private readonly controlStyles = [enumMember("ghost", "Ghost"), enumMember("outline", "Outline"), enumMember("filled", "Filled")];
    private readonly controlShapes = [enumMember("circle", "Circle"), enumMember("roundedSquare", "Rounded square")];
    private readonly motionStyles = [enumMember("horizontal", "Horizontal flip"), enumMember("vertical", "Vertical flip"), enumMember("fade", "Fade"), enumMember("none", "None")];
    private readonly horizontalDirections = [enumMember("left", "Left"), enumMember("right", "Right")];
    private readonly verticalDirections = [enumMember("up", "Up"), enumMember("down", "Down")];
    private readonly easings = [enumMember("smooth", "Smooth"), enumMember("snappy", "Snappy"), enumMember("gentle", "Gentle")];
    private readonly perspectives = [enumMember("subtle", "Subtle"), enumMember("standard", "Standard"), enumMember("deep", "Deep")];
    public readonly enabled = new formattingSettings.ToggleSwitch({ name: "enabled", displayName: "Flip and details", value: false });
    public readonly showDetail = new formattingSettings.ToggleSwitch({ name: "showDetail", displayName: "Show Detail Value", value: true });
    public readonly backLayout = new formattingSettings.ItemDropdown({ name: "backLayout", displayName: "Back layout", items: this.backLayouts, value: this.backLayouts[0]! });
    public readonly backTitleSource = new formattingSettings.ItemDropdown({ name: "backTitleSource", displayName: "Back title", items: this.titleSources, value: this.titleSources[0]! });
    public readonly customBackTitle = new formattingSettings.TextInput({ name: "customBackTitle", displayName: "Custom title", value: "", placeholder: "Details" });
    public readonly detailEmphasis = new formattingSettings.ItemDropdown({ name: "detailEmphasis", displayName: "Detail emphasis", items: this.emphasisModes, value: this.emphasisModes[1]! });
    public readonly sectionDividers = new formattingSettings.ToggleSwitch({ name: "sectionDividers", displayName: "Section dividers", value: false });
    public readonly itemBackgroundEnabled = new formattingSettings.ToggleSwitch({ name: "itemBackgroundEnabled", displayName: "Row or tile background", value: false });
    public readonly backLabelAlignment = new formattingSettings.ItemDropdown({ name: "backLabelAlignment", displayName: "Label alignment", items: alignments, value: alignments[0]! });
    public readonly backValueAlignment = new formattingSettings.ItemDropdown({ name: "backValueAlignment", displayName: "Value alignment", items: alignments, value: alignments[2]! });
    public readonly fontFamily = new formattingSettings.FontPicker({ name: "fontFamily", displayName: "Detail font family", value: "Segoe UI" });
    public readonly fontSize = new formattingSettings.NumUpDown({ name: "fontSize", displayName: "Detail font size", value: 13, options: numberOptions(8, 40) });
    public readonly displayUnits = new formattingSettings.AutoDropdown({ name: "displayUnits", displayName: "Detail display units", value: 0 });
    public readonly decimalPlaces = new formattingSettings.ItemDropdown({ name: "decimalPlaces", displayName: "Detail decimal places", items: decimalPlaces, value: decimalPlaces[0]! });
    public readonly spacing = new formattingSettings.NumUpDown({ name: "spacing", displayName: "Detail spacing", value: 8, options: numberOptions(0, 32) });
    public readonly backHeaderBackground = new formattingSettings.ColorPicker({ name: "backHeaderBackground", displayName: "Header background", value: { value: "#FFFFFF" } });
    public readonly backHeaderTextColor = new formattingSettings.ColorPicker({ name: "backHeaderTextColor", displayName: "Header text", value: { value: "#242424" } });
    public readonly backContentBackground = new formattingSettings.ColorPicker({ name: "backContentBackground", displayName: "Content background", value: { value: "#FFFFFF" } });
    public readonly labelColor = new formattingSettings.ColorPicker({ name: "labelColor", displayName: "Detail label color", value: { value: "#605E5C" } });
    public readonly valueColor = new formattingSettings.ColorPicker({ name: "valueColor", displayName: "Detail value color", value: { value: "#242424" } });
    public readonly backDividerColor = new formattingSettings.ColorPicker({ name: "backDividerColor", displayName: "Divider color", value: { value: "#E5E7EB" } });
    public readonly itemBackground = new formattingSettings.ColorPicker({ name: "itemBackground", displayName: "Row or tile background color", value: { value: "#F3F2F1" } });
    public readonly position = new formattingSettings.ItemDropdown({ name: "position", displayName: "Button position", items: this.positions, value: this.positions[1]! });
    public readonly size = new formattingSettings.NumUpDown({ name: "size", displayName: "Button size", value: 28, options: numberOptions(20, 48) });
    public readonly buttonColor = new formattingSettings.ColorPicker({ name: "buttonColor", displayName: "Button icon color", value: { value: "#323130" } });
    public readonly buttonBackground = new formattingSettings.ColorPicker({ name: "buttonBackground", displayName: "Button background", value: { value: "#FFFFFF" } });
    public readonly controlIcon = new formattingSettings.ItemDropdown({ name: "controlIcon", displayName: "Icon", items: this.controlIcons, value: this.controlIcons[1]! });
    public readonly controlStyle = new formattingSettings.ItemDropdown({ name: "controlStyle", displayName: "Style", items: this.controlStyles, value: this.controlStyles[1]! });
    public readonly controlShape = new formattingSettings.ItemDropdown({ name: "controlShape", displayName: "Shape", items: this.controlShapes, value: this.controlShapes[0]! });
    public readonly showDetailsText = new formattingSettings.ToggleSwitch({ name: "showDetailsText", displayName: "Details text cue", value: false });
    public readonly motionStyle = new formattingSettings.ItemDropdown({ name: "motionStyle", displayName: "Motion style", items: this.motionStyles, value: this.motionStyles[0]! });
    public readonly horizontalDirection = new formattingSettings.ItemDropdown({ name: "horizontalDirection", displayName: "Direction", items: this.horizontalDirections, value: this.horizontalDirections[1]! });
    public readonly verticalDirection = new formattingSettings.ItemDropdown({ name: "verticalDirection", displayName: "Direction", items: this.verticalDirections, value: this.verticalDirections[0]! });
    public readonly easing = new formattingSettings.ItemDropdown({ name: "easing", displayName: "Easing", items: this.easings, value: this.easings[0]! });
    public readonly animationDuration = new formattingSettings.NumUpDown({ name: "animationDuration", displayName: "Animation duration (ms)", value: 450, options: numberOptions(0, 2000) });
    public readonly perspective = new formattingSettings.ItemDropdown({ name: "perspective", displayName: "Perspective", items: this.perspectives, value: this.perspectives[1]! });
    public readonly name = "flip";
    public readonly displayName = "Back face and flip motion";
    public readonly topLevelSlice = this.enabled;
    public readonly layoutGroup = group("backFaceLayoutGroup", "Layout", [this.showDetail, this.backLayout, this.backTitleSource, this.customBackTitle, this.detailEmphasis, this.sectionDividers, this.itemBackgroundEnabled, this.backLabelAlignment, this.backValueAlignment, this.spacing]);
    public readonly typographyGroup = group("backFaceTypographyGroup", "Typography", [this.fontFamily, this.fontSize, this.displayUnits, this.decimalPlaces]);
    public readonly colorsGroup = group("backFaceColorsGroup", "Colors", [this.backHeaderBackground, this.backHeaderTextColor, this.backContentBackground, this.labelColor, this.valueColor, this.backDividerColor, this.itemBackground]);
    public readonly controlGroup = group("flipControlGroup", "Control", [this.position, this.size, this.buttonColor, this.buttonBackground, this.controlIcon, this.controlStyle, this.controlShape, this.showDetailsText]);
    public readonly motionGroup = group("flipMotionGroup", "Motion", [this.motionStyle, this.horizontalDirection, this.verticalDirection, this.easing, this.animationDuration, this.perspective]);
    public readonly groups = [this.layoutGroup, this.typographyGroup, this.colorsGroup, this.controlGroup, this.motionGroup];

    public onPreProcess(): void {
        const enabled = this.enabled.value;
        this.layoutGroup.visible = enabled;
        this.typographyGroup.visible = enabled;
        this.colorsGroup.visible = enabled;
        this.controlGroup.visible = enabled;
        this.motionGroup.visible = enabled;
        this.customBackTitle.visible = getEnumSettingValue(this.backTitleSource) === "custom";
        this.backDividerColor.visible = this.sectionDividers.value;
        this.itemBackground.visible = this.itemBackgroundEnabled.value;
        const motion = getEnumSettingValue(this.motionStyle);
        const hasMotion = motion !== "none";
        this.horizontalDirection.visible = motion === "horizontal";
        this.verticalDirection.visible = motion === "vertical";
        this.easing.visible = hasMotion;
        this.animationDuration.visible = hasMotion;
        this.perspective.visible = motion === "horizontal" || motion === "vertical";
    }
}

export class InteractionsSettings extends FormattingSettingsCard {
    public readonly selectionEnabled = new formattingSettings.ToggleSwitch({ name: "selectionEnabled", displayName: "Selection and filtering", value: true });
    public readonly enableFlip = new formattingSettings.ToggleSwitch({ name: "enableFlip", displayName: "Legacy enable flip", value: false, visible: false });
    public readonly name = "interactions";
    public readonly displayName = "Interactions";
    public readonly controlGroup = group("interactionsControlGroup", "Control", [this.selectionEnabled, this.enableFlip]);
    public readonly groups = [this.controlGroup];
}

class HiddenLegacyCard extends FormattingSettingsSimpleCard {
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

function migrateSetting(setting: { value: unknown; items?: Array<{ value: powerbi.EnumMemberValue }> }, value: unknown): void {
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
        if (objectHas(objects, "flipBehavior", "showButton")) { settings.flip.enabled.value = objectValue<boolean>(objects, "flipBehavior", "showButton") === true; }
        else if (objectHas(objects, "interactions", "enableFlip")) { settings.flip.enabled.value = objectValue<boolean>(objects, "interactions", "enableFlip") === true; }
        else { settings.flip.enabled.value = false; }
    }
    if (!objectHas(objects, "benchmark", "enabled")) {
        settings.benchmark.enabled.value = objectHas(objects, "kpiStatus", "show") ? objectValue<boolean>(objects, "kpiStatus", "show") === true : false;
    }
    if (!objectHas(objects, "multipleCards", "enabled")) { settings.multipleCards.enabled.value = false; }

    const legacyMappings: Array<readonly [string, string, { value: unknown; items?: Array<{ value: powerbi.EnumMemberValue }> }]> = [
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

    if (objectHas(objects, "cardAppearance", "backBackground")) {
        const legacyBack = objectValue<unknown>(objects, "cardAppearance", "backBackground");
        if (legacyBack !== undefined) {
            if (!objectHas(objects, "flip", "backHeaderBackground")) { migrateSetting(settings.flip.backHeaderBackground, legacyBack); }
            if (!objectHas(objects, "flip", "backContentBackground")) { migrateSetting(settings.flip.backContentBackground, legacyBack); }
            if (!objectHas(objects, "benchmark", "statusBackground")) { migrateSetting(settings.benchmark.statusBackground, legacyBack); }
        }
    }
    if (!objectHas(objects, "flip", "backHeaderTextColor") && objectHas(objects, "flip", "valueColor")) {
        const legacyHeaderText = objectValue<unknown>(objects, "flip", "valueColor");
        if (legacyHeaderText !== undefined) { migrateSetting(settings.flip.backHeaderTextColor, legacyHeaderText); }
    }
}

export function getEnumSettingValue(setting: formattingSettings.ItemDropdown): string { return String(setting.value.value); }
export function getDecimalPrecision(setting: formattingSettings.ItemDropdown): number | undefined { const value = getEnumSettingValue(setting); return value === "auto" ? undefined : Number(value); }
export function getEffectiveCardMode(settings: VisualFormattingSettingsModel): EffectiveCardMode { return settings.multipleCards.enabled.value ? getEnumSettingValue(settings.multipleCards.mode) as EffectiveCardMode : "single"; }
export function getSectionSpacing(settings: VisualFormattingSettingsModel): number { return Math.max(0, Math.min(40, settings.label.sectionSpacing.value)); }
export function getBackTitle(settings: VisualFormattingSettingsModel, categoryLabel: string): string {
    const source = getEnumSettingValue(settings.flip.backTitleSource);
    if (source === "category") { return categoryLabel; }
    if (source === "custom") { return settings.flip.customBackTitle.value.trim() || "Details"; }
    return "Details";
}
