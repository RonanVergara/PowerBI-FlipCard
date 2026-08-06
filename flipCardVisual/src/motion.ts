import { CardFace, FaceTransitionState, HorizontalDirection, MotionEasing, MotionPerspective, MotionStyle, VerticalDirection } from "./types";

export interface MotionConfiguration {
    readonly durationMs: number;
    readonly easing: string;
    readonly perspectivePx: number;
    readonly rotationDegrees: number;
    readonly style: MotionStyle;
}

export interface TransitionSurface {
    readonly backFace: HTMLElement;
    readonly frontFace: HTMLElement;
    readonly inner: HTMLElement;
}

export interface FaceTransitionOptions {
    readonly activate: () => void;
    readonly durationMs: number;
    readonly from: CardFace;
    readonly onComplete: () => void;
    readonly style: MotionStyle;
    readonly surface: TransitionSurface;
    readonly to: CardFace;
}

export interface ActiveFaceTransition {
    readonly state: FaceTransitionState;
    complete(): void;
    dispose(): void;
}

const easingValues: Record<MotionEasing, string> = {
    gentle: "cubic-bezier(.37, 0, .63, 1)",
    smooth: "cubic-bezier(.22, .61, .36, 1)",
    snappy: "cubic-bezier(.2, .8, .2, 1)",
};

const perspectiveValues: Record<MotionPerspective, number> = { subtle: 1600, standard: 1000, deep: 650 };

export function createMotionConfiguration(
    style: MotionStyle,
    horizontalDirection: HorizontalDirection,
    verticalDirection: VerticalDirection,
    easing: MotionEasing,
    durationMs: number,
    perspective: MotionPerspective,
    reducedMotion: boolean,
): MotionConfiguration {
    const clampedDuration = Math.max(0, Math.min(2000, durationMs));
    const rotationDegrees = style === "horizontal"
        ? horizontalDirection === "left" ? -180 : 180
        : verticalDirection === "down" ? -180 : 180;
    return {
        durationMs: reducedMotion || style === "none" ? 0 : clampedDuration,
        easing: easingValues[easing],
        perspectivePx: perspectiveValues[perspective],
        rotationDegrees,
        style,
    };
}

export function startFaceTransition(options: FaceTransitionOptions): ActiveFaceTransition {
    const expectedTarget = options.style === "fade"
        ? options.to === "back" ? options.surface.backFace : options.surface.frontFace
        : options.surface.inner;
    const expectedProperty = options.style === "fade" ? "opacity" : "transform";
    let completed = false;
    let timer: number | undefined;

    const cleanup = (): void => {
        expectedTarget.removeEventListener("transitionend", handleTransition);
        expectedTarget.removeEventListener("transitioncancel", handleTransition);
        if (timer !== undefined) { window.clearTimeout(timer); timer = undefined; }
    };
    const complete = (): void => {
        if (completed) { return; }
        completed = true;
        cleanup();
        options.onComplete();
    };
    const handleTransition = (event: Event): void => {
        const transitionEvent = event as TransitionEvent;
        if (event.target !== expectedTarget || transitionEvent.propertyName !== expectedProperty) { return; }
        complete();
    };

    expectedTarget.addEventListener("transitionend", handleTransition);
    expectedTarget.addEventListener("transitioncancel", handleTransition);
    options.activate();
    if (options.style === "none" || options.durationMs <= 0) {
        complete();
    } else {
        timer = window.setTimeout(complete, Math.max(0, options.durationMs) + 100);
    }

    return {
        state: options.to === "back" ? "turningToBack" : "turningToFront",
        complete,
        dispose: (): void => { if (completed) { return; } completed = true; cleanup(); },
    };
}
