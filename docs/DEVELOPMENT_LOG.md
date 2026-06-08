# Development Log

This file stores detailed project history, learning notes, completed changes, test results, and next session starting points.

The README should stay focused on:

* What the project is
* Current status
* Current roadmap
* Build notes
* High-level product direction

Detailed implementation history belongs here.

---

# Project: Power BI Flip Card Custom Visual

## Product Direction

Power BI Flip Card is being built as a customizable smart KPI card visual for Power BI.

It started as a simple flip card visual, but the long-term goal is to become a flexible KPI visual that can support different dashboard needs without requiring bookmarks or duplicated visuals.

Long-term direction:

```plaintext
One visual.
Multiple card modes.
User-controlled features.
No bookmarks required.
Modern Power BI dashboard experience.
```

Important future rule:

```plaintext
Flip behavior = optional
Selection/filter behavior = optional
Maybe separate click targets later
```

---

# Development Principles

This is a learning-first project.

Development rules:

* Build in small steps.
* Test after every meaningful change.
* Keep the visual stable.
* Do not combine unrelated changes.
* Prefer helper refactors before large features.
* Do not jump into formatting pane until the current behavior is stable.
* Keep README focused.
* Store detailed history in this development log.

Preferred teaching format:

```plaintext
Step number
What we are changing
Where to find the code
What exact small part to add or replace
Why it works
What to test before moving on
```

---

# Phase 1 — Foundation

## Goal

Set up the Power BI custom visual project and confirm the basic development workflow works.

## Completed Work

* Installed Node.js
* Installed Power BI Visual SDK
* Created Power BI custom visual project
* Created GitHub repository
* Added `.gitignore`
* Removed build artifacts from Git tracking
* Built `.pbiviz` package successfully
* Imported and tested first custom visual in Power BI Desktop

## Confirmed Status

```plaintext
Power BI custom visual project exists.
pbiviz package works.
Visual can be imported into Power BI Desktop.
GitHub repository is active.
```

---

# Phase 2 — Flip Card UI

## Goal

Create the first working flip card UI.

## Completed Work

* Created front card face
* Created back card face
* Added basic LESS/CSS styling
* Added click interaction
* Added smooth flip animation
* Tested flip behavior in Power BI Desktop

## Confirmed Status

```plaintext
Card renders in Power BI.
Card flips when clicked.
Front and back faces are visible.
Animation works.
```

---

# Phase 3 — Power BI Data Integration

## Goal

Connect the visual to Power BI data fields and make the card dynamic.

## Completed Work

* Added `Card Label` field well
* Added `Card Value` field well
* Added `Detail Value` field well
* Read dynamic Power BI category labels
* Read dynamic Power BI measure values
* Displayed front and back values dynamically
* Added support for Power BI measure formatting
* Fixed percentage formatting so values such as `0.858` can display as `85.8%`
* Added Power BI selection behavior
* Added click-again-to-clear behavior
* Added selected card border/glow feedback
* Added empty state when required fields are missing

## Confirmed Status

```plaintext
Card Label works.
Card Value works.
Detail Value works.
Percentage formatting works.
Power BI filtering works.
Clicking selected card again clears selection.
Selected border/glow feedback works.
Empty state works.
```

---

# Phase 3.5 — Single-Card Refactor

## Goal

Clean up the single-card visual before preparing for multi-card support.

## Completed Work

* Added `CardData` interface
* Added `getCardDataForRow()` helper
* Added `renderCard()` helper
* Added `resizeCard()` helper
* Added `clearSelectionState()` helper
* Moved row-based logic into helper functions
* Shortened `update()` so it controls the flow instead of doing everything directly

## Learning Notes

Main learning concept:

```plaintext
One function should have one main job.
```

The visual became easier to understand because:

```plaintext
update() controls the flow.
Helpers perform specific tasks.
```

## Confirmed Status

```plaintext
Single-card visual still works.
Card resizes correctly.
Card flips correctly.
Power BI filtering works.
Click-again-to-clear works.
Selected border/glow works.
Values and percentage formatting work.
Empty state works.
```

