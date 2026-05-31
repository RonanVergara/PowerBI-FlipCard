# 🚀 Power BI Flip Card Custom Visual

## 📌 Project Overview

This project focuses on building a fully custom interactive Flip Card visual for Power BI.

The goal is to create a reusable Power BI visual that behaves more like a modern web application component rather than a traditional Power BI visual.

The visual should support animations, clean UI/UX, extensive formatting options, dynamic Power BI data integration, and user configuration through the Power BI formatting pane.

---

# 🎯 Main Goal

Create a Power BI custom visual where:

* A card flips when clicked
* Front and back content are fully customizable
* Measures from Power BI can be displayed dynamically
* Category labels such as Vendor, Team, Agent, or Call Driver can be shown
* Animations are smooth and modern
* Users can configure the visual through the Power BI formatting pane
* The visual feels similar to modern web UI components
* The visual can be reused across different Power BI reports

---

# 🏁 Current Status

## Foundation Completed

### Setup Completed

* [x] Installed Node.js
* [x] Installed Power BI Visual SDK (`pbiviz`)
* [x] Created Power BI custom visual project
* [x] Opened project in VS Code
* [x] Successfully executed:

```bash
pbiviz package
```

* [x] Generated `.pbiviz` package
* [x] Created GitHub repository
* [x] Created project documentation
* [x] Fixed folder structure
* [x] Added `.gitignore`
* [x] Removed build artifacts from Git tracking
* [x] Rendered first static custom visual
* [x] Successfully tested custom visual inside Power BI Desktop

---

## Flip Card UI Completed

* [x] Created front card face
* [x] Created back card face
* [x] Added card layout
* [x] Added CSS / LESS styling
* [x] Added click interaction
* [x] Added smooth flip animation
* [x] Successfully tested flip interaction inside Power BI Desktop
* [x] Committed and pushed working flip-card milestone to GitHub

---

## Power BI Data Integration Progress

* [x] Added `Card Value` measure field
* [x] Added `Detail Value` measure field
* [x] Added `Card Label` category field
* [x] Read dynamic measure values from Power BI
* [x] Read dynamic category label from Power BI
* [x] Display main measure on front card face
* [x] Display detail measure on back card face
* [x] Display category label such as Vendor, Team, Agent, or Call Driver
* [x] Successfully tested dynamic data inside Power BI Desktop
* [x] Committed and pushed current working data-integration milestone to GitHub

---

# 📂 Current Folder Structure

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
        ├── style
        ├── capabilities.json
        ├── package.json
        ├── package-lock.json
        ├── pbiviz.json
        └── tsconfig.json
