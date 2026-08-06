# Changelog

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