---

# Phase 4 — Multi-Card Preparation and Interaction Stabilization

## Goal

Move from a single-card-only visual toward controlled multi-card rendering while keeping all existing behavior stable.

## Summary

Phase 4 is the largest development phase so far.

The visual moved from a single-card flip card into a stable multi-card-capable visual.

It now supports multiple card instances from Power BI category rows, controlled card selection, front/back click behavior, cleaner helper-based interaction logic, and improved multi-card layout rules.

---

## Phase 4.1 — Multi-Card Data and DOM Structure

### Completed Work

* Introduced `rowIndex` support
* Updated category label, value, and selection ID logic to use `rowIndex`
* Added `getCategoryRowCount()` helper
* Added `cardContainer` wrapper
* Added flex-ready `.flip-card-container` styling
* Added `CardDomElements` interface
* Added `createCardElements()` helper
* Moved card DOM creation out of the constructor
* Grouped single-card DOM references into `this.cardElements`
* Added `CardInstance` interface
* Added `createCardInstance()` helper
* Added `createCardInstanceForRow()` helper
* Added `createCardInstances()` helper
* Replaced single-card-only state with `cardInstances: CardInstance[]`
* Updated `renderCard()` to accept a full `CardInstance`
* Updated `onCardClick()` to accept a full `CardInstance`
* Removed duplicate `currentSelectionId` state

### Confirmed Status

```plaintext
Single-card visual remained stable.
Card data and DOM were grouped into CardInstance.
The visual was prepared for multi-card rendering.
```

---

## Phase 4.2 — Controlled Multi-Card Rendering

### Completed Work

* Updated `resizeCard()` so the container owns the visual size
* Updated `createCardInstances()` to loop through category rows
* Created one `CardData` object per row
* Created one `CardDomElements` object per row
* Created one `CardInstance` per visible category row
* Attached click behavior to each generated card
* Updated `rebuildCardContainer()` to append all card wrappers
* Updated `update()` to render every card instance
* Added basic responsive sizing behavior for multiple cards

### Confirmed Status

```plaintext
Multiple cards appear correctly.
Each card shows the correct label, front value, and back value.
Each card can flip.
Power BI filtering still works.
Click-again-to-clear still works.
Resize, formatting, selected glow, and empty state still work.
```

---

## Phase 4.3 — Multi-Card Selection Behavior

### Completed Work

* Clicking an unselected card selects that card
* Clicking a different card moves selection to that card
* Clicking the selected card again clears selection
* Selected glow clears correctly when moving to another card
* Selection behavior is currently simple and single-select
* Ctrl / Meta multi-select is not handled yet

### Confirmed Status

```plaintext
Power BI filtering moves correctly between cards.
Selected glow appears and clears correctly.
Flip, formatting, empty state, and resize still work.
```

---

## Phase 4.4 — Back-Face Click Filter Guard

### Completed Work

* Identified issue where flip and filter shared the same click action
* Added a guard so clicking a back-facing card only flips it to the front
* Prevented back-face clicks from changing Power BI filter state
* Preserved front-face click behavior for filtering
* Preserved click-again-to-clear behavior for selected front-facing cards

### Confirmed Status

```plaintext
Front-facing card click selects/filters.
Clicking another front-facing card moves the filter.
Clicking selected front-facing card clears selection.
Back-face click flips card to front without changing filter.
Multi-card rendering, selected glow, formatting, empty state, and resize still work.
```

---

## Phase 4.5 — Split Flip and Selection Logic Into Helpers

### Completed Work

* Added `toggleCardFlip()` helper
* Added `handleCardSelection()` helper
* Added `shouldHandleCardSelection()` helper
* Simplified `onCardClick()` so it coordinates the click flow instead of doing all logic directly

### Confirmed Status

```plaintext
Single-card visual still works.
Multi-card visual still works.
Front-facing card selection behavior still works.
Click-again-to-clear behavior still works.
Back-face click guard still works.
Resize, flip, filtering, selected glow, formatting, and empty state still work.
```

