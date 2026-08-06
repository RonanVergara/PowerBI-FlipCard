import {
    BackLayoutMode,
    ColumnCalculation,
    EffectiveCardMode,
    FeatureProfile,
    FrontPresentationMode,
    LayoutDensity,
    ResponsivePriority,
    ResolvedBackLayout,
    ResolvedFrontPresentation,
    SizingMode,
    StatusPresentation,
} from "./types";

export interface ViewportSize {
    readonly width: number;
    readonly height: number;
}

export interface LayoutSettings {
    readonly cardMode: EffectiveCardMode;
    readonly columnCalculation: ColumnCalculation;
    readonly columns: number;
    readonly fixedHeight: number;
    readonly fixedWidth: number;
    readonly gap: number;
    readonly preferredHeight: number;
    readonly preferredWidth: number;
    readonly sizing: SizingMode;
}

export interface CardLayout {
    readonly cardHeight: number;
    readonly cardWidth: number;
    readonly calloutSizeCeiling: number;
    readonly columns: number;
    readonly density: LayoutDensity;
    readonly isGrid: boolean;
    readonly isTooSmall: boolean;
    readonly overflowX: "auto" | "hidden";
    readonly overflowY: "auto" | "hidden";
    readonly padding: number;
    readonly rows: number;
}

export interface FaceLayoutSettings {
    readonly backLayout: BackLayoutMode;
    readonly configuredPadding: number;
    readonly controlClusterWidth: number;
    readonly frontPresentation: FrontPresentationMode;
    readonly responsivePriority: ResponsivePriority;
    readonly sectionSpacing: number;
    readonly statusPresentation: StatusPresentation;
}

export interface FaceFeatureProfile {
    readonly backItemCount: number;
    readonly hasFlipControl: boolean;
    readonly hasInsight: boolean;
    readonly hasSecondaryReference: boolean;
    readonly hasStatus: boolean;
    readonly heroCharacterCount?: number;
}

export interface FaceLayoutPlan {
    readonly backColumns: 1 | 2;
    readonly backLayout: ResolvedBackLayout;
    readonly calloutSizeCeiling: number;
    readonly contentPadding: number;
    readonly density: LayoutDensity;
    readonly frontPresentation: ResolvedFrontPresentation;
    readonly labelLineLimit: 1 | 2;
    readonly sectionSpacing: number;
    readonly showInsight: boolean;
    readonly showSecondaryReference: boolean;
    readonly showStatus: boolean;
    readonly statusPresentation: StatusPresentation;
}

interface Candidate {
    readonly cardHeight: number;
    readonly cardWidth: number;
    readonly columns: number;
    readonly emptyCells: number;
    readonly rows: number;
    readonly score: number;
}

const GRID_PADDING = 6;
const SPLIT_MINIMUM_WIDTH = 300;
const SPLIT_MINIMUM_HEIGHT = 120;
const SPLIT_MINIMUM_ASPECT = 1.6;
const TILES_MINIMUM_WIDTH = 280;
const TILES_MINIMUM_HEIGHT = 130;

function safetySize(profile: FeatureProfile): ViewportSize {
    if (profile.flip) {
        return { width: 124, height: 84 };
    }
    if (profile.benchmark) {
        return { width: 112, height: 76 };
    }
    return { width: 96, height: 64 };
}

function faceDensity(width: number, height: number, profile: FaceFeatureProfile): LayoutDensity {
    if (width >= 160 && height >= 110) { return "regular"; }
    const safetyWidth = profile.hasFlipControl ? 124 : profile.hasInsight || profile.hasStatus ? 112 : 96;
    const safetyHeight = profile.hasFlipControl ? 84 : profile.hasInsight || profile.hasStatus ? 76 : 64;
    return width >= safetyWidth && height >= safetyHeight ? "compact" : "minimal";
}

function resolveFrontPresentation(width: number, height: number, requested: FrontPresentationMode, profile: FaceFeatureProfile): ResolvedFrontPresentation {
    const hasSecondaryContent = profile.hasInsight || profile.hasStatus;
    const splitSafe = hasSecondaryContent
        && width >= SPLIT_MINIMUM_WIDTH
        && height >= SPLIT_MINIMUM_HEIGHT
        && width / Math.max(1, height) >= SPLIT_MINIMUM_ASPECT;
    if (requested === "stacked") { return "stacked"; }
    if (requested === "split") { return splitSafe ? "split" : "stacked"; }
    return splitSafe ? "split" : "stacked";
}

function resolveBackLayout(width: number, height: number, requested: BackLayoutMode, profile: FaceFeatureProfile): readonly [ResolvedBackLayout, 1 | 2] {
    const twoColumnSafe = profile.backItemCount >= 2 && width >= TILES_MINIMUM_WIDTH && height >= TILES_MINIMUM_HEIGHT;
    if (requested === "list") { return ["list", 1]; }
    if (requested === "tiles") { return twoColumnSafe ? ["tiles", 2] : ["list", 1]; }
    return twoColumnSafe ? ["tiles", 2] : ["list", 1];
}

