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
* Do not combine DOM creation, selection behavior, multi-card rendering, and styling all at once.
* Do not jump into a full feature rewrite without a bridge step.
* Prioritize learning and stability over speed.

---

## 🎯 Main Goal

Create a reusable Power BI custom visual where:

* A card can behave like a normal KPI card.
* A card can optionally flip when clicked.
* The front face shows a main KPI.
* The back face shows a detail KPI.
* Category labels such as Vendor, Team, Agent, or Call Driver can be shown.
* Power BI measure formatting is respected.
* Clicking a card can select the related Power BI category value.
* Clicking the selected card again can clear the selection.
* Selected state has visible border/glow feedback.
* Multiple cards can eventually be rendered from category rows.
* Users can later customize content, layout, colors, typography, borders, animation, and interactions through the formatting pane.

---

## ✅ Current Status

The visual is currently a stable **single-card visual**.

It is being carefully prepared for future multi-card support, but it does **not** fully render multiple cards yet.

Current tested status:

```plaintext
Single-card visual works.
Card resizes correctly.
Card flips correctly.
Power BI filtering works when clicked.
Click again clears the selection.
Selected border/glow feedback works.
Values and percentage formatting work.
Empty state works.
Latest helper refactor still works after testing.
```

Current development stage:

```plaintext
Phase 4 — Multi-card preparation
```

Current focus:

```plaintext
Prepare the code structure for multi-card rendering while keeping the visual stable as a single-card visual.
```

Current important limitation:

```plaintext
The visual still renders only cardInstances[0].
The code is being prepared for multiple cards, but the first real multi-card rendering step has not been completed yet.
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

---

## 🧠 Current Code Pattern

The current `visual.ts` structure is being prepared for multi-card rendering.

Current mental model:

```plaintext
Power BI sends data
↓
update() receives the update
↓
resizeCard() sizes the visual
↓
getCategoryRowCount() checks available category rows
↓
createCardInstances(dataView, rowCount) creates the card instance list
↓
rebuildCardContainer(cardInstances) clears and rebuilds the card container
↓
cardInstances currently still contains only row 0
↓
renderCard(cardInstances[0]) displays the single card
↓
attachCardClickBehavior() connects the card wrapper to click behavior
↓
onCardClick(event, cardInstance) handles flip and Power BI selection
```

Important learning concept:

```plaintext
One function should have one main job.
```

Current helper roles:

```plaintext
resizeCard()                    = sizes the card area from Power BI viewport
clearSelectionState()           = removes selected visual state
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
onCardClick()                   = handles flip and selection for one CardInstance
formatValue()                   = formats values using Power BI formatting
```

---

## 🧱 Current DOM Structure

The visual currently renders one card inside a container.

Current structure:

```plaintext
target
└── flip-card-container
    └── flip-card-wrapper
        └── flip-card-inner
            ├── flip-card-front
            └── flip-card-back
```

Future multi-card structure:

```plaintext
target
└── flip-card-container
    ├── flip-card-wrapper
    ├── flip-card-wrapper
    ├── flip-card-wrapper
    ├── flip-card-wrapper
    └── flip-card-wrapper
```

The number of cards should eventually depend on category rows from Power BI.

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
this.cardInstances[0] = the only rendered card
```

Future behavior:

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