---

## Phase 4.6 — Internal Interaction Gates and Code Organization

### Completed Work

* Added `isCardFlipEnabled()` helper
* Added `isCardSelectionEnabled()` helper
* Added `handleCardFlip()` helper
* Added `getCardElementsForClick()` helper
* Moved flip-enabled checking out of `onCardClick()`
* Moved card element lookup out of `onCardClick()`
* Kept `toggleCardFlip()` focused only on toggling the flipped CSS class
* Made `onCardClick()` focus only on the click flow
* Organized `visual.ts` into helper sections

### Current `visual.ts` Organization

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

### Confirmed Status

```plaintext
No visible behavior change.
Single-card visual works.
Multi-card visual works.
Cards still flip.
Front-facing click still filters.
Clicking another card still moves selection.
Clicking selected front-facing card clears selection.
Back-facing click flips to front without changing filter.
Selected border/glow still works.
Percentage formatting still works.
Empty state still works.
```

---

## Phase 4.7 — Improve Multi-Card Layout Rules

## Goal

Make multi-card display cleaner, more predictable, and safer during resizing while keeping all existing flip and selection behavior stable.

This phase intentionally stayed CSS-focused.

No TypeScript interaction logic was changed.

No formatting pane settings were added.

No click target redesign was added.

---

## Phase 4.7.1 — Predictable Multi-Card Grid Layout

### Completed Work

* Replaced loose flex-based multi-card sizing with CSS grid behavior.
* Used controlled column sizing for multi-card mode.
* Kept single-card mode unchanged.
* Centered the grid when extra horizontal space is available.
* Kept multi-card row height consistent.

### Main CSS Direction

```less
.flip-card-container.is-multi-card {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 320px));
    grid-auto-rows: 160px;
    justify-content: center;
    align-content: flex-start;
    padding: 12px;
}

.flip-card-container.is-multi-card .flip-card-wrapper {
    width: 100%;
    height: 100%;
    max-width: none;
}
```

### Why It Matters

The old flex layout worked, but it allowed card sizing to feel loose.

The grid layout makes the multi-card visual feel more controlled and closer to a KPI grid.

### Confirmed Status

```plaintext
Single-card mode still fills the visual.
Multi-card mode still shows all cards.
Cards still flip.
Power BI filtering still works.
Clicking another card still moves selection.
Clicking selected front-facing card still clears selection.
Back-facing card click still flips only.
Selected glow still works.
Percentage formatting still works.
Resize behavior is cleaner.
```

---

## Phase 4.7.2 — Compact Multi-Card Text Rules

### Completed Work

* Added compact text and spacing rules for multi-card mode.
* Reduced face padding in multi-card mode.
* Reduced label, title, value, and subtitle text sizes in multi-card mode.
* Kept single-card mode visually larger and more premium.

### Main CSS Direction

```less
.flip-card-container.is-multi-card .flip-card-face {
    padding: 18px;
    border-radius: 16px;
}

.flip-card-container.is-multi-card .flip-card-label {
    font-size: 11px;
    margin-bottom: 6px;
}

.flip-card-container.is-multi-card .flip-card-title {
    font-size: 13px;
    margin-bottom: 8px;
}

.flip-card-container.is-multi-card .flip-card-value {
    font-size: 30px;
    margin-bottom: 8px;
}

.flip-card-container.is-multi-card .flip-card-subtitle {
    font-size: 11px;
}
```

### Why It Matters

Single-card mode can use large KPI styling because it owns the full visual area.

Multi-card mode needs tighter spacing because several cards share the same visual area.

This change makes the visual feel more usable as a KPI grid.

### Confirmed Status

```plaintext
Single-card mode still looks the same.
Multi-card cards look less crowded.
Long labels fit better.
KPI values remain readable.
Flip behavior still works.
Selection behavior still works.
Selected glow still works.
Resize behavior still works.
Empty state still works.
```

---

## Phase 4.7.3 — Vertical Scrolling for Many Cards

