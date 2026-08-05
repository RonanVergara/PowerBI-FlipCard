# Smart KPI Flip Card for Power BI

Smart KPI Flip Card is a production-oriented Power BI custom visual for an executive KPI and its supporting context. The front keeps the signal concise; a dedicated button reveals a back face with detail, comparison, target, variance, and status. Selecting and flipping are separate interactions, so the card behaves predictably in a report.

The visual preserves the original visual identity and supports category-driven multiple cards for existing reports. Without a Label category, it deliberately renders one responsive KPI card.

## What the visual shows

The front face contains the optional Label, Card Value, optional variance, textual KPI status, and a small flip button. The back face includes only populated and enabled sections, so Detail Value, Comparison Value, Target Value, variance, and status reflow without empty gaps.

The card adapts at common dashboard sizes. Compact mode removes secondary front content before reducing the main value, long labels can wrap to two lines, and a clear message replaces the card below the minimum usable viewport.

## Data fields

| Field | Required | Purpose |
| --- | --- | --- |
| Label | No | Category/grouping and visible KPI label; multiple category rows produce multiple cards. |
| Card Value | Yes | Finite numeric measure displayed as the primary value. |
| Detail Value | No | Supporting measure displayed on the back. |
| Comparison Value | No | Benchmark used for variance and, when no valid target exists, KPI status. |
| Target Value | No | First-priority benchmark for KPI status. |
| Tooltips | No | Repeatable category or measure fields appended to the native tooltip. |

Display names, model format strings, culture, currencies, percentages, display units, and decimal settings are handled through the Power BI formatting utilities. `Auto` decimal precision preserves the bound model format.

## KPI and variance rules

- Status compares Card Value with a valid Target first, then a valid Comparison. With neither, status is neutral and shown as “No benchmark.”
- Variance compares Card Value with a valid Comparison first, then Target.
- Absolute variance is `Card Value - reference`.
- Percentage variance is `absolute variance / abs(reference)`.
- A zero reference retains the absolute variance and reports that percentage variance is unavailable.
- Neutral tolerance is a percentage of the absolute status reference. Values within the tolerance, including the boundary, are neutral.
- Higher-is-better and lower-is-better change favorable direction only; the displayed variance remains mathematically signed.
- Blank, non-numeric, `NaN`, and infinite optional benchmarks are ignored. An invalid target falls back to a valid comparison.

Every status includes text and a symbol as well as color: Positive / On track, Neutral / Near target or No benchmark, and Negative / Off track.

## Interactions

- Click the card body to select its Power BI category identity.
- Click an already solely selected card to clear it.
- Hold Ctrl on Windows or Cmd on macOS while clicking for multi-select.
- Click blank visual space to clear selection.
- Use the small flip button to change faces. A body click never flips, and a flip-button click never selects.
- Right-click a card for the native Power BI context menu for that identity. Right-click blank space for the visual context menu.
- Hover or focus through Power BI’s native tooltip behavior to see all configured values, variance, status, and Tooltips-bucket fields.

When no Label identity exists, the card still renders and flips; selection calls are intentionally disabled.

## Format pane

The modern Power BI formatting model exposes six cards:

- Card appearance: front/back backgrounds, border, radius, shadow, accent, and internal padding.
- Label: visibility, font, size, color, bold, alignment, and wrapping.
- Main value: font, size, color, bold, alignment, display units, and decimals.
- Detail values: section visibility, font, colors, units, decimals, spacing, target/comparison/variance controls.
- KPI status: visibility, higher/lower direction, tolerance, three status colors, variance mode, and conditional color target.
- Flip behavior: button visibility, position, size/colors, animation duration, and default face.

Conditional status color can apply to the indicator only, accent/border, main value, or card background.

## Accessibility

The visual uses native sibling buttons for selection and flipping, a logical face-aware tab order, visible focus rings, Enter/Space activation, descriptive labels and pressed states, and screen-reader summaries. It honors the Power BI high-contrast palette, communicates status without color alone, and disables flip motion under `prefers-reduced-motion: reduce`.

## Install in Power BI Desktop

1. Download or build the `.pbiviz` file.
2. In Power BI Desktop, open the Visualizations pane and choose **Import a visual from a file**.
3. Select `flipCardVisualFC7B9C3E9690417084C0A63577A86637.1.0.0.0.pbiviz` and confirm the security prompt.
4. Add **Smart KPI Flip Card** to the report canvas.
5. Bind a numeric measure to **Card Value**. Add Label, Detail Value, Comparison Value, Target Value, and Tooltips as needed.
6. Use **Format visual** to adjust appearance, KPI rules, and flip behavior.

## Build from source

Use Node.js 24 LTS and npm 11. From the `flipCardVisual` directory:

```powershell
npm ci
npm run lint
npm run typecheck
npm test
npm run build:dev
npm run build:prod
npm run package
```

Available commands:

| Command | Result |
| --- | --- |
| `npm run dev` | Starts the local Power BI developer visual server. |
| `npm run build:dev` | Builds unminified resources without a `.pbiviz` or statistics report. |
| `npm run build:prod` | Builds minified production resources without a `.pbiviz`. |
| `npm run package` | Creates the production `.pbiviz` without a webpack report. |
| `npm run lint` | Runs ESLint with zero warnings allowed. |
| `npm run typecheck` | Strictly checks production and test TypeScript. |
| `npm test` | Runs the Vitest/jsdom suite once. |
| `npm run test:watch` | Runs tests in watch mode. |

The package is generated at:

```text
flipCardVisual/dist/flipCardVisualFC7B9C3E9690417084C0A63577A86637.1.0.0.0.pbiviz
```

The Power BI tools currently need the `--all-locales` build flag because formatting utilities 7.0.0 emit ES-module locale data that the tools’ locale-pruning loader cannot evaluate. The scripts apply the supported flag automatically. On Windows, install PowerShell 7 (`pwsh`) if the development server needs to generate its HTTPS certificate; resource builds and packaging do not require a tracked certificate.

## Current limitations

- A Label with multiple rows retains compatibility by producing a compact card grid; grid layout options are not exposed in the Format pane.
- The repository does not include a sample PBIX or automated Power BI Desktop control, so live field-well persistence, cross-visual filtering, native tooltip/context-menu presentation, high-contrast themes, and PowerPoint/PDF export still require a Desktop smoke test.
- The visual is not AppSource-certified and currently ships only `en-US` authoring strings.

## Support and source

- Repository: [github.com/RonanVergara/PowerBI-FlipCard](https://github.com/RonanVergara/PowerBI-FlipCard)
- Issues and support: [github.com/RonanVergara/PowerBI-FlipCard/issues](https://github.com/RonanVergara/PowerBI-FlipCard/issues)
- License: [MIT](LICENSE)

Technical implementation details are in [docs/DEVELOPMENT_LOG.md](docs/DEVELOPMENT_LOG.md), and release notes are in [CHANGELOG.md](CHANGELOG.md).