* The visual still renders only one card.
* `createCardInstances()` still creates a single card instance for row `0`.
* `rebuildCardContainer()` still appends only the first card wrapper.
* Flip behavior and Power BI selection are still tied to the same click.
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
Finish controlled multi-card support first because the code is already being prepared for it.
Then move toward formatting pane and interaction settings.
```

This means the immediate code path is still:

```plaintext
Single-card stable
↓
Multi-card preparation
↓
Controlled multi-card rendering
↓
Multi-card selection and flip testing
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
Prepare for controlled multi-card support while keeping the single-card visual stable.
```

### Next Small Step

The next development step should be the first controlled multi-card rendering step.

Do not redesign everything yet.

Do not add formatting pane yet.

Do not redesign selection state yet.

Next step should focus only on making the existing card instance pattern truly create multiple cards.

Recommended next direction:

```plaintext
Update createCardInstances() so it can create one CardInstance per category row.
Create fresh CardDomElements for each new row.
Attach click behavior to each card.
Rebuild the card container with the generated card wrappers.
Render each card instance.
Keep the logic small and test after the first working version.
```

### Next Major Feature

```plaintext
Multi-card support
```

Planned multi-card work:

* [ ] Update `createCardInstances()` to loop through category rows
* [ ] Create one `CardData` object per row
* [ ] Create one `CardDomElements` object per row
* [ ] Create one `CardInstance` per row
* [ ] Attach click behavior per card
* [ ] Append each card wrapper into `.flip-card-container`
* [ ] Render each card instance
* [ ] Test flip behavior per card
* [ ] Test Power BI selection per card
* [ ] Test click-again-to-clear behavior per card
* [ ] Decide whether one card or many cards can be flipped at the same time
* [ ] Add responsive sizing behavior for multiple cards
* [ ] Decide scrolling behavior for many cards

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
Card still fills the visual area.
Card still flips.
Power BI selection still works.
Click again still clears selection.
Selected border/glow feedback still works.
Values and percentage formatting still work.
Empty state still works.
Resize the visual smaller and bigger.
```

For layout or container changes, also test:

```plaintext
No temporary vertical scrollbar during flip.
No temporary horizontal scrollbar during flip.
Card remains centered or properly positioned.
Card does not disappear after resize.
```

For multi-card changes later, also test:

```plaintext
Each category row creates a visible card.
Each card shows the correct label.
Each card shows the correct front value.
Each card shows the correct back value.
Each card can flip.
Clicking a card filters to the correct category.
Clicking again clears the correct selection.
Selected glow appears only where expected.
Resizing still works.
```

Latest confirmed working test results:

```plaintext
Card resizes correctly.
Card flips correctly.
Power BI filtering works when clicked.
Click again clears the selection.
Selected border/glow feedback works.
Front value still works.
Back value still works.
Percentage formatting still works.
Empty state works.
Latest helper refactor works.
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
git commit -m "Revamp README with product roadmap"
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
Continue Phase 4 multi-card preparation.
The next step is the first controlled multi-card rendering step.
The visual should remain stable even if multi-card rendering is introduced gradually.
```

Current status:

```plaintext
Single-card visual works.
Card resizes correctly.
Card flips correctly.
Power BI filtering works when clicked.
Click again clears the selection.
Selected border/glow feedback works.
Values and percentage formatting work.
Empty state works.
Helper bridge before multi-card rendering has been added and tested.
```

Latest completed refactors:

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
The visual still renders only cardInstances[0].
```

Latest known direction:

```plaintext
Next development step:
Start controlled multi-card rendering.

Important:
Do not jump into a full redesign.
Do not redesign selection state yet.
Do not build the formatting pane yet.
Do not change CSS layout too heavily yet.

The next step should focus on creating multiple CardInstance objects safely and rendering them.
```

Long-term goal reminder:

```plaintext
Power BI Flip Card should become a flexible one-stop-shop smart KPI card visual.
It should not remain only a flip animation.
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
We are preparing for controlled multi-card support, but the visual should still remain stable until each small step is tested.

Current tested status:
Single-card visual works.
Card resizes correctly.
Card flips correctly.
Power BI filtering works when clicked.
Click again clears the selection.
Selected border/glow feedback works.
Values and percentage formatting work.
Empty state works.
Helper bridge before multi-card rendering works.

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
The visual still renders only cardInstances[0].

Latest known direction:
The next step is the first controlled multi-card rendering step.

Important:
Do not jump directly into a full redesign.
Do not combine unrelated changes like multi-card loops, selection-state redesign, formatting pane, and layout redesign in one big step.
The next steps should still keep the visual stable.
Always remember the long-term goal: this should become a flexible one-stop-shop smart KPI card visual, not only a flip card.
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
* KPI states and comparisons
* Tooltips and context menu
* Theme-aware styling
* Accessibility support
* Professional dashboard-ready design

The end goal is a visual that users would choose because it saves time, reduces bookmark workarounds, looks modern, and adapts to different KPI dashboard needs.
