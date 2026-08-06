# Smart KPI Flip Card 1.1.0 — Development Log

## Product contract

The authoritative principle is “simple, stable KPI card first.” Card Value is the sole required role. Benchmark, Flip, Multiple cards, and selection are optional layers. Version 1.1.0 intentionally defaults to strict Single without unreliable legacy-instance detection. GUID, author, MIT license, role names, bindings, and category-driven multi-card capability remain unchanged.

## Architecture

| Module | Responsibility |
| --- | --- |
| `src/data.ts` | Role extraction, all-row preservation, validation, model formatting, identities, stable keys, and row/static conditional colors. |
| `src/layout.ts` | Pure Single/Auto/Multiple Fit/Fixed calculations, safety sizes, density, dimensions, columns, and overflow policy. |
| `src/kpi.ts` | Target/comparison priority, tolerance, direction, signed variance, negative/zero-reference safety. |
| `src/valueFormatting.ts` | Culture/model/display-unit formatting, variance text, and feature-gated native tooltip content. |
| `src/settings.ts` | Seven Format cards, progressive visibility, raw-object migration precedence, and identity-aware `ConstantOrRule` containers. |
| `src/renderer.ts` | Fresh safe DOM, meaningful optional sections, final color resolution, inert faces, ARIA, and high contrast. |
| `src/visual.ts` | State precedence, face-state reconciliation, atomic rendering, host interactions, tooltips, context menus, and lifecycle events. |

## Authoritative state and identity

Every update evaluates first-match state precedence: missing Card Value → no data → invalid value → configuration required → too small → ready. Only ready contains `.flip-card-wrapper` DOM. Each render replaces the container with a state element or fresh ready fragment, so landing DOM cannot survive a data transition.

`Map<stableIdentity, front | back>` is authoritative; DOM is disposable. Otherwise-ready data is reconciled before too-small evaluation. Too-small removes all card DOM and event/tooltip surfaces while keeping reconciled identities and face values. Recovery rebuilds the DOM. Missing/no-data/invalid/configuration prune the face map. Card count never causes too-small; Fit may vertically scroll many cards.

## Modes and layout precedence

- Single accepts at most one category row and fills the viewport, ignoring all multi-card dimensions.
- Auto uses single presentation for one row and selected Fit/Fixed grid behavior for multiple identified rows.
- Multiple requires Label and applies Fit/Fixed to one or more rows. Multiple Fixed honors configured dimensions even for one row.
- Fit treats 160×110 as preferred, uses feature-aware safety sizes, evaluates columns, compacts before vertical scrolling, and never overflows horizontally.
- Fixed intentionally honors width/height and may scroll in either direction.
- Manual column calculation is called Custom; it reduces requested Fit columns when required to prevent horizontal overflow.

## Migration precedence

Migration inspects own properties on raw `dataView.metadata.objects`:

| Priority | Condition | Result |
| --- | --- | --- |
| 1 | New property explicitly saved | New property wins. |
| 2 | New absent; compatible legacy property explicitly saved | Map only that saved value. |
| 3 | Neither saved | Use the neutral 1.1.0 default. |

If both legacy flip switches were saved, `flipBehavior.showButton` precedes `interactions.enableFlip`. Explicit `kpiStatus.show` may enable Benchmark. Legacy class defaults, Detail bindings, and Default Face never enable a feature. No legacy multi-card mode exists, so absent new metadata remains strict Single.

## Native conditional formatting

The exact five capability, formatting-model, lookup, test, and documentation paths are:

1. `cardAppearance.frontBackground`
2. `cardAppearance.borderColor`
3. `cardAppearance.accentColor`
4. `mainValue.fontColor`
5. `benchmark.statusIndicatorColor`

Each slice calls `dataViewWildcard.createDataViewWildcardSelector` with InstancesAndTotals, sets `altConstantSelector`, and uses instance kind `ConstantOrRule`; the formatting utility emits `descriptor.altConstantValueSelector`. Categorized alternate selectors come from `selectionId.getSelector()` and identity-less cards use `{}`. Runtime resolution is category-row objects → value-column row objects → explicit metadata constant → neutral/automatic fallback. High contrast substitutes after resolution. Clearing a rule therefore exposes the static constant without retained renderer state.

## Flip and interactions

A back face exists only when Flip is enabled and valid Detail or enabled valid Benchmark content exists. The front selection surface and flip button are siblings. The back is not a selection surface: its background and dedicated button return to Front. Flip events stop propagation.

Inactive faces receive `aria-hidden`, `inert`, `tabIndex=-1` on controls, and `pointer-events:none`. Focus moves to the visible counterpart. Native buttons supply mouse, touch, Enter, and Space activation. Disabling Flip or losing content reconciles Front; stable identities retain face through resize/format/tiny recovery; changed identities start Front.

Selection calls require enabled selection, host interactions, and category identity. Sole-click clear, Ctrl/Cmd multi-select, blank clear, native context menu, tooltip wrapper, selection callback/restoration, and rendering lifecycle remain in the host orchestration layer.

## Validation strategy

Vitest/jsdom tests assert observable DOM, interaction calls, formatting-model descriptors, data output, and pure layout results. Coverage includes atomic state transitions, exact wrapper counts, front/back inertness, no flip selection, identity reconciliation, all feature combinations, Single/Auto/Multiple, Fit/Fixed, both 2×2 acceptance viewports, five-path conditional formatting, rule clearing, high contrast, reduced motion, native interaction routing, migration precedence, percentage/currency/model precision/display units, two cultures, and source display names.

Release validation runs the pinned local toolchain: clean install, lint, production/test type checks, tests, development/production resource builds, normal/verbose package, full audit, production audit, clean-clone overlay validation, and archive inspection. Generated dependencies, `dist`, `.pbiviz`, webpack reports, certificates, and editor output remain ignored and untracked.

## Desktop boundary

Power BI Desktop was unavailable during implementation. The README and completion report contain the exact manual smoke-test checklist; Desktop behavior is not claimed as verified. Optional tool recommendations such as highlighting and localization remain documented limitations, not scope additions.
