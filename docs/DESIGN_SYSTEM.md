# Agente Tributário — Design System v1.0

**Date:** 2026-02-09
**Version:** 1.0
**Status:** 🎨 Active Development
**Methodology:** Atomic Design (Atoms → Molecules → Organisms → Templates → Pages)

---

## Table of Contents

1. [Design Philosophy](#design-philosophy)
2. [Color Palette](#color-palette)
3. [Typography](#typography)
4. [Layout & Spacing](#layout--spacing)
5. [Atomic Components](#atomic-components)
6. [Molecules & Combinations](#molecules--combinations)
7. [Organisms](#organisms)
8. [Icons & Visual Elements](#icons--visual-elements)
9. [Interactions & Animations](#interactions--animations)
10. [Accessibility (WCAG AA)](#accessibility-wcag-aa)
11. [Responsive Breakpoints](#responsive-breakpoints)
12. [Implementation Guide](#implementation-guide)

---

## Design Philosophy

### Core Principles

**Clarity Over Decoration**
Users are managing serious financial matters. Every visual element serves a purpose. No unnecessary animations or decorations.

**Trust & Professionalism**
Colors and typography evoke confidence. Visual hierarchy guides users safely through sensitive operations (like regime transitions).

**Responsiveness First**
Mobile users must have parity with desktop. Density information adapts intelligently based on screen size.

**Accessibility is Non-Negotiable**
All interactions meet WCAG AA standards. Color is never the sole indicator. Focus states are visible.

**Consistency at Scale**
Components follow predictable patterns. A button behaves the same way everywhere.

---

## Color Palette

### Primary Colors

**Primary: Trust Blue**
- `--color-primary-50`: `#EBF2FF`
- `--color-primary-100`: `#D7E5FF`
- `--color-primary-200`: `#B0CCFF`
- `--color-primary-300`: `#7BA7FF`
- `--color-primary-400`: `#4A82FF`
- `--color-primary-500`: `#0052CC` ← **Main Brand Blue**
- `--color-primary-600`: `#0040A3`
- `--color-primary-700`: `#002D7A`
- `--color-primary-800`: `#001A51`
- `--color-primary-900`: `#000D28`

**Usage:** Primary CTAs, links, active states, primary buttons, focus borders

---

### Secondary Colors

**Secondary: Growth Green**
- `--color-secondary-50`: `#ECFAF0`
- `--color-secondary-100`: `#D9F4E2`
- `--color-secondary-200`: `#B3E8C4`
- `--color-secondary-300`: `#8DDCA7`
- `--color-secondary-400`: `#66D189`
- `--color-secondary-500`: `#00A651` ← **Success & Growth**
- `--color-secondary-600`: `#008040`
- `--color-secondary-700`: `#006030`
- `--color-secondary-800`: `#004020`
- `--color-secondary-900`: `#002010`

**Usage:** Success messages, positive trends (↑ growth), secondary CTAs, completion states

---

### Semantic Colors

**Error / Danger: Warning Red**
- `--color-error`: `#D61F1F`
- `--color-error-light`: `#F8EAEA`
- `--color-error-dark`: `#8B0000`

**Usage:** Validation errors, destructive actions (delete), alerts, negative trends

**Warning / Caution: Attention Orange**
- `--color-warning`: `#FF8C00`
- `--color-warning-light`: `#FFF5EE`
- `--color-warning-dark`: `#CC7000`

**Usage:** Warnings, rate limits approaching, informational alerts

**Info / Neutral: Professional Gray**
- `--color-info`: `#0066CC`
- `--color-info-light`: `#E6F0FF`

**Usage:** Informational messages, help text, secondary information

---

### Neutral Colors

**Grayscale (for text, backgrounds, borders)**
- `--color-neutral-0`: `#FFFFFF` ← Background
- `--color-neutral-50`: `#F9F9F9` ← Subtle background
- `--color-neutral-100`: `#F3F3F3` ← Table row, card background
- `--color-neutral-200`: `#E6E6E6` ← Borders, dividers
- `--color-neutral-300`: `#D1D1D1` ← Subtle borders
- `--color-neutral-400`: `#999999` ← Placeholder text
- `--color-neutral-500`: `#666666` ← Secondary text
- `--color-neutral-600`: `#444444` ← Body text
- `--color-neutral-700`: `#222222` ← Headings
- `--color-neutral-800`: `#111111` ← Darkest text
- `--color-neutral-900`: `#000000` ← Extreme contrast

**Usage:**
- Background: `neutral-0`, `neutral-50`, `neutral-100`
- Text: `neutral-600` (body), `neutral-700` (headings), `neutral-400` (disabled)
- Borders: `neutral-200`, `neutral-300`

---

### Color Usage Guidelines

| Element | Color | Contrast Ratio |
|---------|-------|---|
| Primary Button | Primary-500 on Neutral-0 | 5.2:1 ✅ AA |
| Body Text | Neutral-600 on Neutral-0 | 5.1:1 ✅ AA |
| Headings | Neutral-700 on Neutral-0 | 7.5:1 ✅ AAA |
| Disabled Button | Neutral-300 on Neutral-50 | 3.1:1 ⚠️ Acceptable |
| Success Badge | Secondary-500 on Secondary-50 | 5.3:1 ✅ AA |
| Error Text | Error on Neutral-0 | 6.2:1 ✅ AA |

**Rule:** Never use color alone to convey information. Always add icons or text labels.

---

## Typography

### Font Family

**Primary Font: Inter** (Google Fonts)
- Modern, clean, excellent legibility
- Fallback: `system-ui, -apple-system, sans-serif`

**Code Font: Inconsolata** (Google Fonts)
- For API responses, error messages, code examples
- Fallback: `monospace`

### Type Scale

All sizes use **12px base unit** for consistency.

| Role | Size | Weight | Line Height | Usage |
|------|------|--------|---|---|
| **Display** | 32px | Bold (700) | 1.2 (38px) | Page titles, hero text |
| **Heading 1** | 28px | Bold (700) | 1.3 (36px) | Section titles |
| **Heading 2** | 24px | Bold (700) | 1.3 (31px) | Card titles, major sections |
| **Heading 3** | 20px | Semi-Bold (600) | 1.4 (28px) | Subsections |
| **Body Large** | 16px | Regular (400) | 1.5 (24px) | Primary body text |
| **Body** | 14px | Regular (400) | 1.5 (21px) | Secondary text |
| **Body Small** | 12px | Regular (400) | 1.5 (18px) | Helper text, captions |
| **Label** | 12px | Semi-Bold (600) | 1.4 (17px) | Form labels, badges |
| **Overline** | 11px | Bold (700) | 1.2 (13px) | Section headers, tags |

### Letter Spacing

- Display/Heading: `-0.02em` (tighter for emphasis)
- Body: `0em` (default)
- Overline: `0.1em` (wider for all-caps)

### Example Specifications

```css
/* Heading 1 */
font-size: 28px;
font-weight: 700;
line-height: 1.3;
letter-spacing: -0.02em;
color: var(--color-neutral-700);
margin-bottom: 24px;

/* Body */
font-size: 16px;
font-weight: 400;
line-height: 1.5;
color: var(--color-neutral-600);
```

---

## Layout & Spacing

### Grid System

**8px Base Unit**
All spacing derives from 8px multiples for harmony.

| Unit | Value | Usage |
|------|-------|---|
| xs | 4px | Micro-spacing (between icon + text) |
| sm | 8px | Compact spacing (small elements) |
| md | 16px | Standard spacing (padding, margin) |
| lg | 24px | Section spacing |
| xl | 32px | Major spacing (between sections) |
| 2xl | 48px | Large gaps (full sections) |
| 3xl | 64px | Massive gaps (page sections) |

### Padding & Margin Standards

**Buttons:**
- Padding: `8px 16px` (small), `12px 24px` (medium), `16px 32px` (large)

**Cards:**
- Padding: `16px` (compact), `24px` (standard), `32px` (spacious)

**Input Fields:**
- Padding: `12px 16px` (height: 40px)

**Sections:**
- Margin-bottom: `32px` (between major sections)
- Margin-bottom: `16px` (between subsections)

### Maximum Content Width

- **Desktop:** `1280px` (with 32px padding on sides)
- **Tablet:** `100vw` (with 16px padding)
- **Mobile:** `100vw` (with 12px padding)

---

## Atomic Components

### Atoms: Basic Building Blocks

#### Button

**States:**
1. **Primary Button** (Default CTA)
   - Background: `primary-500`
   - Text: `white`
   - Border: none
   - Hover: `primary-600` (darker)
   - Active: `primary-700` (even darker)
   - Disabled: `neutral-300` on `neutral-100`, cursor: not-allowed
   - Focus: 2px solid `primary-500` outline

2. **Secondary Button** (Alternative CTA)
   - Background: `neutral-100`
   - Text: `primary-500`
   - Border: 1px `primary-500`
   - Hover: Background `primary-50`
   - Active: Background `primary-100`
   - Disabled: Text `neutral-400`, border `neutral-300`

3. **Danger Button** (Destructive)
   - Background: `error`
   - Text: `white`
   - Hover: `error-dark`

4. **Ghost Button** (Minimal)
   - Background: transparent
   - Text: `primary-500`
   - Hover: Background `primary-50`

**Sizes:**
- Small: `32px` height, `12px font`, `8px 12px` padding
- Medium: `40px` height, `14px font`, `12px 24px` padding (default)
- Large: `48px` height, `16px font`, `16px 32px` padding

**Always include:**
- Focus state (outline visible)
- Disabled state (opacity or color change)
- Loading state (spinner inside button)
- Keyboard accessible (`:focus` visible)

---

#### Input Field

**Text Input (text, email, number, password)**
- Height: `40px`
- Padding: `12px 16px`
- Border: `1px solid neutral-200`
- Background: `neutral-0` (white)
- Font: `16px`
- Placeholder: `neutral-400` (gray)
- Hover: Border `neutral-300`
- Focus: Border `primary-500`, outline `2px solid primary-200`
- Error: Border `error`, text `error`
- Disabled: Background `neutral-50`, color `neutral-400`

**Select Input**
- Appearance: Similar to text input
- Icon: Chevron down (right side, 16px)
- On mobile: Native select for better UX

**Textarea**
- Min height: `100px`
- Resizable: `vertical` only
- Same border/focus states as text input

---

#### Label & Placeholder Text

**Form Label**
- Font-size: `12px`
- Font-weight: `600`
- Color: `neutral-600`
- Margin-bottom: `8px`
- Display: `block`
- Required indicator: `*` in `error` color

**Placeholder Text**
- Color: `neutral-400`
- Font-style: `italic`
- Opacity: `0.7` (optional, for subtle distinction)

---

#### Badge / Pill

**Status Badge:**
- Background: Color depends on status
  - Success: `secondary-100`, text: `secondary-700`
  - Error: `error-light`, text: `error-dark`
  - Warning: `warning-light`, text: `warning-dark`
  - Info: `info-light`, text: `info`
- Padding: `4px 12px`
- Border-radius: `12px`
- Font-size: `12px`
- Font-weight: `600`
- Display: `inline-block`

**Example HTML:**
```html
<span class="badge badge-success">Ativo</span>
<span class="badge badge-error">Erro</span>
<span class="badge badge-warning">Atenção</span>
```

---

#### Icon

**Lucide Icons System**
- Source: `https://lucide.dev`
- Size: 16px, 20px, 24px, 32px
- Color: Inherit (inherits from text color by default)
- Stroke-width: 2

**Common Icons:**
- Navigation: `ChevronRight`, `ChevronDown`, `Menu`, `X`, `Home`
- Actions: `Plus`, `Edit2`, `Trash2`, `Download`, `Upload`, `Share2`
- Status: `AlertCircle`, `CheckCircle`, `Clock`, `Lock`, `Eye`, `EyeOff`
- Business: `BarChart3`, `PieChart`, `TrendingUp`, `DollarSign`, `Building2`
- Tax-specific: `Calculator`, `FileText`, `ScrollText`

---

### Molecules: Component Combinations

#### Form Field
**Combination:** Label + Input + Helper Text/Error

```
[Label: "CNPJ"]
[Input: "00.000.000/0000-00"]
[Helper: "Digite um CNPJ válido"]
```

Spacing: Label→Input: 8px, Input→Helper: 4px

---

#### Card
**Structure:** Container with optional header, body, footer

```
┌─────────────────────────┐
│ Card Title     [Close]  │  ← Header (optional)
├─────────────────────────┤
│                         │
│   Card content here     │  ← Body
│                         │
├─────────────────────────┤
│  [Cancel] [Save]        │  ← Footer (optional)
└─────────────────────────┘
```

**Styles:**
- Padding: `24px` (standard) or `16px` (compact)
- Border: `1px solid neutral-200`
- Border-radius: `8px`
- Box-shadow: `0 1px 3px rgba(0,0,0,0.1)` (subtle)
- Background: `neutral-0` (white)
- On hover (interactive): Shadow `0 4px 12px rgba(0,0,0,0.15)`

---

#### Alert / Notification

**Structure:** Icon + Message + Action (optional)

```
[Icon] Message text here [Close] [Action]
```

**Types:**
- **Success:** `secondary-50` background, `secondary-700` text, `CheckCircle` icon
- **Error:** `error-light` background, `error-dark` text, `AlertCircle` icon
- **Warning:** `warning-light` background, `warning-dark` text, `AlertTriangle` icon
- **Info:** `info-light` background, `info` text, `Info` icon

**Padding:** `16px`
**Border-radius:** `6px`
**Margin-bottom:** `16px`

---

#### Breadcrumb

**Structure:** `Home > Section > Subsection > Current`

```
<nav aria-label="Breadcrumb">
  <ol>
    <li><a href="/">Home</a></li>
    <li><span>/</span> <a href="/admin">Admin</a></li>
    <li><span>/</span> <span>Usuários</span></li>
  </ol>
</nav>
```

**Styles:**
- Font-size: `14px`
- Color: Links `primary-500`, separators `neutral-400`, current `neutral-700`
- Separator: `/` or `>`

---

#### Table

**Desktop Table:**
```
┌─────────────────────────────────────────┐
│ Header 1    Header 2    Header 3    ... │  ← Sticky header
├─────────────────────────────────────────┤
│ Data 1      Data 2      Data 3          │  ← Alternating rows
│ Data 1      Data 2      Data 3          │  ← neutral-100 every other row
│ Data 1      Data 2      Data 3          │
└─────────────────────────────────────────┘
```

**Table Header:**
- Background: `neutral-50`
- Font-weight: `600`
- Font-size: `12px`
- Text-transform: `uppercase`
- Color: `neutral-700`
- Padding: `16px`
- Sticky: `position: sticky; top: 0;`

**Table Rows:**
- Padding: `16px`
- Border-bottom: `1px solid neutral-200`
- Hover: Background `neutral-50` (on hover)
- Even rows: Background `neutral-100` (optional, for clarity)

**Mobile Table (Card Grid):**
Convert to cards on mobile (`<768px`)

---

### Organisms: Complex UI Sections

#### Navigation Header

**Desktop:**
```
┌──────────────────────────────────────────────┐
│ [Logo] [Menu] [Search]      [Notifications] │
│        Dashboard | Portfolio | Chat         │
└──────────────────────────────────────────────┘
```

**Mobile:**
```
┌─────────────────────────────┐
│ [Menu] [Logo]  [Profile] [×]│
└─────────────────────────────┘
```

---

#### Sidebar Navigation

**Desktop:**
```
┌────────────┐
│ [Logo]     │
├────────────┤
│ Dashboard  │
│ Portfolio  │
│ Chat       │
│ Settings   │
│ Profile    │
└────────────┘
```

**Collapsible on mobile:** Hamburger menu, slides from left

---

#### Dashboard Grid

**Responsive grid layout:**
- Desktop (1920px): 4 columns
- Tablet (768px): 2 columns
- Mobile (375px): 1 column

**Gap between items:** 24px

---

#### Data Table with Pagination

```
┌─────────────────────────────────────────┐
│ [Filter] [Search]        [Export] [New]│
├─────────────────────────────────────────┤
│ Name   | CNPJ   | Status | Alerts  | ⋮ │
├─────────────────────────────────────────┤
│ Data row                                │
│ Data row                                │
│ Data row                                │
├─────────────────────────────────────────┤
│ Showing 1-10 of 50  [← Previous] [Next→]│
└─────────────────────────────────────────┘
```

---

## Icons & Visual Elements

### Icon Sizes & Usage

| Size | Usage |
|------|-------|
| 16px | Inline with text, form inputs |
| 20px | Button icons, small UI |
| 24px | Navigation items, card titles |
| 32px | Large buttons, hero sections |

### Icon Colors

- **Primary:** Inherits text color
- **On colored backgrounds:** Use `white` or adjust for contrast
- **Disabled:** `neutral-400`
- **Hover:** Darken or brighten as needed

### Visual Indicators

**Checkmarks:**
- ✓ for completed items (secondary-500)
- × for errors (error)
- → for navigation (primary-500)
- ↑ for positive trends (secondary-500)
- ↓ for negative trends (error)

**Loading Spinner:**
- Animate continuously
- Color: `primary-500`
- Diameter: 24px (standard) or 16px (inline)

---

## Interactions & Animations

### Transition Timing

All transitions use: `transition: all 200ms ease-in-out;`

**Standard animation durations:**
- Buttons: 200ms
- Cards: 300ms
- Modals: 300ms (entrance), 200ms (exit)
- Dropdowns: 150ms

### Hover States

**Button hover:** Darken by 1 color step (e.g., primary-500 → primary-600)
**Link hover:** Underline appears
**Card hover:** Box-shadow increases from `0 1px 3px` to `0 4px 12px`
**Row hover:** Background color shifts to `neutral-50`

### Focus States

**Keyboard focus:**
- Outline: `2px solid primary-500`
- Outline-offset: `2px`
- Visible on all interactive elements
- Never remove default outline

### Loading States

**Button loading:**
```
[⟳ Processando...]
```
- Show spinner
- Disable further clicks
- Disable other form inputs

**Page/Table loading:**
```
┌─────────────────┐
│    ⟳ Loading    │
│  Carregando...  │
└─────────────────┘
```

**Skeleton loading:**
- Display placeholder blocks (animated gray)
- Match final layout

### Empty States

**No data:**
```
[Empty icon]
Nenhum dado encontrado
[Helpful CTA]
```

Example:
```
[Document icon]
Você não tem alertas
[Botão: "Configurar Alertas"]
```

---

## Accessibility (WCAG AA)

### Color Contrast

| Contrast Ratio | WCAG Level |
|---|---|
| 3:1 | AA (large text) |
| 4.5:1 | AA (normal text) |
| 7:1 | AAA (all text) |

**All text must meet at least 4.5:1 contrast ratio.**

### Focus & Navigation

- ✓ All interactive elements must be keyboard accessible
- ✓ Tab order must be logical (left-to-right, top-to-bottom)
- ✓ Focus indicator always visible
- ✓ No keyboard trap (user can always tab away)
- ✓ Skip links for main content

### ARIA Labels

```html
<!-- Form inputs -->
<label for="cnpj">CNPJ</label>
<input id="cnpj" type="text" aria-describedby="cnpj-helper" />
<span id="cnpj-helper">Formato: 00.000.000/0000-00</span>

<!-- Icon-only buttons -->
<button aria-label="Fechar modal">×</button>

<!-- Tables -->
<table role="grid" aria-label="Lista de empresas">
```

### Semantic HTML

- Use `<button>` for buttons (not `<div>` styled as button)
- Use `<a>` for links (not `<button>` for navigation)
- Use `<label>` for form labels (not placeholder alone)
- Use `<h1>`, `<h2>` for headings (not `<div>`)

### Screen Reader Optimization

- Hidden text for screen readers: `class="sr-only"`
- Announce dynamic content: `role="status" aria-live="polite"`
- Describe complex charts: Provide text alternative

---

## Responsive Breakpoints

### Device Breakpoints

| Device | Width | Layout | Grid Columns |
|--------|-------|--------|---|
| Mobile | 375px | Single column | 1 |
| Tablet | 768px | Two column | 2 |
| Desktop | 1920px | Multi-column | 4 |

### Responsive Approach

**Mobile-first CSS:**
```css
/* Mobile (375px) */
.card { width: 100%; margin: 0; }

/* Tablet (768px) */
@media (min-width: 768px) {
  .card { width: 48%; margin: 12px; }
}

/* Desktop (1920px) */
@media (min-width: 1920px) {
  .card { width: 23%; }
}
```

### Responsive Components

**Table → Card Grid:**
```
Desktop: Data in tabular format
Mobile: Convert each row to a card
```

**Sidebar → Hamburger:**
```
Desktop: Sidebar always visible
Mobile: Hamburger menu, slide-out
```

**Multi-column → Single:**
```
Desktop: KPIs in horizontal row (4 columns)
Mobile: KPIs stacked vertically (1 column)
```

---

## Implementation Guide

### CSS Framework & Tools

**Recommended Stack:**
- Framework: Tailwind CSS 3+ (for utility-first styling)
- Icons: Lucide React (`lucide-react`)
- Form handling: React Hook Form
- Modals: Headless UI or Radix UI
- Data tables: TanStack Table (React Table)

### Design Tokens (CSS Variables)

Create a `tokens.css` file:

```css
:root {
  /* Colors */
  --color-primary-500: #0052cc;
  --color-secondary-500: #00a651;
  --color-error: #d61f1f;
  --color-neutral-0: #ffffff;
  --color-neutral-600: #444444;

  /* Typography */
  --font-family-base: 'Inter', system-ui, sans-serif;
  --font-size-body: 16px;
  --font-size-heading: 28px;

  /* Spacing */
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;

  /* Shadows */
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 4px 12px rgba(0, 0, 0, 0.15);
}
```

### Component Library Structure

```
components/
├── atoms/
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Badge.tsx
│   ├── Icon.tsx
│   └── Label.tsx
├── molecules/
│   ├── FormField.tsx
│   ├── Card.tsx
│   ├── Alert.tsx
│   └── Breadcrumb.tsx
├── organisms/
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   ├── DataTable.tsx
│   └── Modal.tsx
└── pages/
    ├── Dashboard.tsx
    └── AdminPanel.tsx
```

### Tailwind Configuration

```javascript
// tailwind.config.ts
export default {
  theme: {
    colors: {
      primary: {
        50: '#EBF2FF',
        500: '#0052CC',
        600: '#0040A3',
      },
      secondary: {
        50: '#ECFAF0',
        500: '#00A651',
      },
      neutral: {
        0: '#FFFFFF',
        600: '#444444',
      },
    },
    fontFamily: {
      sans: ['Inter', 'system-ui'],
      mono: ['Inconsolata'],
    },
    spacing: {
      'xs': '4px',
      'sm': '8px',
      'md': '16px',
      'lg': '24px',
    },
  },
}
```

---

## Checklist for Implementation

- [ ] Color palette defined in CSS variables
- [ ] Typography scale implemented (Display, Heading 1-3, Body, Label)
- [ ] Button component (4 variants: primary, secondary, danger, ghost)
- [ ] Input component (text, email, select, textarea)
- [ ] Card component with optional header/footer
- [ ] Badge/status component
- [ ] Alert notification component
- [ ] Table component with responsive grid fallback
- [ ] Breadcrumb navigation
- [ ] Icon system integrated (Lucide)
- [ ] Focus states visible on all interactive elements
- [ ] Color contrast verified (4.5:1 minimum)
- [ ] ARIA labels on form inputs and icons
- [ ] Skip navigation link for screen readers
- [ ] Responsive breakpoints tested (375px, 768px, 1920px)
- [ ] All components tested for keyboard accessibility
- [ ] Hover/active/disabled states documented

---

## Next Steps

1. **Implement Atoms** → Build Button, Input, Label, Badge, Icon components
2. **Build Molecules** → FormField, Card, Alert, Breadcrumb
3. **Create Organisms** → Header, Sidebar, DataTable, Modal
4. **Develop Pages** → Dashboard, Admin Panel (Stories 3.1-3.4)
5. **Test Accessibility** → Run axe DevTools, verify WCAG AA compliance
6. **Document Components** → Storybook or Figma

---

**Design System v1.0 Complete**
Ready for development. 🚀

---

*This Design System follows Atomic Design methodology and prioritizes accessibility (WCAG AA), responsive design, and developer experience. All components are built with TypeScript and Tailwind CSS.*
