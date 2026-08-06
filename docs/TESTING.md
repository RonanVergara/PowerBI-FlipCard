# Testing Smart KPI Flip Card 1.2.0

## Commands

Run from `flipCardVisual` with Node 24.16.0 and npm 11:

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

CI installs Chromium with `npx playwright install --with-deps chromium` and uploads ignored `playwright-report` and `test-results` folders only on failure.

## Test layers

- Vitest covers data extraction/formatting, cultures, KPI semantics, layout plans, settings/migration/Reset, capabilities, renderer/accessibility/high contrast, selection, tooltips/context menus, transition locking/events/cancellation/fallback/focus, reduced motion, and destruction.
- Playwright uses the real Visual class, deterministic host/data/colors, bundled Inter 400/600/700 weights, `document.fonts.ready`, and `document.fonts.check`.
- Browser geometry covers 320×180 single, 660×290 and 320×200 four-card grids, wide Split, narrow Stacked, List/Tiles back, long negative values, focus, and high contrast.
- Motion coverage includes a paused 50% real CSS transition via Web Animations, completed forward/return motion, transition locking, Horizontal Left, Vertical Up/Down, Fade, and None. Unit coverage maps both horizontal directions, all easing, all perspectives, clamping, event filtering, and cleanup.

Screenshots in `test-results` are temporary inspection artifacts. They are not `toHaveScreenshot` comparisons and no tracked visual baseline is claimed.

## Clean-copy release check

Create a temporary no-hardlink copy outside the primary tree, copy the complete working diff and non-generated new files into it, run the full command set there, and leave the primary worktree untouched. Inspect the final `.pbiviz` as ZIP: manifest/resources/capabilities only, expected GUID/author/version, all six roles/bindings, no certificates, source maps, repositories, reports, or dependencies.

Power BI Desktop checks are manual and listed in the README and completion report.

## Power BI tooling notices

The verbose 7.2.1 packager reports Analytics Pane, Drill Down, Fetch More Data, File Download, Launch URL, Local Storage, Modal Dialog, and Warning Icon as optional improvement opportunities; the standard report also recommends Highlight Data and Localizations. These are optional Power BI capabilities, not packaging failures, and are outside the approved 1.2.0 scope.

On this Windows host, the tool also attempts development-certificate generation and reports that `pwsh` and a PFX/passphrase are unavailable. Resource builds and compressed `.pbiviz` packaging still complete with exit code 0, and archive inspection confirms no certificate is embedded.
