# Power BI Flip Card Custom Visual

## Project Overview

Power BI Flip Card is a custom Power BI visual that creates a modern, interactive smart KPI card experience.

The project started as a click-to-flip KPI card, but the long-term goal is bigger than a flip animation.

The goal is to build a reusable and highly customizable Power BI visual that can work as:

* A simple static KPI card
* An animated flip card
* A multi-card KPI grid
* A category-based card comparison visual
* A dashboard filtering helper without bookmarks
* A flexible one-stop-shop KPI visual controlled through the Power BI formatting pane

This is a learning-first project and a portfolio-quality project.

The visual should become useful in real dashboards, not just as a coding demo.

---

## ⭐ Product Vision

Power BI Flip Card should become a customizable smart KPI card visual for Power BI.

The long-term direction is:

```plaintext
One visual.
Multiple card modes.
User-controlled features.
No bookmarks required.
Modern Power BI dashboard experience.
```

The goal is not only to build a card that flips.

The goal is to build a flexible KPI super-visual that can start simple and grow into a richer interactive card experience.

---

## Product Principles

This project follows these principles:

* The visual should work first as a simple, stable KPI card.
* Advanced features should be optional.
* Flip behavior should be optional.
* Multi-card behavior should be optional.
* Selection/filtering behavior should be optional.
* Formatting pane settings should allow users to customize the visual without coding.
* Features should be built as modes, not separate forks.
* New features should not break existing working behavior.
* The visual should be useful for real dashboards, portfolio projects, and professional reporting.
* Stability and learning are more important than rushing.

Important product mindset:

```plaintext
Do not build only a cool flip animation.
Build a practical smart KPI card visual where flip is one optional feature.
```

Important future interaction rule:

```plaintext
Flip behavior = optional
Selection/filter behavior = optional
Maybe separate click targets later
Example: whole card flips, small icon/filter area selects
```

---

## Main Goal

Create a reusable Power BI custom visual where:

* A card can behave like a normal KPI card.
* A card can optionally flip when clicked.
* The front face shows a main KPI.
* The back face shows a detail KPI.
* Category labels such as Vendor, Team, Agent, or Call Driver can be shown.
* Power BI measure formatting is respected.
* Multiple cards can be rendered from category rows.
* Clicking a card can select the related Power BI category value.
* Clicking the selected card again can clear the selection.
* Selected state has visible border/glow feedback.
* Back-face clicks can return a card to the front without changing the filter.
* Users can later customize content, layout, colors, typography, borders, animation, and interactions through the formatting pane.

---

## ✅ Current Status

The visual is currently a stable **multi-card-capable flip card visual**.

Current tested status:

```plaintext
Single-card visual works.
Multi-card visual works.
Card resizes correctly.
Cards flip correctly.
Power BI filtering works when a front-facing card is clicked.
Clicking another card moves the filter to that card.
Clicking the selected front-facing card again clears selection.
Clicking a back-facing card flips it to the front without changing the filter.
Selected border/glow feedback works.
Values and percentage formatting work.
Empty state works.
Flip and selection logic are separated into helpers.
Internal feature gates for flip and selection are prepared.
visual.ts helper sections are organized.
Multi-card grid layout works.
Multi-card compact text rules work.
Vertical scrolling for many cards works.
Narrow visual safety layout works.
```

Current development stage:

```plaintext
Phase 4 — Multi-card interaction and layout stabilization
```

Current focus:

```plaintext
Controlled multi-card support is now stable enough to begin preparing the next foundation step.
The next step should still be small and safe.
```

Current important status:

```plaintext
The visual can now render multiple CardInstance objects from category rows.
The click flow is cleaner and separated into helper methods.
The code is prepared for future optional flip and optional selection settings.
The multi-card layout is more predictable using CSS grid rules.
The next step should not be a full redesign.
```

---

## Current Field Wells

```plaintext
Card Label   → Category shown on the card, such as Vendor, Agent, Team, or Call Driver
Card Value   → Main measure shown on the front face
Detail Value → Detail measure shown on the back face
```