function compactStatusPresentation(requested: StatusPresentation, densityValue: LayoutDensity): StatusPresentation {
    if (densityValue === "regular") { return requested; }
    if (densityValue === "compact") { return requested === "pill" ? "text" : requested; }
    return "iconOnly";
}

export function calculateFaceLayout(
    cardSize: ViewportSize,
    settings: FaceLayoutSettings,
    profile: FaceFeatureProfile,
): FaceLayoutPlan {
    const width = Math.max(0, cardSize.width);
    const height = Math.max(0, cardSize.height);
    const densityValue = faceDensity(width, height, profile);
    const frontPresentation = resolveFrontPresentation(width, height, settings.frontPresentation, profile);
    const [backLayout, backColumns] = resolveBackLayout(width, height, settings.backLayout, profile);
    const configuredPadding = Math.max(0, Math.min(40, settings.configuredPadding));
    const configuredSpacing = Math.max(0, Math.min(40, settings.sectionSpacing));
    const contentPadding = densityValue === "regular" ? configuredPadding : densityValue === "compact" ? Math.min(10, configuredPadding) : Math.min(7, configuredPadding);
    const sectionSpacing = densityValue === "regular" ? configuredSpacing : densityValue === "compact" ? Math.min(6, configuredSpacing) : Math.min(3, configuredSpacing);
    let showInsight = profile.hasInsight;
    let showStatus = profile.hasStatus;
    if (densityValue === "minimal") {
        if (settings.responsivePriority === "insight") { showStatus = false; }
        if (settings.responsivePriority === "status") { showInsight = false; }
    }
    const controlReserve = profile.hasFlipControl ? Math.max(0, settings.controlClusterWidth) : 0;
    const usableWidth = Math.max(1, width - contentPadding * 2 - controlReserve);
    const primaryWidth = frontPresentation === "split" ? usableWidth * 0.58 : usableWidth;
    const geometricCeiling = frontPresentation === "split"
        ? Math.max(12, Math.min(64, height * 0.44, primaryWidth * 0.28))
        : Math.max(12, Math.min(64, height * 0.38, usableWidth * 0.24));
    const estimatedTextCeiling = profile.heroCharacterCount && profile.heroCharacterCount > 0
        ? Math.max(12, primaryWidth / (profile.heroCharacterCount * 0.68))
        : geometricCeiling;
    const calloutSizeCeiling = Math.min(geometricCeiling, estimatedTextCeiling);
    return {
        backColumns,
        backLayout,
        calloutSizeCeiling,
        contentPadding,
        density: densityValue,
        frontPresentation,
        labelLineLimit: densityValue === "regular" ? 2 : 1,
        sectionSpacing,
        showInsight,
        showSecondaryReference: profile.hasSecondaryReference && densityValue === "regular" && usableWidth >= 260,
        showStatus,
        statusPresentation: compactStatusPresentation(settings.statusPresentation, densityValue),
    };
}

function density(width: number, height: number, preferredWidth: number, preferredHeight: number): LayoutDensity {
    if (width >= preferredWidth && height >= preferredHeight) {
        return "regular";
    }
    if (width >= 120 && height >= 80) {
        return "compact";
    }
    return "minimal";
}

function singleLayout(viewport: ViewportSize, preferred: ViewportSize, safety: ViewportSize): CardLayout {
    const width = Math.max(0, viewport.width);
    const height = Math.max(0, viewport.height);
    return {
        cardHeight: height,
        cardWidth: width,
        calloutSizeCeiling: Math.max(12, Math.min(64, height * 0.38, width * 0.24)),
        columns: 1,
        density: density(width, height, preferred.width, preferred.height),
        isGrid: false,
        isTooSmall: width < safety.width || height < safety.height,
        overflowX: "hidden",
        overflowY: "hidden",
        padding: 0,
        rows: 1,
    };
}

function candidateFor(
    columns: number,
    count: number,
    availableWidth: number,
    availableHeight: number,
    gap: number,
    preferred: ViewportSize,
): Candidate {
    const rows = Math.ceil(count / columns);
    const cardWidth = Math.max(0, (availableWidth - gap * (columns - 1)) / columns);
    const cardHeight = Math.max(0, (availableHeight - gap * (rows - 1)) / rows);
    return {
        cardHeight,
        cardWidth,
        columns,
        emptyCells: rows * columns - count,
        rows,
        score: Math.min(cardWidth / preferred.width, cardHeight / preferred.height),
    };
}

function betterCandidate(current: Candidate | undefined, candidate: Candidate): Candidate {
    if (!current || candidate.score > current.score + 0.0001) {
        return candidate;
    }
    if (Math.abs(candidate.score - current.score) <= 0.0001) {
        if (candidate.emptyCells < current.emptyCells) {
            return candidate;
        }
        if (candidate.emptyCells === current.emptyCells && candidate.columns < current.columns) {
            return candidate;
        }
    }
    return current;
}

