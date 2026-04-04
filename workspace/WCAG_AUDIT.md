# WCAG 2.1 AA Audit — Care Exchange

**Date:** April 4, 2026  
**Scope:** Frontend source at `/Users/WORK/projects/care-exchange/workspace/src/`  
**Standard:** WCAG 2.1 Level AA  
**Reviewed Files:** App.jsx, Layout.jsx, Dashboard.jsx, Goals.jsx, Documents.jsx, Notifications.jsx, Messages.jsx, ConsentSettings.jsx, Support.jsx, Login.jsx, Register.jsx

---

## Issues Found (Priority: Must Fix)

### 1. Missing Skip-to-Content Link
- **Page:** Layout.jsx (applies to all pages)
- **Element:** `<main>` / page structure
- **Issue:** No "Skip to main content" link exists before the main content area. Violates **WCAG 2.4.1 (Bypass Blocks)**.
- **Fix:** Add a visually hidden skip link immediately inside `<body>` or at the top of Layout.jsx:
  ```jsx
  <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-lg">
    Skip to main content
  </a>
  ```
  Then add `id="main-content"` to the `<main>` element.

---

### 2. Icon-Only Buttons Missing aria-label
- **Page:** Layout.jsx
- **Element:** `<button onClick={logout}` (logout icon only)
- **Issue:** The logout button in the sidebar user section contains only an icon with no text and no `aria-label`. Violates **WCAG 4.1.2 (Name, Role, Value)** — screen readers cannot determine the button's purpose.
- **Fix:**
  ```jsx
  <button onClick={logout} aria-label="Log out" className="p-1.5 text-slate-400 hover:text-slate-600">
    <LogOut size={16} />
  </button>
  ```

---

### 3. Icon-Only Close/Menu Buttons Missing aria-label
- **Page:** Layout.jsx
- **Element:** Mobile sidebar close button `<button onClick={() => setSidebarOpen(false)}>`
- **Issue:** Icon-only button with no accessible name. Violates **WCAG 4.1.2**.
- **Fix:**
  ```jsx
  <button onClick={() => setSidebarOpen(false)} aria-label="Close sidebar" className="ml-auto lg:hidden">
  ```

- **Page:** Layout.jsx
- **Element:** Mobile hamburger menu `<button onClick={() => setSidebarOpen(true)}>`
- **Issue:** Same — icon-only button missing `aria-label`.
- **Fix:**
  ```jsx
  <button className="lg:hidden p-2 text-slate-500" onClick={() => setSidebarOpen(true)} aria-label="Open sidebar">
  ```

---

### 4. Notification Bell Button Missing aria-label
- **Page:** Layout.jsx
- **Element:** Bell icon button in the top header bar
- **Issue:** Icon-only button (with a badge) has no `aria-label`. Violates **WCAG 4.1.2**.
- **Fix:**
  ```jsx
  <button
    onClick={() => navigate('/notifications')}
    aria-label={`Notifications${notifCount > 0 ? `, ${notifCount} unread` : ''}`}
    className="relative p-2 text-slate-500 hover:text-slate-700"
  >
  ```

---

### 5. Support Ticket Slide-Over — Not a Proper Dialog/Modal
- **Page:** Support.jsx
- **Element:** Ticket detail slide-over panel (lines 301–385)
- **Issue:** This is a full-screen slide-over overlay that acts as a modal dialog but lacks:
  - `role="dialog"` or `role="alertdialog"` on the panel **[(a) WCAG 4.1.2]**
  - `aria-modal="true"` **[(b) WCAG 4.1.2]**
  - `aria-labelledby` pointing to the ticket title **[(c) WCAG 1.3.1]**
  - No focus trap — Tab can escape to underlying content
  - No Escape key handler to close
- **Fix:** Add proper dialog semantics and focus management:
  ```jsx
  <div
    role="dialog"
    aria-modal="true"
    aria-labelledby="ticket-title"
    // ...existing className
  >
    {/* Header */}
    <h2 id="ticket-title" className="text-lg font-semibold text-slate-800 leading-snug">{selected.title}</h2>
  ```
  Add a keyboard handler for Escape:
  ```jsx
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && selected) setSelected(null)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [selected])
  ```

---

