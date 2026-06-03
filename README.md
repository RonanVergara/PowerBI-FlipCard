# 🚀 Power BI Flip Card Custom Visual

## 📌 Project Overview

This project is a custom Power BI visual that creates an interactive smart KPI card.

The visual behaves more like a modern web UI component than a traditional static Power BI card.

The long-term goal is to build a reusable, highly customizable Power BI visual with:

* Simple static KPI card mode
* Click-to-flip animation
* Front and back card content
* Dynamic Power BI measure values
* Power BI measure formatting support
* Power BI category selection behavior
* Multi-card support
* Formatting pane customization
* Modern dashboard-style UI/UX

---

## ⭐ Product Vision / North Star

Power BI Flip Card is a customizable smart KPI card visual for Power BI.

It can work as a simple static card, an animated flip card, or a multi-card interactive grid. Users can turn features on or off through the formatting pane, allowing the same visual to support simple KPI displays, detailed drill-style cards, category-based card grids, and interactive dashboard filtering without using bookmarks.

This is the main direction of the project and should always be remembered when continuing development.

The goal is not only to build a card that flips. The goal is to build a flexible, reusable, one-stop-shop KPI card visual where features can work together cleanly.

Core product principles:

* The visual should start simple and work like a normal Power BI card.
* Advanced features should be optional and controlled by the user.
* Flip behavior should be optional.
* Multi-card behavior should be optional.
* Selection and filtering should work naturally with Power BI.
* Formatting pane options should let users customize the visual without writing code.
* Future features should be built in a way that does not break existing modes.
* The visual should be useful for real dashboards, portfolio projects, and professional reporting.

Long-term vision:

```plaintext
One visual.
Multiple card modes.
User-controlled features.
No bookmarks required.
Modern Power BI dashboard experience.
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
* Prioritize learning and stability over speed.

---

## 🎯 Main Goal

Create a reusable Power BI custom visual where:

* A card can behave like a normal KPI card
* A card can optionally flip when clicked
* The front face shows a main KPI
* The back face shows a detail KPI
* Category labels such as Vendor, Team, Agent, or Call Driver can be shown
* Power BI measure formatting is respected
* Clicking a card selects the related Power BI category value
* Clicking the selected card again clears the selection
* Selected state has visible border/glow feedback
* Multiple cards can eventually be rendered from category rows
* Users can later customize the visual through the Power BI formatting pane

---

## ✅ Current Status

The visual is currently a stable **single-card visual**.

It is being carefully prepared for future multi-card support, but it does **not** render multiple cards yet.

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
```

Current development stage:

```plaintext
Phase 4 — Multi-card preparation
```

Current focus:

```plaintext
Prepare the code structure for multi-card rendering while keeping the visual stable as a single-card visual.
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
cardInstances currently contains only row 0
↓
renderCard(cardInstances[0]) displays the single card
↓
onCardClick(event, cardInstances[0]) handles flip and Power BI selection
```

Important learning concept:

```plaintext
One function should have one main job.
```

Current helper roles:

```plaintext
resizeCard()                 = sizes the card area from Power BI viewport
clearSelectionState()        = removes selected visual state
getCategoryRowCount()        = counts how many category rows Power BI provided
getCardDataForRow()          = prepares card information for one row index
getCategoryLabel()           = gets the category label for one row index
getValueAtRow()              = gets a measure value for one row index
createCategorySelectionId()  = creates Power BI selection ID for one row index
createCardElements()         = builds the DOM structure for one flip card
createTextElement()          = creates a reusable text div
createCardInstance()         = groups CardData + CardDomElements
createCardInstanceForRow()   = creates one CardInstance for one row
createCardInstances()        = creates the list of CardInstances
renderCard()                 = renders one CardInstance
showEmptyState()             = renders empty-state text into card elements
onCardClick()                = handles flip and selection for one CardInstance
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

## ⚠️ Current Limitation

The visual still renders only one card.

The code is now array-ready, but `createCardInstances()` currently creates only row `0`.

Current behavior:

```plaintext
Card Label = Vendor
First visible value = HGS
rowIndex = 0
The card represents HGS
```

Current single-card render flow:

```plaintext
createCardInstances(dataView, rowCount)
↓
createCardInstanceForRow(dataView, 0, this.cardElements)
↓
return [cardInstance]
↓
renderCard(this.cardInstances[0])
```

Future improvement:

* Loop through all category rows
* Create one `CardData` object per row
* Create one `CardDomElements` object per row
* Group each pair into one `CardInstance`
* Attach click handling per card
* Append each card wrapper into `.flip-card-container`
* Render all cards instead of only `cardInstances[0]`

---

## 🚧 Development Roadmap

### Current Focus

```plaintext
Prepare for multi-card support while keeping the single-card visual stable.
```

### Next Small Steps

Before the first real multi-card rendering attempt:

* [ ] Clean up indentation/formatting in `visual.ts`
* [ ] Create a helper for attaching click behavior to a card
* [ ] Prepare helper logic for clearing/rebuilding card DOM inside the container

### Next Major Feature

```plaintext
Multi-card support
```

Planned multi-card work:

* [ ] Update `createCardInstances()` to loop through category rows
* [ ] Create one card DOM structure per category row
* [ ] Create one `CardInstance` per row
* [ ] Append each card wrapper into `.flip-card-container`
* [ ] Render each card instance
* [ ] Test flip behavior per card
* [ ] Test Power BI selection per card
* [ ] Test click-again-to-clear behavior per card
* [ ] Add responsive sizing behavior for multiple cards
* [ ] Decide scrolling behavior for many cards

### Later Features

* [ ] Formatting pane support
* [ ] Normal card / flip card toggle
* [ ] Single-card / multi-card toggle
* [ ] Selection/filtering toggle
* [ ] Front card color settings
* [ ] Back card color settings
* [ ] Typography settings
* [ ] Border settings
* [ ] Shadow settings
* [ ] Animation speed setting
* [ ] Label visibility toggle
* [ ] Subtitle visibility toggle
* [ ] Hover effects
* [ ] Tooltips
* [ ] Conditional formatting
* [ ] Icons or status indicators
* [ ] High contrast support
* [ ] Keyboard navigation

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

Some warnings are currently expected and are not blocking:

* `pwsh is not recognized`
* Formatting pane recommendations
* High contrast recommendations
* Keyboard navigation recommendations
* Tooltip recommendations

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

For layout changes, also test:

```plaintext
No temporary vertical scrollbar during flip.
No temporary horizontal scrollbar during flip.
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
git commit -m "Add product vision and update project status"
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

Then confirm the current focus:

```plaintext
Current focus:
Continue learning-first preparation for multi-card support.

Current status:
Single-card visual still works.
Card resizes correctly.
Card flips correctly.
Power BI filtering works when clicked.
Click again clears the selection.
Selected border/glow feedback works.
Values and percentage formatting work.
Empty state works.

Product vision:
Power BI Flip Card is a customizable smart KPI card visual for Power BI.

It can work as a simple static card, an animated flip card, or a multi-card interactive grid. Users can turn features on or off through the formatting pane, allowing the same visual to support simple KPI displays, detailed drill-style cards, category-based card grids, and interactive dashboard filtering without using bookmarks.

Latest completed refactors:
Added CardInstance interface.
Added createCardInstance() helper.
Added createCardInstanceForRow() helper.
Added createCardInstances() helper.
Changed currentCardInstance into cardInstances array.
Removed duplicate currentSelectionId state.
Updated renderCard() to accept CardInstance.
Updated onCardClick() to accept CardInstance.
update() now creates cardInstances through createCardInstances().
The visual still renders only cardInstances[0].

Latest known direction:
Before the first major multi-card rendering step, do small preparation:
1. Clean up indentation/formatting in visual.ts.
2. Create a helper for attaching click behavior to a card.
3. Prepare helper logic for clearing/rebuilding card DOM inside the container.

Important:
Do not jump directly into full multi-card rendering without testing each bridge step.
The visual should remain stable as a single-card visual until the first controlled multi-card attempt.
The long-term goal is a flexible one-stop-shop smart KPI card, not only a flip animation.
```

Before moving forward, confirm:

```bash
git status
```

Expected:

```plaintext
nothing to commit, working tree clean
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
We are preparing for multi-card support, but the visual should still remain stable as a single-card visual until each small step is tested.

Current tested status:
Single-card visual works.
Card resizes correctly.
Card flips correctly.
Power BI filtering works when clicked.
Click again clears the selection.
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
update() now creates cardInstances through createCardInstances().
The visual still renders only cardInstances[0].

Latest known direction:
Before the first major multi-card rendering step, do small preparation:
1. Clean up indentation/formatting in visual.ts.
2. Create a helper for attaching click behavior to a card.
3. Prepare helper logic for clearing/rebuilding card DOM inside the container.

Important:
Do not jump directly into full multi-card rendering yet.
The next steps should still keep the visual stable as a single-card visual.
You may group related safe helper-only changes together, but do not combine unrelated changes like multi-card loops, selection-state redesign, and layout changes in one big step.
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
* Professional dashboard-ready styling
