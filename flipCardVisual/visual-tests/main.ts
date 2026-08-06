import powerbi from "powerbi-visuals-api";
import "@fontsource/inter/400.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";

import DataView = powerbi.DataView;
import DataViewCategoryColumn = powerbi.DataViewCategoryColumn;
import DataViewValueColumn = powerbi.DataViewValueColumn;
import ISelectionId = powerbi.visuals.ISelectionId;
import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import PrimitiveValue = powerbi.PrimitiveValue;

import { Visual } from "../src/visual";

type ScenarioName = "four320" | "four660" | "highContrast" | "listBack" | "longNegative" | "narrowStacked" | "single320" | "tilesBack" | "wideSplit";

interface Scenario {
    readonly dataView: DataView;
    readonly height: number;
    readonly highContrast?: boolean;
    readonly width: number;
}

interface HarnessState {
    readonly contextMenus: number;
    readonly selectionCalls: number;
    readonly selectionClears: number;
    readonly visual: Visual;
}

declare global {
    interface Window { flipHarness: HarnessState; }
}

const url = new URL(window.location.href);
const scenarioName = (url.searchParams.get("case") ?? "single320") as ScenarioName;
const motionStyle = url.searchParams.get("motion") ?? "horizontal";
const direction = url.searchParams.get("direction") ?? "right";

function valueColumn(role: string, displayName: string, values: PrimitiveValue[], format = "$#,0.0\"K\""): DataViewValueColumn {
    return { source: { displayName, format, queryName: `Measures.${role}`, roles: { [role]: true }, type: { numeric: true } }, values } as DataViewValueColumn;
}

function selectionId(key: string): ISelectionId {
    return {
        equals: (other: ISelectionId) => other.getKey() === key,
        getKey: () => key,
        getSelector: () => ({ data: [{ scopeId: { comparison: 0, expr: { kind: 0 } } }] }) as unknown as powerbi.data.Selector,
        getSelectorByColumn: () => ({}),
        hasIdentity: () => true,
        includes: (other: ISelectionId) => other.getKey() === key,
    } as unknown as ISelectionId;
}

function dataView(
    labels: string[],
    values: number[],
    objects: powerbi.DataViewObjects,
    options: { readonly comparison?: number[]; readonly detail?: number[]; readonly target?: number[] } = {},
): DataView {
    const category: DataViewCategoryColumn = {
        identity: labels.map((label) => ({ key: label })) as unknown as DataViewCategoryColumn["identity"],
        source: { displayName: "Business unit", queryName: "Business.Unit", roles: { cardLabel: true } },
        values: labels,
    } as DataViewCategoryColumn;
    const columns: DataViewValueColumn[] = [valueColumn("cardValue", "Revenue", values)];
    if (options.detail) { columns.push(valueColumn("detailValue", "Orders", options.detail, "#,0")); }
    if (options.comparison) { columns.push(valueColumn("comparisonValue", "Previous Month", options.comparison)); }
    if (options.target) { columns.push(valueColumn("targetValue", "Target", options.target)); }
    columns.push(valueColumn("tooltips", "Owner score", values.map((_value, index) => 90 + index), "#,0"));
    return {
        categorical: { categories: [category], values: columns as unknown as powerbi.DataViewValueColumns },
        metadata: { columns: [category.source, ...columns.map((column) => column.source)], objects },
    } as DataView;
}

function baseObjects(overrides: powerbi.DataViewObjects = {}): powerbi.DataViewObjects {
    return {
        cardAppearance: { accentColor: { solid: { color: "#2563EB" } }, accentEnabled: true, cornerRadius: 12, padding: 14 },
        label: { fontFamily: "Inter", presentationMode: "auto", sectionSpacing: 8 },
        mainValue: { decimalPlaces: "1", displayUnits: 0, fontFamily: "Inter", fontSize: 42 },
        benchmark: { enabled: true, insightBackgroundEnabled: true, showReference: true, statusPresentation: "pill" },
        flip: {
            animationDuration: 600,
            backLayout: "auto",
            controlIcon: "rotate",
            controlShape: "circle",
            controlStyle: "outline",
            easing: "smooth",
            enabled: true,
            decimalPlaces: "1",
            displayUnits: 0,
            fontFamily: "Inter",
            horizontalDirection: direction === "left" ? "left" : "right",
            motionStyle,
            perspective: "standard",
            showDetailsText: false,
            verticalDirection: direction === "down" ? "down" : "up",
        },
        ...overrides,
    };
}