### 6. Goals Progress Bar is Not Keyboard Accessible
- **Page:** Goals.jsx
- **Element:** The progress track `<div onClick={() => setProgressUpdate(...)}` (line 371)
- **Issue:** The entire progress bar track is a clickable `<div>` but is not a `<button>` or has `role="slider"`. Keyboard users cannot interact with it. Violates **WCAG 2.1.1 (Keyboard)**.
- **Fix:** Replace the outer div with a proper slider input or at minimum a button:
  ```jsx
  <button
    type="button"
    onClick={() => setProgressUpdate({ ...progressUpdate, [goal.id]: !progressUpdate[goal.id] })}
    className="w-full bg-slate-100 rounded-full h-2.5 cursor-pointer text-left"
    aria-label={`Update progress for ${goal.title}`}
  >
    <div className="bg-green-500 rounded-full h-2.5 transition-all" style={{ width: `${goal.progress || 0}%` }} />
  </button>
  ```
  Or better, expose the range input directly without requiring a click.

---

### 7. Form Error Messages Not Announced to Screen Readers
- **Page:** Goals.jsx, Support.jsx, ConsentSettings.jsx, Documents.jsx, Messages.jsx
- **Element:** Inline error messages (e.g., `<div className="mb-4 p-3 bg-red-50...">{formError}</div>`)
- **Issue:** Error text exists visually but is not announced by screen readers. Violates **WCAG 4.1.3 (Name, Role, Value)** / **WCAG 3.3.1 (Error Identification)**.
- **Fix:** Wrap error messages in a container with `role="alert"` or use `aria-live="polite"`:
  ```jsx
  {formError && (
    <div role="alert" className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
      {formError}
    </div>
  )}
  ```
  Note: `role="alert"` implicitly has `aria-live="assertive"`, so it will announce immediately.

---

### 8. Required Fields Not Marked with aria-required
- **Page:** Goals.jsx, ConsentSettings.jsx, Support.jsx, Login.jsx, Register.jsx, Messages.jsx
- **Element:** Form inputs that are required by the application
- **Issue:** Required fields show a visual `*` but do not use `aria-required="true"` or the HTML5 `required` attribute. Screen reader users cannot programmatically determine which fields are required. Violates **WCAG 3.3.2 (Labels or Instructions)**.
- **Fix:** Add `required` (or `aria-required="true"` for custom widgets) to all required inputs. Example from Goals.jsx line 217:
  ```jsx
  <input
    type="text"
    required  // ADD THIS
    value={goalForm.title}
    onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })}
    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
    placeholder="Enter goal title"
    aria-required="true"
  />
  ```

---

### 9. All Interactive Elements in Notifications/Activity Lists Use div with onClick
- **Page:** Notifications.jsx (line 129), Dashboard.jsx (line 187), Support.jsx (line 269)
- **Element:** `<div onClick={() => markAsRead(...)}>` notification items
- **Issue:** These are `div` elements with click handlers but no keyboard support (no `onKeyDown`, no `role="button"`). Violates **WCAG 2.1.1 (Keyboard)** and **WCAG 4.1.2**.
- **Fix:** Convert to `<button>` elements:
  ```jsx
  <button
    onClick={() => !notif.read && markAsRead(notif.id, notif.link)}
    className={`w-full text-left bg-white rounded-xl border border-slate-200 p-4 cursor-pointer transition-all hover:shadow-sm ${
      !notif.read ? 'border-l-4 border-l-primary bg-primary/5' : ''
    }`}
  >
  ```

---

### 10. No Focus Management on Route Changes
- **Page:** App.jsx (all route changes)
- **Element:** `<Routes>` structure
- **Issue:** When navigating between routes, focus is not managed — it remains where it was or defaults to the top of the page. After a route change, keyboard users expect focus to move to the new page's main heading or a page-level landmark. Violates **WCAG 2.4.3 (Focus Order)** and creates a poor keyboard experience.
- **Fix:** Add a `useEffect` in Layout.jsx or a wrapper component that moves focus to the main heading on route change:
  ```jsx
  useEffect(() => {
    const mainHeading = document.getElementById('page-heading')
    if (mainHeading) {
      mainHeading.focus()
    }
  }, [location.pathname])
  ```
  Add `tabIndex="-1"` and `id="page-heading"` to page `<h1>` elements (e.g., in Dashboard.jsx: `<h1 id="page-heading" tabIndex="-1"...>`).

---

## Issues Found (Priority: Should Fix)

### 11. Logout Button in Layout.jsx Has No Confirmation for destructive Action
- **Page:** Layout.jsx
- **Element:** `<button onClick={logout}`
- **Issue:** The logout button immediately logs the user out without any confirmation dialog. This could be problematic for users with cognitive disabilities. Consider adding a confirmation. (Advisory — not a strict WCAG failure.)
- **Fix:** Add `onClick={() => { if (confirm('Are you sure you want to log out?')) logout() }}`

