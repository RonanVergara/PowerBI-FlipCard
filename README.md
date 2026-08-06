# Smart KPI Flip Card for Power BI

## Simple card first

Smart KPI Flip Card 1.1.0 starts as a clean, neutral Power BI card. **Card Value is the only required field.** A new visual shows the optional Label—or the Card Value measure name when Label is unbound—and the model-formatted callout value. Flip, benchmark/status, multiple cards, and selection are independent capabilities that report authors enable only when needed.

The visual preserves GUID `flipCardVisualFC7B9C3E9690417084C0A63577A86637`, Ronan Vergara’s author identity, the MIT license, and the existing `cardLabel`, `cardValue`, `detailValue`, `comparisonValue`, `targetValue`, and `tooltips` role identifiers.

## Activate optional features

| Feature | How to activate it | Result |
| --- | --- | --- |
| Core card | Bind **Card Value**. Optionally bind **Label**. | One full-viewport card with label and formatted value only. |
| Benchmark and status | Turn on **Benchmark and status**, then bind Target and/or Comparison. | Target is the first status reference; Comparison is the first variance reference. Invalid references produce no benchmark UI. |
| Flip and details | Turn on **Flip and details**, then bind a valid Detail Value or enable Benchmark with a valid reference. | A flip control and meaningful back face appear. A binding alone never forces Flip on. |
| Multiple cards | Turn on **Multiple cards**, then choose **Auto** or **Multiple**. | Auto uses a single presentation for one row and a grid for multiple identified rows. Multiple requires Label and always applies the selected sizing behavior. |
| Selection/filtering | On by default under **Interactions**. | Effective only when Label supplies a Power BI category identity. |

Optional field wells remain statically visible because Power BI declares roles in `capabilities.json`; feature switches make those fields visually inert until enabled.

## Card modes and sizing

- **Single** is the 1.1.0 default. It accepts zero or one Label row and fills the viewport. Multiple rows show one configuration message; no row is discarded.
- **Auto** fills the viewport for one row. Multiple identified Label rows use the responsive grid; missing identities show a configuration message.
- **Multiple** requires Label. One or more category rows use **Fit to space** or **Fixed size**.
- **Fit to space** is the default. It evaluates feasible columns, compacts before scrolling, never creates horizontal overflow, and lets one row fill the viewport. The 160×110 setting is a preferred target, not a hard minimum.
- **Fixed size** honors configured width and height, including one-row Multiple mode, and may intentionally scroll horizontally or vertically.
- Column calculation is named **Automatic** or **Custom** so it is distinct from Auto card mode.

Four core-only vendor cards fit as a 2×2 grid at approximately 660×290 and 320×200. Responsive compaction removes front variance/reference first, shortens secondary content, reduces spacing, constrains the label, then scales the callout below its configured maximum. Flip-control space remains reserved.

## Data and benchmark rules

| Field | Required | Behavior |
| --- | --- | --- |
| Label | No | Card label, category rows, identities, selection, and Multiple mode. |
| Card Value | Yes | Finite numeric callout value. Model format, culture, display units, and precision are retained. |
| Detail Value | No | Meaningful back content only when Flip is enabled. |
| Comparison Value | No | First variance reference; fallback status reference. |
| Target Value | No | First status reference; fallback variance reference. |
| Tooltips | No | Additional fields in the native Power BI tooltip. |

Absolute variance is `Card Value - reference`. Percentage variance divides by `abs(reference)`, preserves negative-reference behavior, and is unavailable for a zero reference. Tolerance uses the absolute status reference. Higher/lower-is-better changes favorable direction without changing the signed variance. Blank, invalid, `NaN`, and infinite optional values do not create UI or announcements. The visual never displays “No benchmark.”

## Native conditional formatting (`fx`)

The visual implements Power BI `ConstantOrRule` descriptors with the official wildcard selector and `altConstantValueSelector` pattern for exactly these five paths:

1. `cardAppearance.frontBackground`
2. `cardAppearance.borderColor`
3. `cardAppearance.accentColor`
4. `mainValue.fontColor`
5. `benchmark.statusIndicatorColor`

Evaluated colors resolve from category-row objects, then value-column row objects, then an explicitly saved static constant. Clearing an `fx` rule reveals the saved constant. Without a saved status override, positive/neutral/negative status colors remain automatic. Power BI high-contrast colors override every constant and evaluated color.

## Interactions and accessibility