function fitLayout(
    viewport: ViewportSize,
    count: number,
    settings: LayoutSettings,
    preferred: ViewportSize,
    safety: ViewportSize,
): CardLayout {
    const gap = Math.max(0, settings.gap);
    const availableWidth = Math.max(0, viewport.width - GRID_PADDING * 2);
    const availableHeight = Math.max(0, viewport.height - GRID_PADDING * 2);
    const maximumColumns = Math.max(1, count);
    let best: Candidate | undefined;

    if (settings.columnCalculation === "custom") {
        let requested = Math.max(1, Math.min(maximumColumns, Math.floor(settings.columns)));
        while (requested > 1) {
            const width = (availableWidth - gap * (requested - 1)) / requested;
            if (width >= safety.width) {
                break;
            }
            requested--;
        }
        best = candidateFor(requested, count, availableWidth, availableHeight, gap, preferred);
    } else {
        for (let columns = 1; columns <= maximumColumns; columns++) {
            const candidate = candidateFor(columns, count, availableWidth, availableHeight, gap, preferred);
            if (candidate.cardWidth >= safety.width && candidate.cardHeight >= safety.height) {
                best = betterCandidate(best, candidate);
            }
        }
    }

    let requiresVerticalScroll = false;
    if (!best) {
        let columns = Math.max(1, Math.min(maximumColumns, Math.floor((availableWidth + gap) / (safety.width + gap))));
        if (settings.columnCalculation === "custom") {
            columns = Math.min(columns, Math.max(1, Math.floor(settings.columns)));
        }
        const rows = Math.ceil(count / columns);
        const cardWidth = Math.max(0, (availableWidth - gap * (columns - 1)) / columns);
        best = {
            cardHeight: safety.height,
            cardWidth,
            columns,
            emptyCells: rows * columns - count,
            rows,
            score: Math.min(cardWidth / preferred.width, safety.height / preferred.height),
        };
        requiresVerticalScroll = rows * safety.height + gap * (rows - 1) > availableHeight;
    }

    return {
        cardHeight: best.cardHeight,
        cardWidth: best.cardWidth,
        calloutSizeCeiling: Math.max(12, Math.min(64, best.cardHeight * 0.38, best.cardWidth * 0.24)),
        columns: best.columns,
        density: density(best.cardWidth, best.cardHeight, preferred.width, preferred.height),
        isGrid: true,
        isTooSmall: viewport.width < safety.width || viewport.height < safety.height,
        overflowX: "hidden",
        overflowY: requiresVerticalScroll ? "auto" : "hidden",
        padding: GRID_PADDING,
        rows: best.rows,
    };
}

function fixedLayout(
    viewport: ViewportSize,
    count: number,
    settings: LayoutSettings,
    preferred: ViewportSize,
    safety: ViewportSize,
): CardLayout {
    const gap = Math.max(0, settings.gap);
    const cardWidth = Math.max(1, settings.fixedWidth);
    const cardHeight = Math.max(1, settings.fixedHeight);
    const availableWidth = Math.max(0, viewport.width - GRID_PADDING * 2);
    const automaticColumns = Math.max(1, Math.min(count, Math.floor((availableWidth + gap) / (cardWidth + gap)) || 1));
    const columns = settings.columnCalculation === "custom"
        ? Math.max(1, Math.min(count, Math.floor(settings.columns)))
        : automaticColumns;
    const rows = Math.ceil(count / columns);
    const contentWidth = columns * cardWidth + gap * (columns - 1) + GRID_PADDING * 2;
    const contentHeight = rows * cardHeight + gap * (rows - 1) + GRID_PADDING * 2;
    return {
        cardHeight,
        cardWidth,
        calloutSizeCeiling: Math.max(12, Math.min(64, cardHeight * 0.38, cardWidth * 0.24)),
        columns,
        density: density(cardWidth, cardHeight, preferred.width, preferred.height),
        isGrid: true,
        isTooSmall: viewport.width < safety.width || viewport.height < safety.height,
        overflowX: contentWidth > viewport.width ? "auto" : "hidden",
        overflowY: contentHeight > viewport.height ? "auto" : "hidden",
        padding: GRID_PADDING,
        rows,
    };
}

export function calculateCardLayout(
    viewport: ViewportSize,
    cardCount: number,
    settings: LayoutSettings,
    profile: FeatureProfile,
): CardLayout {
    const preferred = {
        width: Math.max(1, settings.preferredWidth),
        height: Math.max(1, settings.preferredHeight),
    };
    const safety = safetySize(profile);
    const count = Math.max(1, cardCount);

    if (settings.cardMode === "single" || (settings.cardMode === "auto" && count === 1)) {
        return singleLayout(viewport, preferred, safety);
    }
    if (settings.sizing === "fixed") {
        return fixedLayout(viewport, count, settings, preferred, safety);
    }
    if (count === 1) {
        return singleLayout(viewport, preferred, safety);
    }
    return fitLayout(viewport, count, settings, preferred, safety);
}
