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

## Product Vision

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

## Current Status

The visual is currently a stable multi-card-capable flip card visual.

Phase 4.7 layout stabilization is complete.

Phase 4.8 formatting pane foundation has started, but it is not complete.

The first attempted formatting pane setting was:

```plaintext
Interactions > Enable flip
```

Current result:

```plaintext
The visual can still render.
The Format visual pane does not show the expected Interactions card yet.
The first formatting pane setting is not verified.
Phase 4.8 should be treated as in-progress and needs diagnosis before adding more settings.
```

Current tested status before Phase 4.8 work:

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
onCardClick() is clean and easier to maintain.
Multi-card grid layout works.
Compact multi-card styling works.
Vertical scrolling for many cards works.
Narrow-width layout safety works.
```

Current Phase 4.8 status:

```plaintext
Formatting pane foundation is being prepared.
An initial Enable Flip setting was attempted.
The Interactions card is not appearing in the Format visual pane yet.
No additional formatting settings should be added until this is diagnosed.
```

Important Power BI Desktop note:

```plaintext
The Visualizations pane has separate areas:

Build visual = field wells and data binding
Format visual = paintbrush icon where formatting settings appear

The user already checked the Format visual pane, and Interactions was not visible.
```

---

## Current Field Wells

```plaintext
Card Label   -> Category shown on the card, such as Vendor, Agent, Team, or Call Driver
Card Value   -> Main measure shown on the front face
Detail Value -> Detail measure shown on the back face
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
For each row:
    getCardDataForRow() creates card data
    createCardElements() creates card DOM elements for additional rows
    createCardInstanceForRow() groups data + DOM
    attachCardClickBehavior() attaches click behavior
↓
rebuildCardContainer(cardInstances) clears and rebuilds the card container
↓
renderCard(cardInstance) renders each card
↓
onCardClick(event, cardInstance) controls the click flow
↓
getCardElementsForClick(cardInstance) finds the clicked card elements
↓
handleCardFlip(cardElements) handles flip behavior if enabled
↓
shouldHandleCardSelection(wasFlipped, cardInstance) decides if selection should happen
↓
handleCardSelection(cardInstance) handles Power BI selection/filtering
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
Formatting pane foundation
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

### CardData

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

### CardDomElements

Groups all DOM elements belonging to one card.

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

### CardInstance

Combines card data and card DOM.

```plaintext
CardInstance
├── data
└── elements
```

---

## Current Interaction Flow

```plaintext
Click card
↓
Stop event bubbling
↓
Resolve card elements
↓
Handle flip if enabled
↓
If card was back-facing before the click:
    stop here and do not change Power BI filter
↓
If card was front-facing and selection is enabled:
    select, move selection, or clear selection
```

Current rule:

```plaintext
Front-facing click can filter/select.
Back-facing click only flips back to the front.
```

Future rule:

```plaintext
Flip and selection should become separately configurable.
```

---

## Current Layout Flow

```plaintext
Single-card mode
↓
Use full visual area
↓
Use larger card styling
↓
Keep overflow hidden

Multi-card mode
↓
Use grid layout
↓
Use compact card styling
↓
Allow vertical scrolling only when needed
↓
Prevent horizontal scrolling
↓
Use narrow-width safety rules when visual is very small
```

---

## Current Known Limitations

The project is stable for the current tested phase, but it is still early-stage.

Known limitations:

* Multi-card layout is improved, but not user-configurable yet.
* Selection behavior is still simple and single-select.
* Ctrl / Meta multi-select is not handled yet.
* Flip behavior and Power BI selection still share the same card click, but their logic is now separated internally.
* Flip behavior has an internal feature gate.
* Selection/filtering behavior has an internal feature gate.
* Formatting pane foundation is in progress.
* The first attempted formatting pane card, `Interactions`, is not appearing yet.
* No formatting pane setting should be considered complete yet.
* There are no separate click targets yet.
* Card colors, gradients, typography, spacing, and borders are still mostly hardcoded.
* Conditional formatting is not implemented yet.
* KPI states, targets, variance, and trend indicators are not implemented yet.
* Tooltips are not implemented yet.
* Context menu support is not implemented yet.
* Keyboard navigation is not implemented yet.
* High contrast support is not implemented yet.
* Localization is not implemented yet.
* Metadata, release hygiene, sample PBIX, and certification-readiness still need future cleanup.

Reminder:

```plaintext
These are not failures.
They are the roadmap.
```

---

## Current Formatting Pane Status

Phase 4.8 has started but is not complete.

Current intended first formatting pane setting:

```plaintext
Interactions > Enable flip
```

Current actual result:

```plaintext
The user checked the Format visual pane.
Only default/general formatting groups were visible.
Interactions was not visible.
Enable flip was not visible.
```

Important rule:

```plaintext
Do not add more formatting pane settings until the first one is diagnosed and working.
```

Possible areas to inspect next:

```plaintext
capabilities.json object/property names
settings.ts card/slice names
visual.ts getFormattingModel() method
visual.ts formatting settings service declaration
visual.ts formatting settings service initialization
visual.ts update() populateFormattingSettingsModel call
Whether the pbiviz package imported into Power BI Desktop is the latest built package
Whether Power BI Desktop is using the newly imported visual version
```

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

Known note:

```plaintext
The pwsh warning is not the same as a TypeScript build error.
If pbiviz package shows TypeScript errors, those must be fixed before the package is considered successful.
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

Recommended commit title if committing only documentation:

```bash
git commit -m "Update docs for formatting pane foundation"
```

Recommended commit title if committing the current Phase 4.8 code attempt:

```bash
git commit -m "Start formatting pane foundation"
```

Do not use this commit title yet:

```bash
git commit -m "Add enable flip formatting setting"
```

That title should only be used after `Interactions > Enable flip` appears in the Format visual pane and the on/off behavior is tested.

---

## Next Session Starting Point

When continuing this project, first inspect:

```plaintext
README.md
docs/DEVELOPMENT_LOG.md
flipCardVisual/src/visual.ts
flipCardVisual/src/settings.ts
flipCardVisual/style/visual.less
flipCardVisual/capabilities.json
flipCardVisual/package.json
flipCardVisual/pbiviz.json
```

Then confirm:

```bash
git status
git diff
```

Current focus:

```plaintext
Continue Phase 4.8 — Formatting Pane Foundation.
Do not assume the formatting pane setting is complete.
The Interactions card is currently not appearing in the Format visual pane.
```

Immediate next diagnostic:

```plaintext
Diagnose why Interactions > Enable flip does not appear under:
Visualizations pane -> Format visual / paintbrush icon
```

Current tested baseline before formatting pane work:

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
onCardClick() is clean and easier to maintain.
Multi-card grid layout works.
Compact multi-card styling works.
Vertical scrolling for many cards works.
Narrow-width layout safety works.
```

Latest known direction:

```plaintext
The next step is still Phase 4.8 — Prepare Formatting Pane Foundation.

Important:
Do not jump directly into a full formatting pane redesign.
Do not wire many settings at once.
Do not combine unrelated changes like formatting pane, selection-state redesign, click target redesign, and layout redesign in one big step.
Do not suggest full-file replacements unless explicitly requested.
The next steps should still keep the visual stable.
Always remember the long-term goal: this should become a flexible one-stop-shop smart KPI card visual, not only a flip card.
Future rule: flip behavior and selection/filtering behavior should become separate optional features.
```
