import powerbi from "powerbi-visuals-api";
import { vi } from "vitest";

import DataView = powerbi.DataView;
import DataViewCategoryColumn = powerbi.DataViewCategoryColumn;
import DataViewValueColumn = powerbi.DataViewValueColumn;
import ISelectionId = powerbi.visuals.ISelectionId;
import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import PrimitiveValue = powerbi.PrimitiveValue;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;

export type FixtureValue = PrimitiveValue | null;

export interface DataViewFixtureOptions {
    readonly cardFormat?: string;
    readonly cardName?: string;
    readonly cardValues?: FixtureValue[];
    readonly categoryIdentities?: boolean;
    readonly comparisonValues?: FixtureValue[];
    readonly detailValues?: FixtureValue[];
    readonly labels?: FixtureValue[];
    readonly metadataObjects?: powerbi.DataViewObjects;
    readonly targetValues?: FixtureValue[];
    readonly tooltipColumns?: ReadonlyArray<{ readonly displayName: string; readonly format?: string; readonly values: FixtureValue[] }>;
}

export interface HostFixture {
    readonly host: IVisualHost;
    readonly selectionManager: SelectionManagerFixture;
    readonly spies: {
        readonly contextMenu: ReturnType<typeof vi.fn>;
        readonly renderingFailed: ReturnType<typeof vi.fn>;
        readonly renderingFinished: ReturnType<typeof vi.fn>;
        readonly renderingStarted: ReturnType<typeof vi.fn>;
        readonly select: ReturnType<typeof vi.fn>;
        readonly selectionClear: ReturnType<typeof vi.fn>;
        readonly tooltipHide: ReturnType<typeof vi.fn>;
        readonly tooltipShow: ReturnType<typeof vi.fn>;
    };
}

export interface SelectionManagerFixture {
    clear(): Promise<ISelectionId[]>;
    getSelectionIds(): ISelectionId[];
    registerOnSelectCallback(callback: (selectionIds: ISelectionId[]) => void): void;
    select(selectionId: ISelectionId, multiSelect?: boolean): Promise<ISelectionId[]>;
    showContextMenu(selectionId: ISelectionId, position: { x: number; y: number }): Promise<void>;
}

export function createSelectionId(key: string): ISelectionId {
    return {
        equals: (other: ISelectionId) => other.getKey() === key,
        getKey: () => key,
        getSelector: () => ({ data: [{ scopeId: { comparison: 0, expr: { kind: 0 } } }] }) as unknown as powerbi.data.Selector,
        getSelectorByColumn: () => ({}),
        hasIdentity: () => true,
        includes: (other: ISelectionId) => other.getKey() === key,
    } as unknown as ISelectionId;
}

function createValueColumn(role: string, displayName: string, values: FixtureValue[], format = "#,0.00"): DataViewValueColumn {
    return { source: { displayName, format, queryName: `Measures.${role}`, roles: { [role]: true }, type: { numeric: true } }, values: values as PrimitiveValue[] } as DataViewValueColumn;
}

export function createDataView(options: DataViewFixtureOptions = {}): DataView {
    const columns: DataViewValueColumn[] = [createValueColumn("cardValue", options.cardName ?? "Revenue", options.cardValues ?? [125], options.cardFormat ?? "$#,0.00")];
    if (options.detailValues) { columns.push(createValueColumn("detailValue", "Orders", options.detailValues, "#,0")); }
    if (options.comparisonValues) { columns.push(createValueColumn("comparisonValue", "Previous Month", options.comparisonValues, options.cardFormat ?? "$#,0.00")); }
    if (options.targetValues) { columns.push(createValueColumn("targetValue", "Target", options.targetValues, options.cardFormat ?? "$#,0.00")); }
    for (const tooltip of options.tooltipColumns ?? []) { columns.push(createValueColumn("tooltips", tooltip.displayName, tooltip.values, tooltip.format)); }
    const categories: DataViewCategoryColumn[] | undefined = options.labels ? [{
        source: { displayName: "Vendor", queryName: "Vendor.Name", roles: { cardLabel: true } },
        values: options.labels,
        identity: options.categoryIdentities === false ? undefined : options.labels.map((label) => ({ key: String(label) })) as unknown as DataViewCategoryColumn["identity"],
    } as DataViewCategoryColumn] : undefined;
    return {
        metadata: { columns: [...(categories?.map((category) => category.source) ?? []), ...columns.map((column) => column.source)], objects: options.metadataObjects },
        categorical: { categories, values: columns as unknown as powerbi.DataViewValueColumns },
    } as DataView;
}