- Front-card click selects; clicking the sole selected card again clears it. Ctrl/Cmd supports multi-select, and blank visual space clears selection.
- Flip buttons stop propagation and never select, clear, or filter. Back-face background and the dedicated back control both return to Front.
- Right-click uses native card or blank-space context menus. Tooltips use Power BI’s native/default and enhanced-tooltip support.
- Hidden faces are `aria-hidden`, inert, removed from tab order, and unable to receive pointer events. Native buttons support mouse, touch, Enter, and Space, with visible focus transfer between face controls.
- Face state survives resize, ordinary formatting updates, and too-small recovery for stable identities. New identities start on Front; disabling Flip returns to Front.
- High contrast replaces authored colors, and `prefers-reduced-motion` forces zero-duration face changes.

## Format pane

Seven cards use progressive disclosure: **Card**, **Layout**, **Label**, **Callout value**, **Benchmark and status**, **Flip and details**, and **Interactions**. Core controls are always available. Multi-card subsettings appear only when enabled, Fixed dimensions only in Fixed sizing, benchmark settings only when enabled, and back/flip settings only when enabled. Legacy settings remain hidden compatibility metadata; legacy Default Face is ignored.

## Upgrade note

- Re-import the new `.pbiviz`.
- Compatible explicitly saved formatting is retained: an explicitly saved new property wins; otherwise a compatible explicitly saved legacy property may migrate; otherwise the neutral 1.1.0 default applies.
- 1.1.0 intentionally defaults to strict Single. An upgraded instance with multiple Label rows and no explicitly saved new mode may show the configuration message until **Auto** or **Multiple** is enabled. The visual does not attempt unreliable legacy-instance detection.
- Legacy Default Face never exposes the back when Flip is disabled.
- Use **Reset to default** or create a new instance to obtain all neutral defaults.

## Install and build

In Power BI Desktop, import `flipCardVisualFC7B9C3E9690417084C0A63577A86637.1.1.0.0.pbiviz` through **Import a visual from a file**. To build locally, use Node.js 24 and npm 11 from `flipCardVisual`:

```powershell
npm ci
npm run lint
npm run typecheck
npm test
npm run build:dev
npm run build:prod
npm run package
npm run package -- --verbose
npm audit
npm audit --omit=dev
```

The local pinned `pbiviz` writes the artifact to `flipCardVisual/dist/flipCardVisualFC7B9C3E9690417084C0A63577A86637.1.1.0.0.pbiviz`. Build scripts use `--all-locales` for the current formatting-utilities/tooling combination. `pwsh` is needed only when the tools generate a development certificate; no certificate is tracked.

## Manual Power BI Desktop smoke test

Power BI Desktop was not available for this release, so perform these checks before distribution:

1. Re-import 1.1.0.0. Confirm compatible saved formatting remains. Confirm a legacy multi-Label instance with no new mode may require enabling Auto/Multiple; test Reset to default and a new neutral instance.
2. Add/remove Card Value and verify missing, no-data, invalid, too-small, and ready states never mix cards with a landing message.
3. Bind four Vendor rows and test 2×2 Fit layout near 660×290 and 320×200 with no horizontal overflow or unnecessary scrollbar. Test Single, Auto, Multiple, Automatic/Custom columns, and Multiple Fixed with one row.
4. Resize through tiny and normal sizes; verify content compaction, value legibility, retained face state, and reconstructed DOM.
5. Enable Flip with Detail and/or Benchmark. Test front/back using mouse, touch, Enter, and Space; test back background; confirm one activation returns and does not change filtering.
6. Toggle Benchmark off/on. Test Target priority, Comparison fallback, invalid references, negative references, tolerance boundaries, and a zero reference.
7. Test select, click-again clear, Ctrl/Cmd multi-select, blank-space clear, selection restoration, and identity-less selection inactivity.
8. Test native/default and enhanced tooltips plus card and blank-space context menus.
9. Test `fx` for all five paths listed above on categorized cards and an identity-less card. Clear each rule and verify its static constant returns.
10. Test a high-contrast theme, reduced motion, and PDF/PowerPoint export.

## Honest limitations

- Live Desktop field-well persistence, cross-visual filtering, enhanced-tooltip presentation, high-contrast themes, and export were not automated or claimed as Desktop-verified.
- The visual does not implement unrelated optional features reported by the Power BI tools, including highlighting, localization, drill-down, analytics-pane features, images, or sparklines.
- The project is not AppSource-certified and ships English authoring strings.

Source: [github.com/RonanVergara/PowerBI-FlipCard](https://github.com/RonanVergara/PowerBI-FlipCard) · [MIT license](LICENSE) · [development notes](docs/DEVELOPMENT_LOG.md) · [changelog](CHANGELOG.md)
