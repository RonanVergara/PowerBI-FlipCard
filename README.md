# 🚀 Power BI Flip Card Custom Visual

## 📌 Project Overview

This project focuses on building a fully custom interactive Flip Card visual for Power BI.

The goal is to create a reusable Power BI visual that behaves more like a modern web application component rather than a traditional Power BI visual.

The visual should support animations, clean UI/UX, extensive formatting options, and dynamic interactions without relying on bookmarks.

---

# 🎯 Main Goal

Create a Power BI custom visual where:

* A card flips when clicked
* Front and back content are fully customizable
* Animations are smooth and modern
* Users can configure the visual through the Power BI formatting pane
* The visual feels similar to modern web UI components

---

# 🏁 Current Status

## Day 1 Completed

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
* First static card displays correctly in Power BI Desktop
* Build artifacts such as `.tmp`, `dist`, and webpack reports are ignored by Git
* Phase 1 Foundation is complete

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

* [ ] Create Front Face
* [ ] Create Back Face
* [ ] Add Card Layout
* [ ] Add CSS Styling
* [ ] Add Click Interaction
* [ ] Add Flip Animation

---

## Phase 3 — Power BI Integration

* [ ] Read Measure Values
* [ ] Read Category Fields
* [ ] Dynamic Text Rendering
* [ ] Dynamic KPI Rendering
* [ ] Selection Support

---

## Phase 4 — Formatting Pane

* [ ] Title Settings
* [ ] Colors
* [ ] Typography
* [ ] Borders
* [ ] Shadows
* [ ] Animation Controls

---

## Phase 5 — Advanced Features

* [ ] Hover Effects
* [ ] Icons
* [ ] Images
* [ ] KPI Indicators
* [ ] Responsive Layout
* [ ] Performance Optimization

---

# ✅ Current Working Visual

The custom visual currently displays a static card inside Power BI Desktop:

```plaintext
+----------------------+
| Flip Card Visual     |
| Hello Power BI       |
+----------------------+
```

No animation yet.

The goal of this stage was to confirm that custom TypeScript and LESS styling can render successfully inside Power BI.

---

# ⚠️ Known Current Warnings

When running:

```bash
pbiviz package
```

Current non-blocking warnings may appear:

* `pwsh is not recognized`
* Optional Power BI visual feature warnings such as:

  * Allow Interactions
  * Color Palette
  * Context Menu
  * High Contrast
  * Tooltips

These are not blocking the build.

Important successful output:

```plaintext
Lint check completed.
done   Build completed successfully
```

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

3. Commit current static-card milestone if not yet committed:

```bash
git add .
git commit -m "Render first static flip card"
git push
```

4. Open:

```plaintext
flipCardVisual/src/visual.ts
flipCardVisual/style/visual.less
```

5. Start Phase 2:

```plaintext
Build actual flip card UI
```

Next target:

```plaintext
Front Face:
+----------------------+
| Total Volume         |
| 12,345               |
+----------------------+

Back Face:
+----------------------+
| Details              |
| Clicked / flipped    |
+----------------------+
```

Goal:

* Create front and back card faces
* Add click interaction
* Add smooth flip animation
* Keep build successful with zero lint errors

---

# 🔥 Long-Term Vision

Build a reusable Power BI visual capable of delivering:

* Web-like interactions
* Modern animations
* Rich customization
* Better storytelling
* Premium dashboard experiences

---

# 💡 Project Philosophy

Power BI visuals should feel interactive, alive, and modern — not static slides.