```

Current status:

* GitHub repository contains documentation and actual visual source code
* Power BI Visual builds successfully
* `.pbiviz` package generates successfully
* Flip card animation works inside Power BI Desktop
* Main measure displays dynamically
* Detail measure displays dynamically
* Category label displays dynamically
* Build artifacts such as `.tmp`, `dist`, and webpack reports are ignored by Git
* Phase 1 Foundation is complete
* Phase 2 Flip Card UI is complete
* Phase 3 Power BI Integration is partially complete

---

# 🛠️ Tech Stack

| Technology          | Purpose                   |
| ------------------- | ------------------------- |
| Power BI Visual SDK | Custom Visual Framework   |
| TypeScript          | Main Development Language |
| HTML / DOM          | Visual Structure          |
| LESS / CSS          | Styling                   |
| JavaScript Logic    | Interactions              |
| VS Code             | Development Environment   |
| GitHub              | Version Control           |
| Excel               | Sample Data Source        |
| Power BI Desktop    | Testing Environment       |

---

# 🚧 Development Roadmap

## Phase 1 — Foundation

* [x] Project Planning
* [x] Power BI Visual SDK Setup
* [x] Repository Cleanup
* [x] Render Static Card
* [x] Test Custom Visual inside Power BI

---

## Phase 2 — Flip Card UI

* [x] Create Front Face
* [x] Create Back Face
* [x] Add Card Layout
* [x] Add CSS Styling
* [x] Add Click Interaction
* [x] Add Flip Animation

---

## Phase 3 — Power BI Integration

* [x] Read Measure Values
* [x] Read Category Fields
* [x] Dynamic Text Rendering
* [x] Dynamic KPI Rendering
* [ ] Respect Power BI Measure Formatting
* [ ] Selection Support
* [ ] Multi-row / multi-card support

---

## Phase 4 — Formatting Pane

* [ ] Add Modern Formatting Pane Support
* [ ] Title Settings
* [ ] Front Card Colors
* [ ] Back Card Colors
* [ ] Typography
* [ ] Borders
* [ ] Shadows
* [ ] Animation Controls
* [ ] Label Visibility Toggle
* [ ] Subtitle Visibility Toggle

---

## Phase 5 — Advanced Features

* [ ] Hover Effects
* [ ] Icons
* [ ] Images
* [ ] KPI Indicators
* [ ] Conditional Formatting
* [ ] Responsive Layout
* [ ] Performance Optimization
* [ ] High Contrast Support
* [ ] Tooltips
* [ ] Context Menu
* [ ] Keyboard Navigation

---

# ✅ Current Working Visual

The custom visual currently displays a working interactive flip card inside Power BI Desktop.

## Current Field Wells

```plaintext
Card Label   → Vendor / Team / Agent / Call Driver
Card Value   → Main measure shown on the front face
Detail Value → Detail measure shown on the back face
```

## Example Front Face

```plaintext
+----------------------+
| HGS                  |
| Total Calls          |
| 12,345               |
| Click card to view   |
| details              |
+----------------------+
```

## Example Back Face

```plaintext
+----------------------+
| HGS                  |
| Average AHT          |
| 588                  |
| Front value: 12,345  |
+----------------------+
```

The card flips when clicked.

---

# 📊 Sample Data File

A sample Excel file was created for testing the visual in Power BI.

The sample data includes realistic BPO-style fields such as:

* Date
* Vendor
* Team
* Agent
* Tenure Band
* Call Driver
* Calls
* AHT
* CSAT
* QA Score
* Transfers
* Holds
* FCR
* Escalations

The sample file also includes reference DAX measures and test scenarios for the Flip Card visual.

Example test setup:

```plaintext
Card Label   = Vendor
Card Value   = Total Calls
Detail Value = Average AHT
```

Another example:

```plaintext
Card Label   = Call Driver
Card Value   = CSAT %
Detail Value = Transfer Rate %
```

---

# ⚠️ Known Current Warnings

When running:

```bash
pbiviz package
```

Current non-blocking warnings may appear:

* `pwsh is not recognized`
* `Format Pane` required soon
* Optional Power BI visual feature warnings such as:

  * Allow Interactions
  * Color Palette
  * Context Menu
  * High Contrast
  * Highlight Data
  * Keyboard Navigation
  * Landing Page
  * Localizations
  * Rendering Events
  * Selection Across Visuals
  * Tooltips

These warnings are not currently blocking the build.

Important successful output:

```plaintext
Lint check completed.
Package created!
done   Build completed successfully
```

---

# ⚠️ Known Current Limitation

## Measure Formatting Not Yet Respected

Current numeric values are displayed using basic number formatting.

Example:

```plaintext
CSAT % currently displays as 0.84
```

Expected future behavior:

```plaintext
CSAT % should display as 84%
```

Future fix:

* Read the measure format string from Power BI
* Use Power BI visual formatting utilities
* Respect percentage, currency, decimal, and display unit formatting

This is planned as the next improvement before moving deeper into formatting pane customization.

---

# 📍 Next Session Starting Point

When returning to this project:

1. Open terminal in:

```plaintext
C:\Power BI Custom Visual\PowerBI-FlipCard
```

2. Verify Git status:

```bash
git status
```

Expected result:

```plaintext
nothing to commit, working tree clean
```

3. Open the visual project:

```plaintext
C:\Power BI Custom Visual\PowerBI-FlipCard\flipCardVisual
```

4. Open these files:

```plaintext
flipCardVisual/src/visual.ts
flipCardVisual/capabilities.json
flipCardVisual/style/visual.less
```

5. Continue with the next development target:

```plaintext
Respect Power BI measure formatting
```

Next target:

```plaintext
CSAT % should display as 84%
Transfer Rate % should display as 15%
Currency measures should display with currency formatting
Whole numbers should display cleanly
Decimal values should follow Power BI measure formatting
```

Goal:

* Replace basic manual number formatting
* Use Power BI measure format strings
* Keep build successful with zero lint errors
* Test with Total Calls, Average AHT, CSAT %, QA Score %, and Transfer Rate %

---

# 🧪 Build Command

Run this command from the visual project folder:

```bash
cd "C:\Power BI Custom Visual\PowerBI-FlipCard\flipCardVisual"
pbiviz package
```

Expected success output:

```plaintext
Lint check completed.
Package created!
done   Build completed successfully
```

---

# 💾 Git Workflow

Use this workflow after every successful milestone:

```bash
cd "C:\Power BI Custom Visual\PowerBI-FlipCard"
git status
git add .
git commit -m "Your milestone message here"
git push
```

Current suggested next commit message:

```bash
git commit -m "Update README with current flip card progress"
```

Future formatting milestone commit message:

```bash
git commit -m "Respect Power BI measure formatting"
```

---

# 🔥 Long-Term Vision

Build a reusable Power BI visual capable of delivering:

* Web-like interactions
* Modern animations
* Rich customization
* Better storytelling
* Premium dashboard experiences
* Reusable custom KPI cards
* Data-driven dashboard interactions without relying on bookmarks

---

# 💡 Project Philosophy

Power BI visuals should feel interactive, alive, and modern — not static slides.

This project is also a learning project. Each milestone should be documented clearly so the progress can be passed between ChatGPT, Codex, GitHub, and future development sessions without losing context.
