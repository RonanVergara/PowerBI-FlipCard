# 🚀 Power BI Flip Card Custom Visual

## 📌 Project Overview

This project is a custom Power BI visual that creates an interactive flip card.

The visual behaves more like a modern web UI component than a traditional static Power BI card.

The long-term goal is to build a reusable Power BI custom visual with:

* Click-to-flip animation
* Front and back card content
* Dynamic Power BI measure values
* Power BI measure formatting support
* Power BI category selection behavior
* Formatting pane customization
* Multi-card support
* Modern dashboard-style UI/UX

---

## 🧠 Learning-First Project Rule

This is not only a development project.

This is also a learning project.

The main goal is for the developer to understand and master the code through repeated small updates.

When helping with this project:

* Do not rush to provide full-file replacements unless requested.
* Prefer step-by-step edits.
* Show exactly where to edit.
* Explain what each code block does.
* Explain why the change matters.
* Keep each step small.
* After each milestone, test before moving forward.
* Prioritize learning and repetition over speed.

Preferred teaching format:

```plaintext
Step number
What we are changing
Where to find it
What to add / replace
Why it works
What to test
```

Important working style:

* Related safe changes may be grouped together.
* CSS-only layout changes can be grouped when they belong to the same purpose.
* Small helper-only changes can be grouped when they are directly related.
* Avoid combining unrelated changes in one step.
* Do not combine DOM creation, selection behavior, multi-card rendering, and styling all at once.
* Keep the visual stable after every step.

---

## 🎯 Main Goal

Create a reusable Power BI custom visual where:

* A card flips when clicked
* The front face shows a main KPI
* The back face shows a detail KPI
* Category labels such as Vendor, Team, Agent, or Call Driver can be shown
* Power BI measure formatting is respected
* Clicking the card selects the current category value
* Clicking the selected card again clears the selection
* Selected state has visible border/glow feedback
* The visual can later support multiple cards and formatting pane options

---

## ✅ Current Working Features

The visual currently supports:

* Static flip card layout
* Front card face
* Back card face
* Smooth flip animation
* Dynamic Power BI field values
* `Card Label` category field
* `Card Value` measure field
* `Detail Value` measure field
* Power BI measure formatting
* Percentage formatting such as `85.8%` instead of `0.858`
* Power BI selection support
* Click again to clear selection
* Selected border/glow feedback
* Single-card row-based data preparation
* Row-index-aware label, value, and selection logic
* Card container wrapper
* Flex-ready card container layout
* Successful `.pbiviz` package build
* Successful Power BI Desktop testing

---

## 🧩 Current Field Wells

```plaintext
Card Label   → Category shown on the card, such as Vendor or Agent
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

## 🏁 Completed Milestones

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

* [x] Created card wrapper
* [x] Created front face
* [x] Created back face
* [x] Added LESS/CSS styling
* [x] Added click interaction
* [x] Added flip animation
* [x] Tested flip behavior in Power BI Desktop

### Phase 3 — Power BI Data Integration

* [x] Added `Card Label`
* [x] Added `Card Value`
* [x] Added `Detail Value`
* [x] Read dynamic Power BI measure values
* [x] Read dynamic Power BI category labels
* [x] Display front measure dynamically
* [x] Display back measure dynamically
* [x] Respect Power BI measure formatting
* [x] Support percentage formatting
* [x] Add Power BI selection behavior
* [x] Add click-again-to-clear behavior
* [x] Add selected card border/glow feedback

### Phase 3.5 — Single-Card Code Refactor

* [x] Added `CardData` interface
* [x] Added `getCardDataForRow()` helper
* [x] Added `renderCard()` helper
* [x] Added `resizeCard()` helper
* [x] Added `clearSelectionState()` helper
* [x] Shortened `update()` so it controls the flow instead of doing everything directly
* [x] Moved row-based logic into helper functions
* [x] Tested after each refactor and confirmed the visual still works

### Phase 4 — Multi-Card Preparation Started

* [x] Introduced `rowIndex` concept
* [x] Updated category label logic to use `rowIndex`
* [x] Updated measure value logic to use `rowIndex`
* [x] Updated selection ID logic to use `rowIndex`
* [x] Renamed `getCardData()` to `getCardDataForRow()`
* [x] Added `getCategoryRowCount()` helper
* [x] Added row count guard before rendering
* [x] Added `cardContainer` wrapper
* [x] Added `.flip-card-container` styling
* [x] Prepared container layout with flex, wrap, gap, and hidden overflow
* [x] Fixed temporary scrollbar flash during flip animation by using `overflow: hidden`
* [x] Tested after each small change in Power BI Desktop

---

## 🧠 Current Code Pattern

The current `visual.ts` structure is being refactored toward cleaner responsibilities and future multi-card support.

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
getCardDataForRow(dataView, 0) prepares one CardData object for row 0
↓
renderCard() displays the card
↓
onCardClick() handles flip and Power BI selection
```

