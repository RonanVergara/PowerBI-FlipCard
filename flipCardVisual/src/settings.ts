"use strict";

import powerbi from "powerbi-visuals-api";
import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";

import FormattingSettingsCard = formattingSettings.SimpleCard;
import FormattingSettingsModel = formattingSettings.Model;
import FormattingSettingsSlice = formattingSettings.Slice;

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

const alignments = [
    enumMember("left", "Left"),
    enumMember("center", "Center"),
    enumMember("right", "Right"),
];

const decimalPlaces = [
    enumMember("auto", "Auto"),
    enumMember("0", "0"),
    enumMember("1", "1"),
    enumMember("2", "2"),
    enumMember("3", "3"),
    enumMember("4", "4"),
];

export class CardAppearanceSettings extends FormattingSettingsCard {
    public readonly frontBackground = new formattingSettings.ColorPicker({
        name: "frontBackground",
        displayName: "Front background",
        value: { value: "#0F6CBD" },
    });

    public readonly backBackground = new formattingSettings.ColorPicker({
        name: "backBackground",
        displayName: "Back background",
        value: { value: "#F7F9FC" },
    });

    public readonly borderColor = new formattingSettings.ColorPicker({
        name: "borderColor",
        displayName: "Border color",
        value: { value: "#D1D5DB" },
    });

    public readonly borderWidth = new formattingSettings.NumUpDown({
        name: "borderWidth",
        displayName: "Border width",
        value: 1,
        options: numberOptions(0, 8),
    });

    public readonly cornerRadius = new formattingSettings.NumUpDown({
        name: "cornerRadius",
        displayName: "Corner radius",
        value: 16,
        options: numberOptions(0, 40),
    });

    public readonly shadow = new formattingSettings.ToggleSwitch({
        name: "shadow",
        displayName: "Shadow",
        value: true,
    });

    public readonly accentColor = new formattingSettings.ColorPicker({
        name: "accentColor",
        displayName: "Accent color",
        value: { value: "#2D7D9A" },
    });

    public readonly padding = new formattingSettings.NumUpDown({
        name: "padding",
        displayName: "Internal padding",
        value: 20,
        options: numberOptions(4, 40),
    });

    public readonly name = "cardAppearance";
    public readonly displayName = "Card appearance";
    public readonly slices: FormattingSettingsSlice[] = [
        this.frontBackground,
        this.backBackground,
        this.borderColor,
        this.borderWidth,
        this.cornerRadius,
        this.shadow,
        this.accentColor,
        this.padding,
    ];
}

export class LabelSettings extends FormattingSettingsCard {
    public readonly show = new formattingSettings.ToggleSwitch({
        name: "show",
        displayName: "Show",
        value: true,
    });

    public readonly fontFamily = new formattingSettings.FontPicker({
        name: "fontFamily",
        displayName: "Font family",
        value: "Segoe UI",
    });

    public readonly fontSize = new formattingSettings.NumUpDown({
        name: "fontSize",
        displayName: "Font size",
        value: 14,
        options: numberOptions(8, 48),
    });

    public readonly fontColor = new formattingSettings.ColorPicker({
        name: "fontColor",
        displayName: "Font color",
        value: { value: "#EAF3FB" },
    });

    public readonly bold = new formattingSettings.ToggleSwitch({
        name: "bold",
        displayName: "Bold",
        value: true,
    });

    public readonly alignment = new formattingSettings.ItemDropdown({
        name: "alignment",
        displayName: "Alignment",
        items: alignments,
        value: alignments[0]!,
    });

    public readonly wrap = new formattingSettings.ToggleSwitch({
        name: "wrap",
        displayName: "Text wrapping",
        value: true,
    });

    public readonly name = "label";
    public readonly displayName = "Label";
    public readonly slices: FormattingSettingsSlice[] = [
        this.show,
        this.fontFamily,
        this.fontSize,
        this.fontColor,
        this.bold,
        this.alignment,
        this.wrap,
    ];
}

export class MainValueSettings extends FormattingSettingsCard {
    public readonly fontFamily = new formattingSettings.FontPicker({
        name: "fontFamily",
        displayName: "Font family",
        value: "Segoe UI",
    });

