import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const capabilities = JSON.parse(readFileSync(resolve(process.cwd(), "capabilities.json"), "utf8")) as {
    dataRoles: Array<{ name: string }>;
    objects: Record<string, { displayName: string; properties: Record<string, { type?: { enumeration?: Array<{ value: string }> } }> }>;
};

describe("Power BI capabilities contract", () => {
    it("preserves all public data-role identifiers", () => {
        expect(capabilities.dataRoles.map((role) => role.name)).toEqual(["cardLabel", "cardValue", "detailValue", "comparisonValue", "targetValue", "tooltips"]);
    });

    it("declares the exact five native fx-compatible color paths", () => {
        for (const path of ["cardAppearance.frontBackground", "cardAppearance.borderColor", "cardAppearance.accentColor", "mainValue.fontColor", "benchmark.statusIndicatorColor"]) {
            const [objectName, propertyName] = path.split(".");
            expect(capabilities.objects[objectName!]?.properties[propertyName!], path).toMatchObject({ type: { fill: { solid: { color: true } } } });
        }
    });

    it("declares master feature switches independently", () => {
        expect(capabilities.objects.flip!.properties.enabled).toBeDefined();
        expect(capabilities.objects.benchmark!.properties.enabled).toBeDefined();
        expect(capabilities.objects.multipleCards!.properties.enabled).toBeDefined();
        expect(capabilities.objects.interactions!.properties.selectionEnabled).toBeDefined();
    });

    it("preserves internal card identities while exposing the seven 1.2 display names", () => {
        expect(Object.keys(capabilities.objects).slice(0, 7)).toEqual(["cardAppearance", "multipleCards", "label", "mainValue", "benchmark", "flip", "interactions"]);
        expect(Object.values(capabilities.objects).slice(0, 7).map((object) => object.displayName)).toEqual([
            "Card frame", "Multiple-card layout", "Front — Label", "Front — Callout", "Front — Insight and status", "Back face and flip motion", "Interactions",
        ]);
    });

    it.each([
        ["label", "presentationMode", ["auto", "stacked", "split"]],
        ["label", "verticalAlignment", ["top", "center", "bottom"]],
        ["label", "responsivePriority", ["automatic", "insight", "status"]],
        ["benchmark", "statusPresentation", ["pill", "text", "iconOnly"]],
        ["flip", "backLayout", ["auto", "list", "tiles"]],
        ["flip", "backTitleSource", ["automatic", "category", "custom"]],
        ["flip", "detailEmphasis", ["standard", "strong"]],
        ["flip", "backLabelAlignment", ["left", "center", "right"]],
        ["flip", "backValueAlignment", ["left", "center", "right"]],
        ["flip", "controlIcon", ["information", "rotate", "chevron"]],
        ["flip", "controlStyle", ["ghost", "outline", "filled"]],
        ["flip", "controlShape", ["circle", "roundedSquare"]],
        ["flip", "motionStyle", ["horizontal", "vertical", "fade", "none"]],
        ["flip", "horizontalDirection", ["left", "right"]],
        ["flip", "verticalDirection", ["up", "down"]],
        ["flip", "easing", ["smooth", "snappy", "gentle"]],
        ["flip", "perspective", ["subtle", "standard", "deep"]],
    ])("locks %s.%s serialized values", (objectName, propertyName, values) => {
        expect(capabilities.objects[objectName]?.properties[propertyName]?.type?.enumeration?.map((item) => item.value)).toEqual(values);
    });

    it("retains the hidden legacy back-background descriptor in capabilities", () => {
        expect(capabilities.objects.cardAppearance?.properties.backBackground).toBeDefined();
    });
});
