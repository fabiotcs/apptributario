# Agente Tributário — WCAG AA Accessibility Checklist

**Date:** 2026-02-09
**Standard:** WCAG 2.1 Level AA
**Status:** 📋 Implementation Guide
**Tools:** axe DevTools, WAVE, Lighthouse, NVDA, JAWS

---

## Table of Contents

1. [Perceivable](#perceivable)
2. [Operable](#operable)
3. [Understandable](#understandable)
4. [Robust](#robust)
5. [Testing Procedures](#testing-procedures)
6. [Tools & Resources](#tools--resources)

---

## PERCEIVABLE

Users must be able to perceive the information being presented.

### 1.1 Text Alternatives

**Criterion:** All non-text content has a text alternative.

- [ ] **1.1.1 Non-text Content (Level A)**
  - [ ] All images have alt text
    ```html
    <img src="chart.png" alt="Pie chart showing revenue distribution: Serviço 65%, Produto 35%">
    <img src="logo.svg" alt="Agente Tributário logo">
    ```
  - [ ] SVG icons have titles or aria-labels
    ```html
    <svg aria-label="Warning icon">
      <title>Warning</title>
      ...
    </svg>
    ```
  - [ ] Decorative images marked with `alt=""`
    ```html
    <img src="decoration.svg" alt="" aria-hidden="true">
    ```
  - [ ] Form buttons have accessible labels
    ```html
    <button aria-label="Close modal">×</button>
    <button aria-label="Search"><svg>...</svg></button>
    ```
  - [ ] Data charts have text alternative
    ```html
    <!-- Chart with data table fallback -->
    <button>Show data as table</button>
    <table style="display: none;" id="chart-data">
      <!-- Accessible data table -->
    </table>
    ```
  - [ ] Video has captions (for spoken content)
  - [ ] Audio has transcript

- [ ] **1.1.2 Functional Images**
  - [ ] Clickable images have alt text describing action
    ```html
    <img src="download-icon.svg" alt="Download report as PDF">
    ```

---

### 1.2 Time-based Media

**Criterion:** Captions, audio descriptions, transcripts for multimedia.

- [ ] **1.2.1 Captions (Level A)**
  - [ ] Videos include captions for spoken dialogue
  - [ ] Use WebVTT format or built-in caption tools

- [ ] **1.2.3 Audio Description (Level A)**
  - [ ] Important visual information described in audio

- [ ] **1.2.5 Transcripts (Level AA)**
  - [ ] All audio-only content has transcript
  - [ ] Transcript available near media

---

### 1.3 Adaptable

**Criterion:** Content adapts to different presentations without loss of information.

- [ ] **1.3.1 Info and Relationships (Level A)**
  - [ ] Semantic HTML used (not divs for everything)
    ```html
    <!-- Good -->
    <h1>Dashboard</h1>
    <nav><ul><li><a href="#">Home</a></li></ul></nav>
    <main>...</main>
    <footer>...</footer>

    <!-- Bad -->
    <div class="title">Dashboard</div>
    <div class="navigation">...</div>
    ```
  - [ ] Form inputs associated with labels
    ```html
    <label for="cnpj">CNPJ</label>
    <input id="cnpj" type="text">
    ```
  - [ ] Table headers identified
    ```html
    <table>
      <thead><tr><th>Name</th><th>Revenue</th></tr></thead>
      <tbody>...</tbody>
    </table>
    ```
  - [ ] Lists properly marked
    ```html
    <ul>
      <li>Item 1</li>
      <li>Item 2</li>
    </ul>
    ```

- [ ] **1.3.2 Meaningful Sequence (Level A)**
  - [ ] Content order logical in DOM (not just visually)
  - [ ] Tab order follows visual left-to-right, top-to-bottom
  - [ ] No reversed tab order via tabindex
  - [ ] Reading order makes sense for screen readers

- [ ] **1.3.4 Orientation (Level AA)**
  - [ ] Content works in both portrait and landscape
  - [ ] No requirement for specific orientation
  - [ ] Exception: media that requires orientation (e.g., spreadsheet)

---

### 1.4 Distinguishable

**Criterion:** Content is easier to see and hear.

- [ ] **1.4.3 Contrast (Minimum) (Level AA)**
  - [ ] Text contrast: 4.5:1 (normal), 3:1 (large text ≥18pt or ≥14pt bold)
    ```
    Light text on light background: Check ratio
    Body text (16px): 4.5:1 minimum
    Headings (28px bold): 3:1 minimum
    ```
  - [ ] Test with axe DevTools or WebAIM contrast checker
  - [ ] Disabled buttons may have lower contrast (3:1)
  - [ ] Color not sole indicator
    ```html
    <!-- Bad: Red alone means error -->
    <input style="color: red;">

    <!-- Good: Red + icon + text -->
    <input style="border-color: red;">
    <span style="color: red;">❌ CNPJ inválido</span>
    ```

- [ ] **1.4.5 Images of Text (Level AA)**
  - [ ] Avoid images containing text (use actual text + CSS)
  - [ ] Exception: logos, screenshots, diagrams

- [ ] **1.4.7 Low or No Background Audio (Level AAA - optional)**
  - [ ] Audio content clear (no background music)

- [ ] **1.4.10 Reflow (Level AA)**
  - [ ] Content reflows without horizontal scrolling (mobile)
  - [ ] Up to 400% zoom without scrolling (for most content)
  - [ ] Test: Zoom browser to 200%, verify no horizontal scroll

- [ ] **1.4.11 Non-text Contrast (Level AA)**
  - [ ] UI components (buttons, inputs) have 3:1 contrast
  - [ ] Graphical elements (icons) have 3:1 contrast
  - [ ] Example: Primary button blue (primary-500) on white: ✓ 5.2:1

- [ ] **1.4.13 Content on Hover or Focus (Level AA)**
  - [ ] Hovered/focused content doesn't obscure other content
  - [ ] Tooltip visible and dismissible
  - [ ] Persistent until user dismisses or moves focus

---

## OPERABLE

Users must be able to operate interfaces via keyboard, mouse, or assistive tech.

### 2.1 Keyboard Accessible

**Criterion:** All functionality available via keyboard.

- [ ] **2.1.1 Keyboard (Level A)**
  - [ ] All interactive elements keyboard accessible
    ```html
    <!-- All of these must be keyboard-focusable -->
    <button>Click me</button>
    <a href="/">Link</a>
    <input type="text">
    <select><option>Choose</option></select>
    ```
  - [ ] No keyboard trap (user can tab out)
  - [ ] Custom components use role/tabindex correctly
    ```html
    <div role="button" tabindex="0">Custom button</div>
    ```

- [ ] **2.1.2 No Keyboard Trap (Level A)**
  - [ ] User can move focus away from any element
  - [ ] Exception: Modal dialogs (focus trapped intentionally)
    ```javascript
    // Modal focus trap
    const lastFocusableElement = modalDialog.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    lastFocusableElement.addEventListener('keydown', (e) => {
      if (e.key === 'Tab' && !e.shiftKey) {
        e.preventDefault();
        firstFocusableElement.focus();
      }
    });
    ```

- [ ] **2.1.3 Keyboard (No Exception) (Level AAA - optional)**
  - [ ] All content keyboard accessible (no time limit)

---

### 2.2 Enough Time

**Criterion:** Users have enough time to read and use content.

- [ ] **2.2.1 Timing Adjustable (Level A)**
  - [ ] No time limits (or user can extend)
  - [ ] Exception: real-time events (chat, auctions)
  - [ ] Provide option: "Stop", "Extend", "Skip"

- [ ] **2.2.2 Pause, Stop, Hide (Level A)**
  - [ ] Auto-playing content (video, animation) can be paused
  - [ ] Moving content can be paused
  - [ ] Blinking content stops after 5 seconds

---

### 2.3 Seizures and Physical Reactions

**Criterion:** No flashing that could trigger seizures.

- [ ] **2.3.1 Three Flashes or Below Threshold (Level A)**
  - [ ] No content flashes more than 3 times per second
  - [ ] Flashing region < 25% of screen
  - [ ] Avoid: rapid color changes, strobe effects

---

### 2.4 Navigable

**Criterion:** Users can navigate and find content.

- [ ] **2.4.1 Bypass Blocks (Level A)**
  - [ ] Skip link to main content (before header/nav)
    ```html
    <a href="#main-content" class="skip-link">Skip to main content</a>
    <header>...</header>
    <main id="main-content">...</main>
    ```
  - [ ] Navigation can be skipped on repeated pages

- [ ] **2.4.2 Page Titled (Level A)**
  - [ ] Unique, descriptive page title
    ```html
    <title>Dashboard — Agente Tributário</title> <!-- Good -->
    <title>Page 1</title> <!-- Bad -->
    ```

- [ ] **2.4.3 Focus Order (Level A)**
  - [ ] Focus order logical (left-to-right, top-to-bottom)
  - [ ] Test with keyboard navigation (Tab key)
  - [ ] No tabindex > 0 (bad practice)
    ```html
    <!-- Bad -->
    <button tabindex="5">First</button>
    <button tabindex="3">Second</button>

    <!-- Good -->
    <button>First</button>
    <button>Second</button>
    ```

- [ ] **2.4.4 Link Purpose (In Context) (Level A)**
  - [ ] Link text describes its purpose
    ```html
    <!-- Good -->
    <a href="/docs/regime-change">Learn about regime change</a>

    <!-- Bad -->
    <a href="/docs/regime-change">Click here</a>
    ```
  - [ ] Or aria-label provides context
    ```html
    <a href="/api/download-pdf" aria-label="Download regime comparison as PDF">
      📥 PDF
    </a>
    ```

- [ ] **2.4.5 Multiple Ways (Level AA)**
  - [ ] Multiple ways to find pages
    - Navigation menu
    - Search function
    - Site map
    - Related links

- [ ] **2.4.7 Focus Visible (Level AA)**
  - [ ] All interactive elements show focus outline
    ```css
    button:focus {
      outline: 2px solid var(--color-primary-500);
      outline-offset: 2px;
    }

    /* Or use */
    button:focus-visible {
      outline: 2px solid var(--color-primary-500);
      outline-offset: 2px;
    }
    ```
  - [ ] Outline visible on all interactive elements
  - [ ] Outline contrast: 3:1 minimum
  - [ ] Outline width: 2px minimum

---

## UNDERSTANDABLE

Users must understand the content and how to use it.

### 3.1 Readable

**Criterion:** Text is readable and understandable.

- [ ] **3.1.1 Language of Page (Level A)**
  - [ ] Page language identified
    ```html
    <html lang="pt-BR">
    ```

- [ ] **3.1.2 Language of Parts (Level AA)**
  - [ ] Language change identified
    ```html
    <p>This text is in English: <span lang="en">Hello world</span></p>
    ```

- [ ] **3.1.4 Unusual Words (Level AAA - optional)**
  - [ ] Definitions for unusual words
  - [ ] Abbreviations expanded on first use
    ```html
    <abbr title="Lucro Presumido">LP</abbr>
    ```

---

### 3.2 Predictable

**Criterion:** Pages appear and operate predictably.

- [ ] **3.2.1 On Focus (Level A)**
  - [ ] Focus doesn't cause unexpected context change
    ```javascript
    // Good: Focus on dropdown doesn't open it
    <select>
      <option>Choose regime</option>
      <option>Simples</option>
      <option>Presumido</option>
    </select>

    // Bad: Focus triggers automatic dropdown
    ```

- [ ] **3.2.2 On Input (Level A)**
  - [ ] User input doesn't cause unexpected context change
    ```javascript
    // Good: User activates button to submit
    <button onClick={handleSubmit}>Submeter</button>

    // Bad: Form auto-submits on last input focus
    <input onBlur={autoSubmit} />
    ```

- [ ] **3.2.3 Consistent Navigation (Level AA)**
  - [ ] Navigation consistent across pages
  - [ ] Same navigation menu in same place
  - [ ] Menu items in same order

- [ ] **3.2.4 Consistent Identification (Level AA)**
  - [ ] UI components with same function identified consistently
  - [ ] Example: "Cancel" button always in same position

---

### 3.3 Input Assistance

**Criterion:** Users are helped to avoid and correct mistakes.

- [ ] **3.3.1 Error Identification (Level A)**
  - [ ] Errors identified and described in text
    ```html
    <!-- Good -->
    <input aria-describedby="cnpj-error">
    <span id="cnpj-error" role="alert">❌ CNPJ inválido. Formato: 00.000.000/0000-00</span>

    <!-- Bad (just red color) -->
    <input style="border-color: red;">
    ```

- [ ] **3.3.2 Labels or Instructions (Level A)**
  - [ ] All form inputs have labels
    ```html
    <label for="email">Email</label>
    <input id="email" type="email">
    ```
  - [ ] Required fields marked
    ```html
    <label for="cnpj">CNPJ <span aria-label="required">*</span></label>
    <input id="cnpj" required aria-required="true">
    ```

- [ ] **3.3.3 Error Suggestion (Level AA)**
  - [ ] Suggestions provided for errors
    ```html
    <span id="cnpj-error" role="alert">
      ❌ CNPJ inválido. Did you mean: 12.345.678/0001-99?
    </span>
    ```

- [ ] **3.3.4 Error Prevention (Legal, Financial) (Level AA)**
  - [ ] Confirmations for legal/financial actions
    ```html
    <!-- Modal confirmation -->
    <dialog>
      <p>Are you sure you want to switch regime? This is irreversible.</p>
      <button>Cancel</button>
      <button>Yes, switch regime</button>
    </dialog>
    ```

---

## ROBUST

Content must be compatible with assistive technologies.

### 4.1 Compatible

**Criterion:** Content compatible with assistive tech.

- [ ] **4.1.1 Parsing (Level A)**
  - [ ] HTML is valid (no duplicate IDs, proper nesting)
  - [ ] Use W3C HTML Validator
  - [ ] Common errors:
    ```html
    <!-- Bad: Duplicate IDs -->
    <input id="name">
    <input id="name">

    <!-- Bad: Unclosed tags -->
    <div><p>Text</div></p>

    <!-- Bad: Invalid attribute -->
    <img src="photo.jpg" alt="Photo" notanattribute>
    ```

- [ ] **4.1.2 Name, Role, Value (Level A)**
  - [ ] All UI components have accessible name, role, value
    ```html
    <!-- Button: Name = "Save" -->
    <button>Save</button>

    <!-- Input: Name = "Email", Role = textbox, Value = user input -->
    <label for="email">Email</label>
    <input id="email" type="email">

    <!-- Custom component: Explicitly define -->
    <div role="button" aria-label="Close">×</div>
    ```

- [ ] **4.1.3 Status Messages (Level AA)**
  - [ ] Status messages announced to screen readers
    ```html
    <!-- Live region for dynamic updates -->
    <div role="status" aria-live="polite" aria-atomic="true" id="save-status">
      Salvando...
    </div>

    <!-- JavaScript -->
    document.getElementById('save-status').textContent = '✅ Salvo!';
    ```

---

## Testing Procedures

### Automated Testing

**Tools:**
- axe DevTools (Chrome/Firefox extension)
- WAVE (WebAIM web accessibility evaluator)
- Lighthouse (Chrome DevTools)
- Pa11y (CLI tool)

**Steps:**
1. Install axe DevTools
2. Open page in browser
3. Run axe scan
4. Review violations (errors) and warnings
5. Fix before deployment

**Command line:**
```bash
npm install --save-dev pa11y pa11y-ci
npx pa11y https://localhost:3000/dashboard
```

### Manual Testing

**Screen Reader Testing (NVDA - free):**
1. Download NVDA (Windows) or use VoiceOver (Mac)
2. Turn on screen reader
3. Navigate page with Tab, arrow keys
4. Verify:
   - All elements announced
   - Links have descriptive text
   - Form labels associated
   - Headings hierarchical
   - Tables properly marked

**Keyboard Navigation:**
1. Disconnect mouse
2. Use Tab to navigate
3. Verify:
   - All interactive elements reachable
   - Focus visible
   - No keyboard traps
   - Logical focus order

**Zoom Testing:**
1. Zoom to 200% (Ctrl +)
2. Verify no horizontal scrolling
3. Content still readable

**Color Contrast Testing:**
1. Use WebAIM contrast checker
2. Test all text colors
3. Verify 4.5:1 for normal, 3:1 for large text

---

### Audit Checklist (Pre-Deployment)

- [ ] Run axe DevTools, fix all violations
- [ ] Test with screen reader (NVDA/JAWS)
- [ ] Keyboard navigation works
- [ ] Focus outline visible
- [ ] Page zoom to 200% without scroll
- [ ] Color contrast 4.5:1 minimum
- [ ] Form labels properly associated
- [ ] Page title descriptive
- [ ] Images have alt text
- [ ] No keyboard traps
- [ ] Skip link present
- [ ] Errors described in text + icon + color

---

## Tools & Resources

### Free Tools

| Tool | Purpose | URL |
|------|---------|-----|
| axe DevTools | Automated scanning | https://www.deque.com/axe/devtools/ |
| WAVE | Accessibility checker | https://wave.webaim.org/ |
| Lighthouse | Chrome audit | DevTools → Lighthouse |
| WebAIM Contrast Checker | Color contrast | https://webaim.org/resources/contrastchecker/ |
| NVDA | Screen reader (Windows) | https://www.nvaccess.org/ |
| Pa11y | CLI accessibility tool | https://pa11y.org/ |

### Documentation

| Resource | URL |
|----------|-----|
| WCAG 2.1 Spec | https://www.w3.org/WAI/WCAG21/quickref/ |
| WebAIM | https://webaim.org/ |
| MDN Accessibility | https://developer.mozilla.org/en-US/docs/Web/Accessibility |
| A11y Project | https://www.a11yproject.com/ |

### Testing Services

- Level Access (paid)
- Continuum (paid)
- Accessibility Insights (free extension, by Microsoft)

---

## Implementation Tips

### Accessibility-First Development

1. **Semantic HTML First**
   - Use `<button>`, `<a>`, `<form>` instead of divs
   - Use `<h1>`, `<h2>` for headings
   - Use `<ul>`, `<ol>` for lists

2. **ARIA Progressively**
   - Don't use ARIA if semantic HTML works
   - Use ARIA to supplement, not replace
   - Common mistakes:
     ```html
     <!-- Bad: Using ARIA instead of semantic HTML -->
     <div role="button">Click me</div>

     <!-- Good: Use actual button -->
     <button>Click me</button>
     ```

3. **Testing During Development**
   - Run axe scan on every component
   - Test keyboard navigation while building
   - Test with zoom and color contrast

4. **Component Library**
   - Build accessible components
   - Document accessibility features
   - Example:
     ```javascript
     // Button.tsx
     export const Button = ({
       children,
       onClick,
       aria-label,
       disabled,
       ...props
     }) => (
       <button
         onClick={onClick}
         disabled={disabled}
         aria-label={aria-label}
         {...props}
       >
         {children}
       </button>
     );
     ```

---

## Standards Summary

| Level | Criteria | Purpose |
|-------|----------|---------|
| **A** (Foundation) | 25 criteria | Minimum baseline |
| **AA** (Intermediate) | 50 criteria | **TARGET for Agente Tributário** |
| **AAA** (Advanced) | 78 criteria | Enhanced experience |

**Our Target:** WCAG 2.1 Level AA
- Ensures broad accessibility
- Covers most users with disabilities
- Industry standard for public services
- Recommended by Brazilian accessibility guidelines (ABNT NBR 15290)

---

## Non-Compliance Risk

**If not WCAG AA:**
- Legal risk: Brazilian laws require accessibility (Lei Brasileira de Inclusão)
- User base: ~45 million Brazilians with disabilities excluded
- Business: Reputational damage, user support costs
- Financial: Potential fines for government contracts

---

## Next Steps

1. **During Development:**
   - Use axe DevTools on every component
   - Test with keyboard only
   - Verify color contrast (WebAIM checker)

2. **Before Launch:**
   - Full accessibility audit (axe + manual)
   - Screen reader testing (NVDA)
   - User testing with people with disabilities (optional but recommended)

3. **Post-Launch:**
   - Monitor accessibility reports
   - Fix issues as reported
   - Regular audits (quarterly)
   - Train team on accessibility (ongoing)

---

**WCAG AA Checklist Complete**
Ready for development. ♿

---

*This checklist ensures Agente Tributário is accessible to all users, including those with disabilities. Accessibility is not optional—it's a legal requirement and moral imperative.*