    public readonly fontSize = new formattingSettings.NumUpDown({
        name: "fontSize",
        displayName: "Font size",
        value: 40,
        options: numberOptions(12, 96),
    });

    public readonly fontColor = new formattingSettings.ColorPicker({
        name: "fontColor",
        displayName: "Font color",
        value: { value: "#FFFFFF" },
    });

    public readonly bold = new formattingSettings.ToggleSwitch({
        name: "bold",
        displayName: "Bold",
        value: true,
    });

    public readonly alignment = new formattingSettings.ItemDropdown({
        name: "alignment",
        displayName: "Alignment",
        items: alignments,
        value: alignments[0]!,
    });

    public readonly displayUnits = new formattingSettings.AutoDropdown({
        name: "displayUnits",
        displayName: "Display units",
        value: 0,
    });

    public readonly decimalPlaces = new formattingSettings.ItemDropdown({
        name: "decimalPlaces",
        displayName: "Decimal places",
        items: decimalPlaces,
        value: decimalPlaces[0]!,
    });

    public readonly name = "mainValue";
    public readonly displayName = "Main value";
    public readonly slices: FormattingSettingsSlice[] = [
        this.fontFamily,
        this.fontSize,
        this.fontColor,
        this.bold,
        this.alignment,
        this.displayUnits,
        this.decimalPlaces,
    ];
}

export class DetailValuesSettings extends FormattingSettingsCard {
    public readonly showDetail = new formattingSettings.ToggleSwitch({ name: "showDetail", displayName: "Show detail", value: true });
    public readonly showComparison = new formattingSettings.ToggleSwitch({ name: "showComparison", displayName: "Show comparison", value: true });
    public readonly showTarget = new formattingSettings.ToggleSwitch({ name: "showTarget", displayName: "Show target", value: true });
    public readonly showVariance = new formattingSettings.ToggleSwitch({ name: "showVariance", displayName: "Show variance", value: true });
    public readonly fontFamily = new formattingSettings.FontPicker({ name: "fontFamily", displayName: "Font family", value: "Segoe UI" });
    public readonly fontSize = new formattingSettings.NumUpDown({ name: "fontSize", displayName: "Font size", value: 14, options: numberOptions(8, 40) });
    public readonly labelColor = new formattingSettings.ColorPicker({ name: "labelColor", displayName: "Label color", value: { value: "#5B6472" } });
    public readonly valueColor = new formattingSettings.ColorPicker({ name: "valueColor", displayName: "Value color", value: { value: "#1F2937" } });
    public readonly displayUnits = new formattingSettings.AutoDropdown({ name: "displayUnits", displayName: "Display units", value: 0 });
    public readonly decimalPlaces = new formattingSettings.ItemDropdown({ name: "decimalPlaces", displayName: "Decimal places", items: decimalPlaces, value: decimalPlaces[0]! });
    public readonly spacing = new formattingSettings.NumUpDown({ name: "spacing", displayName: "Spacing", value: 10, options: numberOptions(0, 32) });

    public readonly name = "detailValues";
    public readonly displayName = "Detail values";
    public readonly slices: FormattingSettingsSlice[] = [
        this.showDetail,
        this.showComparison,
        this.showTarget,
        this.showVariance,
        this.fontFamily,
        this.fontSize,
        this.labelColor,
        this.valueColor,
        this.displayUnits,
        this.decimalPlaces,
        this.spacing,
    ];
}

export class KpiStatusSettings extends FormattingSettingsCard {
    private readonly directions = [enumMember("higher", "Higher values are better"), enumMember("lower", "Lower values are better")];
    private readonly varianceModes = [enumMember("absolute", "Absolute"), enumMember("percentage", "Percentage"), enumMember("both", "Both")];
    private readonly conditionalTargets = [
        enumMember("indicator", "Status indicator only"),
        enumMember("accent", "Accent and border"),
        enumMember("mainValue", "Main value"),
        enumMember("background", "Card background"),
    ];