export function setCategoryObjects(dataView: DataView, objects: powerbi.DataViewObjects[]): void { dataView.categorical!.categories![0]!.objects = objects; }
export function setValueObjects(dataView: DataView, objects: powerbi.DataViewObjects[]): void { dataView.categorical!.values![0]!.objects = objects; }
export function fill(color: string): powerbi.Fill { return { solid: { color } }; }

export function createHostFixture(highContrast = false, locale = "en-US"): HostFixture {
    let selected: ISelectionId[] = [];
    let callback: ((selectionIds: ISelectionId[]) => void) | undefined;
    let activeCategory: DataViewCategoryColumn | undefined;
    let activeIndex = 0;
    const contextMenu = vi.fn(() => Promise.resolve());
    const renderingFailed = vi.fn(); const renderingFinished = vi.fn(); const renderingStarted = vi.fn();
    const selectionClear = vi.fn(); const select = vi.fn(); const tooltipHide = vi.fn(); const tooltipShow = vi.fn();
    const selectionManager: SelectionManagerFixture = {
        clear: () => { selectionClear(); selected = []; callback?.(selected); return Promise.resolve(selected); },
        getSelectionIds: () => [...selected],
        registerOnSelectCallback: (next) => { callback = next; },
        select: (selectionId, multiSelect = false) => {
            select(selectionId, multiSelect);
            if (multiSelect) { selected = selected.some((candidate) => candidate.equals(selectionId)) ? selected.filter((candidate) => !candidate.equals(selectionId)) : [...selected, selectionId]; }
            else { selected = [selectionId]; }
            callback?.(selected); return Promise.resolve([...selected]);
        },
        showContextMenu: contextMenu,
    };
    const host = {
        colorPalette: {
            background: { value: highContrast ? "#000000" : "#FFFFFF" }, foreground: { value: highContrast ? "#FFFF00" : "#000000" },
            hyperlink: { value: highContrast ? "#00FFFF" : "#0066CC" }, isHighContrast: highContrast, foregroundSelected: { value: highContrast ? "#00FF00" : "#0078D4" },
        },
        createSelectionIdBuilder(): powerbi.visuals.ISelectionIdBuilder {
            return {
                createSelectionId: () => createSelectionId(`category:${String(activeCategory?.values?.[activeIndex])}`),
                withCategory(category: DataViewCategoryColumn, index: number): powerbi.visuals.ISelectionIdBuilder { activeCategory = category; activeIndex = index; return this; },
            } as powerbi.visuals.ISelectionIdBuilder;
        },
        createSelectionManager: () => selectionManager as unknown as powerbi.extensibility.ISelectionManager,
        eventService: { renderingFailed, renderingFinished, renderingStarted },
        hostCapabilities: { allowInteractions: true }, locale,
        tooltipService: { enabled: () => true, hide: tooltipHide, move: vi.fn(), show: tooltipShow },
    };
    return { host: host as unknown as IVisualHost, selectionManager, spies: { contextMenu, renderingFailed, renderingFinished, renderingStarted, select, selectionClear, tooltipHide, tooltipShow } };
}

export function createUpdateOptions(dataView: DataView | undefined, width = 320, height = 180): VisualUpdateOptions {
    return { dataViews: dataView ? [dataView] : [], type: 510 as powerbi.VisualUpdateType, viewport: { height, width } } as VisualUpdateOptions;
}

export async function flushPromises(): Promise<void> { await Promise.resolve(); await Promise.resolve(); }
