# Smart KPI Flip Card for Power BI

Smart KPI Flip Card 1.2.0 is a focused face-design and motion release. Card Value remains the only required field; no data roles were added. The visual keeps GUID `flipCardVisualFC7B9C3E9690417084C0A63577A86637`, Ronan Vergara’s author metadata, the MIT license, and the six existing roles: `cardLabel`, `cardValue`, `detailValue`, `comparisonValue`, `targetValue`, and `tooltips`.

## Face layouts

Front — Label exposes three presentation modes:

- **Auto** chooses Split only when renderable insight or status content exists, the card is at least 300×120, and the aspect ratio is at least 1.6. Otherwise it uses Stacked.
- **Stacked** keeps label, value, insight, and status in a vertical hierarchy for narrow or square cards.
- **Split** uses a 58/42 primary/secondary hierarchy when safe and falls back to Stacked below the same safety limit.

Responsive compaction removes the secondary reference line first, shortens Pill to Text and then Icon-only, reduces gaps and padding, constrains the label, and scales the callout while reserving the complete flip-control cluster. `responsivePriority` decides whether insight or status survives first at minimal density. Layout decisions are made by the pure calculator and never remove eligible tooltip or screen-reader information.

Back face and flip motion exposes:

- **Auto**: Tiles with at least two valid items at 280×130 or larger; List otherwise.
- **List**: responsive label/value rows.
- **Tiles**: normally two columns; below the threshold it becomes a one-column List before any information is removed.

The back contains only valid enabled items under a fixed header: Detail Value, Comparison, Target, variance, and reference-aware status. Compact layouts remove subtitles and decoration before reducing spacing. If all rows cannot fit, only the content region scrolls vertically. Front and back always share the same outer dimensions, border, radius, and accent.

## Smart KPI language

Calculation behavior remains compatible with 1.1.0:

- Status reference priority: Target, then Comparison.
- Variance reference priority: Comparison, then Target.
- Signed absolute variance and percentage variance divided by `abs(reference)`.
- Higher-is-better, lower-is-better, tolerance boundaries, negative references, and zero-reference safety.

Every numeric insight names its reference, for example `+12.4% vs Previous Month`. A zero percentage reference falls back to signed absolute variance instead of infinity or an ambiguous placeholder.

Target status uses **At target**, **Within tolerance**, **Above target**, or **Below target**. Comparison status uses **Improved**, **Declined**, or **Unchanged**. Above/below describes numeric position; positive/neutral/negative styling represents performance direction. With both references, the front can show comparison insight and target status without repeating the same interpretation.

## Motion and controls

The canonical face remains Front or Back while the transition controller uses `front`, `turningToBack`, `back`, and `turningToFront`. Supported motion is Horizontal, Vertical, Fade, or None, with Left/Right, Up/Down, Smooth/Snappy/Gentle easing, 0–2000 ms duration, and Subtle/Standard/Deep perspective where relevant.

Repeated activation is locked. Completion filters the expected element and CSS property, accepts `transitionend` or `transitioncancel`, and uses an exactly-once `duration + 100 ms` fallback. Resize or formatting updates resolve to the intended canonical destination. Timers, transition listeners, activation bookkeeping, and `matchMedia` listeners are cleaned up.

Controls support Information, Rotate, or Chevron icons; Ghost, Outline, or Filled styles; Circle or Rounded-square shapes; and an optional separate **Details** cue. The cue is never part of the button, so a Circle button remains circular. Whole-card flip activation is intentionally not implemented because the front surface retains Power BI selection.

## Interactions and accessibility

- A selectable front surface keeps click-again deselection, Ctrl/Cmd multi-select, blank-space clearing, selection restoration, context menus, and native tooltips.
- Identity-less or selection-disabled cards are static, non-focusable accessible groups. They do not expose selection keyboard behavior.
- Flip controls and the back background never call the selection manager. The back background returns to Front without stealing focus.
- Inactive faces are `aria-hidden`, inert, untabbable, pointer-inert, and omitted from current screen-reader navigation.
- Keyboard Enter/Space requests destination-control focus after completion. Pointer/touch transfers focus only when the originating control already held focus.
- Screen-reader summaries and tooltips use the viewport-independent KPI presentation and retain all valid enabled information, including explicitly bound Tooltip fields.
- High contrast replaces authored, evaluated, and automatic backgrounds, borders, accents, text, controls, focus, insight/status, and back-face colors.
- `prefers-reduced-motion`, motion None, and zero duration complete immediately without 3D movement or delay.

## Format pane and native `fx`

The seven visible cards are **Card frame**, **Multiple-card layout**, **Front — Label**, **Front — Callout**, **Front — Insight and status**, **Back face and flip motion**, and **Interactions**. These are display names; internal card names remain `cardAppearance`, `multipleCards`, `label`, `mainValue`, `benchmark`, `flip`, and `interactions`. Groups and conditional slice visibility are documented in [Formatting properties](docs/FORMATTING_PROPERTIES.md).

The exact native conditional-formatting paths remain:

