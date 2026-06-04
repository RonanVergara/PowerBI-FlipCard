# 🚀 Power BI Flip Card Custom Visual

## 📌 Project Overview

Power BI Flip Card is a custom Power BI visual that creates a modern, interactive smart KPI card.

The project started as a click-to-flip KPI card, but the long-term goal is bigger than a flip animation.

The goal is to build a reusable, highly customizable Power BI visual that can work as:

* A simple static KPI card
* An animated flip card
* A multi-card KPI grid
* A category-based card comparison visual
* A dashboard filtering helper without bookmarks
* A flexible one-stop-shop KPI visual controlled through the Power BI formatting pane

This is a learning-first project and a portfolio-quality project.

The visual should become useful in real dashboards, not just as a coding demo.

---

## ⭐ Product Vision / North Star

Power BI Flip Card is a customizable smart KPI card visual for Power BI.

It should help report builders create modern KPI experiences without needing bookmarks, duplicate visuals, or custom code.

The long-term product direction is:

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

## 🧠 Product Principles

This project should always follow these principles:

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

## 🧠 Learning-First Project Rule

This is both a development project and a learning project.

The main goal is to understand and master the code through small, tested updates.

When helping with this project:

* Do not rush.
* Do not provide full-file replacements unless requested.
* Prefer small step-by-step edits.
* Show exactly where to edit.
* Explain what each change does.
* Explain why the change matters.
* Test after every milestone.
* Keep the visual stable after every step.

Preferred teaching format:

```plaintext
Step number
What we are changing
Where to find it
What exact small part to add or replace
Why it works
What to test before moving on
```

Important working style:

* Related safe helper-only changes may be grouped together.
* CSS-only layout changes may be grouped when they support the same purpose.
* Avoid combining unrelated changes in one step.
* Do not combine DOM creation, selection behavior, multi-card rendering, formatting pane, and styling all at once.
* Do not jump into a full feature rewrite without a bridge step.
* Prioritize learning and stability over speed.
* README updates may be grouped at the end of a session instead of after every small commit.

---

## 🎯 Main Goal

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

It started as a single-card visual, but it now supports controlled multi-card rendering from category rows.

Current tested status:

```plaintext
Single-card visual works.
Multi-card visual works.
Card resizes correctly.
Cards flip correctly.
Power BI filtering works when a front-facing card is clicked.
Clicking the selected front-facing card again clears the selection.
Selected border/glow feedback works.
Clicking a back-facing card flips it to the front without changing the filter.
Values and percentage formatting work.
Empty state works.
Helper bridge before multi-card rendering works.
Controlled multi-card rendering works.
Improved multi-card selection behavior works.
Back-face click filter guard works.
```

Current development stage:

```plaintext
Phase 4 — Multi-card preparation and interaction stabilization
```

Current focus:

```plaintext
Stabilize the multi-card interaction structure while keeping the visual simple and tested.
```

Current important status:

```plaintext
The visual now renders multiple CardInstance objects when multiple category rows are available.
The next step is not a new feature.
The next step is a helper refactor to split flip logic and selection logic inside visual.ts.
```

---

## 🧩 Current Field Wells

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

## 🏁 Completed Milestones Summary

### Phase 1 — Foundation

* [x] Installed Node.js
* [x] Installed Power BI Visual SDK
* [x] Created Power BI custom visual project
* [x] Created GitHub repository
* [x] Added `.gitignore`
* [x] Removed build artifacts from Git tracking
* [x] Built `.pbiviz` package successfully
* [x] Tested first custom visual in Power BI Desktop

### Phase 2 — Flip Card UI

* [x] Created front and back card faces
* [x] Added LESS/CSS styling
* [x] Added click interaction
* [x] Added smooth flip animation
* [x] Tested flip behavior in Power BI Desktop

### Phase 3 — Power BI Data Integration