### Completed Work

* Added multi-card vertical scrolling only when needed.
* Prevented horizontal scrolling.
* Kept base single-card overflow behavior unchanged.
* Made many-card scenarios safer so cards are not silently hidden.

### Main CSS Direction

```less
.flip-card-container.is-multi-card {
    overflow-x: hidden;
    overflow-y: auto;
}
```

### Why It Matters

The base container uses `overflow: hidden` to avoid scrollbar flash during flip animation.

That is good for single-card mode, but in multi-card mode it can hide cards when there are too many category rows.

This rule keeps the visual clean while allowing users to access cards that do not fit vertically.

### Confirmed Status

```plaintext
Single-card mode still has no scrollbar.
Multi-card mode still shows the clean grid.
With only a few cards, no unnecessary scrollbar appears.
With many cards or smaller visual height, vertical scroll appears.
No horizontal scrollbar appears.
Cards still flip correctly.
Front-facing click still filters.
Clicking another card still moves the filter.
Clicking selected front-facing card still clears selection.
Back-facing card click flips only and does not change filter.
Selected border/glow still works.
Resize behavior still works.
```

---

## Phase 4.7.4 — Narrow-Width Safety Rule

### Completed Work

* Added a media query for very narrow visual widths.
* Forced multi-card mode into one compact column when the visual is too narrow.
* Reduced row height, padding, gap, and text sizes for narrow mode.
* Protected the layout from feeling broken when the Power BI visual is resized very small.

### Main CSS Direction

```less
@media (max-width: 260px) {
    .flip-card-container.is-multi-card {
        grid-template-columns: 1fr;
        grid-auto-rows: 150px;
        padding: 8px;
        gap: 8px;
    }

    .flip-card-container.is-multi-card .flip-card-face {
        padding: 14px;
        border-radius: 14px;
    }

    .flip-card-container.is-multi-card .flip-card-value {
        font-size: 26px;
    }

    .flip-card-container.is-multi-card .flip-card-title {
        font-size: 12px;
    }

    .flip-card-container.is-multi-card .flip-card-label,
    .flip-card-container.is-multi-card .flip-card-subtitle {
        font-size: 10px;
    }
}
```

### Why It Matters

Power BI users can resize visuals freely.

If the visual becomes very narrow, the normal multi-card grid can become cramped.

This safety rule makes the visual degrade more gracefully by switching to one compact column.

### Confirmed Status

```plaintext
Normal single-card mode still looks the same.
Normal multi-card mode still looks the same.
Very narrow multi-card mode becomes one compact column.
No horizontal scrollbar appears.
Vertical scrolling still works when many cards are present.
Cards still flip.
Front-facing click still filters.
Back-facing click still flips back without changing filter.
Selected border/glow still appears.
```

---

# Current Code Mental Model

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

---

# Current Interaction Flow

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

---

# Current Layout Flow

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

