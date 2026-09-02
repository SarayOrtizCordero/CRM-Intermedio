# Retoque de marca — CRM básico / intermedio / completo — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Retouch the three CRM demos (`CRM/basico`, `CRM/intermedio`, `CRM/completo`) so they use Panel-Web's warm orange/terracotta brand identity (colors, dark mode, brand icon) and industry-neutral seed data, instead of their current ad-hoc blue palette and textile/retail-flavored example data.

**Architecture:** Each of the three demos is a standalone `git init`-ed folder with no build step (plain HTML/CSS/JS, `localStorage` as the "database"). Each gets its own copy of this plan and its own commits. There is no test runner in this codebase — "tests" here are `grep` assertions against the source files (deterministic, fast) plus a manual visual check in the browser (color, dark-mode toggle, brand icon). Every task ends with both.

**Tech Stack:** Plain HTML/CSS/JS, no build step, no package manager, no test framework.

## Global Constraints

- Do not change any file under `Panel-Web/` — it is the source we copy *from*, never the target.
- Do not change functionality, page structure, or form fields — only colors, the theme toggle, the brand icon/favicon, and seed-data text.
- Every color value used in this plan is copied verbatim from `Panel-Web/panel-intermedio/css/styles.css` (light block: `--primary:#b64211`, `--primary-strong:#df3314`, `--primary-soft:rgba(251,123,21,0.08)`, `--on-primary:#ffffff`, `--danger:#b11e1b`, `--danger-soft:rgba(177,30,27,0.1)`, `--ok:#3f6b28`, `--ok-soft:rgba(95,141,62,0.12)`, `--accent:#df3314`, `--accent-soft:rgba(223,51,20,0.12)`, `--bg:#f8f4e9`, `--surface:#ffffff`, `--surface-soft:#faf1e7`, `--border:#ecdfd0`, `--text:#2a1c10`, `--text-muted:#8a7565`; dark block: `--primary:#fb7b15`, `--primary-strong:#ff9a4d`, `--primary-soft:rgba(251,123,21,0.18)`, `--on-primary:#241608`, `--danger:#ff7168`, `--danger-soft:rgba(226,69,63,0.16)`, `--ok:#7cab5a`, `--ok-soft:rgba(124,171,90,0.16)`, `--accent:#ff9a4d`, `--accent-soft:rgba(255,154,77,0.18)`, `--bg:#1b140f`, `--surface:#241b14`, `--surface-soft:#2c2118`, `--border:#3a2c20`, `--text:#f8f4e9`, `--text-muted:#b5a08c`) — we use panel-intermedio's set (not panel-basico's) because it is the superset that also defines `--accent`/`--accent-soft`, which CRM needs.
- Panel-Web has no CSS token for "warning" or for pre-computed focus-ring/hover-shadow tints. We define four new local tokens per repo (not present in Panel-Web, chosen to stay in the same warm family): `--warning:#92400e` / `--warning-soft:rgba(146,64,14,0.12)` / `--primary-ring:rgba(182,66,17,0.18)` / `--primary-shadow:rgba(182,66,17,0.28)` (light), `--warning:#fbbf24` / `--warning-soft:rgba(251,191,36,0.18)` / `--primary-ring:rgba(251,123,21,0.28)` / `--primary-shadow:rgba(251,123,21,0.35)` (dark).
- Dark mode defaults to **light** on first load in all three tiers (verified against Panel-Web's actual `index.html` inline script — its READMEs describe a system-preference default that the real code does not implement; we replicate the real code).
- No dependency installs, no build step, no test framework — verification is `grep`-based assertions plus opening `index.html` in the browser.
- Commit after every task, in the affected repo, with `git commit` (never `--amend`, never `--no-verify`).

---

## File Structure

Per tier (`basico`, `intermedio`, `completo`), the same four files change:

- `css/style.css` — root color tokens, dark-mode block, theme-toggle styles, brand-mark styles, and every hardcoded blue literal.
- `index.html` — inline theme-init script in `<head>`, theme-toggle button in the topbar/sidenav, brand-mark markup (SVG flame instead of "C"), `<script src="js/theme.js">`.
- `js/theme.js` — **new file**, theme persistence + toggle wiring (identical logic across tiers, different `localStorage` key).
- `js/store.js` — stage/tag color arrays (recolored) and, in the second task per tier, the seed data text (company/contact/deal names).
- `favicon.svg` — flame mark instead of the "C" badge.
- `intermedio`/`completo` only: `PAGE_ACCENTS` and the `--page-accent` custom property are removed from `js/app.js` and `css/style.css` (see Task 5).

---

## Task 1: CRM básico — color system, dark mode, brand icon

**Files:**
- Modify: `CRM/basico/css/style.css`
- Modify: `CRM/basico/index.html`
- Create: `CRM/basico/js/theme.js`
- Modify: `CRM/basico/js/store.js:3-9` (the `STATUSES` array)
- Modify: `CRM/basico/favicon.svg`

**Interfaces:**
- Produces: `.theme-toggle` button wired by `initTheme()`/`applyTheme()` in `js/theme.js`, reusable verbatim (only the storage key changes) by Tasks 3 and 5.
- Produces: the CSS token set (`--primary`, `--primary-strong`, `--primary-soft`, `--on-primary`, `--danger`, `--danger-soft`, `--ok`, `--ok-soft`, `--accent`, `--accent-soft`, `--bg`, `--surface`, `--surface-soft`, `--border`, `--text`, `--text-muted`, `--warning`, `--warning-soft`, `--primary-ring`, `--primary-shadow`, `--radius-lg`, `--radius-md`, `--shadow`, `--shadow-hover`) that Tasks 3 and 5 replicate in their own `style.css`.

- [ ] **Step 1: Replace the `:root` block with Panel-Web's light+dark tokens**

In `CRM/basico/css/style.css`, replace:

```css
:root {
  --primary: #1d4ed8;
  --primary-dark: #1e3a8a;
  --accent: #3b82f6;
  --accent-light: #93c5fd;
  --danger: #dc2626;
  --success: #16a34a;
  --warning: #d97706;
  --neutral: #64748b;
  --bg: #f4f6fb;
  --card-bg: #ffffff;
  --border: #e2e8f0;
  --text: #1e293b;
  --text-muted: #64748b;
  --radius: 12px;
  --font-heading: 'Montserrat', system-ui, sans-serif;
  --font-body: 'Inter', system-ui, sans-serif;
  --ease: cubic-bezier(0.4, 0, 0.2, 1);
}
```

with:

```css
:root {
  --primary: #b64211;
  --primary-strong: #df3314;
  --primary-soft: rgba(251, 123, 21, 0.08);
  --on-primary: #ffffff;
  --danger: #b11e1b;
  --danger-soft: rgba(177, 30, 27, 0.1);
  --ok: #3f6b28;
  --ok-soft: rgba(95, 141, 62, 0.12);
  --accent: #df3314;
  --accent-soft: rgba(223, 51, 20, 0.12);
  --warning: #92400e;
  --warning-soft: rgba(146, 64, 14, 0.12);
  --primary-ring: rgba(182, 66, 17, 0.18);
  --primary-shadow: rgba(182, 66, 17, 0.28);

  --bg: #f8f4e9;
  --surface: #ffffff;
  --surface-soft: #faf1e7;
  --border: #ecdfd0;
  --text: #2a1c10;
  --text-muted: #8a7565;

  --radius-lg: 18px;
  --radius-md: 12px;
  --shadow: 0 8px 24px rgba(178, 94, 42, 0.08);
  --shadow-hover: 0 12px 28px rgba(178, 94, 42, 0.14);

  --font-heading: 'Montserrat', system-ui, sans-serif;
  --font-body: 'Inter', system-ui, sans-serif;
  --ease: cubic-bezier(0.4, 0, 0.2, 1);
}

:root[data-theme="dark"] {
  --primary: #fb7b15;
  --primary-strong: #ff9a4d;
  --primary-soft: rgba(251, 123, 21, 0.18);
  --on-primary: #241608;
  --danger: #ff7168;
  --danger-soft: rgba(226, 69, 63, 0.16);
  --ok: #7cab5a;
  --ok-soft: rgba(124, 171, 90, 0.16);
  --accent: #ff9a4d;
  --accent-soft: rgba(255, 154, 77, 0.18);
  --warning: #fbbf24;
  --warning-soft: rgba(251, 191, 36, 0.18);
  --primary-ring: rgba(251, 123, 21, 0.28);
  --primary-shadow: rgba(251, 123, 21, 0.35);

  --bg: #1b140f;
  --surface: #241b14;
  --surface-soft: #2c2118;
  --border: #3a2c20;
  --text: #f8f4e9;
  --text-muted: #b5a08c;

  --shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
  --shadow-hover: 0 12px 28px rgba(0, 0, 0, 0.45);
}
```

This single change removes `--neutral` (declared but never used anywhere in `style.css` — verified with `grep -n "var(--neutral)" CRM/basico/css/style.css`, which returns nothing) and renames `--card-bg`→`--surface`, `--primary-dark`→`--primary-strong`, `--success`→`--ok`, `--accent-light`→(dropped, see Step 3), `--radius`→`--radius-md`/`--radius-lg` (see Step 3).

- [ ] **Step 2: Verify the old blue primary is gone from the root block**

Run: `grep -n "#1d4ed8" CRM/basico/css/style.css`
Expected: only matches inside `.stat-card.total`-style rules are gone; if the command prints nothing, the root block edit succeeded. (Full removal of `#1d4ed8` everywhere in the file is confirmed at the end of this task, once Steps 3–4 also remove it from `PAGE_ACCENTS`-style literals — básico has none, so this file should already be clean here.)

- [ ] **Step 3: Rename the remaining variable usages across the file**

Using the Edit tool with `replace_all: true` on `CRM/basico/css/style.css`, apply each of these exact replacements (do them one at a time so a failed match is easy to spot):

| old_string | new_string |
|---|---|
| `var(--card-bg)` | `var(--surface)` |
| `var(--primary-dark)` | `var(--primary-strong)` |
| `var(--success)` | `var(--ok)` |
| `var(--accent-light)` | `var(--primary-soft)` |
| `var(--radius)` | `var(--radius-md)` |
| `border-radius: 16px;` | `border-radius: var(--radius-lg);` |

- [ ] **Step 4: Replace hardcoded blue literals with the new tokens**

Using the Edit tool with `replace_all: true` on `CRM/basico/css/style.css`:

| old_string | new_string |
|---|---|
| `background: #e0e9fa;` | `background: var(--primary-soft);` |
| `background: #eef2fb;` | `background: var(--surface-soft);` |
| `background: #dfe7f9;` | `background: var(--primary-soft);` |
| `box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.18);` | `box-shadow: 0 0 0 3px var(--primary-ring);` |
| `box-shadow: 0 6px 16px rgba(29, 78, 216, 0.28);` | `box-shadow: 0 6px 16px var(--primary-shadow);` |
| `box-shadow: 0 1px 2px rgba(29, 78, 216, 0.04);` | `box-shadow: var(--shadow);` |
| `box-shadow: 0 8px 18px rgba(29, 78, 216, 0.1);` | `box-shadow: 0 8px 18px var(--primary-shadow);` |

- [ ] **Step 5: Verify no old-palette literal remains**

Run: `grep -nE "#1d4ed8|#1e3a8a|#3b82f6|#93c5fd|#16a34a|#d97706|#64748b|#e0e9fa|#eef2fb|#dfe7f9|rgba\(29, 78, 216|rgba\(59, 130, 246" CRM/basico/css/style.css`
Expected: no output (the `#64748b` that used to be `--neutral`'s value is gone because the whole declaration was removed in Step 1 — `#64748b` may legitimately still appear inside `js/store.js`'s `STATUSES` array until Step 8 below, but that is a different file, not matched by this command).

- [ ] **Step 6: Replace the brand-mark CSS (square badge → flame icon)**

In `CRM/basico/css/style.css`, replace:

```css
.brand-mark {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  background: var(--primary);
  color: white;
  font-family: var(--font-heading);
  font-weight: 800;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
```

with:

```css
.brand-mark {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.brand-mark svg {
  width: 26px;
  height: 26px;
}
```

- [ ] **Step 7: Add theme-toggle CSS**

Append to `CRM/basico/css/style.css`, right after the `.brand-mark svg` rule added in Step 6:

```css
.topbar-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.theme-toggle {
  width: 38px;
  height: 38px;
  border-radius: 999px;
  background: var(--surface);
  border: 1px solid var(--border);
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: transform 0.15s var(--ease), border-color 0.15s var(--ease), background-color 0.15s var(--ease);
}

.theme-toggle svg { width: 18px; height: 18px; }

.theme-toggle:hover { border-color: var(--primary); transform: translateY(-1px); }
.theme-toggle:active { transform: translateY(0) scale(0.92); }

.theme-toggle .icon-moon { display: none; }
:root[data-theme="dark"] .theme-toggle .icon-sun { display: none; }
:root[data-theme="dark"] .theme-toggle .icon-moon { display: block; }
```

- [ ] **Step 8: Recolor the pipeline stages**

In `CRM/basico/js/store.js`, replace:

```js
const STATUSES = [
  { key: 'nuevo', label: 'Nuevo', color: '#64748b' },
  { key: 'contactado', label: 'Contactado', color: '#2563eb' },
  { key: 'propuesta', label: 'Propuesta', color: '#d97706' },
  { key: 'ganado', label: 'Ganado', color: '#16a34a' },
  { key: 'perdido', label: 'Perdido', color: '#dc2626' },
];
```

with:

```js
const STATUSES = [
  { key: 'nuevo', label: 'Nuevo', color: '#8a7565' },
  { key: 'contactado', label: 'Contactado', color: '#b64211' },
  { key: 'propuesta', label: 'Propuesta', color: '#df3314' },
  { key: 'ganado', label: 'Ganado', color: '#3f6b28' },
  { key: 'perdido', label: 'Perdido', color: '#b11e1b' },
];
```

(Same 5 hex values as the light-mode `--text-muted`/`--primary`/`--accent`/`--ok`/`--danger` tokens — these render as inline `style="background:…"` colors from JS and are not theme-aware, same limitation the current code already has.)

- [ ] **Step 9: Create `js/theme.js`**

Create `CRM/basico/js/theme.js`:

```js
const THEME_STORAGE_KEY = "crmbasico-theme";

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (e) {
    // localStorage no disponible (modo privado, etc.) — el tema no se recuerda, pero no rompe nada.
  }

  const label = theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro";
  document.querySelectorAll(".theme-toggle").forEach((toggle) => {
    toggle.setAttribute("aria-label", label);
  });
}

function initTheme() {
  const toggles = document.querySelectorAll(".theme-toggle");
  if (toggles.length === 0) return;

  const current = document.documentElement.getAttribute("data-theme") || "light";
  const label = current === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro";

  toggles.forEach((toggle) => {
    toggle.setAttribute("aria-label", label);
    toggle.addEventListener("click", () => {
      const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(next);
    });
  });
}

initTheme();
```

- [ ] **Step 10: Wire up the theme-init script, toggle button, brand-mark SVG, and script tag in `index.html`**

In `CRM/basico/index.html`, replace the `<head>` block:

```html
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CRM Básico · Demo</title>
  <link rel="icon" type="image/svg+xml" href="favicon.svg">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Montserrat:wght@600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/style.css">
</head>
```

with:

```html
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CRM Básico · Demo</title>
  <link rel="icon" type="image/svg+xml" href="favicon.svg">
  <script>
    // Aplica el tema guardado antes de pintar, para evitar un parpadeo del
    // tema equivocado al cargar la página. Por defecto siempre es claro.
    (function () {
      try {
        var stored = localStorage.getItem("crmbasico-theme");
        document.documentElement.setAttribute("data-theme", stored === "dark" ? "dark" : "light");
      } catch (e) {
        document.documentElement.setAttribute("data-theme", "light");
      }
    })();
  </script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Montserrat:wght@600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/style.css">
</head>
```

Then replace the topbar:

```html
  <header class="topbar">
    <div class="topbar-inner">
      <div class="topbar-brand">
        <span class="brand-mark">C</span>
        <div>
          <h1>CRM Básico</h1>
          <p class="subtitle-tag">Contactos y pipeline simple</p>
        </div>
      </div>
    </div>
  </header>
```

with:

```html
  <header class="topbar">
    <div class="topbar-inner">
      <div class="topbar-brand">
        <span class="brand-mark">
          <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="fueguitoGradBasico" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stop-color="#fb7b15"/>
                <stop offset="1" stop-color="#df3314"/>
              </linearGradient>
            </defs>
            <path fill="url(#fueguitoGradBasico)" d="M15 2.3C18.3 6.3 22.2 10.8 22.8 16.2C23.7 11.7 22.2 8.3 20.7 6.3C23.7 8.7 25.8 13.2 25.5 18.3C25.5 25.2 20.9 30.3 15 30.3C9.2 30.3 4.5 25.2 4.5 18.3C4.5 13.8 6.9 10.2 10.2 7.5C9 10.2 9.3 13.2 11.1 15C10.5 10.8 12.3 6.3 15 2.3Z"/>
          </svg>
        </span>
        <div>
          <h1>CRM Básico</h1>
          <p class="subtitle-tag">Contactos y pipeline simple</p>
        </div>
      </div>
      <div class="topbar-actions">
        <button class="theme-toggle" id="themeToggle" title="Cambiar tema" aria-label="Cambiar tema">
          <svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"></circle><line x1="12" y1="2" x2="12" y2="4"></line><line x1="12" y1="20" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="6.34" y2="6.34"></line><line x1="17.66" y1="17.66" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="4" y2="12"></line><line x1="20" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="6.34" y2="17.66"></line><line x1="17.66" y1="6.34" x2="19.07" y2="4.93"></line></svg>
          <svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
        </button>
      </div>
    </div>
  </header>
```

Then, right before `</body>`, replace:

```html
  <script src="js/store.js"></script>
  <script src="js/app.js"></script>
</body>
```

with:

```html
  <script src="js/store.js"></script>
  <script src="js/app.js"></script>
  <script src="js/theme.js"></script>
</body>
```

- [ ] **Step 11: Replace favicon.svg content**

Replace the entire content of `CRM/basico/favicon.svg`:

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <defs>
    <linearGradient id="fueguitoGradFavicon" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fb7b15"/>
      <stop offset="1" stop-color="#df3314"/>
    </linearGradient>
  </defs>
  <path fill="url(#fueguitoGradFavicon)" d="M15 2.3C18.3 6.3 22.2 10.8 22.8 16.2C23.7 11.7 22.2 8.3 20.7 6.3C23.7 8.7 25.8 13.2 25.5 18.3C25.5 25.2 20.9 30.3 15 30.3C9.2 30.3 4.5 25.2 4.5 18.3C4.5 13.8 6.9 10.2 10.2 7.5C9 10.2 9.3 13.2 11.1 15C10.5 10.8 12.3 6.3 15 2.3Z"/>
</svg>
```

- [ ] **Step 12: Final grep verification**

Run: `grep -c "brand-mark\">C<" CRM/basico/index.html` → expected `0`
Run: `grep -c "theme-toggle" CRM/basico/index.html` → expected ≥ `2` (button class + toggle logic reference)
Run: `grep -cE "#1d4ed8|#2563eb|#16a34a" CRM/basico/js/store.js` → expected `0`
Run: `grep -c "crmbasico-theme" CRM/basico/js/theme.js` → expected ≥ `1`

- [ ] **Step 13: Manual browser check**

Open `CRM/basico/index.html` directly in a browser (double-click or `file://` path — no server needed, this demo has no cross-tab sync requirement). Confirm:
- Topbar shows the orange gradient flame, not a "C" badge.
- Background/cards use the warm cream palette, not blue.
- Clicking the sun/moon button switches to dark mode (dark brown background, orange text/accents) and back; reloading the page keeps the last choice.
- Kanban columns and status badges show the 5 new warm-toned colors (muted taupe/rust/red-orange/green/dark red) instead of gray/blue/amber/green/red.

- [ ] **Step 14: Commit**

```bash
cd CRM/basico
git add css/style.css index.html js/theme.js js/store.js favicon.svg
git commit -m "feat: retoque de marca — paleta naranja/terracota, modo oscuro e icono de llama"
```

---

## Task 2: CRM básico — neutral seed data

**Files:**
- Modify: `CRM/basico/js/store.js:19-31` (the `seedContacts` function)

**Interfaces:**
- Consumes: nothing from Task 1 (independent edit to a different part of the same file).
- Produces: the neutral company-name roster (`Grupo Alameda`, `Suministros Prats`, `Consultora Levante S.L.`, `Distribuciones Norte`, `Grupo Herrero`, `Salas & Asociados`, `Campos & Asociados`, `Montes Logística`) that Tasks 4 and 6 reuse for consistency across tiers.

- [ ] **Step 1: Replace the seed contacts**

In `CRM/basico/js/store.js`, replace the `seedContacts` function body (the `return [...]` array) — keep every `status`, `notes`, and relative `createdAt` offset exactly as-is, only change `name`, `company`, `email`, `phone` where the company name changes:

```js
function seedContacts() {
  const now = Date.now();
  return [
    { id: uid(), name: 'Marta Gil', company: 'Grupo Alameda', email: 'marta.gil@grupoalameda.es', phone: '+34 611 223 344', status: 'nuevo', notes: 'Llegó desde el formulario web.', createdAt: now - 86400000 * 1 },
    { id: uid(), name: 'Javier Prats', company: 'Suministros Prats', email: 'javier@suministrosprats.com', phone: '+34 622 334 455', status: 'nuevo', notes: '', createdAt: now - 86400000 * 2 },
    { id: uid(), name: 'Ana Belén Ruiz', company: 'Consultora Levante S.L.', email: 'ab.ruiz@consultoralevante.es', phone: '+34 633 445 566', status: 'contactado', notes: 'Llamada agendada para el jueves.', createdAt: now - 86400000 * 4 },
    { id: uid(), name: 'Carlos Fuentes', company: 'Distribuciones Norte', email: 'carlos.fuentes@distnorte.com', phone: '+34 644 556 677', status: 'contactado', notes: '', createdAt: now - 86400000 * 5 },
    { id: uid(), name: 'Lucía Herrero', company: 'Grupo Herrero', email: 'lucia@grupoherrero.es', phone: '+34 655 667 788', status: 'propuesta', notes: 'Propuesta enviada, pendiente de respuesta.', createdAt: now - 86400000 * 7 },
    { id: uid(), name: 'Pedro Salas', company: 'Salas & Asociados', email: 'pedro.salas@salasyasociados.com', phone: '+34 666 778 899', status: 'propuesta', notes: '', createdAt: now - 86400000 * 8 },
    { id: uid(), name: 'Elena Campos', company: 'Campos & Asociados', email: 'elena.campos@camposasociados.es', phone: '+34 677 889 900', status: 'ganado', notes: 'Contrato firmado.', createdAt: now - 86400000 * 12 },
    { id: uid(), name: 'David Montes', company: 'Montes Logística', email: 'david@monteslogistica.com', phone: '+34 688 990 011', status: 'perdido', notes: 'Optó por otro proveedor.', createdAt: now - 86400000 * 15 },
  ];
}
```

- [ ] **Step 2: Verify no industry-specific term remains**

Run: `grep -niE "textil|ferreter|moda levante|hosteler|panader" CRM/basico/js/store.js`
Expected: no output.

- [ ] **Step 3: Manual browser check**

Open `CRM/basico/index.html`. In DevTools console run `localStorage.removeItem('crm_basico_contacts')` and reload (the demo re-seeds from `seedContacts()` only when the stored key is empty/invalid). Confirm the kanban/table shows the 8 new company names.

- [ ] **Step 4: Commit**

```bash
cd CRM/basico
git add js/store.js
git commit -m "content: datos de ejemplo neutros, sin sabor textil/retail"
```

---

## Task 3: CRM intermedio — color system, dark mode, brand icon

Same recipe as Task 1, applied to `CRM/intermedio`. The `:root` blocks, hover-literal replacements, `.brand-mark`, `.theme-toggle` CSS, and `js/theme.js` content are byte-for-byte identical to Task 1 except where noted below.

**Files:**
- Modify: `CRM/intermedio/css/style.css`
- Modify: `CRM/intermedio/index.html`
- Create: `CRM/intermedio/js/theme.js`
- Modify: `CRM/intermedio/js/store.js:3-15` (the `STAGES` and `TAGS` arrays)
- Modify: `CRM/intermedio/favicon.svg`

**Interfaces:**
- Consumes: nothing from Task 1 (separate repo).
- Produces: same token set as Task 1, reused verbatim by Task 5.

- [ ] **Step 1: Replace the `:root` block**

Same old_string/new_string pair as Task 1 Step 1, applied to `CRM/intermedio/css/style.css` (its current `:root` block is character-for-character identical to básico's before the edit).

- [ ] **Step 2: Rename variable usages (`replace_all`)**

Same table as Task 1 Step 3, applied to `CRM/intermedio/css/style.css`.

- [ ] **Step 3: Replace hardcoded blue literals (`replace_all`)**

Same table as Task 1 Step 4, applied to `CRM/intermedio/css/style.css`. Intermedio has more selectors than básico (kanban cards, task sidebar, activity timeline) but every occurrence of these exact literal strings gets caught by `replace_all` regardless of how many times each appears.

- [ ] **Step 4: Verify no old-palette literal remains**

Run: `grep -nE "#1d4ed8|#1e3a8a|#3b82f6|#93c5fd|#16a34a|#d97706|#64748b|#e0e9fa|#eef2fb|#dfe7f9|rgba\(29, 78, 216|rgba\(59, 130, 246" CRM/intermedio/css/style.css`
Expected: no output.

- [ ] **Step 5: Replace `.brand-mark` CSS**

Same old_string/new_string as Task 1 Step 6, applied to `CRM/intermedio/css/style.css`.

- [ ] **Step 6: Add theme-toggle CSS**

Same block as Task 1 Step 7, appended to `CRM/intermedio/css/style.css` after `.brand-mark svg`.

- [ ] **Step 7: Recolor stages and tags**

In `CRM/intermedio/js/store.js`, replace:

```js
const STAGES = [
  { key: 'nuevo', label: 'Nuevo', color: '#64748b' },
  { key: 'contactado', label: 'Contactado', color: '#2563eb' },
  { key: 'propuesta', label: 'Propuesta', color: '#d97706' },
  { key: 'ganado', label: 'Ganado', color: '#16a34a' },
  { key: 'perdido', label: 'Perdido', color: '#dc2626' },
];

const TAGS = [
  { key: 'vip', label: 'VIP', color: '#7c3aed' },
  { key: 'frio', label: 'Frío', color: '#0891b2' },
  { key: 'caliente', label: 'Caliente', color: '#dc2626' },
];
```

with:

```js
const STAGES = [
  { key: 'nuevo', label: 'Nuevo', color: '#8a7565' },
  { key: 'contactado', label: 'Contactado', color: '#b64211' },
  { key: 'propuesta', label: 'Propuesta', color: '#df3314' },
  { key: 'ganado', label: 'Ganado', color: '#3f6b28' },
  { key: 'perdido', label: 'Perdido', color: '#b11e1b' },
];

const TAGS = [
  { key: 'vip', label: 'VIP', color: '#92400e' },
  { key: 'frio', label: 'Frío', color: '#8a7565' },
  { key: 'caliente', label: 'Caliente', color: '#b11e1b' },
];
```

- [ ] **Step 8: Create `js/theme.js`**

Same content as Task 1 Step 9, but with `const THEME_STORAGE_KEY = "crmintermedio-theme";` on line 1. Create at `CRM/intermedio/js/theme.js`.

- [ ] **Step 9: Wire up `index.html`**

In `CRM/intermedio/index.html`, replace the `<head>` block (same structure as Task 1 Step 10, replacing `crmbasico-theme` with `crmintermedio-theme`, keeping the title `CRM Intermedio · Demo`):

```html
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CRM Intermedio · Demo</title>
  <link rel="icon" type="image/svg+xml" href="favicon.svg">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Montserrat:wght@600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/style.css">
</head>
```

with:

```html
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CRM Intermedio · Demo</title>
  <link rel="icon" type="image/svg+xml" href="favicon.svg">
  <script>
    // Aplica el tema guardado antes de pintar, para evitar un parpadeo del
    // tema equivocado al cargar la página. Por defecto siempre es claro.
    (function () {
      try {
        var stored = localStorage.getItem("crmintermedio-theme");
        document.documentElement.setAttribute("data-theme", stored === "dark" ? "dark" : "light");
      } catch (e) {
        document.documentElement.setAttribute("data-theme", "light");
      }
    })();
  </script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Montserrat:wght@600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/style.css">
</head>
```

Then replace the topbar-brand block:

```html
      <div class="topbar-brand">
        <span class="brand-mark">C</span>
        <div>
          <h1>CRM Intermedio</h1>
          <p class="subtitle-tag">Empresas, tratos con valor, tareas y actividad</p>
        </div>
      </div>
```

with:

```html
      <div class="topbar-brand">
        <span class="brand-mark">
          <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="fueguitoGradIntermedio" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stop-color="#fb7b15"/>
                <stop offset="1" stop-color="#df3314"/>
              </linearGradient>
            </defs>
            <path fill="url(#fueguitoGradIntermedio)" d="M15 2.3C18.3 6.3 22.2 10.8 22.8 16.2C23.7 11.7 22.2 8.3 20.7 6.3C23.7 8.7 25.8 13.2 25.5 18.3C25.5 25.2 20.9 30.3 15 30.3C9.2 30.3 4.5 25.2 4.5 18.3C4.5 13.8 6.9 10.2 10.2 7.5C9 10.2 9.3 13.2 11.1 15C10.5 10.8 12.3 6.3 15 2.3Z"/>
          </svg>
        </span>
        <div>
          <h1>CRM Intermedio</h1>
          <p class="subtitle-tag">Empresas, tratos con valor, tareas y actividad</p>
        </div>
      </div>
```

Then, right after that `</div>` that closes `.topbar-brand` and before `</header>`, add the theme-toggle wrapper (intermedio's topbar-inner currently has only one child, `.topbar-brand`, so this is a new sibling):

```html
      <div class="topbar-actions">
        <button class="theme-toggle" id="themeToggle" title="Cambiar tema" aria-label="Cambiar tema">
          <svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"></circle><line x1="12" y1="2" x2="12" y2="4"></line><line x1="12" y1="20" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="6.34" y2="6.34"></line><line x1="17.66" y1="17.66" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="4" y2="12"></line><line x1="20" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="6.34" y2="17.66"></line><line x1="17.66" y1="6.34" x2="19.07" y2="4.93"></line></svg>
          <svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
        </button>
      </div>
```

Then, right before `</body>`, replace:

```html
  <script src="js/store.js"></script>
  <script src="js/app.js"></script>
</body>
```

with:

```html
  <script src="js/store.js"></script>
  <script src="js/app.js"></script>
  <script src="js/theme.js"></script>
</body>
```

- [ ] **Step 10: Replace favicon.svg**

Same content as Task 1 Step 11, at `CRM/intermedio/favicon.svg`.

- [ ] **Step 11: Final grep verification**

Same 4 checks as Task 1 Step 12, with paths under `CRM/intermedio/`.

- [ ] **Step 12: Manual browser check**

Same as Task 1 Step 13, opening `CRM/intermedio/index.html`. Additionally confirm the pipeline/table/companies/contacts view-toggle buttons and the sidebar task list all render with warm-palette borders/backgrounds, not blue.

- [ ] **Step 13: Commit**

```bash
cd CRM/intermedio
git add css/style.css index.html js/theme.js js/store.js favicon.svg
git commit -m "feat: retoque de marca — paleta naranja/terracota, modo oscuro e icono de llama"
```

---

## Task 4: CRM intermedio — neutral seed data

**Files:**
- Modify: `CRM/intermedio/js/store.js:46-101` (the `seedData` function: `companies`, `contacts`, `deals`, `tasks`, `activities`)

**Interfaces:**
- Consumes: the company-name roster from Task 2 (same 8 companies, same renames).

- [ ] **Step 1: Replace `companies`**

In `CRM/intermedio/js/store.js`, inside `seedData()`, replace the `companies` array:

```js
  const companies = [
    { id: uid(), name: 'Textiles Rioja', sector: 'Textil', website: 'textilesrioja.es', notes: 'Cliente habitual, pedidos recurrentes.', createdAt: daysFromNow(-60) },
    { id: uid(), name: 'Ferretería Prats', sector: 'Ferretería', website: 'ferreteriaprats.com', notes: '', createdAt: daysFromNow(-50) },
    { id: uid(), name: 'Moda Levante S.L.', sector: 'Moda', website: 'modalevante.es', notes: 'Dos interlocutores habituales.', createdAt: daysFromNow(-90) },
    { id: uid(), name: 'Distribuciones Norte', sector: 'Logística', website: 'distnorte.com', notes: '', createdAt: daysFromNow(-40) },
    { id: uid(), name: 'Grupo Herrero', sector: 'Servicios', website: 'grupoherrero.es', notes: 'Cuenta estratégica.', createdAt: daysFromNow(-120) },
    { id: uid(), name: 'Salas Hostelería', sector: 'Hostelería', website: 'salashosteleria.com', notes: '', createdAt: daysFromNow(-30) },
    { id: uid(), name: 'Campos & Asociados', sector: 'Legal', website: 'camposasociados.es', notes: '', createdAt: daysFromNow(-200) },
    { id: uid(), name: 'Montes Logística', sector: 'Logística', website: 'monteslogistica.com', notes: 'Optó por otro proveedor en la última operación.', createdAt: daysFromNow(-70) },
  ];
```

with:

```js
  const companies = [
    { id: uid(), name: 'Grupo Alameda', sector: 'Servicios', website: 'grupoalameda.es', notes: 'Cliente habitual, pedidos recurrentes.', createdAt: daysFromNow(-60) },
    { id: uid(), name: 'Suministros Prats', sector: 'Distribución', website: 'suministrosprats.com', notes: '', createdAt: daysFromNow(-50) },
    { id: uid(), name: 'Consultora Levante S.L.', sector: 'Consultoría', website: 'consultoralevante.es', notes: 'Dos interlocutores habituales.', createdAt: daysFromNow(-90) },
    { id: uid(), name: 'Distribuciones Norte', sector: 'Logística', website: 'distnorte.com', notes: '', createdAt: daysFromNow(-40) },
    { id: uid(), name: 'Grupo Herrero', sector: 'Servicios', website: 'grupoherrero.es', notes: 'Cuenta estratégica.', createdAt: daysFromNow(-120) },
    { id: uid(), name: 'Salas & Asociados', sector: 'Servicios profesionales', website: 'salasyasociados.com', notes: '', createdAt: daysFromNow(-30) },
    { id: uid(), name: 'Campos & Asociados', sector: 'Legal', website: 'camposasociados.es', notes: '', createdAt: daysFromNow(-200) },
    { id: uid(), name: 'Montes Logística', sector: 'Logística', website: 'monteslogistica.com', notes: 'Optó por otro proveedor en la última operación.', createdAt: daysFromNow(-70) },
  ];
```

- [ ] **Step 2: Replace `contacts`**

Replace:

```js
  const contacts = [
    { id: uid(), name: 'Marta Gil', companyId: byName('Textiles Rioja'), position: 'Responsable de Compras', email: 'marta.gil@textilesrioja.es', phone: '+34 611 223 344', tags: ['caliente'], createdAt: daysFromNow(-58) },
    { id: uid(), name: 'Javier Prats', companyId: byName('Ferretería Prats'), position: 'Gerente', email: 'javier@ferreteriaprats.com', phone: '+34 622 334 455', tags: [], createdAt: daysFromNow(-49) },
    { id: uid(), name: 'Ana Belén Ruiz', companyId: byName('Moda Levante S.L.'), position: 'Directora Comercial', email: 'ab.ruiz@modalevante.es', phone: '+34 633 445 566', tags: ['vip'], createdAt: daysFromNow(-88) },
    { id: uid(), name: 'Rubén Ibáñez', companyId: byName('Moda Levante S.L.'), position: 'Compras', email: 'ruben.ibanez@modalevante.es', phone: '+34 634 445 567', tags: [], createdAt: daysFromNow(-20) },
    { id: uid(), name: 'Carlos Fuentes', companyId: byName('Distribuciones Norte'), position: 'Responsable de Logística', email: 'carlos.fuentes@distnorte.com', phone: '+34 644 556 677', tags: [], createdAt: daysFromNow(-38) },
    { id: uid(), name: 'Lucía Herrero', companyId: byName('Grupo Herrero'), position: 'CEO', email: 'lucia@grupoherrero.es', phone: '+34 655 667 788', tags: ['vip', 'caliente'], createdAt: daysFromNow(-118) },
    { id: uid(), name: 'Pedro Salas', companyId: byName('Salas Hostelería'), position: 'Propietario', email: 'pedro.salas@salashosteleria.com', phone: '+34 666 778 899', tags: ['frio'], createdAt: daysFromNow(-28) },
    { id: uid(), name: 'Elena Campos', companyId: byName('Campos & Asociados'), position: 'Socia', email: 'elena.campos@camposasociados.es', phone: '+34 677 889 900', tags: ['vip'], createdAt: daysFromNow(-198) },
    { id: uid(), name: 'David Montes', companyId: byName('Montes Logística'), position: 'Director', email: 'david@monteslogistica.com', phone: '+34 688 990 011', tags: [], createdAt: daysFromNow(-68) },
  ];
```

with:

```js
  const contacts = [
    { id: uid(), name: 'Marta Gil', companyId: byName('Grupo Alameda'), position: 'Responsable de Compras', email: 'marta.gil@grupoalameda.es', phone: '+34 611 223 344', tags: ['caliente'], createdAt: daysFromNow(-58) },
    { id: uid(), name: 'Javier Prats', companyId: byName('Suministros Prats'), position: 'Gerente', email: 'javier@suministrosprats.com', phone: '+34 622 334 455', tags: [], createdAt: daysFromNow(-49) },
    { id: uid(), name: 'Ana Belén Ruiz', companyId: byName('Consultora Levante S.L.'), position: 'Directora Comercial', email: 'ab.ruiz@consultoralevante.es', phone: '+34 633 445 566', tags: ['vip'], createdAt: daysFromNow(-88) },
    { id: uid(), name: 'Rubén Ibáñez', companyId: byName('Consultora Levante S.L.'), position: 'Compras', email: 'ruben.ibanez@consultoralevante.es', phone: '+34 634 445 567', tags: [], createdAt: daysFromNow(-20) },
    { id: uid(), name: 'Carlos Fuentes', companyId: byName('Distribuciones Norte'), position: 'Responsable de Logística', email: 'carlos.fuentes@distnorte.com', phone: '+34 644 556 677', tags: [], createdAt: daysFromNow(-38) },
    { id: uid(), name: 'Lucía Herrero', companyId: byName('Grupo Herrero'), position: 'CEO', email: 'lucia@grupoherrero.es', phone: '+34 655 667 788', tags: ['vip', 'caliente'], createdAt: daysFromNow(-118) },
    { id: uid(), name: 'Pedro Salas', companyId: byName('Salas & Asociados'), position: 'Propietario', email: 'pedro.salas@salasyasociados.com', phone: '+34 666 778 899', tags: ['frio'], createdAt: daysFromNow(-28) },
    { id: uid(), name: 'Elena Campos', companyId: byName('Campos & Asociados'), position: 'Socia', email: 'elena.campos@camposasociados.es', phone: '+34 677 889 900', tags: ['vip'], createdAt: daysFromNow(-198) },
    { id: uid(), name: 'David Montes', companyId: byName('Montes Logística'), position: 'Director', email: 'david@monteslogistica.com', phone: '+34 688 990 011', tags: [], createdAt: daysFromNow(-68) },
  ];
```

- [ ] **Step 3: Replace `deals`**

Replace:

```js
  const deals = [
    { id: uid(), title: 'Renovación pedido textil', companyId: byName('Textiles Rioja'), contactId: byContactName('Marta Gil'), value: 4200, stage: 'nuevo', createdAt: daysFromNow(-3) },
    { id: uid(), title: 'Suministro de herramientas', companyId: byName('Ferretería Prats'), contactId: byContactName('Javier Prats'), value: 1800, stage: 'nuevo', createdAt: daysFromNow(-2) },
    { id: uid(), title: 'Colección otoño-invierno', companyId: byName('Moda Levante S.L.'), contactId: byContactName('Ana Belén Ruiz'), value: 12500, stage: 'contactado', createdAt: daysFromNow(-5) },
    { id: uid(), title: 'Pedido complementario', companyId: byName('Moda Levante S.L.'), contactId: byContactName('Rubén Ibáñez'), value: 2300, stage: 'nuevo', createdAt: daysFromNow(-1) },
    { id: uid(), title: 'Ampliación de almacén', companyId: byName('Distribuciones Norte'), contactId: byContactName('Carlos Fuentes'), value: 8600, stage: 'contactado', createdAt: daysFromNow(-6) },
    { id: uid(), title: 'Consultoría anual', companyId: byName('Grupo Herrero'), contactId: byContactName('Lucía Herrero'), value: 15000, stage: 'propuesta', createdAt: daysFromNow(-9) },
    { id: uid(), title: 'Mantelería de temporada', companyId: byName('Salas Hostelería'), contactId: byContactName('Pedro Salas'), value: 3100, stage: 'propuesta', createdAt: daysFromNow(-7) },
    { id: uid(), title: 'Auditoría legal anual', companyId: byName('Campos & Asociados'), contactId: byContactName('Elena Campos'), value: 6400, stage: 'ganado', createdAt: daysFromNow(-14) },
    { id: uid(), title: 'Transporte de flota', companyId: byName('Montes Logística'), contactId: byContactName('David Montes'), value: 5200, stage: 'perdido', createdAt: daysFromNow(-16) },
  ];
```

with:

```js
  const deals = [
    { id: uid(), title: 'Renovación de contrato anual', companyId: byName('Grupo Alameda'), contactId: byContactName('Marta Gil'), value: 4200, stage: 'nuevo', createdAt: daysFromNow(-3) },
    { id: uid(), title: 'Suministro de material técnico', companyId: byName('Suministros Prats'), contactId: byContactName('Javier Prats'), value: 1800, stage: 'nuevo', createdAt: daysFromNow(-2) },
    { id: uid(), title: 'Ampliación de servicio de consultoría', companyId: byName('Consultora Levante S.L.'), contactId: byContactName('Ana Belén Ruiz'), value: 12500, stage: 'contactado', createdAt: daysFromNow(-5) },
    { id: uid(), title: 'Pedido complementario', companyId: byName('Consultora Levante S.L.'), contactId: byContactName('Rubén Ibáñez'), value: 2300, stage: 'nuevo', createdAt: daysFromNow(-1) },
    { id: uid(), title: 'Ampliación de almacén', companyId: byName('Distribuciones Norte'), contactId: byContactName('Carlos Fuentes'), value: 8600, stage: 'contactado', createdAt: daysFromNow(-6) },
    { id: uid(), title: 'Consultoría anual', companyId: byName('Grupo Herrero'), contactId: byContactName('Lucía Herrero'), value: 15000, stage: 'propuesta', createdAt: daysFromNow(-9) },
    { id: uid(), title: 'Servicios de temporada', companyId: byName('Salas & Asociados'), contactId: byContactName('Pedro Salas'), value: 3100, stage: 'propuesta', createdAt: daysFromNow(-7) },
    { id: uid(), title: 'Auditoría legal anual', companyId: byName('Campos & Asociados'), contactId: byContactName('Elena Campos'), value: 6400, stage: 'ganado', createdAt: daysFromNow(-14) },
    { id: uid(), title: 'Transporte de flota', companyId: byName('Montes Logística'), contactId: byContactName('David Montes'), value: 5200, stage: 'perdido', createdAt: daysFromNow(-16) },
  ];
```

- [ ] **Step 4: Replace `tasks` and `activities` deal-title references**

Replace:

```js
  const tasks = [
    { id: uid(), dealId: byDealTitle('Renovación pedido textil'), title: 'Llamar para confirmar pedido', dueDate: daysFromNow(-2), completed: false, createdAt: daysFromNow(-3) },
    { id: uid(), dealId: byDealTitle('Suministro de herramientas'), title: 'Revisar condiciones del contrato', dueDate: daysFromNow(6), completed: false, createdAt: daysFromNow(-2) },
    { id: uid(), dealId: byDealTitle('Colección otoño-invierno'), title: 'Reunión de seguimiento', dueDate: daysFromNow(2), completed: false, createdAt: daysFromNow(-5) },
    { id: uid(), dealId: byDealTitle('Consultoría anual'), title: 'Enviar propuesta actualizada', dueDate: daysFromNow(1), completed: false, createdAt: daysFromNow(-4) },
    { id: uid(), dealId: byDealTitle('Mantelería de temporada'), title: 'Confirmar fecha de entrega', dueDate: daysFromNow(-1), completed: false, createdAt: daysFromNow(-3) },
    { id: uid(), dealId: byDealTitle('Pedido complementario'), title: 'Primera llamada de contacto', dueDate: daysFromNow(4), completed: false, createdAt: daysFromNow(-1) },
    { id: uid(), dealId: byDealTitle('Auditoría legal anual'), title: 'Enviar factura final', dueDate: daysFromNow(-8), completed: true, createdAt: daysFromNow(-14) },
  ];

  const activities = [
    { id: uid(), dealId: byDealTitle('Renovación pedido textil'), type: 'llamada', text: 'Primer contacto telefónico, muestran interés en ampliar el pedido habitual.', date: daysFromNow(-3) },
    { id: uid(), dealId: byDealTitle('Renovación pedido textil'), type: 'nota', text: 'Cliente de más de 3 años, buen historial de pago.', date: daysFromNow(-3) },
    { id: uid(), dealId: byDealTitle('Colección otoño-invierno'), type: 'email', text: 'Enviado catálogo de la colección otoño-invierno.', date: daysFromNow(-5) },
    { id: uid(), dealId: byDealTitle('Colección otoño-invierno'), type: 'reunion', text: 'Reunión en showroom, muy interesados en 3 referencias.', date: daysFromNow(-2) },
    { id: uid(), dealId: byDealTitle('Consultoría anual'), type: 'nota', text: 'Quieren renovar la consultoría con alcance ampliado.', date: daysFromNow(-6) },
    { id: uid(), dealId: byDealTitle('Auditoría legal anual'), type: 'reunion', text: 'Firma del contrato en sus oficinas.', date: daysFromNow(-14) },
  ];
```

with:

```js
  const tasks = [
    { id: uid(), dealId: byDealTitle('Renovación de contrato anual'), title: 'Llamar para confirmar pedido', dueDate: daysFromNow(-2), completed: false, createdAt: daysFromNow(-3) },
    { id: uid(), dealId: byDealTitle('Suministro de material técnico'), title: 'Revisar condiciones del contrato', dueDate: daysFromNow(6), completed: false, createdAt: daysFromNow(-2) },
    { id: uid(), dealId: byDealTitle('Ampliación de servicio de consultoría'), title: 'Reunión de seguimiento', dueDate: daysFromNow(2), completed: false, createdAt: daysFromNow(-5) },
    { id: uid(), dealId: byDealTitle('Consultoría anual'), title: 'Enviar propuesta actualizada', dueDate: daysFromNow(1), completed: false, createdAt: daysFromNow(-4) },
    { id: uid(), dealId: byDealTitle('Servicios de temporada'), title: 'Confirmar fecha de entrega', dueDate: daysFromNow(-1), completed: false, createdAt: daysFromNow(-3) },
    { id: uid(), dealId: byDealTitle('Pedido complementario'), title: 'Primera llamada de contacto', dueDate: daysFromNow(4), completed: false, createdAt: daysFromNow(-1) },
    { id: uid(), dealId: byDealTitle('Auditoría legal anual'), title: 'Enviar factura final', dueDate: daysFromNow(-8), completed: true, createdAt: daysFromNow(-14) },
  ];

  const activities = [
    { id: uid(), dealId: byDealTitle('Renovación de contrato anual'), type: 'llamada', text: 'Primer contacto telefónico, muestran interés en ampliar el contrato habitual.', date: daysFromNow(-3) },
    { id: uid(), dealId: byDealTitle('Renovación de contrato anual'), type: 'nota', text: 'Cliente de más de 3 años, buen historial de pago.', date: daysFromNow(-3) },
    { id: uid(), dealId: byDealTitle('Ampliación de servicio de consultoría'), type: 'email', text: 'Enviada propuesta de ampliación de servicio.', date: daysFromNow(-5) },
    { id: uid(), dealId: byDealTitle('Ampliación de servicio de consultoría'), type: 'reunion', text: 'Reunión en sus oficinas, muy interesados en ampliar el alcance.', date: daysFromNow(-2) },
    { id: uid(), dealId: byDealTitle('Consultoría anual'), type: 'nota', text: 'Quieren renovar la consultoría con alcance ampliado.', date: daysFromNow(-6) },
    { id: uid(), dealId: byDealTitle('Auditoría legal anual'), type: 'reunion', text: 'Firma del contrato en sus oficinas.', date: daysFromNow(-14) },
  ];
```

- [ ] **Step 5: Verify no industry-specific term remains**

Run: `grep -niE "textil|ferreter|moda levante|hosteler|panader" CRM/intermedio/js/store.js`
Expected: no output.

- [ ] **Step 6: Manual browser check**

Open `CRM/intermedio/index.html`. In DevTools console run `localStorage.removeItem('crm_intermedio_data')` and reload. Confirm the pipeline, "Empresas" and "Contactos" table views all show the new neutral names, and clicking into a deal still shows its tasks/activity (referential integrity preserved).

- [ ] **Step 7: Commit**

```bash
cd CRM/intermedio
git add js/store.js
git commit -m "content: datos de ejemplo neutros, sin sabor textil/retail"
```

---

## Task 5: CRM completo — color system, dark mode, brand icon, page-accent simplification

**Files:**
- Modify: `CRM/completo/css/style.css`
- Modify: `CRM/completo/index.html`
- Create: `CRM/completo/js/theme.js`
- Modify: `CRM/completo/js/store.js:3-15` (the `STAGES` and `TAGS` arrays)
- Modify: `CRM/completo/js/app.js:54-64` and `:909` (`PAGE_ACCENTS`)
- Modify: `CRM/completo/favicon.svg`

**Interfaces:**
- Consumes: nothing from Tasks 1–4 (separate repo).
- Produces: same token set as Tasks 1 and 3.

- [ ] **Step 1: Replace the `:root` block**

Same old_string/new_string pair as Task 1 Step 1, applied to `CRM/completo/css/style.css` (its current `:root` block, lines 1-19, is character-for-character identical to the other two tiers before the edit).

- [ ] **Step 2: Rename variable usages (`replace_all`)**

Same table as Task 1 Step 3, applied to `CRM/completo/css/style.css`.

- [ ] **Step 3: Replace hardcoded blue literals (`replace_all`)**

Same table as Task 1 Step 4, applied to `CRM/completo/css/style.css`, **plus** this completo-only literal (the zebra-striped table rows, not present in the other two tiers):

| old_string | new_string |
|---|---|
| `background: rgba(29, 78, 216, 0.025);` | `background: var(--surface-soft);` |

- [ ] **Step 4: Simplify `--page-accent` to always use `--primary`**

Completo currently gives each of its 9 pages ("resumen", "pipeline", "tratos", "calendario", "empresas", "contactos", "informes", "automatizaciones", "actividad") a different accent hue via `PAGE_ACCENTS` in `js/app.js`, applied as an inline `--page-accent` custom property. Those hues (blue/purple/teal/amber/slate) don't fit a single warm brand, and because they're set as fixed hex values in JS they don't adapt to dark mode either (a known correctness gap). We remove the per-page accent system entirely — every page now uses the same `--primary` token, which *is* theme-aware.

In `CRM/completo/js/app.js`, delete the `PAGE_ACCENTS` object:

```js
const PAGE_ACCENTS = {
  resumen: '#1d4ed8',
  pipeline: '#1d4ed8',
  tratos: '#1d4ed8',
  calendario: '#1d4ed8',
  empresas: '#6d28d9',
  contactos: '#6d28d9',
  informes: '#0f766e',
  automatizaciones: '#b45309',
  actividad: '#475569',
};
```

Delete this whole block (verify with `grep -n "PAGE_ACCENTS" CRM/completo/js/app.js` that it's fully removed before moving on).

Then, in the same file, remove the line that sets the custom property:

```js
  document.documentElement.style.setProperty('--page-accent', PAGE_ACCENTS[page] || PAGE_ACCENTS.resumen);
```

Delete this line entirely (the surrounding `switchPage()` function keeps working — it only stops setting an inline color it no longer needs).

In `CRM/completo/css/style.css`, using the Edit tool with `replace_all: true`:

| old_string | new_string |
|---|---|
| `var(--page-accent, var(--primary))` | `var(--primary)` |

- [ ] **Step 5: Verify no old-palette literal or page-accent reference remains**

Run: `grep -nE "#1d4ed8|#1e3a8a|#3b82f6|#93c5fd|#16a34a|#d97706|#64748b|#e0e9fa|#eef2fb|#dfe7f9|#6d28d9|#0f766e|#b45309|#475569|rgba\(29, 78, 216" CRM/completo/css/style.css CRM/completo/js/app.js`
Expected: no output. (`#b45309` is deliberately included in this check even though it happened to already be warm-toned — it must disappear because `PAGE_ACCENTS` itself is now gone, not because the color was wrong.)
Run: `grep -n "page-accent\|PAGE_ACCENTS" CRM/completo/css/style.css CRM/completo/js/app.js`
Expected: no output.

- [ ] **Step 6: Replace `.brand-mark` CSS**

Same old_string/new_string as Task 1 Step 6, applied to `CRM/completo/css/style.css` (completo's `.brand-mark` rule, inside the sidenav, is identical to the other two tiers' before the edit).

- [ ] **Step 7: Add theme-toggle CSS**

Same block as Task 1 Step 7, appended to `CRM/completo/css/style.css` after `.brand-mark svg`.

- [ ] **Step 8: Recolor stages and tags**

Same old_string/new_string as Task 3 Step 7, applied to `CRM/completo/js/store.js` (its `STAGES`/`TAGS` arrays are identical to intermedio's before the edit).

- [ ] **Step 9: Create `js/theme.js`**

Same content as Task 1 Step 9, but with `const THEME_STORAGE_KEY = "crmcompleto-theme";` on line 1. Create at `CRM/completo/js/theme.js`.

- [ ] **Step 10: Wire up `index.html`**

Replace the `<head>` block:

```html
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CRM Completo · Demo</title>
  <link rel="icon" type="image/svg+xml" href="favicon.svg">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Montserrat:wght@600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/style.css">
</head>
```

with:

```html
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CRM Completo · Demo</title>
  <link rel="icon" type="image/svg+xml" href="favicon.svg">
  <script>
    // Aplica el tema guardado antes de pintar, para evitar un parpadeo del
    // tema equivocado al cargar la página. Por defecto siempre es claro.
    (function () {
      try {
        var stored = localStorage.getItem("crmcompleto-theme");
        document.documentElement.setAttribute("data-theme", stored === "dark" ? "dark" : "light");
      } catch (e) {
        document.documentElement.setAttribute("data-theme", "light");
      }
    })();
  </script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Montserrat:wght@600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/style.css">
</head>
```

Then replace the sidenav brand block:

```html
      <div class="sidenav-brand">
        <span class="brand-mark">C</span>
        <span class="sidenav-title">CRM Completo</span>
      </div>
```

with:

```html
      <div class="sidenav-brand">
        <span class="brand-mark">
          <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="fueguitoGradCompleto" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stop-color="#fb7b15"/>
                <stop offset="1" stop-color="#df3314"/>
              </linearGradient>
            </defs>
            <path fill="url(#fueguitoGradCompleto)" d="M15 2.3C18.3 6.3 22.2 10.8 22.8 16.2C23.7 11.7 22.2 8.3 20.7 6.3C23.7 8.7 25.8 13.2 25.5 18.3C25.5 25.2 20.9 30.3 15 30.3C9.2 30.3 4.5 25.2 4.5 18.3C4.5 13.8 6.9 10.2 10.2 7.5C9 10.2 9.3 13.2 11.1 15C10.5 10.8 12.3 6.3 15 2.3Z"/>
          </svg>
        </span>
        <span class="sidenav-title">CRM Completo</span>
      </div>
```

Then, inside `.topbar-inner`, replace:

```html
          <div class="topbar-filter" id="owner-filter-wrap">
            <label for="owner-filter">Vendedor</label>
            <select id="owner-filter">
              <option value="">Todos</option>
            </select>
          </div>
        </div>
      </header>
```

with:

```html
          <div class="topbar-filter" id="owner-filter-wrap">
            <label for="owner-filter">Vendedor</label>
            <select id="owner-filter">
              <option value="">Todos</option>
            </select>
          </div>
          <div class="topbar-actions">
            <button class="theme-toggle" id="themeToggle" title="Cambiar tema" aria-label="Cambiar tema">
              <svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"></circle><line x1="12" y1="2" x2="12" y2="4"></line><line x1="12" y1="20" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="6.34" y2="6.34"></line><line x1="17.66" y1="17.66" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="4" y2="12"></line><line x1="20" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="6.34" y2="17.66"></line><line x1="17.66" y1="6.34" x2="19.07" y2="4.93"></line></svg>
              <svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
            </button>
          </div>
        </div>
      </header>
```

Then, right before `</body>`, replace:

```html
  <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script>
  <script src="js/store.js"></script>
  <script src="js/app.js"></script>
</body>
```

with:

```html
  <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script>
  <script src="js/store.js"></script>
  <script src="js/app.js"></script>
  <script src="js/theme.js"></script>
</body>
```

- [ ] **Step 11: Replace favicon.svg**

Same content as Task 1 Step 11, at `CRM/completo/favicon.svg`.

- [ ] **Step 12: Final grep verification**

Same 4 checks as Task 1 Step 12, with paths under `CRM/completo/`, plus the Step 5 checks above re-run to confirm they still pass after the HTML/theme edits.

- [ ] **Step 13: Manual browser check**

Open `CRM/completo/index.html`. Confirm:
- Sidenav shows the flame icon, not "C".
- Every one of the 9 pages (Resumen, Pipeline, Tratos, Empresas, Contactos, Calendario, Informes, Automatizaciones, Actividad) highlights its active sidenav link and topbar underline in the same orange, not a different hue per page.
- The theme toggle in the topbar works and persists across page switches and reload.
- The "Informes" charts and the "Resumen" pipeline-by-stage bar render in warm tones, not blue/purple/teal.

- [ ] **Step 14: Commit**

```bash
cd CRM/completo
git add css/style.css index.html js/theme.js js/store.js js/app.js favicon.svg
git commit -m "feat: retoque de marca — paleta naranja/terracota, modo oscuro, icono de llama y unificación de --page-accent"
```

---

## Task 6: CRM completo — neutral seed data

**Files:**
- Modify: `CRM/completo/js/store.js:67-160` (the `seedData` function: `companies`, `contacts`, `deals`, `tasks`, `activities`, `events`)

**Interfaces:**
- Consumes: the same company-name roster as Tasks 2 and 4, plus two completo-only companies (`Tecnología Vidal`, kept as-is — already neutral — and `Panadería Ferrer`, renamed).

- [ ] **Step 1: Replace `companies`**

In `CRM/completo/js/store.js`, inside `seedData()`, replace the `companies` array:

```js
  const companies = [
    { id: uid(), name: 'Textiles Rioja', sector: 'Textil', website: 'textilesrioja.es', notes: 'Cliente habitual, pedidos recurrentes.', createdAt: daysFromNow(-200) },
    { id: uid(), name: 'Ferretería Prats', sector: 'Ferretería', website: 'ferreteriaprats.com', notes: '', createdAt: daysFromNow(-190) },
    { id: uid(), name: 'Moda Levante S.L.', sector: 'Moda', website: 'modalevante.es', notes: 'Dos interlocutores habituales.', createdAt: daysFromNow(-210) },
    { id: uid(), name: 'Distribuciones Norte', sector: 'Logística', website: 'distnorte.com', notes: '', createdAt: daysFromNow(-180) },
    { id: uid(), name: 'Grupo Herrero', sector: 'Servicios', website: 'grupoherrero.es', notes: 'Cuenta estratégica.', createdAt: daysFromNow(-220) },
    { id: uid(), name: 'Salas Hostelería', sector: 'Hostelería', website: 'salashosteleria.com', notes: '', createdAt: daysFromNow(-170) },
    { id: uid(), name: 'Campos & Asociados', sector: 'Legal', website: 'camposasociados.es', notes: '', createdAt: daysFromNow(-230) },
    { id: uid(), name: 'Montes Logística', sector: 'Logística', website: 'monteslogistica.com', notes: 'Optó por otro proveedor en la última operación.', createdAt: daysFromNow(-195) },
    { id: uid(), name: 'Tecnología Vidal', sector: 'Tecnología', website: 'tecnologiavidal.es', notes: 'Cliente desde hace más de un año.', createdAt: daysFromNow(-175) },
    { id: uid(), name: 'Panadería Ferrer', sector: 'Alimentación', website: 'panaderiaferrer.com', notes: '', createdAt: daysFromNow(-80) },
  ];
```

with:

```js
  const companies = [
    { id: uid(), name: 'Grupo Alameda', sector: 'Servicios', website: 'grupoalameda.es', notes: 'Cliente habitual, pedidos recurrentes.', createdAt: daysFromNow(-200) },
    { id: uid(), name: 'Suministros Prats', sector: 'Distribución', website: 'suministrosprats.com', notes: '', createdAt: daysFromNow(-190) },
    { id: uid(), name: 'Consultora Levante S.L.', sector: 'Consultoría', website: 'consultoralevante.es', notes: 'Dos interlocutores habituales.', createdAt: daysFromNow(-210) },
    { id: uid(), name: 'Distribuciones Norte', sector: 'Logística', website: 'distnorte.com', notes: '', createdAt: daysFromNow(-180) },
    { id: uid(), name: 'Grupo Herrero', sector: 'Servicios', website: 'grupoherrero.es', notes: 'Cuenta estratégica.', createdAt: daysFromNow(-220) },
    { id: uid(), name: 'Salas & Asociados', sector: 'Servicios profesionales', website: 'salasyasociados.com', notes: '', createdAt: daysFromNow(-170) },
    { id: uid(), name: 'Campos & Asociados', sector: 'Legal', website: 'camposasociados.es', notes: '', createdAt: daysFromNow(-230) },
    { id: uid(), name: 'Montes Logística', sector: 'Logística', website: 'monteslogistica.com', notes: 'Optó por otro proveedor en la última operación.', createdAt: daysFromNow(-195) },
    { id: uid(), name: 'Tecnología Vidal', sector: 'Tecnología', website: 'tecnologiavidal.es', notes: 'Cliente desde hace más de un año.', createdAt: daysFromNow(-175) },
    { id: uid(), name: 'Ferrer & Cía', sector: 'Distribución', website: 'ferrerycia.com', notes: '', createdAt: daysFromNow(-80) },
  ];
```

- [ ] **Step 2: Replace `contacts`**

Replace:

```js
  const contacts = [
    { id: uid(), name: 'Marta Gil', companyId: byName('Textiles Rioja'), position: 'Responsable de Compras', email: 'marta.gil@textilesrioja.es', phone: '+34 611 223 344', tags: ['caliente'], createdAt: daysFromNow(-58) },
    { id: uid(), name: 'Javier Prats', companyId: byName('Ferretería Prats'), position: 'Gerente', email: 'javier@ferreteriaprats.com', phone: '+34 622 334 455', tags: [], createdAt: daysFromNow(-49) },
    { id: uid(), name: 'Ana Belén Ruiz', companyId: byName('Moda Levante S.L.'), position: 'Directora Comercial', email: 'ab.ruiz@modalevante.es', phone: '+34 633 445 566', tags: ['vip'], createdAt: daysFromNow(-88) },
    { id: uid(), name: 'Rubén Ibáñez', companyId: byName('Moda Levante S.L.'), position: 'Compras', email: 'ruben.ibanez@modalevante.es', phone: '+34 634 445 567', tags: [], createdAt: daysFromNow(-20) },
    { id: uid(), name: 'Carlos Fuentes', companyId: byName('Distribuciones Norte'), position: 'Responsable de Logística', email: 'carlos.fuentes@distnorte.com', phone: '+34 644 556 677', tags: [], createdAt: daysFromNow(-38) },
    { id: uid(), name: 'Lucía Herrero', companyId: byName('Grupo Herrero'), position: 'CEO', email: 'lucia@grupoherrero.es', phone: '+34 655 667 788', tags: ['vip', 'caliente'], createdAt: daysFromNow(-118) },
    { id: uid(), name: 'Pedro Salas', companyId: byName('Salas Hostelería'), position: 'Propietario', email: 'pedro.salas@salashosteleria.com', phone: '+34 666 778 899', tags: ['frio'], createdAt: daysFromNow(-28) },
    { id: uid(), name: 'Elena Campos', companyId: byName('Campos & Asociados'), position: 'Socia', email: 'elena.campos@camposasociados.es', phone: '+34 677 889 900', tags: ['vip'], createdAt: daysFromNow(-198) },
    { id: uid(), name: 'David Montes', companyId: byName('Montes Logística'), position: 'Director', email: 'david@monteslogistica.com', phone: '+34 688 990 011', tags: [], createdAt: daysFromNow(-68) },
    { id: uid(), name: 'Marina Vidal', companyId: byName('Tecnología Vidal'), position: 'CTO', email: 'marina@tecnologiavidal.es', phone: '+34 699 001 122', tags: ['vip'], createdAt: daysFromNow(-172) },
    { id: uid(), name: 'Jorge Ferrer', companyId: byName('Panadería Ferrer'), position: 'Propietario', email: 'jorge@panaderiaferrer.com', phone: '+34 610 112 233', tags: [], createdAt: daysFromNow(-78) },
  ];
```

with:

```js
  const contacts = [
    { id: uid(), name: 'Marta Gil', companyId: byName('Grupo Alameda'), position: 'Responsable de Compras', email: 'marta.gil@grupoalameda.es', phone: '+34 611 223 344', tags: ['caliente'], createdAt: daysFromNow(-58) },
    { id: uid(), name: 'Javier Prats', companyId: byName('Suministros Prats'), position: 'Gerente', email: 'javier@suministrosprats.com', phone: '+34 622 334 455', tags: [], createdAt: daysFromNow(-49) },
    { id: uid(), name: 'Ana Belén Ruiz', companyId: byName('Consultora Levante S.L.'), position: 'Directora Comercial', email: 'ab.ruiz@consultoralevante.es', phone: '+34 633 445 566', tags: ['vip'], createdAt: daysFromNow(-88) },
    { id: uid(), name: 'Rubén Ibáñez', companyId: byName('Consultora Levante S.L.'), position: 'Compras', email: 'ruben.ibanez@consultoralevante.es', phone: '+34 634 445 567', tags: [], createdAt: daysFromNow(-20) },
    { id: uid(), name: 'Carlos Fuentes', companyId: byName('Distribuciones Norte'), position: 'Responsable de Logística', email: 'carlos.fuentes@distnorte.com', phone: '+34 644 556 677', tags: [], createdAt: daysFromNow(-38) },
    { id: uid(), name: 'Lucía Herrero', companyId: byName('Grupo Herrero'), position: 'CEO', email: 'lucia@grupoherrero.es', phone: '+34 655 667 788', tags: ['vip', 'caliente'], createdAt: daysFromNow(-118) },
    { id: uid(), name: 'Pedro Salas', companyId: byName('Salas & Asociados'), position: 'Propietario', email: 'pedro.salas@salasyasociados.com', phone: '+34 666 778 899', tags: ['frio'], createdAt: daysFromNow(-28) },
    { id: uid(), name: 'Elena Campos', companyId: byName('Campos & Asociados'), position: 'Socia', email: 'elena.campos@camposasociados.es', phone: '+34 677 889 900', tags: ['vip'], createdAt: daysFromNow(-198) },
    { id: uid(), name: 'David Montes', companyId: byName('Montes Logística'), position: 'Director', email: 'david@monteslogistica.com', phone: '+34 688 990 011', tags: [], createdAt: daysFromNow(-68) },
    { id: uid(), name: 'Marina Vidal', companyId: byName('Tecnología Vidal'), position: 'CTO', email: 'marina@tecnologiavidal.es', phone: '+34 699 001 122', tags: ['vip'], createdAt: daysFromNow(-172) },
    { id: uid(), name: 'Jorge Ferrer', companyId: byName('Ferrer & Cía'), position: 'Propietario', email: 'jorge@ferrerycia.com', phone: '+34 610 112 233', tags: [], createdAt: daysFromNow(-78) },
  ];
```

- [ ] **Step 3: Replace `deals`**

Replace:

```js
  const deals = [
    // Pipeline actual
    { id: uid(), title: 'Renovación pedido textil', companyId: byName('Textiles Rioja'), contactId: byContactName('Marta Gil'), ownerId: userByName('Laura Méndez'), value: 4200, stage: 'nuevo', createdAt: daysFromNow(-3) },
    { id: uid(), title: 'Suministro de herramientas', companyId: byName('Ferretería Prats'), contactId: byContactName('Javier Prats'), ownerId: userByName('Óscar Reyes'), value: 1800, stage: 'nuevo', createdAt: daysFromNow(-2) },
    { id: uid(), title: 'Colección otoño-invierno', companyId: byName('Moda Levante S.L.'), contactId: byContactName('Ana Belén Ruiz'), ownerId: userByName('Iván Costa'), value: 12500, stage: 'contactado', createdAt: daysFromNow(-5) },
    { id: uid(), title: 'Pedido complementario', companyId: byName('Moda Levante S.L.'), contactId: byContactName('Rubén Ibáñez'), ownerId: userByName('Iván Costa'), value: 2300, stage: 'nuevo', createdAt: daysFromNow(-1) },
    { id: uid(), title: 'Ampliación de almacén', companyId: byName('Distribuciones Norte'), contactId: byContactName('Carlos Fuentes'), ownerId: userByName('Nerea Blanco'), value: 8600, stage: 'contactado', createdAt: daysFromNow(-6) },
    { id: uid(), title: 'Consultoría anual', companyId: byName('Grupo Herrero'), contactId: byContactName('Lucía Herrero'), ownerId: userByName('Nerea Blanco'), value: 15000, stage: 'propuesta', createdAt: daysFromNow(-9) },
    { id: uid(), title: 'Mantelería de temporada', companyId: byName('Salas Hostelería'), contactId: byContactName('Pedro Salas'), ownerId: userByName('Laura Méndez'), value: 3100, stage: 'propuesta', createdAt: daysFromNow(-7) },
    { id: uid(), title: 'Auditoría legal anual', companyId: byName('Campos & Asociados'), contactId: byContactName('Elena Campos'), ownerId: userByName('Óscar Reyes'), value: 6400, stage: 'ganado', createdAt: daysFromNow(-14) },
    { id: uid(), title: 'Transporte de flota', companyId: byName('Montes Logística'), contactId: byContactName('David Montes'), ownerId: userByName('Iván Costa'), value: 5200, stage: 'perdido', createdAt: daysFromNow(-16) },

    // Histórico (últimos ~6 meses) para informes
    { id: uid(), title: 'Renovación anual software', companyId: byName('Tecnología Vidal'), contactId: byContactName('Marina Vidal'), ownerId: userByName('Laura Méndez'), value: 9800, stage: 'ganado', createdAt: daysFromNow(-170) },
    { id: uid(), title: 'Servicio de limpieza industrial', companyId: byName('Distribuciones Norte'), contactId: byContactName('Carlos Fuentes'), ownerId: userByName('Iván Costa'), value: 2200, stage: 'perdido', createdAt: daysFromNow(-165) },
    { id: uid(), title: 'Suministro de uniformes', companyId: byName('Salas Hostelería'), contactId: byContactName('Pedro Salas'), ownerId: userByName('Nerea Blanco'), value: 3400, stage: 'ganado', createdAt: daysFromNow(-150) },
    { id: uid(), title: 'Ampliación de línea de producción', companyId: byName('Textiles Rioja'), contactId: byContactName('Marta Gil'), ownerId: userByName('Óscar Reyes'), value: 15600, stage: 'ganado', createdAt: daysFromNow(-140) },
    { id: uid(), title: 'Contrato de mantenimiento', companyId: byName('Montes Logística'), contactId: byContactName('David Montes'), ownerId: userByName('Laura Méndez'), value: 4100, stage: 'perdido', createdAt: daysFromNow(-130) },
    { id: uid(), title: 'Pedido de temporada', companyId: byName('Moda Levante S.L.'), contactId: byContactName('Ana Belén Ruiz'), ownerId: userByName('Iván Costa'), value: 7200, stage: 'ganado', createdAt: daysFromNow(-115) },
    { id: uid(), title: 'Auditoría de procesos', companyId: byName('Campos & Asociados'), contactId: byContactName('Elena Campos'), ownerId: userByName('Nerea Blanco'), value: 5300, stage: 'ganado', createdAt: daysFromNow(-100) },
    { id: uid(), title: 'Suministro de material de oficina', companyId: byName('Ferretería Prats'), contactId: byContactName('Javier Prats'), ownerId: userByName('Óscar Reyes'), value: 1200, stage: 'perdido', createdAt: daysFromNow(-90) },
    { id: uid(), title: 'Servicio de catering para eventos', companyId: byName('Panadería Ferrer'), contactId: byContactName('Jorge Ferrer'), ownerId: userByName('Laura Méndez'), value: 2600, stage: 'ganado', createdAt: daysFromNow(-75) },
    { id: uid(), title: 'Renovación de flota', companyId: byName('Montes Logística'), contactId: byContactName('David Montes'), ownerId: userByName('Iván Costa'), value: 6700, stage: 'ganado', createdAt: daysFromNow(-60) },
    { id: uid(), title: 'Consultoría de expansión', companyId: byName('Grupo Herrero'), contactId: byContactName('Lucía Herrero'), ownerId: userByName('Nerea Blanco'), value: 11200, stage: 'ganado', createdAt: daysFromNow(-45) },
    { id: uid(), title: 'Pedido urgente cancelado', companyId: byName('Textiles Rioja'), contactId: byContactName('Marta Gil'), ownerId: userByName('Óscar Reyes'), value: 1900, stage: 'perdido', createdAt: daysFromNow(-30) },
  ];
```

with:

```js
  const deals = [
    // Pipeline actual
    { id: uid(), title: 'Renovación de contrato anual', companyId: byName('Grupo Alameda'), contactId: byContactName('Marta Gil'), ownerId: userByName('Laura Méndez'), value: 4200, stage: 'nuevo', createdAt: daysFromNow(-3) },
    { id: uid(), title: 'Suministro de material técnico', companyId: byName('Suministros Prats'), contactId: byContactName('Javier Prats'), ownerId: userByName('Óscar Reyes'), value: 1800, stage: 'nuevo', createdAt: daysFromNow(-2) },
    { id: uid(), title: 'Ampliación de servicio de consultoría', companyId: byName('Consultora Levante S.L.'), contactId: byContactName('Ana Belén Ruiz'), ownerId: userByName('Iván Costa'), value: 12500, stage: 'contactado', createdAt: daysFromNow(-5) },
    { id: uid(), title: 'Pedido complementario', companyId: byName('Consultora Levante S.L.'), contactId: byContactName('Rubén Ibáñez'), ownerId: userByName('Iván Costa'), value: 2300, stage: 'nuevo', createdAt: daysFromNow(-1) },
    { id: uid(), title: 'Ampliación de almacén', companyId: byName('Distribuciones Norte'), contactId: byContactName('Carlos Fuentes'), ownerId: userByName('Nerea Blanco'), value: 8600, stage: 'contactado', createdAt: daysFromNow(-6) },
    { id: uid(), title: 'Consultoría anual', companyId: byName('Grupo Herrero'), contactId: byContactName('Lucía Herrero'), ownerId: userByName('Nerea Blanco'), value: 15000, stage: 'propuesta', createdAt: daysFromNow(-9) },
    { id: uid(), title: 'Servicios de temporada', companyId: byName('Salas & Asociados'), contactId: byContactName('Pedro Salas'), ownerId: userByName('Laura Méndez'), value: 3100, stage: 'propuesta', createdAt: daysFromNow(-7) },
    { id: uid(), title: 'Auditoría legal anual', companyId: byName('Campos & Asociados'), contactId: byContactName('Elena Campos'), ownerId: userByName('Óscar Reyes'), value: 6400, stage: 'ganado', createdAt: daysFromNow(-14) },
    { id: uid(), title: 'Transporte de flota', companyId: byName('Montes Logística'), contactId: byContactName('David Montes'), ownerId: userByName('Iván Costa'), value: 5200, stage: 'perdido', createdAt: daysFromNow(-16) },

    // Histórico (últimos ~6 meses) para informes
    { id: uid(), title: 'Renovación anual de software', companyId: byName('Tecnología Vidal'), contactId: byContactName('Marina Vidal'), ownerId: userByName('Laura Méndez'), value: 9800, stage: 'ganado', createdAt: daysFromNow(-170) },
    { id: uid(), title: 'Servicio de limpieza industrial', companyId: byName('Distribuciones Norte'), contactId: byContactName('Carlos Fuentes'), ownerId: userByName('Iván Costa'), value: 2200, stage: 'perdido', createdAt: daysFromNow(-165) },
    { id: uid(), title: 'Servicio de asesoría puntual', companyId: byName('Salas & Asociados'), contactId: byContactName('Pedro Salas'), ownerId: userByName('Nerea Blanco'), value: 3400, stage: 'ganado', createdAt: daysFromNow(-150) },
    { id: uid(), title: 'Ampliación de contrato de servicios', companyId: byName('Grupo Alameda'), contactId: byContactName('Marta Gil'), ownerId: userByName('Óscar Reyes'), value: 15600, stage: 'ganado', createdAt: daysFromNow(-140) },
    { id: uid(), title: 'Contrato de mantenimiento', companyId: byName('Montes Logística'), contactId: byContactName('David Montes'), ownerId: userByName('Laura Méndez'), value: 4100, stage: 'perdido', createdAt: daysFromNow(-130) },
    { id: uid(), title: 'Renovación de consultoría', companyId: byName('Consultora Levante S.L.'), contactId: byContactName('Ana Belén Ruiz'), ownerId: userByName('Iván Costa'), value: 7200, stage: 'ganado', createdAt: daysFromNow(-115) },
    { id: uid(), title: 'Auditoría de procesos', companyId: byName('Campos & Asociados'), contactId: byContactName('Elena Campos'), ownerId: userByName('Nerea Blanco'), value: 5300, stage: 'ganado', createdAt: daysFromNow(-100) },
    { id: uid(), title: 'Suministro de material de oficina', companyId: byName('Suministros Prats'), contactId: byContactName('Javier Prats'), ownerId: userByName('Óscar Reyes'), value: 1200, stage: 'perdido', createdAt: daysFromNow(-90) },
    { id: uid(), title: 'Servicio de distribución para eventos', companyId: byName('Ferrer & Cía'), contactId: byContactName('Jorge Ferrer'), ownerId: userByName('Laura Méndez'), value: 2600, stage: 'ganado', createdAt: daysFromNow(-75) },
    { id: uid(), title: 'Renovación de flota', companyId: byName('Montes Logística'), contactId: byContactName('David Montes'), ownerId: userByName('Iván Costa'), value: 6700, stage: 'ganado', createdAt: daysFromNow(-60) },
    { id: uid(), title: 'Consultoría de expansión', companyId: byName('Grupo Herrero'), contactId: byContactName('Lucía Herrero'), ownerId: userByName('Nerea Blanco'), value: 11200, stage: 'ganado', createdAt: daysFromNow(-45) },
    { id: uid(), title: 'Renovación urgente cancelada', companyId: byName('Grupo Alameda'), contactId: byContactName('Marta Gil'), ownerId: userByName('Óscar Reyes'), value: 1900, stage: 'perdido', createdAt: daysFromNow(-30) },
  ];
```

- [ ] **Step 4: Replace `tasks`, `activities`, and `events` deal/company-name references**

Replace:

```js
  const tasks = [
    { id: uid(), dealId: byDealTitle('Renovación pedido textil'), ownerId: ownerOfDeal('Renovación pedido textil'), title: 'Llamar para confirmar pedido', dueDate: daysFromNow(-2), completed: false, createdAt: daysFromNow(-3) },
    { id: uid(), dealId: byDealTitle('Suministro de herramientas'), ownerId: ownerOfDeal('Suministro de herramientas'), title: 'Revisar condiciones del contrato', dueDate: daysFromNow(6), completed: false, createdAt: daysFromNow(-2) },
    { id: uid(), dealId: byDealTitle('Colección otoño-invierno'), ownerId: ownerOfDeal('Colección otoño-invierno'), title: 'Reunión de seguimiento', dueDate: daysFromNow(2), completed: false, createdAt: daysFromNow(-5) },
    { id: uid(), dealId: byDealTitle('Consultoría anual'), ownerId: ownerOfDeal('Consultoría anual'), title: 'Enviar propuesta actualizada', dueDate: daysFromNow(1), completed: false, createdAt: daysFromNow(-4) },
    { id: uid(), dealId: byDealTitle('Mantelería de temporada'), ownerId: ownerOfDeal('Mantelería de temporada'), title: 'Confirmar fecha de entrega', dueDate: daysFromNow(-1), completed: false, createdAt: daysFromNow(-3) },
    { id: uid(), dealId: byDealTitle('Pedido complementario'), ownerId: ownerOfDeal('Pedido complementario'), title: 'Primera llamada de contacto', dueDate: daysFromNow(4), completed: false, createdAt: daysFromNow(-1) },
    { id: uid(), dealId: byDealTitle('Ampliación de almacén'), ownerId: ownerOfDeal('Ampliación de almacén'), title: 'Visita técnica al almacén', dueDate: daysFromNow(9), completed: false, createdAt: daysFromNow(-2) },
    { id: uid(), dealId: byDealTitle('Auditoría legal anual'), ownerId: ownerOfDeal('Auditoría legal anual'), title: 'Enviar factura final', dueDate: daysFromNow(-8), completed: true, createdAt: daysFromNow(-14) },
  ];

  const activities = [
    { id: uid(), dealId: byDealTitle('Renovación pedido textil'), type: 'llamada', text: 'Primer contacto telefónico, muestran interés en ampliar el pedido habitual.', date: daysFromNow(-3) },
    { id: uid(), dealId: byDealTitle('Renovación pedido textil'), type: 'nota', text: 'Cliente de más de 3 años, buen historial de pago.', date: daysFromNow(-3) },
    { id: uid(), dealId: byDealTitle('Colección otoño-invierno'), type: 'email', text: 'Enviado catálogo de la colección otoño-invierno.', date: daysFromNow(-5) },
    { id: uid(), dealId: byDealTitle('Colección otoño-invierno'), type: 'reunion', text: 'Reunión en showroom, muy interesados en 3 referencias.', date: daysFromNow(-2) },
    { id: uid(), dealId: byDealTitle('Consultoría anual'), type: 'nota', text: 'Quieren renovar la consultoría con alcance ampliado.', date: daysFromNow(-6) },
    { id: uid(), dealId: byDealTitle('Auditoría legal anual'), type: 'reunion', text: 'Firma del contrato en sus oficinas.', date: daysFromNow(-14) },
  ];
```

with:

```js
  const tasks = [
    { id: uid(), dealId: byDealTitle('Renovación de contrato anual'), ownerId: ownerOfDeal('Renovación de contrato anual'), title: 'Llamar para confirmar renovación', dueDate: daysFromNow(-2), completed: false, createdAt: daysFromNow(-3) },
    { id: uid(), dealId: byDealTitle('Suministro de material técnico'), ownerId: ownerOfDeal('Suministro de material técnico'), title: 'Revisar condiciones del contrato', dueDate: daysFromNow(6), completed: false, createdAt: daysFromNow(-2) },
    { id: uid(), dealId: byDealTitle('Ampliación de servicio de consultoría'), ownerId: ownerOfDeal('Ampliación de servicio de consultoría'), title: 'Reunión de seguimiento', dueDate: daysFromNow(2), completed: false, createdAt: daysFromNow(-5) },
    { id: uid(), dealId: byDealTitle('Consultoría anual'), ownerId: ownerOfDeal('Consultoría anual'), title: 'Enviar propuesta actualizada', dueDate: daysFromNow(1), completed: false, createdAt: daysFromNow(-4) },
    { id: uid(), dealId: byDealTitle('Servicios de temporada'), ownerId: ownerOfDeal('Servicios de temporada'), title: 'Confirmar fecha de entrega', dueDate: daysFromNow(-1), completed: false, createdAt: daysFromNow(-3) },
    { id: uid(), dealId: byDealTitle('Pedido complementario'), ownerId: ownerOfDeal('Pedido complementario'), title: 'Primera llamada de contacto', dueDate: daysFromNow(4), completed: false, createdAt: daysFromNow(-1) },
    { id: uid(), dealId: byDealTitle('Ampliación de almacén'), ownerId: ownerOfDeal('Ampliación de almacén'), title: 'Visita técnica al almacén', dueDate: daysFromNow(9), completed: false, createdAt: daysFromNow(-2) },
    { id: uid(), dealId: byDealTitle('Auditoría legal anual'), ownerId: ownerOfDeal('Auditoría legal anual'), title: 'Enviar factura final', dueDate: daysFromNow(-8), completed: true, createdAt: daysFromNow(-14) },
  ];

  const activities = [
    { id: uid(), dealId: byDealTitle('Renovación de contrato anual'), type: 'llamada', text: 'Primer contacto telefónico, muestran interés en ampliar el contrato habitual.', date: daysFromNow(-3) },
    { id: uid(), dealId: byDealTitle('Renovación de contrato anual'), type: 'nota', text: 'Cliente de más de 3 años, buen historial de pago.', date: daysFromNow(-3) },
    { id: uid(), dealId: byDealTitle('Ampliación de servicio de consultoría'), type: 'email', text: 'Enviada propuesta de ampliación de servicio.', date: daysFromNow(-5) },
    { id: uid(), dealId: byDealTitle('Ampliación de servicio de consultoría'), type: 'reunion', text: 'Reunión en sus oficinas, muy interesados en ampliar el alcance.', date: daysFromNow(-2) },
    { id: uid(), dealId: byDealTitle('Consultoría anual'), type: 'nota', text: 'Quieren renovar la consultoría con alcance ampliado.', date: daysFromNow(-6) },
    { id: uid(), dealId: byDealTitle('Auditoría legal anual'), type: 'reunion', text: 'Firma del contrato en sus oficinas.', date: daysFromNow(-14) },
  ];
```

Then replace the `events` seed lines that reference company/deal names directly:

```js
  events.push({ id: uid(), type: 'contacto', text: 'Nuevo contacto: Rubén Ibáñez (Moda Levante S.L.)', date: daysFromNow(-20) });
  events.push({ id: uid(), type: 'empresa', text: 'Nueva empresa: Panadería Ferrer', date: daysFromNow(-80) });
```

with:

```js
  events.push({ id: uid(), type: 'contacto', text: 'Nuevo contacto: Rubén Ibáñez (Consultora Levante S.L.)', date: daysFromNow(-20) });
  events.push({ id: uid(), type: 'empresa', text: 'Nueva empresa: Ferrer & Cía', date: daysFromNow(-80) });
```

(The other `events` entries are built dynamically from `deals`/`tasks` titles via template literals, so they inherit the renames from Steps 3–4 automatically — no further edit needed there.)

- [ ] **Step 5: Verify no industry-specific term remains**

Run: `grep -niE "textil|ferreter|moda levante|hosteler|panader" CRM/completo/js/store.js`
Expected: no output.

- [ ] **Step 6: Manual browser check**

Open `CRM/completo/index.html`. In DevTools console run `localStorage.removeItem('crm_completo_data')` and reload. Confirm: Resumen, Pipeline, Tratos, Empresas, Contactos, Informes and Actividad pages all show the new neutral names; CSV/Excel export buttons on "Tratos"/"Empresas"/"Contactos" still produce files (referential integrity between `companyId`/`contactId`/`dealId` preserved).

- [ ] **Step 7: Commit**

```bash
cd CRM/completo
git add js/store.js
git commit -m "content: datos de ejemplo neutros, sin sabor textil/retail"
```

---

## Self-Review Notes

- **Spec coverage:** §1 Sistema de color → Tasks 1/3/5 Steps 1–4. §2 Modo claro/oscuro → Tasks 1/3/5 Steps 7–10 (+ theme.js). §3 Icono de marca → Tasks 1/3/5 Steps 6, 10/9/10, and the favicon steps. §4 Datos de ejemplo neutros → Tasks 2/4/6.
- **Placeholder scan:** every step has literal old_string/new_string content; no "add validation"-style steps.
- **Type consistency:** `THEME_STORAGE_KEY` and the `.theme-toggle`/`.icon-sun`/`.icon-moon` class names are identical across all three `theme.js`/CSS copies, differing only in the storage-key string and (in completo) requiring the `--page-accent` cleanup — called out explicitly in Task 5 Step 4 so it isn't silently skipped.