* [x] Added `Card Label`
* [x] Added `Card Value`
* [x] Added `Detail Value`
* [x] Read dynamic Power BI category labels
* [x] Read dynamic Power BI measure values
* [x] Display front and back values dynamically
* [x] Respect Power BI measure formatting
* [x] Support percentage formatting such as `85.8%` instead of `0.858`
* [x] Add Power BI selection behavior
* [x] Add click-again-to-clear behavior
* [x] Add selected card border/glow feedback
* [x] Add empty state when required fields are missing

### Phase 3.5 — Single-Card Refactor

* [x] Added `CardData` interface
* [x] Added `getCardDataForRow()` helper
* [x] Added `renderCard()` helper
* [x] Added `resizeCard()` helper
* [x] Added `clearSelectionState()` helper
* [x] Shortened `update()` so it controls the flow instead of doing everything directly
* [x] Moved row-based logic into helper functions
* [x] Tested after each refactor and confirmed the visual still works

### Phase 4 — Multi-Card Preparation

* [x] Introduced `rowIndex` concept
* [x] Updated category label, value, and selection ID logic to use `rowIndex`
* [x] Added `getCategoryRowCount()` helper
* [x] Added `cardContainer` wrapper
* [x] Added flex-ready `.flip-card-container` styling
* [x] Added `CardDomElements` interface
* [x] Added `createCardElements()` helper
* [x] Moved card DOM creation out of the constructor
* [x] Grouped single-card DOM references into `this.cardElements`
* [x] Added `CardInstance` interface
* [x] Added `createCardInstance()` helper
* [x] Added `createCardInstanceForRow()` helper
* [x] Added `createCardInstances()` helper
* [x] Replaced `currentCardInstance` with `cardInstances: CardInstance[]`
* [x] Updated `renderCard()` to accept a full `CardInstance`
* [x] Updated `onCardClick()` to accept a full `CardInstance`
* [x] Removed duplicate `currentSelectionId` state
* [x] Confirmed resize, flip, filtering, clear-selection, selected glow, formatting, and empty state still work

### Phase 4.1 — Helper Bridge Before Multi-Card Rendering

* [x] Cleaned and organized the current single-card helper flow
* [x] Added `attachCardClickBehavior()` helper
* [x] Added `getCardInstanceForElements()` helper
* [x] Added `rebuildCardContainer()` helper
* [x] Updated the constructor to attach click behavior through a helper
* [x] Updated `update()` to rebuild the card container after creating card instances
* [x] Kept the visual stable as a single-card visual
* [x] Confirmed the visual still renders only `cardInstances[0]`
* [x] Tested flip, resize, selection, click-again-to-clear, selected glow, formatting, and empty state
* [x] Committed the tested milestone to Git

### Phase 4.2 — Controlled Multi-Card Rendering

* [x] Updated `resizeCard()` so the container owns the visual size
* [x] Updated `createCardInstances()` to loop through category rows
* [x] Created one `CardData` object per row
* [x] Created fresh `CardDomElements` for additional rows
* [x] Created one `CardInstance` per visible category row
* [x] Attached click behavior to each generated card
* [x] Updated `rebuildCardContainer()` to append all card wrappers
* [x] Updated `update()` to render every card instance
* [x] Added minimal multi-card CSS sizing
* [x] Confirmed multiple cards appear correctly
* [x] Confirmed each card shows the correct label, front value, and back value
* [x] Confirmed each card can flip
* [x] Confirmed Power BI filtering still works
* [x] Confirmed click-again-to-clear still works
* [x] Confirmed resize, formatting, selected glow, and empty state still work
* [x] Committed the tested milestone to Git

### Phase 4.3 — Clean Multi-Card Selection Behavior

* [x] Updated selection behavior for multiple cards
* [x] Clicking an unselected card selects that card
* [x] Clicking a different card moves selection to that card
* [x] Clicking the selected card again clears selection
* [x] Updated selected glow behavior so stale selected borders are cleared
* [x] Kept selection behavior simple and single-select for now
* [x] Confirmed Power BI filtering moves correctly between cards
* [x] Confirmed selected glow appears and clears correctly
* [x] Confirmed flip, formatting, empty state, and resize still work
* [x] Committed the tested milestone to Git