# Latest Confirmed Working Behavior

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
Split flip and selection helpers work.
Internal flip and selection gates work.
Cleaned onCardClick() flow works.
visual.ts helper sections are organized.
CSS grid multi-card layout works.
Compact multi-card text rules work.
Many-card vertical scrolling works.
Narrow-width safety layout works.
```

---

# Current Known Limitations

The project is stable for the current phase, but it is still early-stage.

Known limitations:

* Multi-card layout is improved, but not user-configurable yet.
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

Reminder:

```plaintext
These are not failures.
They are the roadmap.
```

---

# Documentation Strategy

Use this documentation structure:

```plaintext
README.md = public-facing project overview, current status, roadmap, and build notes
docs/DEVELOPMENT_LOG.md = detailed phase history, learning notes, test results, and next session starting point
CHANGELOG.md = future version/release notes only
```

Documentation rule:

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

# Test Checklist

After each change, test:

```plaintext
Card still fills the visual area in single-card mode.
Multiple cards still appear in multi-card mode.
Each card shows the correct label.
Each card shows the correct front value.
Each card shows the correct back value.
Cards still flip.
Power BI selection still works.
Clicking a different card moves the selection.
Clicking the selected front-facing card again clears selection.
Clicking a back-facing card returns it to the front without changing the filter.
Selected border/glow feedback still works.
Values and percentage formatting still work.
Empty state still works.
Resize the visual smaller and bigger.
```

For layout or container changes, also test:

```plaintext
No temporary vertical scrollbar during flip.
No temporary horizontal scrollbar during flip.
Cards remain visible after resize.
Cards do not disappear after resize.
Cards do not overlap in an unexpected way.
Single-card layout still looks good.
Multi-card layout still looks controlled.
Many-card vertical scrolling works when needed.
Very narrow visual width remains usable.
```

---

# Build Command

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

# Git Workflow

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

# Next Session Starting Point

When continuing this project, first inspect:

```plaintext
README.md
docs/DEVELOPMENT_LOG.md
flipCardVisual/src/visual.ts
flipCardVisual/style/visual.less
flipCardVisual/capabilities.json
```

Then confirm:

```bash
git status
```

Expected after committing and pushing:

```plaintext
nothing to commit, working tree clean
```

Current focus:

```plaintext
Continue from completed Phase 4.7 layout stabilization.
The next step is Phase 4.8 — Prepare Formatting Pane Foundation.
```

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
onCardClick() is clean and easier to maintain.
Multi-card grid layout works.
Compact multi-card styling works.
Vertical scrolling for many cards works.
Narrow-width layout safety works.
```

Latest known direction:

```plaintext
Next development step:
Phase 4.8 — Prepare Formatting Pane Foundation.

Important:
Do not jump directly into a full formatting pane redesign.
Do not wire many settings at once.
Do not combine formatting pane, selection-state redesign, click target redesign, and layout redesign in one big step.
Start with one small, safe formatting pane setting.
The visual should remain stable after each small step.
```

Suggested first Phase 4.8 direction:

```plaintext
Start by reading capabilities.json and visual.ts carefully.
Identify the minimum format pane pattern needed for one safe setting.
Recommended first setting: a simple card appearance setting or interaction setting that does not disturb existing behavior.
Avoid adding all front/back color, typography, animation, and interaction settings in one session.
```

---

# Best Prompt to Start a New ChatGPT Session

Use this prompt when starting a new session:

```plaintext
Here is my GitHub repo:

https://github.com/RonanVergara/PowerBI-FlipCard

Please read the current project files first before suggesting changes.

Important files to read:
1. README.md
2. docs/DEVELOPMENT_LOG.md
3. flipCardVisual/src/visual.ts
4. flipCardVisual/style/visual.less
5. flipCardVisual/capabilities.json

Important:
This is a learning-first project.
Do not rush.
Do not give me full-file replacement unless I ask.
Teach me step by step.
For every change, show:
1. Where to find the code
2. What exact small part to add or replace
3. Why it works
4. What to test before moving on

Product vision:
Power BI Flip Card is a customizable smart KPI card visual for Power BI.

It can work as a simple static card, an animated flip card, or a multi-card interactive grid. Users can turn features on or off through the formatting pane, allowing the same visual to support simple KPI displays, detailed drill-style cards, category-based card grids, and interactive dashboard filtering without using bookmarks.

Current goal:
Continue from the README and DEVELOPMENT_LOG next starting point.

Current phase:
We finished Phase 4.7 layout stabilization and are preparing for Phase 4.8 — Formatting Pane Foundation.

Current tested status:
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

Latest known direction:
The next step is Phase 4.8 — Prepare Formatting Pane Foundation.

Important:
Do not jump directly into a full formatting pane redesign.
Do not wire many settings at once.
Do not combine unrelated changes like formatting pane, selection-state redesign, click target redesign, and layout redesign in one big step.
The next steps should still keep the visual stable.
Always remember the long-term goal: this should become a flexible one-stop-shop smart KPI card visual, not only a flip card.
Future rule: flip behavior and selection/filtering behavior should become separate optional features.
```