    public readonly show = new formattingSettings.ToggleSwitch({ name: "show", displayName: "Show status", value: true });
    public readonly direction = new formattingSettings.ItemDropdown({ name: "direction", displayName: "Preferred direction", items: this.directions, value: this.directions[0]! });
    public readonly tolerance = new formattingSettings.NumUpDown({ name: "tolerance", displayName: "Neutral tolerance (%)", value: 0, options: numberOptions(0, 100) });
    public readonly positiveColor = new formattingSettings.ColorPicker({ name: "positiveColor", displayName: "Positive color", value: { value: "#107C10" } });
    public readonly neutralColor = new formattingSettings.ColorPicker({ name: "neutralColor", displayName: "Neutral color", value: { value: "#8A6D1D" } });
    public readonly negativeColor = new formattingSettings.ColorPicker({ name: "negativeColor", displayName: "Negative color", value: { value: "#C50F1F" } });
    public readonly varianceMode = new formattingSettings.ItemDropdown({ name: "varianceMode", displayName: "Variance display", items: this.varianceModes, value: this.varianceModes[1]! });
    public readonly conditionalTarget = new formattingSettings.ItemDropdown({ name: "conditionalTarget", displayName: "Conditional color target", items: this.conditionalTargets, value: this.conditionalTargets[0]! });

    public readonly name = "kpiStatus";
    public readonly displayName = "KPI status";
    public readonly slices: FormattingSettingsSlice[] = [
        this.show,
        this.direction,
        this.tolerance,
        this.positiveColor,
        this.neutralColor,
        this.negativeColor,
        this.varianceMode,
        this.conditionalTarget,
    ];
}

export class FlipBehaviorSettings extends FormattingSettingsCard {
    private readonly positions = [
        enumMember("topLeft", "Top left"),
        enumMember("topRight", "Top right"),
        enumMember("bottomLeft", "Bottom left"),
        enumMember("bottomRight", "Bottom right"),
    ];
    private readonly faces = [enumMember("front", "Front"), enumMember("back", "Back")];

    public readonly showButton = new formattingSettings.ToggleSwitch({ name: "showButton", displayName: "Show flip button", value: true });
    public readonly position = new formattingSettings.ItemDropdown({ name: "position", displayName: "Button position", items: this.positions, value: this.positions[1]! });
    public readonly size = new formattingSettings.NumUpDown({ name: "size", displayName: "Button size", value: 30, options: numberOptions(20, 48) });
    public readonly buttonColor = new formattingSettings.ColorPicker({ name: "buttonColor", displayName: "Button icon color", value: { value: "#0F6CBD" } });
    public readonly buttonBackground = new formattingSettings.ColorPicker({ name: "buttonBackground", displayName: "Button background", value: { value: "#FFFFFF" } });
    public readonly animationDuration = new formattingSettings.NumUpDown({ name: "animationDuration", displayName: "Animation duration (ms)", value: 600, options: numberOptions(0, 2000) });
    public readonly defaultFace = new formattingSettings.ItemDropdown({ name: "defaultFace", displayName: "Default face", items: this.faces, value: this.faces[0]! });

    public readonly name = "flipBehavior";
    public readonly displayName = "Flip behavior";
    public readonly slices: FormattingSettingsSlice[] = [
        this.showButton,
        this.position,
        this.size,
        this.buttonColor,
        this.buttonBackground,
        this.animationDuration,
        this.defaultFace,
    ];
}

export class VisualFormattingSettingsModel extends FormattingSettingsModel {
    public readonly cardAppearance = new CardAppearanceSettings();
    public readonly label = new LabelSettings();
    public readonly mainValue = new MainValueSettings();
    public readonly detailValues = new DetailValuesSettings();
    public readonly kpiStatus = new KpiStatusSettings();
    public readonly flipBehavior = new FlipBehaviorSettings();

    public readonly cards = [
        this.cardAppearance,
        this.label,
        this.mainValue,
        this.detailValues,
        this.kpiStatus,
        this.flipBehavior,
    ];
}

export function getEnumSettingValue(setting: formattingSettings.ItemDropdown): string {
    return String(setting.value.value);
}

export function getDecimalPrecision(setting: formattingSettings.ItemDropdown): number | undefined {
    const value = getEnumSettingValue(setting);
    return value === "auto" ? undefined : Number(value);
}