Example setup:

```plaintext
Card Label   = Vendor
Card Value   = Total Calls
Detail Value = CSAT %
```

Example front card:

```plaintext
HGS
Total Calls
16.63K
Click card to view details
```

Example back card:

```plaintext
HGS
CSAT %
85.8%
Front value: 16.63K
```

---

## Current Code Pattern

The current `visual.ts` structure supports controlled multi-card rendering and cleaner card interaction flow.

Current mental model:

```plaintext
Power BI sends data
↓
update() receives the update
↓
resizeCard() sizes the visual container from Power BI viewport
↓
getCategoryRowCount() checks available category rows
↓
createCardInstances(dataView, rowCount) creates the card instance list
↓
rebuildCardContainer(cardInstances) clears and rebuilds the card container
↓
renderCard(cardInstance) renders each card
↓
onCardClick(event, cardInstance) controls the click flow
```

Main helper groups inside `visual.ts`:

```plaintext
Card types
Constructor and update flow
Layout and state helpers
Data preparation helpers
Card creation helpers
Card rendering helpers
Card interaction helpers
Power BI lookup and formatting helpers
```

Important learning concept:

```plaintext
One function should have one main job.
```

---

## Current DOM Structure

The visual can render multiple cards inside a container.

```plaintext
target
└── flip-card-container
    ├── flip-card-wrapper
    │   └── flip-card-inner
    │       ├── flip-card-front
    │       └── flip-card-back
    ├── flip-card-wrapper
    │   └── flip-card-inner
    │       ├── flip-card-front
    │       └── flip-card-back
    └── ...
```

The number of cards depends on category rows from Power BI.

---

## Current TypeScript Shapes

### `CardData`

Represents the information shown on the card.

```plaintext
CardData
├── label
├── frontTitle
├── frontValue
├── frontSubtitle
├── backTitle
├── backValue
├── backSubtitle
└── selectionId
```

### `CardDomElements`

Represents the HTML elements that make up one card.

```plaintext
CardDomElements
├── wrapper
├── inner
├── frontLabel
├── frontTitle
├── frontValue
├── frontSubtitle
├── backLabel
├── backTitle
├── backValue
└── backSubtitle
```

### `CardInstance`

Groups one card’s data and DOM elements together.

```plaintext
CardInstance
├── data
│   └── CardData
└── elements
    └── CardDomElements
```

Current storage:

```plaintext
this.cardInstances: CardInstance[]
```

---

## Current Layout Direction

The card container supports both single-card and multi-card modes.

Single-card mode:

```plaintext
Uses the full visual area.
Keeps the large KPI card style.
Keeps overflow hidden to avoid flip animation scrollbar flash.
```

Multi-card mode:

```plaintext
Uses CSS grid for predictable rows and columns.
Uses compact text rules so each card fits better.
Allows vertical scrolling only when many cards do not fit.
Prevents horizontal scrolling.
Has a narrow-width safety rule for very small visual sizes.
```

Current multi-card layout behavior:

```plaintext
Normal multi-card layout:
- Cards use a controlled grid.
- Columns fit between 220px and 320px.
- Rows use a consistent 160px height.
- Cards are centered when there is extra horizontal space.

Many-card behavior:
- Vertical scrolling appears only when needed.
- Horizontal scrolling is hidden.

Very narrow visual behavior:
- Cards switch to one compact column.
- Row height, padding, and text sizes are reduced.
```

Important layout principle:

```plaintext
Single-card mode should feel premium and spacious.
Multi-card mode should feel compact, readable, and controlled.
```

---

## ⚠️ Current Limitations

The project is promising, but it is still early-stage.

Current limitations:

* Multi-card layout is improved, but still not user-configurable.
* Selection behavior is still simple and single-select.
* Ctrl / Meta multi-select is not handled yet.
* Flip behavior and Power BI selection still share the same card click, but their logic is now separated internally.
* Flip behavior has an internal feature gate, but it is not user-configurable yet.
* Selection/filtering behavior has an internal feature gate, but it is not user-configurable yet.
* There are no separate click targets yet.
* Formatting pane settings are not wired into the visual yet.
* Card colors, gradients, typography, spacing, and borders are still hardcoded.
* Conditional formatting is not implemented yet.
* KPI states, targets, variance, and trend indicators are not implemented yet.
* Tooltips are not implemented yet.
* Context menu support is not implemented yet.
* Keyboard navigation is not implemented yet.
* High contrast support is not implemented yet.
* Localization is not implemented yet.
* Metadata, release hygiene, sample PBIX, and certification-readiness still need future cleanup.

Important reminder:

```plaintext
These are not failures.
They are the roadmap.
```

---

## Product Roadmap

The stronger product direction is to become a mode-based KPI super-visual.

Target modes:

```plaintext
Mode 1: Static KPI Card
Mode 2: Flip KPI Card
Mode 3: Multi-Card KPI Grid
Mode 4: KPI Comparison / State Card
Mode 5: Dashboard Filtering Card
```

Long-term priority stack:

```plaintext
1. Proper formatting pane integration
2. True user-controlled multi-card grid support
3. Separate flip behavior from selection/filter behavior
4. Tooltip and context menu support
5. Accessibility support
6. KPI states and comparisons
7. Theme-aware rendering
8. Localization and locale correctness
9. Sparkline / mini trend support
10. Packaging, sample report, release, and certification preparation
```

Immediate development path:

```plaintext
Complete documentation and commit Phase 4.7 layout stabilization
↓
Prepare formatting pane foundation carefully
↓
Add first simple formatting setting
↓
Add optional flip setting
↓
Add optional selection/filter setting
↓
Add additional KPI customization features
```

---

## Current Development Focus

### Phase 4.7 — Multi-Card Layout Rules

Status:

```plaintext
Completed and tested locally.
```

Completed:

* Replaced loose flex-style multi-card sizing with a more predictable CSS grid layout.
* Added compact multi-card text rules.
* Added vertical scrolling for many-card scenarios.
* Prevented horizontal scrolling.
* Added narrow-width safety rules.
* Confirmed single-card mode still looks stable.
* Confirmed multi-card mode still works.
* Confirmed flip and selection behavior still work after layout changes.

Do not next:

* Do not add the full formatting pane in one big step.
* Do not add multiple user-facing interaction toggles all at once.
* Do not add separate click targets yet.
* Do not redesign the whole visual.
* Do not move helpers into separate files yet.

Recommended next focus:

```plaintext
Phase 4.8 — Prepare Formatting Pane Foundation
```

Goal:

```plaintext
Start formatting pane work carefully with a small, low-risk setting.
Keep the visual stable.
Do not wire every customization option at once.
```

---

## Future Product Features

Near-term:

* [x] Improve responsive layout rules for multiple cards
* [x] Decide basic scrolling behavior for many cards
* [ ] Decide whether one card or many cards can be flipped at the same time
* [ ] Add formatting pane foundation
* [ ] Add normal card / flip card toggle
* [ ] Add single-card / multi-card toggle
* [ ] Add selection/filtering toggle
* [ ] Separate flip interaction from selection interaction
* [ ] Add front card color settings
* [ ] Add back card color settings
* [ ] Add typography settings
* [ ] Add border settings
* [ ] Add shadow settings
* [ ] Add animation speed setting
* [ ] Add label visibility toggle
* [ ] Add subtitle visibility toggle

Later:

* [ ] Tooltip support
* [ ] Context menu support
* [ ] Conditional formatting
* [ ] Status chips
* [ ] Icons or status indicators
* [ ] Target value
* [ ] Prior period value
* [ ] Variance display
* [ ] Mini sparkline or trend strip
* [ ] Theme-aware colors
* [ ] High contrast support
* [ ] Keyboard navigation
* [ ] Localization support
* [ ] Mobile-friendly layout
* [ ] Sample PBIX report
* [ ] Release notes
* [ ] AppSource/certification-readiness cleanup

