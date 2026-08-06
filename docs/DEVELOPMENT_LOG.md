# Smart KPI Flip Card 1.2.0 — Development Log

## Scope and compatibility

Version 1.2.0 is restricted to face design, semantic KPI presentation, motion, accessibility, and validation. Card Value remains the only required role. GUID, author, license, six role names/bindings, Single/Auto/Multiple, Fit/Fixed, stable identities, face persistence, selection, tooltips, context menus, conditional formatting, high contrast, rendering lifecycle, and atomic states remain compatibility contracts.

## Architecture

| Module | 1.2 responsibility |
| --- | --- |
| `src/data.ts` | Existing role extraction, validation, formatting, stable identities, tooltip bindings, and evaluated `fx` colors. |
| `src/kpi.ts` | Reference priorities, signed calculations, exact/tolerance/above/below relations, and performance tones. |
| `src/valueFormatting.ts` | Model/culture formatting plus one viewport-independent KPI presentation reused by faces, tooltips, and accessibility. |
| `src/layout.ts` | Pure grid and per-face plans: modes, columns, density, padding/gaps, visibility, callout ceiling, safety, and overflow. |
| `src/settings.ts` | Exact serialized enums/defaults, grouped composite Format cards, slice visibility, raw-metadata migration, Reset descriptors, and `fx` containers. |
| `src/renderer.ts` | Accessible face DOM, semantic back sections, CSS variables, control cluster, high contrast, and active/inactive face state. |
| `src/motion.ts` | Motion mappings plus transition target/property filtering, cancellation, exactly-once completion, fallback, and disposal. |
| `src/visual.ts` | Host lifecycle, canonical face reconciliation, transition records, focus modality, selection boundaries, tooltips, and cleanup. |

The root correction was separating semantic content from responsive visibility. KPI relations, messages, tones, formatted values, and field names are now computed once without viewport input. The face plan chooses only what is visible. Compact rendering therefore cannot accidentally remove tooltip, bound Tooltip-role, or screen-reader information.

Canonical face state remains `Map<stableIdentity, front | back>`. A separate transition map holds `turningToBack`/`turningToFront`, focus intent, and the exactly-once controller. The intended canonical destination is recorded at activation, so rerender, resize, too-small recovery, lost content, or reduced-motion changes cannot corrupt identity reconciliation.

## Layout and content rules

Feature safety sizes are core 96×64, benchmark 112×76, and flip 124×84. Front Auto uses Split at 300×120 and 1.6 aspect only when actual validated secondary content exists. Back Auto uses two-column Tiles with at least two items at 280×130; forced Tiles falls to List below the threshold. Strict Single and Fit/Fixed precedence remains unchanged.

Each valid back label/value pair is one item. Header and return control stay fixed; body rows are never discarded and can scroll vertically. Compact/minimal presentation removes subtitle/decorations, then reduces spacing and typography. The Details cue is a separate non-interactive sibling of the button.

## Format pane and migration

Seven visible display names map to the preserved internal cards. Every slice name equals its capability property. Group names and property tables are maintained in `docs/FORMATTING_PROPERTIES.md`.

Migration reads own properties from `dataView.metadata.objects`: explicit new property, compatible explicitly saved legacy property, then 1.2 default. A saved legacy back background seeds three independent new colors only when their paths are absent. Its hidden slice is retained for Reset descriptors but cannot directly produce a renderer CSS variable.

All five `fx` containers remain in their owning groups. Runtime order remains evaluated row color, explicitly saved static constant, automatic/static fallback, then high-contrast override. Status `fx` affects status indicators on both faces but not numeric insight.

The installed API exports `DisplayUnitSystemType` at runtime and it now replaces the former numeric formatter value. Required validator/wildcard/instance-kind declarations are const enums absent at the Vitest runtime; typed named constants preserve the official values with regression coverage.

## Validation strategy

Vitest/jsdom covers pure layout, KPI math/language, model formatting and cultures, migration, grouped formatting output, Reset descriptors, five `fx` paths and clearing, renderer semantics, high contrast, selection boundaries, every motion mapping, transition events/cancellation/fallback, focus modality, rerender resolution, reduced motion, and destruction.

Playwright loads the real visual through Vite with a deterministic mock host and locally packaged Inter font weights. Geometry and interaction cases include 320×180 single; 660×290 and 320×200 four-card grids; wide Split; narrow Stacked; List/Tiles back; front/back; paused real CSS mid-flip via Web Animations; completed forward/return; Vertical/Fade/None; long negative values; focus; and high contrast. Output screenshots are ignored review artifacts rather than tracked baselines.

Release verification includes primary-tree and temporary clean-copy install, lint, two type checks, Vitest, Playwright, dev/prod builds, normal/verbose packaging, both audits, archive inspection, ignored-artifact checks, and complete diff review.

## Desktop boundary

Power BI Desktop is installed, but no reliable automated Desktop surface was available. Re-import/migration, Format pane host behavior, live `fx`, cross-visual selection, touch, high contrast, screen reader, and export remain explicit manual checklist items. In particular, Desktop must determine whether Reset actually removes hidden legacy metadata even though the formatting model emits its descriptor.