1. `cardAppearance.frontBackground`
2. `cardAppearance.borderColor`
3. `cardAppearance.accentColor`
4. `mainValue.fontColor`
5. `benchmark.statusIndicatorColor`

Each uses the official wildcard selector, category/identity-less alternate constant selector, and `ConstantOrRule`. Clearing a rule reveals its saved static constant. `benchmark.statusIndicatorColor` controls front and back status indicators only; it never recolors the numeric insight line. High contrast overrides constants and evaluated colors.

## Upgrade from 1.1.0

- Re-import the 1.2.0 `.pbiviz`.
- Explicitly saved compatible 1.1.0 paths remain supported. Migration order is explicit 1.2 property, explicitly saved compatible 1.1 property, then the 1.2 default. Raw metadata presence—not class defaults—determines whether a setting was saved.
- If `cardAppearance.backBackground` was explicitly saved, it seeds the new back header, back content, and status background only where the new paths are absent. The legacy path remains a hidden compatibility descriptor and never directly drives rendering.
- Unsaved face-layout and motion properties receive 1.2.0 defaults. Reset to default or a new visual instance is the way to obtain every new default.
- The formatting model emits Reset descriptors for the hidden legacy path, but whether Power BI Desktop removes hidden legacy metadata is host behavior and was not Desktop-verified.

## Development and validation

Use Node 24.16.0 and npm 11 from `flipCardVisual`:

```powershell
npm ci
npx playwright install chromium
npm run lint
npm run typecheck
npm test
npm run test:visual
npm run build:dev
npm run build:prod
npm run package
npm run package -- --verbose
npm audit
npm audit --omit=dev
```

CI uses `npx playwright install --with-deps chromium`. The browser harness bundles Inter test weights and waits for `document.fonts.ready` and `document.fonts.check` before geometry assertions. Screenshots under ignored `test-results` are inspection artifacts, not tracked visual-regression baselines. See [Testing](docs/TESTING.md).

The package is written to `flipCardVisual/dist/flipCardVisualFC7B9C3E9690417084C0A63577A86637.1.2.0.0.pbiviz`.

## Power BI Desktop smoke test

Desktop validation remains manual. Before distribution:

1. Re-import 1.2.0 over a formatted 1.1.0 instance; verify explicit saved settings, new defaults on unsaved paths, legacy back-background migration, Reset behavior, and a fresh instance.
2. Add/remove Card Value; bind/unbind Label, Detail, Comparison, Target, and Tooltip fields. Confirm invalid optional values remove their entire rows/sections.
3. Exercise Single, Auto, Multiple, Fit, and Fixed; verify 320×180 single and four-card 2×2 layouts near 660×290 and 320×200.
4. Test Auto, Stacked, and Split fronts; Auto, List, and Tiles backs; long labels; large/negative values; currencies, percentages, display units, model precision, and multiple cultures.
5. Verify Target/Comparison wording, explicit reference names, exact target, tolerance, higher/lower-is-better, improvement, decline, unchanged, negative references, and zero references.
6. Flip with mouse, touch, Enter, and Space. Test Horizontal Left/Right, Vertical Up/Down, Fade, None, every easing/perspective/duration, repeated activation, transition cancellation/fallback, and resize/format updates during motion.
7. Verify selection, click-again deselection, Ctrl/Cmd multi-select, blank-space clear, restored host selection, native/default and enhanced tooltips, and card/blank context menus. Confirm all flip actions make zero selection-manager calls.
8. Inspect the exact seven Format cards and named groups, top-level switches, conditional slice visibility, all icon/style/shape combinations, and the separate Details cue with reserved cluster space.
9. Exercise all five native `fx` paths; clear every rule and confirm the static constant returns. Verify status `fx` affects both faces but not insight.
10. Test high contrast, reduced motion, keyboard entry/exit without focus trapping, screen-reader output, identity-less semantics, and PDF/PowerPoint export.

## Limitations

- Power BI Desktop upgrade behavior, field-well persistence, cross-visual filtering, enhanced-tooltip presentation, high-contrast themes, screen-reader behavior, and PDF/PowerPoint export were not automated or claimed as Desktop-verified.
- The installed Power BI API exposes several required formatting enums as declaration-only const enums that are unavailable at the Vitest runtime. Typed named compatibility constants are used and regression-tested; the supported runtime values are unchanged.
- The host’s treatment of hidden metadata during Reset to default cannot be proven outside Desktop even though the descriptor is emitted.
- The `.pbiviz` package schema carries author/version/resource metadata but no project-license field; MIT is verified in the repository `LICENSE` and npm package metadata.
- The release intentionally adds no data roles, analytics-pane features, highlighting expansion, localization expansion, sparklines, images, downloads, drill-down, timed rotation, or whole-card flip.

Source: [GitHub](https://github.com/RonanVergara/PowerBI-FlipCard) · [MIT license](LICENSE) · [development log](docs/DEVELOPMENT_LOG.md) · [changelog](CHANGELOG.md)