### Phase 4.4 — Back-Face Click Filter Guard

* [x] Identified interaction issue where flip and filter were sharing the same click action
* [x] Added a guard so clicking a back-facing card only flips it to the front
* [x] Prevented back-face clicks from changing Power BI filter state
* [x] Preserved front-face click behavior for filtering
* [x] Confirmed front-face click can still select/filter
* [x] Confirmed selected front-facing card can still clear selection
* [x] Confirmed back-face click returns the card to the front while keeping the filter unchanged
* [x] Confirmed multi-card rendering, selected glow, formatting, empty state, and resize still work
* [x] Committed the tested milestone to Git

---

## 🧠 Current Code Pattern

The current `visual.ts` structure supports controlled multi-card rendering.

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
onCardClick(event, cardInstance) handles flip and Power BI selection behavior
```

Important learning concept:

```plaintext
One function should have one main job.
```

Current helper roles:

```plaintext
resizeCard()                    = sizes the visual container from Power BI viewport
clearSelectionState()           = removes selected visual state from all cards
getCategoryRowCount()           = counts how many category rows Power BI provided
getCardDataForRow()             = prepares card information for one row index
getCategoryLabel()              = gets the category label for one row index
getValueAtRow()                 = gets a measure value for one row index
createCategorySelectionId()     = creates Power BI selection ID for one row index
createCardElements()            = builds the DOM structure for one flip card
createTextElement()             = creates a reusable text div
createCardInstance()            = groups CardData + CardDomElements
createCardInstanceForRow()      = creates one CardInstance for one row
createCardInstances()           = creates the list of CardInstances
rebuildCardContainer()          = clears and rebuilds the card container
renderCard()                    = renders one CardInstance
showEmptyState()                = renders empty-state text into card elements
attachCardClickBehavior()       = attaches click handling to a card wrapper
getCardInstanceForElements()    = finds which CardInstance belongs to clicked DOM elements
onCardClick()                   = currently handles both flip and selection behavior
formatValue()                   = formats values using Power BI formatting
```

Current refactor opportunity:

```plaintext
onCardClick() currently does more than one job.
Next session should split flip behavior and selection behavior into separate helpers.
```

---

## 🧱 Current DOM Structure

The visual can now render multiple cards inside a container.

Current multi-card structure:

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
    ├── flip-card-wrapper
    │   └── flip-card-inner
    │       ├── flip-card-front
    │       └── flip-card-back
    └── ...
```

The number of cards depends on category rows from Power BI.

Example:

```plaintext
rowIndex 0 → HGS
rowIndex 1 → Vendor A
rowIndex 2 → Vendor B
rowIndex 3 → Vendor C
rowIndex 4 → Vendor D
```

---

## 🧱 Current TypeScript Shapes

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

Current behavior:

```plaintext
this.cardInstances[0] = row 0 card
this.cardInstances[1] = row 1 card
this.cardInstances[2] = row 2 card
this.cardInstances[3] = row 3 card
```

---

## 🎨 Current Layout CSS Direction

The card container is prepared for multiple cards.

Current container layout:

```less
.flip-card-container {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    overflow: hidden;
}
```

Current multi-card layout direction:

```less
.flip-card-container.is-multi-card {
    align-content: flex-start;
    padding: 12px;
}

.flip-card-container.is-multi-card .flip-card-wrapper {
    flex: 1 1 220px;
    width: auto;
    height: 160px;
    max-width: 320px;
}
```

Important note:

```plaintext
overflow: auto caused temporary scrollbars during the flip animation.
overflow: hidden fixed the scrollbar flash.
```

Scrolling behavior for many cards should be designed intentionally later.

---

## ⚠️ Current Limitations

The project is promising, but it is still early-stage.

Current limitations:

* Multi-card rendering works, but layout is still basic.
* Selection behavior is still simple and single-select.
* Ctrl / Meta multi-select is not handled yet.
* Flip behavior and Power BI selection are still tied to the same click action.
* Back-face click has a guard now, but the final interaction model is not yet built.
* Flip behavior is not optional yet.
* Selection/filtering behavior is not optional yet.
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

