import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const capabilities = JSON.parse(readFileSync(resolve(process.cwd(), "capabilities.json"), "utf8")) as {
    dataRoles: Array<{ name: string }>;
    objects: Record<string, { properties: Record<string, unknown> }>;
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
});
