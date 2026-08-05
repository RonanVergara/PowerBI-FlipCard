# Smart KPI Flip Card — Technical Notes

This document describes the implementation of production release 1.0.0. It is an architecture and maintenance reference, not a duplicate of the end-user README.

## Architecture

The visual keeps host orchestration separate from data and presentation logic:

| Module | Responsibility |
| --- | --- |
| `src/visual.ts` | Power BI lifecycle, formatting population, stable card instances, selection, context menus, tooltips, viewport state, and rendering events. |
| `src/data.ts` | Categorical role lookup, row extraction, validation, display names, selection identities, and stable keys. |
| `src/kpi.ts` | Pure benchmark, tolerance, status, and variance calculations. |
| `src/valueFormatting.ts` | Power BI value formatting, signed variance text, zero-reference handling, and tooltip item composition. |
| `src/renderer.ts` | Safe DOM creation, card-face rendering, conditional styling, ARIA state, and high-contrast colors. |
| `src/settings.ts` | Formatting-model cards, slices, defaults, enumerations, and validators. |
| `src/types.ts` | Shared domain types and view models. |
| `style/visual.less` | Root-scoped layout, responsive behavior, focus styles, flip animation, and reduced-motion override. |

No user-provided content is inserted with `innerHTML`; rendering uses created nodes and `textContent`.

## Data flow

1. `Visual.update()` starts the host rendering lifecycle and populates formatting settings from the current `DataView`.
2. Viewport classes and the very-small state are evaluated before extraction.
3. `extractDataView()` finds columns by their stable role identifiers, validates values, formats them with source metadata and locale, creates category identities where possible, and calculates KPI results.
4. Presentation preparation formats variance and composes native tooltip items.
5. `renderCards()` reconciles DOM instances by stable selection key. Existing identities retain face state; changed identities start at Default Face.
6. The renderer applies content, section visibility, CSS variables, conditional color, and accessibility state.
7. Host selection state is reapplied, then rendering finishes exactly once. Unexpected exceptions signal `renderingFailed` and are rethrown.

Without a Label category, extraction intentionally uses only the first Card Value row. With Label, one instance is produced per category row for backward compatibility.

## Formatting model

`VisualFormattingSettingsModel` contains six `SimpleCard` classes whose names and slice names match `capabilities.json`. `FormattingSettingsService.populateFormattingSettingsModel()` runs during every update, including formatting-only updates. `getFormattingModel()` returns `buildFormattingModel()` directly.

Dropdown values are stable string enums. Numeric controls have formatting-model validators. Decimal precision defaults to `Auto` (`undefined` at the formatter boundary), preserving model precision and formats. Power BI SDK package 5.11.1 exposes API version 5.11.0, which is the value stored in `pbiviz.json`.

## KPI rules

- Valid Target has first priority for status; otherwise valid Comparison; otherwise no benchmark.
- Valid Comparison has first priority for variance; otherwise valid Target.
- Absolute variance is value minus variance reference.
- Percentage variance divides by `abs(reference)`, so negative references retain an intuitive denominator while absolute variance remains signed.
- A zero reference makes percentage variance unavailable instead of producing infinity.
- Neutral tolerance is `abs(status reference) × tolerance percent / 100`.
- Direction controls favorable sign only. Equality and differences within tolerance are neutral.
- Invalid optional fields are not calculation inputs. Invalid Target can therefore fall back to Comparison.

## Selection and flip state

The selection surface and flip control are sibling native buttons. Their event handlers are attached once when an identity-keyed card instance is created.

- Selection uses `select(identity, ctrlKey || metaKey)` and `clear()` for a sole selected identity clicked again.
- `registerOnSelectCallback()` and `getSelectionIds()` restore styling after host updates.
- Root blank-space clicks clear selection.
- Flip buttons stop propagation and update only local face state.
- Changing Default Face resets retained instances. Hiding the button returns instances to the configured default.
- A category-less card has no selection identity and makes no invalid host calls.

