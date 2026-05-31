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

### Phase 3.5 — Code Refactor

* [x] Added `CardData` interface
* [x] Added `getCardData()` helper
* [x] Added `renderCard()` helper
* [x] Shortened `update()` so it controls the flow instead of doing everything directly
* [x] Tested after refactor and confirmed the visual still works

---

## 🧠 Current Code Pattern

The current `visual.ts` structure is being refactored toward cleaner responsibilities.

Current mental model:

```plaintext
Power BI sends data
↓
update() receives the update
↓
getCardData() prepares one CardData object
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
getCardData() = prepares the card information
renderCard()  = puts the card information on screen
onCardClick() = handles flip and selection
```

---

## ⚠️ Current Limitation

The visual currently supports only one card.

It uses the first visible category value.

Example:

```plaintext
Card Label = Vendor
First visible value = HGS
The card represents HGS
```

Future improvement:

* Convert one `CardData` object into multiple `CardData` objects
* Render multiple cards
* Allow each card to represent its own category value
* Allow each card to have its own selection ID

---

## 🚧 Development Roadmap

### Current Focus

```plaintext
Clean the current single-card code before moving to multi-card support.
```

Next cleanup targets:

* [ ] Add `resizeCard()` helper
* [ ] Add `clearSelectionState()` helper
* [ ] Keep `update()` even cleaner
* [ ] Test after each small refactor
* [ ] Commit clean working milestone

### Next Major Feature

```plaintext
Multi-card support
```

Planned future work:

* [ ] Convert `CardData` into an array of cards
* [ ] Loop through category rows
* [ ] Create one card per category value
* [ ] Give each card its own selection ID
* [ ] Add responsive layout for multiple cards

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

## 💾 Git Workflow

Use this after every successful tested milestone:

```bash
cd "C:\Power BI Custom Visual\PowerBI-FlipCard"
git status
git diff
git add .
git commit -m "Your milestone message here"
git push
```

Current suggested commit message:

```bash
git commit -m "Refactor visual data rendering into CardData model"
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
Continue learning-first refactor of the single-card visual.
Next small cleanup:
Add resizeCard() and clearSelectionState() helpers.
```

Do not jump directly to advanced features unless the current milestone is tested and committed.

---

## 🟢 Best Prompt to Start a New ChatGPT Session

Use this prompt when starting a new session:

```plaintext
Here is my GitHub repo:

https://github.com/RonanVergara/PowerBI-FlipCard

Please read the README and current code first before suggesting changes.

Important:
This is a learning-first project. Do not rush.
Do not give me full-file replacement unless I ask.
Teach me step by step.
For every change, show:
1. Where to find the code
2. What exact small part to add or replace
3. Why it works
4. What to test before moving on

Current goal:
Continue from the README’s “Next Session Starting Point.”
Help me understand and master the code through repeated small updates.
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

```
```
