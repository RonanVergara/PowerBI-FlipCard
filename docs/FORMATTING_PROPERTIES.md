# Formatting properties — 1.2.0

Display names do not change serialized identities. The visible cards and exact groups are:

| Card display name | Internal card | Internal groups |
| --- | --- | --- |
| Card frame | `cardAppearance` | `cardAppearanceLayoutGroup`, `cardAppearanceColorsGroup`, `cardAppearanceDecorationGroup` |
| Multiple-card layout | `multipleCards` | `multipleCardsLayoutGroup` |
| Front — Label | `label` | `frontLabelLayoutGroup`, `frontLabelTypographyGroup`, `frontLabelColorsGroup` |
| Front — Callout | `mainValue` | `frontCalloutTypographyGroup`, `frontCalloutNumberFormatGroup`, `frontCalloutColorsGroup` |
| Front — Insight and status | `benchmark` | `frontInsightStatusLayoutGroup`, `frontInsightStatusColorsGroup` |
| Back face and flip motion | `flip` | `backFaceLayoutGroup`, `backFaceTypographyGroup`, `backFaceColorsGroup`, `flipControlGroup`, `flipMotionGroup` |
| Interactions | `interactions` | `interactionsControlGroup` |

`multipleCards.enabled`, `benchmark.enabled`, and `flip.enabled` remain card-level switches.

## New 1.2 properties

| Path | Stored values/default | Visibility |
| --- | --- | --- |
| `label.presentationMode` | `auto` / `stacked` / `split`; default `auto` | Always |
| `label.verticalAlignment` | `top` / `center` / `bottom`; default `center` | Always |
| `label.sectionSpacing` | 0–40 px; default 8 | Always; validator and runtime clamp |
| `label.dividerEnabled` | default `false` | Always |
| `label.dividerColor` | default `#E5E7EB` | Divider enabled |
| `label.responsivePriority` | `automatic` / `insight` / `status`; default `automatic` | Always |
| `benchmark.insightIcon` | default `false` | Benchmark enabled |
| `benchmark.statusPresentation` | `pill` / `text` / `iconOnly`; default `pill` | Benchmark enabled |
| `benchmark.insightBackgroundEnabled` | default `false` | Benchmark enabled |
| `benchmark.insightBackground` | default `#F3F2F1` | Background switch enabled |
| `benchmark.statusBackground` | default `#FFFFFF` | Status presentation Pill |
| `flip.backLayout` | `auto` / `list` / `tiles`; default `auto` | Flip enabled |
| `flip.backTitleSource` | `automatic` / `category` / `custom`; default `automatic` | Flip enabled |
| `flip.customBackTitle` | default empty; whitespace renders `Details` | Custom title source |
| `flip.backHeaderBackground` | default `#FFFFFF` | Flip enabled |
| `flip.backHeaderTextColor` | default `#242424` | Flip enabled |
| `flip.backContentBackground` | default `#FFFFFF` | Flip enabled |
| `flip.detailEmphasis` | `standard` / `strong`; default `strong` | Flip enabled |
| `flip.sectionDividers` | default `false` | Flip enabled |
| `flip.backDividerColor` | default `#E5E7EB` | Section dividers enabled |
| `flip.itemBackgroundEnabled` | default `false` | Flip enabled |
| `flip.itemBackground` | default `#F3F2F1` | Item background enabled |
| `flip.backLabelAlignment` | `left` / `center` / `right`; default `left` | Flip enabled |
| `flip.backValueAlignment` | `left` / `center` / `right`; default `right` | Flip enabled |
| `flip.controlIcon` | `information` / `rotate` / `chevron`; default `rotate` | Flip enabled |
| `flip.controlStyle` | `ghost` / `outline` / `filled`; default `outline` | Flip enabled |
| `flip.controlShape` | `circle` / `roundedSquare`; default `circle` | Flip enabled |
| `flip.showDetailsText` | default `false` | Flip enabled |
| `flip.motionStyle` | `horizontal` / `vertical` / `fade` / `none`; default `horizontal` | Flip enabled |
| `flip.horizontalDirection` | `left` / `right`; default `right` | Horizontal only |
| `flip.verticalDirection` | `up` / `down`; default `up` | Vertical only |
| `flip.easing` | `smooth` / `snappy` / `gentle`; default `smooth` | Horizontal, Vertical, Fade |
| `flip.animationDuration` | 0–2000 ms; default 450 | Horizontal, Vertical, Fade |
| `flip.perspective` | `subtle` / `standard` / `deep`; default `standard` | Horizontal, Vertical |

Motion None shows no motion subsettings. Fixed dimensions appear only for Fixed sizing; preferred dimensions appear only for Fit. Multiple-card groups, benchmark groups, and flip groups follow their respective master switches.

## Preserved property inventory

- `cardAppearance`: `frontBackground`, hidden `backBackground`, `borderColor`, `borderWidth`, `cornerRadius`, `shadow`, `accentEnabled`, `accentColor`, `padding`.
- `multipleCards`: `enabled`, `mode`, `sizing`, `columnCalculation`, `columns`, `gap`, `preferredWidth`, `preferredHeight`, `fixedWidth`, `fixedHeight`.
- `label`: all new properties above plus `show`, `fontFamily`, `fontSize`, `fontColor`, `bold`, `alignment`, `wrap`.
- `mainValue`: `fontFamily`, `fontSize`, `fontColor`, `bold`, `alignment`, `displayUnits`, `decimalPlaces`.
- `benchmark`: all new properties above plus `enabled`, `showReference`, `showStatus`, `showVariance`, `direction`, `tolerance`, `positiveColor`, `neutralColor`, `negativeColor`, `varianceMode`, `statusIndicatorColor`.
- `flip`: all new properties above plus `enabled`, `showDetail`, `position`, `size`, `buttonColor`, `buttonBackground`, `fontFamily`, `fontSize`, `labelColor`, `valueColor`, `displayUnits`, `decimalPlaces`, `spacing`.
- `interactions`: `selectionEnabled` and hidden `enableFlip`.
- Hidden legacy objects remain `detailValues`, `kpiStatus`, and `flipBehavior`.

## Conditional formatting and Reset

Exact `fx` paths: `cardAppearance.frontBackground`, `cardAppearance.borderColor`, `cardAppearance.accentColor`, `mainValue.fontColor`, and `benchmark.statusIndicatorColor`. Each is emitted from a formatting container in its owning composite group with wildcard selector, alternate constant selector, and `ConstantOrRule`.

Every visible card emits `revertToDefaultDescriptors` for its possible slices. `cardAppearance.backBackground` remains invisible but is included in the Card frame Reset descriptors. The formatting API can describe the reset; only Power BI Desktop can verify whether the host removes hidden legacy metadata.