Important learning concept:

```plaintext
One function should have one main job.
```

Current helper roles:

```plaintext
resizeCard()                = sizes the card area from Power BI viewport
clearSelectionState()       = removes selected visual state
getCategoryRowCount()       = counts how many category rows Power BI provided
getCardDataForRow()         = prepares card information for one row index
getCategoryLabel()          = gets the category label for one row index
getValueAtRow()             = gets a measure value for one row index
createCategorySelectionId() = creates Power BI selection ID for one row index
renderCard()                = puts the card information on screen
onCardClick()               = handles flip and selection
```

---

## 🧱 Current DOM Structure

The visual currently uses a card container wrapper.

Current structure:

```plaintext
target
└── flip-card-container
    └── flip-card-wrapper
        └── flip-card-inner
            ├── flip-card-front
            └── flip-card-back
```

This prepares the visual for future multi-card rendering.

Future structure:

```plaintext
target
└── flip-card-container
    ├── flip-card-wrapper
    ├── flip-card-wrapper
    ├── flip-card-wrapper
    ├── flip-card-wrapper
    └── flip-card-wrapper
```

The number of cards should eventually depend on how many category rows Power BI provides.

Example:

```plaintext
rowIndex 0 → HGS
rowIndex 1 → Vendor A
rowIndex 2 → Vendor B
rowIndex 3 → Vendor C
rowIndex 4 → Vendor D
```

---

## 🎨 Current Layout CSS Direction

The card container is now prepared for multiple cards.

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

The visual currently still renders only one card.

It now uses row-based helper logic, but `update()` still calls only row `0`.

Current behavior:

```plaintext
Card Label = Vendor
First visible value = HGS
rowIndex = 0
The card represents HGS
```

Current single-card render flow:

```plaintext
getCardDataForRow(dataView, 0)
```

Future improvement:

* Loop through category rows
* Call `getCardDataForRow(dataView, rowIndex)` for each row
* Create one card per category value
* Give each card its own selection ID
* Render all cards inside `.flip-card-container`

---

## 🚧 Development Roadmap

### Current Focus

```plaintext
Prepare the visual for multi-card rendering while keeping the current single-card behavior stable.
```

Completed cleanup targets:

* [x] Add `resizeCard()` helper
* [x] Add `clearSelectionState()` helper
* [x] Keep `update()` cleaner
* [x] Test after each small refactor
* [x] Commit clean working milestones

Current multi-card preparation status:

* [x] Make data helpers row-index aware
* [x] Add row count helper
* [x] Add card container wrapper
* [x] Add card container layout CSS
* [x] Keep single-card behavior working

Next small target:

```plaintext
Create a reusable helper for building card DOM elements.
```

Important:

```plaintext
Do not jump directly into full multi-card rendering yet.
First prepare reusable DOM creation safely.
```

### Next Major Feature

```plaintext
Multi-card support
```

Planned future work:

* [ ] Create reusable card DOM helper
* [ ] Convert one fixed card into repeatable card creation
* [ ] Convert one `CardData` object into multiple `CardData` objects
* [ ] Loop through category rows
* [ ] Create one card per category value
* [ ] Give each card its own selection ID
* [ ] Add responsive layout behavior for multiple cards
* [ ] Test selection behavior per card

### Later Features

* [ ] Formatting pane support
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
Selection still works.
Click again still clears selection.
Values and percentage formatting still work.
Resize the visual smaller and bigger.
```

For layout changes, also test:

```plaintext
No temporary vertical scrollbar during flip.
No temporary horizontal scrollbar during flip.
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

Current suggested commit message:

```bash
git commit -m "Prepare multi-card layout and update project status"
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
Row-based data helpers are ready.
Card container wrapper exists.
Container layout is flex-ready.
Latest tested CSS uses:
display: flex;
flex-wrap: wrap;
gap: 12px;
overflow: hidden;

Next small step:
Create a reusable helper for building card DOM elements.
```

Do not jump directly to full multi-card rendering yet.

Before moving forward, confirm:

```plaintext
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

Current goal:
Continue from the README’s “Next Session Starting Point.”

Current phase:
We are preparing for multi-card support, but the visual should still remain stable as a single-card visual until each small step is tested.

Latest known direction:
Next small step is to create a reusable helper for building card DOM elements.

Also:
You may group related safe changes together, especially CSS-only or small helper-only changes, but do not combine unrelated changes like DOM creation, selection behavior, and multi-card rendering in one big step.
```

---

## 🔥 Long-Term Vision

Build a reusable custom Power BI visual that makes dashboards feel more modern, interactive, and web-like.

This visual should eventually support:

* Modern KPI cards
* Animated dashboard storytelling
* Reusable custom visual design
* Power BI interactions without bookmarks
* Rich formatting options
* Multiple cards driven by data
* Premium dashboard experiences