---

## Target Smart KPI Card Anatomy

Future front face example:

```plaintext
┌─────────────────────────────────────┐
│ Status chip        KPI title   Icon │
│ Category / segment label            │
│                                     │
│ Main value                          │
│ Variance vs target        ▲ +4.3%   │
│ Target: 92%    Prior: 88%           │
│ Mini trend sparkline                │
│ Optional action row / hint          │
└─────────────────────────────────────┘
```

Future back face or expanded detail mode:

```plaintext
Detail measure
Explanation / annotation
Top contributor / decomposition hint
Drillthrough hint
Tooltip summary
Last refresh information
Owner or business definition
```

This is the future direction, not the current implemented state.

---

## Build Command

Run this from the visual project folder:

```bash
cd "C:\Power BI Custom Visual\PowerBI-FlipCard\flipCardVisual"
pbiviz package
```

Expected successful result:

```plaintext
Lint check completed.
Package created!
Build completed successfully.
```

Some warnings may currently appear and are not blocking yet:

* `pwsh is not recognized`
* Formatting pane recommendations
* High contrast recommendations
* Keyboard navigation recommendations
* Tooltip recommendations

These warnings should be handled later as the project matures.

---

## Project Folder Structure

```plaintext
Power BI Custom Visual
│
└── PowerBI-FlipCard
    ├── README.md
    ├── .gitignore
    ├── docs
    │   └── DEVELOPMENT_LOG.md
    │
    └── flipCardVisual
        ├── assets
        ├── src
        │   └── visual.ts
        ├── style
        │   └── visual.less
        ├── capabilities.json
        ├── package.json
        ├── package-lock.json
        ├── pbiviz.json
        └── tsconfig.json
```

Possible future structure:

```plaintext
src/
├── visual.ts
├── cardTypes.ts
├── cardDom.ts
├── cardData.ts
├── cardInteraction.ts
├── cardFormatting.ts
└── cardLayout.ts
```

Current decision:

```plaintext
Keep helpers inside visual.ts for now.
Only move helpers into separate files after the helper groups become stable and obvious.
```

---

## Documentation Strategy

Use this documentation structure:

```plaintext
README.md = public-facing project overview, current status, roadmap, and build notes
docs/DEVELOPMENT_LOG.md = detailed phase history, learning notes, test results, and next session starting point
CHANGELOG.md = future version/release notes only
```

Update cadence:

```plaintext
During coding:
- Keep README unchanged unless the project direction changes.
- Keep DEVELOPMENT_LOG unchanged unless a milestone is completed.

End of session:
- Update README with current high-level status and roadmap if needed.
- Update DEVELOPMENT_LOG with detailed changes and test results.
- Commit both together if both changed.
```

---

## Git Workflow

Use this after every successful tested milestone:

```bash
cd "C:\Power BI Custom Visual\PowerBI-FlipCard"

git status
git diff
git add .
git commit -m "Your milestone message here"
git push
git status
```

Expected clean result:

```plaintext
nothing to commit, working tree clean
```

Recommended commit title for this session:

```bash
git commit -m "Stabilize multi-card layout rules"
```

---

## Long-Term Vision

Build a reusable custom Power BI visual that makes dashboards feel more modern, interactive, and web-like.

The project North Star is:

```plaintext
Power BI Flip Card = a customizable smart KPI card visual.
```

It should eventually support:

* Simple static KPI card mode
* Animated flip card mode
* Multi-card interactive grid mode
* Category-based card generation
* Power BI filtering without bookmarks
* Rich formatting pane customization
* Optional flip behavior
* Optional selection/filter behavior
* Separate or configurable click targets
* KPI states and comparisons
* Tooltips and context menu
* Theme-aware styling
* Accessibility support
* Professional dashboard-ready design

The end goal is a visual that users would choose because it saves time, reduces bookmark workarounds, looks modern, and adapts to different KPI dashboard needs.
