import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const stylesheetPath = resolve(process.cwd(), "style/visual.less");
const stylesheet = readFileSync(stylesheetPath, "utf8");

describe("visual stylesheet", () => {
    it("scopes authored selectors to the visual root", () => {
        expect(stylesheet.trimStart().startsWith(".flip-card-visual-root {")).toBe(true);
        expect(stylesheet).not.toMatch(/^\s*(html|body|button|article)\s*\{/m);
    });

    it("provides compact and very-small viewport behavior", () => {
        expect(stylesheet).toContain("&.is-compact");
        expect(stylesheet).toContain("&.is-very-small");
        expect(stylesheet).toContain("overflow-y: auto");
    });

    it("disables flip transitions for reduced-motion users", () => {
        expect(stylesheet).toContain("@media (prefers-reduced-motion: reduce)");
        expect(stylesheet).toMatch(/\.flip-card-inner\s*\{\s*transition:\s*none;/s);
    });
});