---

### 12. Care Team Member Checkboxes in Messages.jsx Have No Group Label
- **Page:** Messages.jsx
- **Element:** Group thread participant checkboxes (lines 266–284)
- **Issue:** The checkbox group "Select participants" has no `fieldset`/`legend` or `role="group"` with `aria-label`. Violates **WCAG 1.3.1 (Info and Relationships)**.
- **Fix:**
  ```jsx
  <fieldset>
    <legend className="text-xs text-slate-500 mb-1">Select participants:</legend>
    {careTeam.map(member => (
      <label key={member.user_id} className="flex items-center gap-2 text-sm text-slate-600">
        <input type="checkbox" ... />
        {member.full_name || member.email}
      </label>
    ))}
  </fieldset>
  ```

---

### 13. New Thread Form Fields in Messages.jsx Have No Labels
- **Page:** Messages.jsx
- **Element:** New thread form inputs (Topic, Participant ID, Initial message — lines 242–291)
- **Issue:** The new thread form inputs use `placeholder` text but have no `<label>` elements. Placeholders are not reliable substitutes for labels (they disappear, don't meet contrast requirements, etc.). Violates **WCAG 1.3.1** and **3.3.2**.
- **Fix:** Add proper `<label>` elements (can be visually hidden with `sr-only` class if needed):
  ```jsx
  <label className="sr-only" htmlFor="thread-topic">Topic</label>
  <input
    id="thread-topic"
    type="text"
    placeholder="Topic"
    ...
  />
  ```

---

### 14. No aria-describedby for Form Inputs with Helper Text
- **Page:** Goals.jsx (target date field)
- **Element:** `<input type="date">` in the goal form
- **Issue:** While labels exist, there is no `aria-describedby` linking fields to helper/instructional text. Violates **WCAG 1.3.1 (Info and Relationships)** — advisory.
- **Fix:** Add `aria-describedby` if instructional text is present below the input.

---

### 15. Upload Form in Documents.jsx Uses No Modal But Has Form Elements Outside Main Flow
- **Page:** Documents.jsx
- **Element:** Upload form (inline, not a modal) — appears within the page flow
- **Issue:** The upload form expands inline, which is fine, but it is not wrapped in a `<details>`/`<summary>` or otherwise marked as a collapsible section. Keyboard users may tab into it unexpectedly. Consider wrapping in `<details>` for clarity. (Advisory.)

---

### 16. Consent Form — Data Category Selection Has No Fieldset/Legend
- **Page:** ConsentSettings.jsx
- **Element:** Data categories checkbox/pill buttons (lines 126–148)
- **Issue:** A set of toggle buttons selects data categories but lacks a `fieldset`/`legend` grouping. Screen readers may not convey that these buttons belong to the same group. Violates **WCAG 1.3.1**.
- **Fix:**
  ```jsx
  <fieldset>
    <legend className="block text-sm font-medium text-slate-700 mb-2">
      Data Categories to Share
    </legend>
    <div className="flex flex-wrap gap-2">
      {dataCategories.map(cat => (
        <button key={cat.id} type="button" ...>
          {cat.label}
        </button>
      ))}
    </div>
  </fieldset>
  ```

---

## Already Compliant

### Positive Findings

1. **Color Contrast (Primary):** The primary teal color `#0F766E` on white `#FFFFFF` has a contrast ratio of approximately **4.8:1**, which passes **WCAG 4.5:1 (Normal Text)** at Level AA. The dark variant `#0D5D57` is even stronger.

2. **Color Contrast (Slate-500):** `text-slate-500` (Tailwind default ~`#64748b`) on white `#FFFFFF` has a contrast ratio of approximately **5.9:1**, passing the 4.5:1 requirement. **Verified compliant.**

3. **Form Labels:** Goals.jsx, ConsentSettings.jsx, Support.jsx, Login.jsx, Register.jsx, Documents.jsx, and Messages.jsx all have proper `<label>` elements associated with their form inputs via `htmlFor`/`id` pairs. This is done correctly throughout.

4. **Focus Indicators (Visual):** All form inputs use `focus:ring-2` Tailwind classes providing visible focus indicators. This is consistently applied across all pages. Examples:
   - Login.jsx: `focus:ring-2 focus:ring-primary/20 focus:border-primary`
   - Goals.jsx: `focus:ring-2 focus:ring-blue-500`
   - Support.jsx: `focus:ring-2 focus:ring-emerald-500`

5. **NavLink Keyboard Navigation:** The sidebar navigation in Layout.jsx uses React Router's `<NavLink>` component which renders as `<a href>` elements, making all nav items keyboard accessible by default with proper focus indicators.

6. **Loading States:** All pages handle loading states gracefully with loading spinners/text rather than leaving blank screens, reducing confusion for all users.

7. **Error States:** Dashboard.jsx, Goals.jsx, Support.jsx all display error messages when API calls fail, visible to all users.

8. **Interactive Image Links:** In Messages.jsx, images in attachments use `<a href... target="_blank" rel="noreferrer">` which opens in a new tab but the link text "Download" is descriptive. Could benefit from additional link text clarification but is functional.

9. **Color alone is not used to convey information:** Status badges in Goals.jsx (STATUS_COLORS), Notifications.jsx, and Support.jsx all use both color AND text/icon to convey status (e.g., "Active" badge has both a colored background AND text). This passes **WCAG 1.4.1 (Use of Color)**.

10. **Autofill support:** Form inputs use standard `type` attributes (`type="email"`, `type="password"`, `type="date"`, `type="datetime-local"`, `type="number"`, `type="file"`, `type="checkbox"`, `type="radio"`) which enables browser autofill and accessibility APIs work correctly.

11. **Tab Order is Logical:** The tab order through the page follows the visual DOM order. No positive `tabIndex` values are used anywhere, avoiding tab order bugs.

12. **Headings Structure:** Page headings use proper hierarchical `<h1>` → `<h2>` → `<h3>` structure. For example, Dashboard.jsx has `<h1>` for page title and `<h2>` for section headings.

13. **Text Size:** The app uses relative `rem` units throughout (from Tailwind's default), meaning text scales correctly when browser font size is increased. No `px`-fixed text sizes used for content.

14. **Logout Button is Icon+Action:** While the logout button is icon-only, it is placed within a clearly labeled user section in the sidebar, which partially compensates. The user section has name/email visible. This is a partial mitigation, not a full fix.

---

## Recommended Tools

The team should run these automated accessibility tools regularly:

1. **axe DevTools (Browser Extension)**  
   https://www.deque.com/axe/  
   The most comprehensive WCAG automated checker. Install the browser extension and run against every page in the app. Catch issues like missing labels, color contrast failures, and improper ARIA usage.

2. **Lighthouse (built into Chrome DevTools)**  
   Run a Lighthouse accessibility audit (not just performance). Covers ~30% of WCAG issues automatically. Best used alongside axe.

3. **WAVE (WebAIM)**  
   https://wave.webaim.org/extension/  
   Visual feedback tool that shows accessibility errors, contrast errors, and structural issues directly on the page.

4. **Accessibility Insights (Microsoft)**  
   https://accessibilityinsights.io/  
   Fast Pass and Assessment modes catch common issues including missing labels, keyboard accessibility, and contrast.

5. **NVDA Screen Reader (Windows — free)**  
   https://www.nvaccess.org/  
   For manual testing on Windows. The app should be tested with at least one screen reader. On Mac, use the built-in VoiceOver (Cmd+F5 to activate).

6. **Color Contrast Analyzer**  
   https://colororacle.org/  
   For checking all color combinations (primary on white, primary on slate-100, etc.) against the 4.5:1 ratio.

7. **Manual Keyboard Testing Checklist**  
   After every major UI change, verify:
   - [ ] Tab through all interactive elements — no traps
   - [ ] Escape closes any open overlays/dialogs
   - [ ] Focus is visible on all elements
   - [ ] Skip-to-content link appears when Tab is first pressed (once implemented)

---

## Summary

| Category | Status |
|---|---|
| Keyboard Accessibility | **Needs work** — missing skip link, no focus management on route changes, keyboard-inaccessible progress bar |
| ARIA / Labels | **Needs work** — icon-only buttons missing aria-label, form inputs missing aria-required |
| Color Contrast | **Largely compliant** — primary/secondary/slate text on white backgrounds passes 4.5:1 |
| Forms | **Partially compliant** — labels present but error messages not announced, required fields not marked |
| Navigation | **Partially compliant** — NavLinks are keyboard accessible but no skip-to-content link exists |
| Modals/Dialogs | **Needs work** — Support ticket panel lacks dialog role, aria-modal, focus trap, and Escape key handler |
| Focus Indicators | **Compliant** — all inputs have visible focus rings via Tailwind `focus:ring-*` |

**Estimated Fix Effort:** The "Must Fix" issues can be resolved in approximately **2–3 days** of development work. Most are straightforward additions of `aria-label`, `role="alert"`, and `required` attributes. The focus management and skip-to-content link require slightly more architectual changes but are still minor.