## 🔎 Research-Informed Product Strategy

The product should not compete only as a flip animation.

The stronger direction is to become a mode-based KPI super-visual.

Target modes:

```plaintext
Mode 1: Static KPI Card
Mode 2: Flip KPI Card
Mode 3: Multi-Card KPI Grid
Mode 4: KPI Comparison / State Card
Mode 5: Dashboard Filtering Card
```

Every major capability should become optional and controlled by settings.

Examples:

```plaintext
Flip: On / Off
Selection: On / Off
Multi-card: On / Off
Trend: On / Off
Status chip: On / Off
Back face: On / Off
Tooltip: On / Off
```

This keeps the visual flexible and avoids turning the project into many separate visuals.

---

## 🧭 Product Priority Stack

The long-term priority stack is:

```plaintext
1. Proper formatting pane integration
2. True multi-card grid support
3. Separate flip behavior from selection/filter behavior
4. Tooltip and context menu support
5. Accessibility support
6. KPI states and comparisons
7. Theme-aware rendering
8. Localization and locale correctness
9. Sparkline / mini trend support
10. Packaging, sample report, release, and certification preparation
```

Current development priority:

```plaintext
Stabilize the multi-card interaction structure first.
Then move toward formatting pane and interaction settings.
```

This means the immediate code path is:

```plaintext
Single-card stable
↓
Multi-card preparation
↓
Controlled multi-card rendering
↓
Multi-card selection and flip testing
↓
Back-face click filter guard
↓
Split flip and selection helpers
↓
Layout rules for multiple cards
↓
Formatting pane foundation
```

---

## 🧩 Target Smart KPI Card Anatomy

Future front face example:

```plaintext
┌─────────────────────────────────────┐
│ Status chip   KPI title      Icon   │
│ Category / segment label            │
│                                     │
│ Main value                          │
│ Variance vs target   ▲ +4.3%        │
│ Target: 92%          Prior: 88%     │
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

## 🚧 Development Roadmap

### Current Focus

```plaintext
Stabilize controlled multi-card support while keeping every change small and tested.
```

### Next Small Step

The next development step should be a helper refactor, not a new visual feature.

Recommended next direction:

```plaintext
Phase 4.5 — Split Flip and Selection Logic Into Helpers

Goal:
Make onCardClick() easier to read and prepare the code for future optional flip and optional selection modes.

Do:
- Remove old global isFlipped state if still present.
- Add toggleCardFlip() helper.
- Add handleCardSelection() helper.
- Simplify onCardClick().
- Keep current behavior the same.
- Test everything again.

Do not:
- Add formatting pane yet.
- Add interaction toggles yet.
- Add separate click targets yet.
- Redesign the layout yet.
```

### Next Major Feature Area

```plaintext
Multi-card layout and interaction foundation
```

Planned near-term multi-card work:

* [x] Update `createCardInstances()` to loop through category rows
* [x] Create one `CardData` object per row
* [x] Create one `CardDomElements` object per row
* [x] Create one `CardInstance` per row
* [x] Attach click behavior per card
* [x] Append each card wrapper into `.flip-card-container`
* [x] Render each card instance
* [x] Test flip behavior per card
* [x] Test Power BI selection per card
* [x] Test click-again-to-clear behavior per card
* [x] Add basic responsive sizing behavior for multiple cards
* [x] Prevent back-face click from changing filter
* [ ] Split flip and selection logic into helpers
* [ ] Decide whether one card or many cards can be flipped at the same time
* [ ] Improve responsive layout rules for multiple cards
* [ ] Decide scrolling behavior for many cards
* [ ] Prepare selection/filtering as a future optional mode
* [ ] Prepare flip behavior as a future optional mode

### Near-Term Product Features

After basic multi-card support is stable:

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

### Later Product Features

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

## 🧪 Current Test Checklist

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
```