Right-click routes through `showContextMenu()` with either the card identity or an empty visual context. Browser context menus are suppressed inside the visual.

## Native tooltips

`powerbi-visuals-utils-tooltiputils` is attached to both face selection surfaces. Data includes Label, all present configured values, formatted variance, textual status, and every Tooltips-bucket projection. Display names and formats come from the Power BI metadata source. Flip buttons do not own tooltip handlers and therefore cannot trigger accidental selection or tooltip duplication.

## Accessibility and responsive behavior

Native buttons provide Enter/Space activation. Only controls on the visible face participate in tab order; the hidden face is marked `aria-hidden`. Selection and flip controls expose pressed state and descriptive labels, while a visually hidden summary contains label, value, variance, and status.

Power BI high-contrast mode replaces authored background, foreground, border, status, and link/button colors with the host palette. Status always includes text and a symbol. CSS uses a root namespace, container-relative type sizing, compact/tiny viewport classes, two-line label clamping, and overflow-safe detail rows. `prefers-reduced-motion` disables the transform transition.

## Testing strategy

Vitest runs in jsdom with typed Power BI host, event-service, selection-manager, identity, and tooltip mocks.

- `kpi.test.ts`: priority, fallback, both directions, three statuses, tolerance, negative references, and zero division.
- `data.test.ts`: all/required-only fields, optionals, tooltips, formatting metadata, category identity behavior, blank/invalid/non-finite inputs, and variance modes.
- `settings.test.ts`: production defaults, persisted properties, validators through the model, and all Format pane cards.
- `renderer.test.ts`: safe DOM structure, hidden sections, face tab order, ARIA, status text, and high contrast.
- `visual.test.ts`: selection/multi-select/clear/restore, flip isolation and persistence, context menus, tooltip contents, empty states, viewport classes, rendering events, formatting model, and cleanup.
- `style.test.ts`: root scoping, compact/tiny behavior, overflow handling, and reduced-motion rules.

The test suite deliberately exercises observable behavior; it contains no trivial assertions.

## Build and release process

Use Node.js 24 LTS and npm 11:

```powershell
cd flipCardVisual
npm ci
npm run lint
npm run typecheck
npm test
npm run build:prod
npm run package
```

Dependencies are exact versions in `package.json` and resolved by `package-lock.json`. `powerbi-visuals-tools` is local, so scripts never rely on a global `pbiviz`. Generated dependencies, `.tmp`, `dist`, reports, certificates, and editor state are ignored.

The Power BI development server currently brings `uuid` through `sockjs`; an exact `11.1.1` npm override keeps that tooling-only chain on the advisory-fixed CommonJS-compatible release.

The GitHub Actions workflow repeats install, lint, type-check, tests, production build, and packaging on pushes and pull requests, then uploads the `.pbiviz` artifact.

For a release:

1. Update npm/package and four-part visual versions consistently.
2. Update `CHANGELOG.md` and user documentation.
3. Run the complete verification matrix from a clean checkout.
4. Inspect the packaged filename and archive contents.
5. Smoke-test the package in Power BI Desktop before distributing it.

## Important decisions

- The original GUID and existing data-role identifiers are retained to avoid breaking saved reports.
- Single-card behavior is primary; the historical category grid is retained only when Label produces multiple identities.
- Flip state belongs to stable card instances rather than update calls.
- Expected author states are rendered messages, not rendering failures.
- Selection and flipping use separate controls to eliminate ambiguous body clicks.
- The supported `--all-locales` Power BI tools flag works around an upstream ES-module locale-pruning incompatibility in formatting utilities 7.0.0.
- Export reliability favors complete synchronous DOM rendering before `renderingFinished`; no delayed animation callback gates the host lifecycle.

## Optional future enhancements

- Localized authoring and empty-state strings.
- Configurable multi-card grid columns and card height.
- A sample PBIX and automated screenshot regression fixtures.
- Trend/sparkline data roles.
- AppSource certification work, including certification-specific lint and marketplace assets.
