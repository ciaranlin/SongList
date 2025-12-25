# VTuber Song List Website - Design Guidelines

## Design Approach
**Selected Approach:** Custom aesthetic - "Soft Pastel VTuber UI"  
This project has specific visual requirements that define its unique identity.

---

## Core Design Principles

### Visual Identity
- **Aesthetic:** Soft, pastel, VTuber-inspired interface with glass-like translucency
- **Rounded corners:** 14px–18px consistently across all UI elements
- **Shadows:** Subtle, soft shadows only (no heavy drop shadows)
- **Surfaces:** Semi-transparent "glass-like" panels with backdrop blur where supported

---

## Color System

### Primary Colors
- **Background:** `#A9BAC4` (muted misty blue-gray)
- **Card backgrounds:** `rgba(255,255,255,0.22)` with `rgba(255,255,255,0.35)` 1px border
- **Button default:** `rgba(255,255,255,0.45)`
- **Button hover:** `rgba(255,255,255,0.60)`
- **Table background:** `#FFFFFF` (solid white)
- **Divider lines:** `rgba(0,0,0,0.08)`

### Text Readability (Critical)
**Auto Text Color System:**
- Light backgrounds → Dark text `#1B1B1B`
- Dark backgrounds → Light text `#FFFFFF`
- Apply to: hero text, filter labels, buttons, card text, table headers
- Add subtle text shadow if contrast is insufficient

---

## Typography Scale

- **Hero title:** 40–48px, bold weight
- **Hero subtitle:** 28–32px, medium weight
- **Hint text:** 12–14px, regular
- **Filter bar labels:** 13–14px, medium
- **Table text:** 14px, regular
- **System font stack is acceptable**

---

## Layout System

### Spacing Primitives
Use Tailwind units: **2, 4, 6, 8, 12, 16** for consistent rhythm

### Content Width & Alignment
- **Filter bar container width must exactly match table container width** (strict requirement)
- Left/right edges must be pixel-perfect aligned
- Configurable max-width for content area
- Centered layout with even spacing

---

## Component Library

### 1. Hero Banner
- **Avatar:** Circular, positioned prominently
- **Title + Subtitle + Hint:** Stacked vertically with proper hierarchy
- **Hover trigger area:** Dedicated invisible zone for card reveal (excludes corner buttons)

### 2. Hover-Reveal Cards
**Behavior:**
- Appear on hero area hover with smooth fade-in (200-300ms)
- Fade out when mouse leaves
- **Zero layout shift:** Cards must not cause jitter or movement
- Position below or near hero

**Card Structure:**
- Title (configurable typography)
- Body text (configurable line-height and spacing)
- Multiple link items per card (icon + label in rounded pill buttons)
- Configurable: padding, border-radius, background, border, shadow

**Link Items (Pills):**
- Icon (optional) + Text label
- Rounded pill style matching overall aesthetic
- Hover state with background opacity increase
- Open in new tab option supported

### 3. Filter Bar (Aligned with Table)
**Components from left to right:**
- Language tabs (国语/日语/英语) - independent state
- Mandarin Pinyin Initial filter (A-Z) - only visible when Mandarin selected
- Search input - independent state
- Captain Request toggle - independent filter group
- Action buttons (if any)

**Layout Requirements:**
- All elements evenly spaced with consistent gaps
- Width matches table exactly
- Filters are independent: changing one doesn't reset others

### 4. Song List Table
- Solid white background `#FFFFFF`
- Clean rows with subtle dividers `rgba(0,0,0,0.08)`
- Columns: Song Name, Singer, Language, Remark, Captain Requestable status
- Readable 14px text

### 5. Admin Pages (/config and /yu)
**Both must use identical theme:**
- Same color scheme, rounded corners, shadows
- Same typography scale
- Same translucent card aesthetic

**/config Page (Two-Column):**
- Left: Configuration editor (form fields, controls)
- Right: Live preview of homepage (updates instantly without reload)

**/yu Page:**
- Editable table view of song list
- Add/Edit/Delete controls
- Save button to persist changes
- Matches homepage aesthetic

---

## Interaction Patterns

### Hover States
- **Cards:** Fade in/out smoothly, no jitter
- **Buttons:** Increase background opacity (0.45 → 0.60)
- **Corner buttons:** Must NOT trigger hero hover behavior
- **Link pills:** Subtle background highlight on hover

### Filter Logic
- Language filters (independent group)
- Captain Request filter (independent group)  
- Search (independent)
- Results = Language AND Captain AND Search (if active)
- State persists across filter changes

---

## Images

**Hero Section:**
- Avatar/icon image (circular, prominent placement)
- No large hero background image required
- Focus on clean, translucent UI over hero
- If buttons overlay any image areas, use backdrop blur `backdrop-blur-sm` on button backgrounds

---

## Critical Quality Requirements

1. **No layout jitter:** Hover cards must never cause content shift
2. **Pixel-perfect alignment:** Filter bar and table edges must match exactly
3. **Text readability:** Auto text color ensures contrast on all backgrounds
4. **Consistent theming:** All three pages (/, /config, /yu) use identical visual language
5. **Smooth interactions:** All transitions 200-300ms with easing
6. **Independent filters:** State management ensures filters don't interfere with each other
7. **SSR rendering:** No flash of default content on homepage load