function scenario(name: ScenarioName): Scenario {
    const singleData = { comparison: [112], detail: [1_842], target: [120] };
    if (name === "single320") { return { width: 320, height: 180, dataView: dataView(["Revenue"], [125.5], baseObjects({ flip: { ...baseObjects().flip, showDetailsText: true } }), singleData) }; }
    if (name === "wideSplit") { return { width: 520, height: 210, dataView: dataView(["Revenue"], [125.5], baseObjects({ label: { fontFamily: "Inter", presentationMode: "split" } }), singleData) }; }
    if (name === "narrowStacked") { return { width: 260, height: 200, dataView: dataView(["Revenue"], [125.5], baseObjects({ label: { fontFamily: "Inter", presentationMode: "auto" } }), singleData) }; }
    if (name === "listBack") { return { width: 260, height: 210, dataView: dataView(["Revenue"], [125.5], baseObjects({ flip: { ...baseObjects().flip, backLayout: "list", motionStyle: "none" } }), singleData) }; }
    if (name === "tilesBack") { return { width: 420, height: 230, dataView: dataView(["Revenue"], [125.5], baseObjects({ flip: { ...baseObjects().flip, backLayout: "tiles", motionStyle: "none" } }), singleData) }; }
    if (name === "longNegative") { return { width: 320, height: 180, dataView: dataView(["International Enterprise Revenue and Customer Success"], [-9_876.5], baseObjects(), { comparison: [-8_500], detail: [-12_345], target: [-9_000] }) }; }
    if (name === "highContrast") { return { width: 320, height: 180, highContrast: true, dataView: dataView(["Revenue"], [125.5], baseObjects(), singleData) }; }
    const width = name === "four660" ? 660 : 320; const height = name === "four660" ? 290 : 200;
    return {
        width, height,
        dataView: dataView(
            ["North", "South", "East", "West"], [125.5, 98.2, -42.8, 153.9],
            baseObjects({ multipleCards: { enabled: true, mode: "multiple", sizing: "fit" } }),
            { comparison: [112, 101, -40, 145], detail: [1842, 1604, 920, 2091], target: [120, 100, -41, 150] },
        ),
    };
}

function host(highContrast: boolean): { readonly host: IVisualHost; readonly state: { contextMenus: number; selectionCalls: number; selectionClears: number } } {
    const state = { contextMenus: 0, selectionCalls: 0, selectionClears: 0 };
    let activeCategory: DataViewCategoryColumn | undefined; let activeIndex = 0; let selected: ISelectionId[] = [];
    const selectionManager = {
        clear: () => { state.selectionClears++; selected = []; return Promise.resolve(selected); },
        getSelectionIds: () => [...selected],
        registerOnSelectCallback: () => undefined,
        select: (id: ISelectionId, multi = false) => { state.selectionCalls++; selected = multi ? [...selected, id] : [id]; return Promise.resolve(selected); },
        showContextMenu: () => { state.contextMenus++; return Promise.resolve(); },
    };
    const visualHost = {
        colorPalette: {
            background: { value: highContrast ? "#000000" : "#FFFFFF" }, foreground: { value: highContrast ? "#FFFF00" : "#242424" },
            foregroundSelected: { value: highContrast ? "#00FF00" : "#0078D4" }, hyperlink: { value: highContrast ? "#00FFFF" : "#0066CC" }, isHighContrast: highContrast,
        },
        createSelectionIdBuilder: () => ({
            createSelectionId: () => selectionId(`category:${String(activeCategory?.values[activeIndex])}`),
            withCategory(category: DataViewCategoryColumn, index: number) { activeCategory = category; activeIndex = index; return this; },
        }),
        createSelectionManager: () => selectionManager,
        eventService: { renderingFailed: () => undefined, renderingFinished: () => undefined, renderingStarted: () => undefined },
        hostCapabilities: { allowInteractions: true }, locale: "en-US",
        tooltipService: { enabled: () => true, hide: () => undefined, move: () => undefined, show: () => undefined },
    };
    return { host: visualHost as unknown as IVisualHost, state };
}

async function boot(): Promise<void> {
    const chosen = scenario(scenarioName);
    document.documentElement.style.cssText = "margin:0;background:#E5E7EB";
    document.body.style.cssText = `margin:0;width:${chosen.width}px;height:${chosen.height}px;overflow:hidden;font-family:Inter,sans-serif`;
    const target = document.querySelector<HTMLElement>("#visual")!;
    target.style.cssText = `width:${chosen.width}px;height:${chosen.height}px`;
    const fixture = host(chosen.highContrast === true);
    const visual = new Visual({ element: target, host: fixture.host });
    visual.update({ dataViews: [chosen.dataView], type: 510 as powerbi.VisualUpdateType, viewport: { width: chosen.width, height: chosen.height } });
    await document.fonts.ready;
    if (!document.fonts.check("16px Inter")) { throw new Error("Deterministic Inter test font did not load"); }
    window.flipHarness = {
        get contextMenus() { return fixture.state.contextMenus; },
        get selectionCalls() { return fixture.state.selectionCalls; },
        get selectionClears() { return fixture.state.selectionClears; },
        visual,
    };
    document.documentElement.dataset.harnessReady = "true";
}

void boot();
