import {
    ColumnCalculation,
    EffectiveCardMode,
    FeatureProfile,
    LayoutDensity,
    SizingMode,
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

interface Candidate {
    readonly cardHeight: number;
    readonly cardWidth: number;
    readonly columns: number;
    readonly emptyCells: number;
    readonly rows: number;
    readonly score: number;
}

const GRID_PADDING = 6;

function safetySize(profile: FeatureProfile): ViewportSize {
    if (profile.flip) {
        return { width: 120, height: 80 };
    }
    if (profile.benchmark) {
        return { width: 108, height: 72 };
    }
    return { width: 96, height: 64 };
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
