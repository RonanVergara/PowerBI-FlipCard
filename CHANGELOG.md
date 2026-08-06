# Changelog

## 1.2.0 — 2026-08-06

- Added deterministic Auto/Stacked/Split front presentations and Auto/List/Tiles back presentations through the pure responsive layout layer.
- Added a viewport-independent KPI presentation model with explicit Comparison/Target field names, exact/within/above/below relations, independent performance tone, zero-reference absolute fallback, natural tooltips, and screen-reader summaries.
- Reorganized front hierarchy and semantic back sections with independent backgrounds, dividers, emphasis, alignment, internal overflow, responsive compaction, and no invalid placeholder rows.
- Added Information/Rotate/Chevron, Ghost/Outline/Filled, Circle/Rounded-square, and separate Details-cue control designs.
- Replaced binary class toggling with exactly-once Horizontal, Vertical, Fade, and None transitions, supported directions, easing, duration, perspective, cancellation/fallback handling, focus-modality rules, reduced-motion resolution, and full cleanup.
- Converted the seven Format pane cards to grouped composite cards while preserving all internal card/slice identities, top switches, compatibility descriptors, and five native `fx` paths.
- Added explicit 1.1.0 migration coverage, including independent migration of saved `cardAppearance.backBackground`, unsaved 1.2 defaults, Reset descriptors, and rule-clearing constant restoration.
- Added a real-visual Vite/Playwright harness with bundled Inter weights, deterministic geometry/interaction checks, ignored inspection screenshots, and CI diagnostics upload on failure.
- Aligned Node to 24.16.0 and set npm/visual versions to 1.2.0/1.2.0.0 without runtime dependency additions.

## 1.1.0 — 2026-08-06

- Restored the product’s “simple card first” direction: strict Single, neutral core styling, shadow/accent/benchmark/flip off, selection on only when an identity exists.
- Added mutually exclusive missing, no-data, invalid, configuration-required, too-small, and ready states; ready rendering now atomically removes every landing element.
- Rebuilt flip state around stable identities, safe front/back controls, inert hidden faces, back-background return, focus transfer, reduced motion, and zero selection side effects.
- Added independent Benchmark, Flip, Multiple cards, and Interactions master settings with deterministic migration precedence and deprecated Default Face behavior.
- Added Single, Auto, and Multiple modes plus Fit/Fixed sizing, Automatic/Custom columns, feature-aware compaction, and tested 2×2 layouts at 660×290 and 320×200.
- Added genuine Power BI native conditional formatting for `cardAppearance.frontBackground`, `cardAppearance.borderColor`, `cardAppearance.accentColor`, `mainValue.fontColor`, and `benchmark.statusIndicatorColor`.
- Preserved model formats, display units, decimal precision, cultures, native tooltips/context menus, selection restoration, high contrast, accessibility, and rendering lifecycle events.
- Redesigned the Format pane into seven progressively disclosed cards and expanded the observable automated suite to cover state transitions, modes, combinations, formatting, and interactions.

## 1.0.0 — 2026-08-05

- Added the initial Smart KPI front/back experience, KPI calculations, category selection, modern formatting model, responsive styling, tests, CI, and production packaging.