Latest confirmed working test results:

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
Front value works.
Back value works.
Percentage formatting works.
Empty state works.
Latest interaction guard works.
```

---

## 🧪 Build Command

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

## 📂 Project Folder Structure

```plaintext
Power BI Custom Visual
│
└── PowerBI-FlipCard
    │
    ├── README.md
    ├── .gitignore
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

---

## 💾 Git Workflow

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

Suggested commit message for this README update:

```bash
git add README.md
git commit -m "Update README after multi-card interaction milestones"
git push
```

---

## 📍 Next Session Starting Point

When continuing this project, first inspect:

```plaintext
flipCardVisual/src/visual.ts
flipCardVisual/capabilities.json
flipCardVisual/style/visual.less
README.md
```

Then confirm:

```bash
git status
```

Expected:

```plaintext
nothing to commit, working tree clean
```

Current focus:

```plaintext
Continue Phase 4 multi-card interaction stabilization.
The next step is Phase 4.5 — Split Flip and Selection Logic Into Helpers.
The visual should remain stable and behavior should stay the same after the refactor.
```

Current status:

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
```

Latest completed refactors and milestones:

```plaintext
Added CardInstance interface.
Added createCardInstance() helper.
Added createCardInstanceForRow() helper.
Added createCardInstances() helper.
Changed currentCardInstance into cardInstances array.
Removed duplicate currentSelectionId state.
Updated renderCard() to accept CardInstance.
Updated onCardClick() to accept CardInstance.
Added attachCardClickBehavior() helper.
Added getCardInstanceForElements() helper.
Added rebuildCardContainer() helper.
update() now creates cardInstances and rebuilds the card container.
createCardInstances() now loops through category rows.
The visual now renders multiple cards.
Selection behavior works across multiple cards.
Back-face click no longer changes filter state.
```

Latest known direction:

```plaintext
Next development step:
Phase 4.5 — Split Flip and Selection Logic Into Helpers.

Important:
Do not jump into a full redesign.
Do not build the formatting pane yet.
Do not add optional toggles yet.
Do not create separate click targets yet.
Do not redesign the layout yet.

The next step should make the existing working behavior easier to maintain by separating flip logic and selection logic into helpers.
```

Long-term goal reminder:

```plaintext
Power BI Flip Card should become a flexible one-stop-shop smart KPI card visual.
It should not remain only a flip animation.
Flip behavior and selection/filtering behavior should eventually become separate optional features.
```

---

## 🟢 Best Prompt to Start a New ChatGPT Session

Use this prompt when starting a new session:

```plaintext
Here is my GitHub repo:

https://github.com/RonanVergara/PowerBI-FlipCard

Please read the README and current code first before suggesting changes.

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
Continue from the README’s “Next Session Starting Point.”

Current phase:
We are stabilizing controlled multi-card support, but the visual should still remain stable until each small step is tested.

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

Latest completed refactors:
Added CardInstance interface.
Added createCardInstance() helper.
Added createCardInstanceForRow() helper.
Added createCardInstances() helper.
Changed currentCardInstance into cardInstances array.
Removed duplicate currentSelectionId state.
Updated renderCard() to accept CardInstance.
Updated onCardClick() to accept CardInstance.
Added attachCardClickBehavior() helper.
Added getCardInstanceForElements() helper.
Added rebuildCardContainer() helper.
update() now creates cardInstances and rebuilds the card container.
createCardInstances() now loops through category rows.
The visual now renders multiple cards.
Selection behavior works across multiple cards.
Back-face click no longer changes filter state.

Latest known direction:
The next step is Phase 4.5 — Split Flip and Selection Logic Into Helpers.

Important:
Do not jump directly into a full redesign.
Do not combine unrelated changes like formatting pane, selection-state redesign, click target redesign, and layout redesign in one big step.
The next steps should still keep the visual stable.
Always remember the long-term goal: this should become a flexible one-stop-shop smart KPI card visual, not only a flip card.
Future rule: flip behavior and selection/filtering behavior should become separate optional features.
```

---

## 🔥 Long-Term Vision

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
