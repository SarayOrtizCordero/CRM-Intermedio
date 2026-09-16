# Melray Fase 1 — Marca y terminología: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reposition the three CRM demos (`CRM/basico`, `CRM/intermedio`, `CRM/completo`) from a generic B2B CRM to Melray, a product for small health businesses — new pipeline stages, patient-centric data model (no "Empresas" entity), Melray branding, and personality toasts.

**Architecture:** Static HTML/CSS/vanilla-JS demos, no build step, `localStorage` as the only persistence. No test framework exists; every task's "test" is a manual browser verification pass (open the page, exercise the flow, confirm via `read_page`/console). Each of the three tiers is its own git repo, so changes to `store.js`, `index.html`, `app.js` and `css/style.css` are made independently per tier, in that dependency order (data → markup → logic → visuals), so the tier stays runnable after each task.

**Tech Stack:** Vanilla HTML/CSS/JS, `localStorage`, no framework, no bundler. `completo` additionally loads SheetJS (`xlsx`) from a CDN for Excel export.

## Global Constraints

- Spec: `docs/superpowers/specs/2026-09-16-melray-fase1-marca-terminologia-design.md` (same content in the three repos).
- Keep internal JS variable/function names and HTML element `id`s as they are (`contacts`, `deals`, `dealId`, `page-tratos`, `data-page="tratos"`, etc.) unless they are being deleted outright (the "Empresas" entity). Only user-visible text and the data fields that changed shape (`service`, `source` replacing `company`/`position`) change. This keeps the diff focused and avoids breaking wiring between files.
- 7 pipeline stages (same keys/labels/colors in all three tiers):
  `nuevo` "Nuevo contacto" `#8a7565` · `recibida` "Consulta recibida" `#a9754a` · `contactado` "Contactado" `#b64211` · `interesado` "Interesado" `#df3314` · `turno` "Turno reservado" `#eda100` · `atendido` "Atendido" `#3f6b28` · `seguimiento` "Seguimiento" `#6b8a52`.
- "Empresas" entity removed entirely from `intermedio` and `completo` (array, page/view, modal, table column, `companyId` references). `basico`'s free-text "Empresa" field is replaced the same way as the other tiers' `company`/`position` fields.
- Every contact/patient gets two new fields: `service` (free-text, "servicio/tratamiento de interés") and `source` (one of `whatsapp`/`instagram`/`web`/`telefono`/`formulario`, select dropdown, labels WhatsApp/Instagram/Web/Teléfono/Formulario).
- User-visible renames: "CRM Básico/Intermedio/Completo" → "Melray Básico/Intermedio/Completo" (wordmark + `<title>`); "Contactos" → "Pacientes"; "Tratos"/"Trato" → "Consultas"/"Consulta" (every user-visible occurrence — button labels, modal titles, confirm dialogs, empty states, CSV headers, stat labels — not the internal `deal*`/`trato` JS/HTML identifiers); "Vendedor" filter label → "Profesional"; "Top vendedores" → "Top profesionales"; "Ranking de vendedores (valor ganado)" → "Ranking de profesionales (valor ganado)".
- New toast component (identical pattern in all three tiers): fixed bottom-right, auto-dismiss ~4s, 🔥 icon, triggered on (a) creating a new patient, (b) a deal/status moving to `turno`, (c) moving to `atendido`.
- No automated test suite exists and none is introduced. Verification = manual pass in the Browser pane per task.
- Before manually verifying any tier, clear that tier's `localStorage` key first (old seed shape is incompatible with the new fields) — see each tier's verification step for the exact key.

---

## Part A — `CRM/basico`

### Task 1: `basico/js/store.js` — data model and seed

**Files:**
- Modify: `CRM/basico/js/store.js` (full file rewrite — it is 52 lines)

**Interfaces:**
- Produces: `STATUSES` (array of `{key,label,color}`, 7 entries), `statusInfo(key)`, `uid()`, `seedContacts()` returning patient objects `{id, name, service, source, email, phone, status, notes, createdAt}`, `loadContacts()`, `saveContacts(contacts)`. Consumed by `js/app.js` (Task 2/3) and referenced by `index.html` inline `<option>` lists (Task 2).

- [ ] **Step 1: Rewrite `store.js`**

Replace the entire file content with:

```js
const STORAGE_KEY = 'crm_basico_contacts';

const STATUSES = [
  { key: 'nuevo', label: 'Nuevo contacto', color: '#8a7565' },
  { key: 'recibida', label: 'Consulta recibida', color: '#a9754a' },
  { key: 'contactado', label: 'Contactado', color: '#b64211' },
  { key: 'interesado', label: 'Interesado', color: '#df3314' },
  { key: 'turno', label: 'Turno reservado', color: '#eda100' },
  { key: 'atendido', label: 'Atendido', color: '#3f6b28' },
  { key: 'seguimiento', label: 'Seguimiento', color: '#6b8a52' },
];

function statusInfo(key) {
  return STATUSES.find((s) => s.key === key) || STATUSES[0];
}

function uid() {
  return (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`);
}

function seedContacts() {
  const now = Date.now();
  return [
    { id: uid(), name: 'Marta Gil', service: 'Limpieza dental', source: 'whatsapp', email: 'marta.gil@email.com', phone: '+34 611 223 344', status: 'nuevo', notes: 'Escribió por WhatsApp preguntando por la limpieza dental.', createdAt: now - 86400000 * 1 },
    { id: uid(), name: 'Javier Prats', service: 'Revisión general', source: 'telefono', email: 'javier.prats@email.com', phone: '+34 622 334 455', status: 'nuevo', notes: '', createdAt: now - 86400000 * 2 },
    { id: uid(), name: 'Ana Belén Ruiz', service: 'Ortodoncia invisible', source: 'instagram', email: 'ab.ruiz@email.com', phone: '+34 633 445 566', status: 'contactado', notes: 'Llamada agendada para el jueves.', createdAt: now - 86400000 * 4 },
    { id: uid(), name: 'Carlos Fuentes', service: 'Consulta general', source: 'formulario', email: 'carlos.fuentes@email.com', phone: '+34 644 556 677', status: 'contactado', notes: '', createdAt: now - 86400000 * 5 },
    { id: uid(), name: 'Lucía Herrero', service: 'Sesión de fisioterapia', source: 'web', email: 'lucia.herrero@email.com', phone: '+34 655 667 788', status: 'interesado', notes: 'Presupuesto de fisioterapia enviado, pendiente de respuesta.', createdAt: now - 86400000 * 7 },
    { id: uid(), name: 'Pedro Salas', service: 'Peeling facial', source: 'instagram', email: 'pedro.salas@email.com', phone: '+34 666 778 899', status: 'interesado', notes: '', createdAt: now - 86400000 * 8 },
    { id: uid(), name: 'Elena Campos', service: 'Sesión de botox', source: 'whatsapp', email: 'elena.campos@email.com', phone: '+34 677 889 900', status: 'atendido', notes: 'Sesión realizada, muy satisfecha.', createdAt: now - 86400000 * 12 },
    { id: uid(), name: 'David Montes', service: 'Blanqueamiento dental', source: 'whatsapp', email: 'david.montes@email.com', phone: '+34 688 990 011', status: 'seguimiento', notes: 'No respondió tras el primer contacto; en seguimiento.', createdAt: now - 86400000 * 15 },
  ];
}

function loadContacts() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const seeded = seedContacts();
    saveContacts(seeded);
    return seeded;
  }
  try {
    return JSON.parse(raw);
  } catch {
    const seeded = seedContacts();
    saveContacts(seeded);
    return seeded;
  }
}

function saveContacts(contacts) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
}
```

- [ ] **Step 2: Commit**

```bash
git add js/store.js
git commit -m "feat(basico): pipeline de salud y pacientes de ejemplo en store.js"
```

### Task 2: `basico/index.html` — markup and copy

**Files:**
- Modify: `CRM/basico/index.html`

**Interfaces:**
- Consumes: nothing new (static markup). Produces the DOM ids `contact-service`, `contact-source` that Task 3's `app.js` reads/writes (replacing `contact-company`), and the `#toast-container` that Task 3's `showToast()` renders into.

- [ ] **Step 1: Title and brand**

Old:
```html
  <title>CRM Básico · Demo</title>
```
New:
```html
  <title>Melray Básico · Demo</title>
```

Old:
```html
        <div>
          <h1>CRM Básico</h1>
          <p class="subtitle-tag">Contactos y pipeline simple</p>
        </div>
```
New:
```html
        <div>
          <h1>Melray Básico</h1>
          <p class="subtitle-tag">Menos WhatsApp. Menos tareas manuales. Más pacientes.</p>
        </div>
```

- [ ] **Step 2: Search placeholder and status filter options**

Old:
```html
            <input type="text" id="search-input" placeholder="Buscar por nombre o empresa...">
          </div>
          <select id="filter-status">
            <option value="">Todos los estados</option>
            <option value="nuevo">Nuevo</option>
            <option value="contactado">Contactado</option>
            <option value="propuesta">Propuesta</option>
            <option value="ganado">Ganado</option>
            <option value="perdido">Perdido</option>
          </select>
```
New:
```html
            <input type="text" id="search-input" placeholder="Buscar por nombre o servicio...">
          </div>
          <select id="filter-status">
            <option value="">Todos los estados</option>
            <option value="nuevo">Nuevo contacto</option>
            <option value="recibida">Consulta recibida</option>
            <option value="contactado">Contactado</option>
            <option value="interesado">Interesado</option>
            <option value="turno">Turno reservado</option>
            <option value="atendido">Atendido</option>
            <option value="seguimiento">Seguimiento</option>
          </select>
```

- [ ] **Step 3: "Nuevo contacto" button — no text change needed (already generic), rename table header and add nav label "Pacientes" is out of scope for básico (it has no sidenav — the page itself is the patients list, so only the table header changes)**

Old:
```html
              <th>Nombre</th>
              <th>Empresa</th>
              <th>Email</th>
```
New:
```html
              <th>Nombre</th>
              <th>Servicio</th>
              <th>Email</th>
```

- [ ] **Step 4: Contact modal — replace Empresa field with Servicio + Origen**

Old:
```html
        <label for="contact-name">Nombre</label>
        <input type="text" id="contact-name" required placeholder="Ej: Marta Gil">

        <label for="contact-company">Empresa</label>
        <input type="text" id="contact-company" placeholder="Ej: Textiles Rioja">

        <div class="field-row">
          <div>
            <label for="contact-email">Email</label>
            <input type="email" id="contact-email" placeholder="ejemplo@empresa.com">
          </div>
          <div>
            <label for="contact-phone">Teléfono</label>
            <input type="tel" id="contact-phone" placeholder="+34 600 000 000">
          </div>
        </div>

        <label for="contact-status">Estado</label>
        <select id="contact-status">
          <option value="nuevo">Nuevo</option>
          <option value="contactado">Contactado</option>
          <option value="propuesta">Propuesta</option>
          <option value="ganado">Ganado</option>
          <option value="perdido">Perdido</option>
        </select>

        <label for="contact-notes">Notas</label>
        <textarea id="contact-notes" rows="3" placeholder="Notas sobre el contacto..."></textarea>
```
New:
```html
        <label for="contact-name">Nombre</label>
        <input type="text" id="contact-name" required placeholder="Ej: Marta Gil">

        <div class="field-row">
          <div>
            <label for="contact-service">Servicio de interés</label>
            <input type="text" id="contact-service" placeholder="Ej: Limpieza dental">
          </div>
          <div>
            <label for="contact-source">Origen</label>
            <select id="contact-source">
              <option value="whatsapp">WhatsApp</option>
              <option value="instagram">Instagram</option>
              <option value="web">Web</option>
              <option value="telefono">Teléfono</option>
              <option value="formulario">Formulario</option>
            </select>
          </div>
        </div>

        <div class="field-row">
          <div>
            <label for="contact-email">Email</label>
            <input type="email" id="contact-email" placeholder="ejemplo@email.com">
          </div>
          <div>
            <label for="contact-phone">Teléfono</label>
            <input type="tel" id="contact-phone" placeholder="+34 600 000 000">
          </div>
        </div>

        <label for="contact-status">Estado</label>
        <select id="contact-status">
          <option value="nuevo">Nuevo contacto</option>
          <option value="recibida">Consulta recibida</option>
          <option value="contactado">Contactado</option>
          <option value="interesado">Interesado</option>
          <option value="turno">Turno reservado</option>
          <option value="atendido">Atendido</option>
          <option value="seguimiento">Seguimiento</option>
        </select>

        <label for="contact-notes">Notas</label>
        <textarea id="contact-notes" rows="3" placeholder="Notas sobre el paciente..."></textarea>
```

- [ ] **Step 5: Add the toast container before the closing `</body>`**

Old:
```html
  <script src="js/store.js"></script>
  <script src="js/app.js"></script>
  <script src="js/theme.js"></script>
</body>
</html>
```
New:
```html
  <div id="toast-container" class="toast-container"></div>

  <script src="js/store.js"></script>
  <script src="js/app.js"></script>
  <script src="js/theme.js"></script>
</body>
</html>
```

- [ ] **Step 6: Commit**

```bash
git add index.html
git commit -m "feat(basico): copy y marca Melray, pacientes en vez de empresa"
```

### Task 3: `basico/js/app.js` — field wiring and toasts

**Files:**
- Modify: `CRM/basico/js/app.js`

**Interfaces:**
- Consumes: `STATUSES`, `statusInfo(key)`, `uid()`, `loadContacts()`, `saveContacts()` from Task 1; DOM ids `contact-service`, `contact-source`, `toast-container` from Task 2.
- Produces: `showToast(message)` and `notifyStatusChange(newStatus, previousStatus)`, usable by any future step in this file.

- [ ] **Step 1: Replace the `fCompany` element ref with `fService`/`fSource`**

Old:
```js
  fCompany: document.getElementById('contact-company'),
```
New:
```js
  fService: document.getElementById('contact-service'),
  fSource: document.getElementById('contact-source'),
```

- [ ] **Step 2: Add `showToast` right after `escapeHtml`**

Old:
```js
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}
```
New:
```js
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}

function showToast(message) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span class="toast-icon">🔥</span><span>${escapeHtml(message)}</span>`;
  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

function notifyStatusChange(newStatus, previousStatus) {
  if (newStatus === previousStatus) return;
  if (newStatus === 'turno') showToast('Booked. We love to see it.');
  else if (newStatus === 'atendido') showToast('Nice work.');
}
```

- [ ] **Step 3: Search filter — `company` → `service`**

Old:
```js
    const matchesTerm = !term || c.name.toLowerCase().includes(term) || c.company.toLowerCase().includes(term);
```
New:
```js
    const matchesTerm = !term || c.name.toLowerCase().includes(term) || (c.service || '').toLowerCase().includes(term);
```

- [ ] **Step 4: Kanban card — show service, and notify on drop**

Old:
```js
          <p class="card-company">${escapeHtml(c.company || 'Sin empresa')}</p>
```
New:
```js
          <p class="card-company">${escapeHtml(c.service || 'Sin servicio')}</p>
```

Old:
```js
      if (contact && contact.status !== newStatus) {
        contact.status = newStatus;
        saveContacts(contacts);
        renderAll();
      }
```
New:
```js
      if (contact && contact.status !== newStatus) {
        const previousStatus = contact.status;
        contact.status = newStatus;
        notifyStatusChange(newStatus, previousStatus);
        saveContacts(contacts);
        renderAll();
      }
```

- [ ] **Step 5: Table cell — `company` → `service`**

Old:
```js
        <td class="cell-muted">${escapeHtml(c.company || '—')}</td>
```
New:
```js
        <td class="cell-muted">${escapeHtml(c.service || '—')}</td>
```

- [ ] **Step 6: `openEditModal` — populate service/source**

Old:
```js
  els.fCompany.value = contact.company || '';
```
New:
```js
  els.fService.value = contact.service || '';
  els.fSource.value = contact.source || 'whatsapp';
```

- [ ] **Step 7: `handleFormSubmit` — payload fields and toast triggers**

Old:
```js
function handleFormSubmit(e) {
  e.preventDefault();
  const data = {
    name: els.fName.value.trim(),
    company: els.fCompany.value.trim(),
    email: els.fEmail.value.trim(),
    phone: els.fPhone.value.trim(),
    status: els.fStatus.value,
    notes: els.fNotes.value.trim(),
  };
  if (!data.name) return;

  if (editingId) {
    const contact = contacts.find((c) => c.id === editingId);
    Object.assign(contact, data);
  } else {
    contacts.push({ id: uid(), ...data, createdAt: Date.now() });
  }
  saveContacts(contacts);
  closeModal();
  renderAll();
}
```
New:
```js
function handleFormSubmit(e) {
  e.preventDefault();
  const data = {
    name: els.fName.value.trim(),
    service: els.fService.value.trim(),
    source: els.fSource.value,
    email: els.fEmail.value.trim(),
    phone: els.fPhone.value.trim(),
    status: els.fStatus.value,
    notes: els.fNotes.value.trim(),
  };
  if (!data.name) return;

  if (editingId) {
    const contact = contacts.find((c) => c.id === editingId);
    const previousStatus = contact.status;
    Object.assign(contact, data);
    notifyStatusChange(data.status, previousStatus);
  } else {
    contacts.push({ id: uid(), ...data, createdAt: Date.now() });
    showToast('New patient unlocked.');
  }
  saveContacts(contacts);
  closeModal();
  renderAll();
}
```

- [ ] **Step 8: Commit**

```bash
git add js/app.js
git commit -m "feat(basico): pacientes con servicio/origen y toasts con personalidad"
```

### Task 4: `basico/css/style.css` — 7-column kanban and toast styles

**Files:**
- Modify: `CRM/basico/css/style.css`

- [ ] **Step 1: Kanban grid, desktop**

Old:
```css
.kanban-board {
  display: grid;
  grid-template-columns: repeat(5, minmax(220px, 1fr));
  gap: 14px;
  overflow-x: auto;
  padding-bottom: 4px;
}
```
New:
```css
.kanban-board {
  display: grid;
  grid-template-columns: repeat(7, minmax(200px, 1fr));
  gap: 14px;
  overflow-x: auto;
  padding-bottom: 4px;
}
```

- [ ] **Step 2: Kanban grid, mobile/tablet media query**

Old:
```css
  .kanban-board {
    grid-template-columns: repeat(5, 240px);
  }
```
New:
```css
  .kanban-board {
    grid-template-columns: repeat(7, 220px);
  }
```

- [ ] **Step 3: Append toast component styles at the end of the file**

```css

/* ---------- Toasts ---------- */
.toast-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--surface);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 12px 16px;
  box-shadow: var(--shadow-hover);
  font-size: 13px;
  font-weight: 600;
  max-width: 320px;
  opacity: 0;
  transform: translateY(8px);
  transition: opacity 0.25s var(--ease), transform 0.25s var(--ease);
}

.toast.show {
  opacity: 1;
  transform: translateY(0);
}

.toast-icon {
  font-size: 16px;
  flex-shrink: 0;
}
```

- [ ] **Step 4: Commit**

```bash
git add css/style.css
git commit -m "feat(basico): kanban a 7 etapas y estilos de toast"
```

### Task 5: Manual verification — `basico`

**Files:** none (browser-only check)

- [ ] **Step 1: Clear stale data and load the page**

In the Browser pane console (or `javascript_tool`): `localStorage.removeItem('crm_basico_contacts')`, then reload `http://localhost:8020` (the `crm-basico` entry already in `.claude/launch.json`).

- [ ] **Step 2: Visual/functional checklist**

- Header says "Melray Básico" and the tab title is "Melray Básico · Demo".
- Kanban shows 7 columns: Nuevo contacto, Consulta recibida, Contactado, Interesado, Turno reservado, Atendido, Seguimiento — no "Propuesta"/"Ganado"/"Perdido" left.
- Table view header row says "Servicio" instead of "Empresa"; no cell shows a company name.
- Open "Nuevo contacto": form has "Servicio de interés" and "Origen" fields (no "Empresa"), and the "Estado" select lists the 7 new stages.
- Fill the form (name required) and save → a 🔥 "New patient unlocked." toast appears bottom-right and auto-dismisses after ~4s.
- Drag any kanban card into the "Turno reservado" column → a 🔥 "Booked. We love to see it." toast appears. Drag a card into "Atendido" → 🔥 "Nice work." toast appears.
- Toggle dark mode → toast, kanban cards and the new form fields all render with dark background/text (no white boxes), consistent with the earlier dark-mode fix.

---

## Part B — `CRM/intermedio`

### Task 6: `intermedio/js/store.js` — data model and seed (Empresas removed)

**Files:**
- Modify: `CRM/intermedio/js/store.js` (full file rewrite — it is 127 lines)

**Interfaces:**
- Produces: `STAGES` (7 entries), `TAGS`, `ACTIVITY_TYPES`, `stageInfo`, `tagInfo`, `activityTypeLabel`, `uid`, `daysFromNow`, `loadData()`/`saveData()` returning/accepting `{ contacts, deals, tasks, activities }` (no `companies`). `contacts[i]` shape: `{id, name, service, source, email, phone, tags, createdAt}`. `deals[i]` shape: `{id, title, contactId, value, stage, createdAt}` (no `companyId`). Consumed by `js/app.js` (Task 8) and `index.html`'s hardcoded `<option>` lists (Task 7).

- [ ] **Step 1: Rewrite `store.js`**

```js
const STORAGE_KEY = 'crm_intermedio_data';

const STAGES = [
  { key: 'nuevo', label: 'Nuevo contacto', color: '#8a7565' },
  { key: 'recibida', label: 'Consulta recibida', color: '#a9754a' },
  { key: 'contactado', label: 'Contactado', color: '#b64211' },
  { key: 'interesado', label: 'Interesado', color: '#df3314' },
  { key: 'turno', label: 'Turno reservado', color: '#eda100' },
  { key: 'atendido', label: 'Atendido', color: '#3f6b28' },
  { key: 'seguimiento', label: 'Seguimiento', color: '#6b8a52' },
];

const TAGS = [
  { key: 'vip', label: 'VIP', color: '#92400e' },
  { key: 'frio', label: 'Frío', color: '#8a7565' },
  { key: 'caliente', label: 'Caliente', color: '#b11e1b' },
];

const ACTIVITY_TYPES = [
  { key: 'nota', label: 'Nota' },
  { key: 'llamada', label: 'Llamada' },
  { key: 'email', label: 'Email' },
  { key: 'reunion', label: 'Reunión' },
];

function stageInfo(key) {
  return STAGES.find((s) => s.key === key) || STAGES[0];
}

function tagInfo(key) {
  return TAGS.find((t) => t.key === key);
}

function activityTypeLabel(key) {
  const t = ACTIVITY_TYPES.find((a) => a.key === key);
  return t ? t.label : key;
}

function uid() {
  return (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`);
}

function daysFromNow(n) {
  return Date.now() + n * 86400000;
}

function seedData() {
  const contacts = [
    { id: uid(), name: 'Marta Gil', service: 'Limpieza dental', source: 'whatsapp', email: 'marta.gil@email.com', phone: '+34 611 223 344', tags: ['caliente'], createdAt: daysFromNow(-58) },
    { id: uid(), name: 'Javier Prats', service: 'Revisión general', source: 'telefono', email: 'javier.prats@email.com', phone: '+34 622 334 455', tags: [], createdAt: daysFromNow(-49) },
    { id: uid(), name: 'Ana Belén Ruiz', service: 'Ortodoncia invisible', source: 'instagram', email: 'ab.ruiz@email.com', phone: '+34 633 445 566', tags: ['vip'], createdAt: daysFromNow(-88) },
    { id: uid(), name: 'Rubén Ibáñez', service: 'Revisión de ortodoncia', source: 'whatsapp', email: 'ruben.ibanez@email.com', phone: '+34 634 445 567', tags: [], createdAt: daysFromNow(-20) },
    { id: uid(), name: 'Carlos Fuentes', service: 'Consulta general', source: 'formulario', email: 'carlos.fuentes@email.com', phone: '+34 644 556 677', tags: [], createdAt: daysFromNow(-38) },
    { id: uid(), name: 'Lucía Herrero', service: 'Sesión de fisioterapia', source: 'web', email: 'lucia.herrero@email.com', phone: '+34 655 667 788', tags: ['vip', 'caliente'], createdAt: daysFromNow(-118) },
    { id: uid(), name: 'Pedro Salas', service: 'Peeling facial', source: 'instagram', email: 'pedro.salas@email.com', phone: '+34 666 778 899', tags: ['frio'], createdAt: daysFromNow(-28) },
    { id: uid(), name: 'Elena Campos', service: 'Sesión de botox', source: 'whatsapp', email: 'elena.campos@email.com', phone: '+34 677 889 900', tags: ['vip'], createdAt: daysFromNow(-198) },
    { id: uid(), name: 'David Montes', service: 'Blanqueamiento dental', source: 'whatsapp', email: 'david.montes@email.com', phone: '+34 688 990 011', tags: [], createdAt: daysFromNow(-68) },
  ];
  const byContactName = (n) => contacts.find((c) => c.name === n).id;

  const deals = [
    { id: uid(), title: 'Consulta inicial — Limpieza dental', contactId: byContactName('Marta Gil'), value: 4200, stage: 'nuevo', createdAt: daysFromNow(-3) },
    { id: uid(), title: 'Consulta inicial — Revisión general', contactId: byContactName('Javier Prats'), value: 1800, stage: 'nuevo', createdAt: daysFromNow(-2) },
    { id: uid(), title: 'Valoración de ortodoncia invisible', contactId: byContactName('Ana Belén Ruiz'), value: 12500, stage: 'contactado', createdAt: daysFromNow(-5) },
    { id: uid(), title: 'Revisión de ortodoncia', contactId: byContactName('Rubén Ibáñez'), value: 2300, stage: 'nuevo', createdAt: daysFromNow(-1) },
    { id: uid(), title: 'Consulta general de seguimiento', contactId: byContactName('Carlos Fuentes'), value: 8600, stage: 'contactado', createdAt: daysFromNow(-6) },
    { id: uid(), title: 'Plan de fisioterapia', contactId: byContactName('Lucía Herrero'), value: 15000, stage: 'interesado', createdAt: daysFromNow(-9) },
    { id: uid(), title: 'Peeling facial — sesión inicial', contactId: byContactName('Pedro Salas'), value: 3100, stage: 'interesado', createdAt: daysFromNow(-7) },
    { id: uid(), title: 'Sesión de botox', contactId: byContactName('Elena Campos'), value: 6400, stage: 'atendido', createdAt: daysFromNow(-14) },
    { id: uid(), title: 'Blanqueamiento dental', contactId: byContactName('David Montes'), value: 5200, stage: 'seguimiento', createdAt: daysFromNow(-16) },
  ];
  const byDealTitle = (t) => deals.find((d) => d.title === t).id;

  const tasks = [
    { id: uid(), dealId: byDealTitle('Consulta inicial — Limpieza dental'), title: 'Llamar para confirmar la cita', dueDate: daysFromNow(-2), completed: false, createdAt: daysFromNow(-3) },
    { id: uid(), dealId: byDealTitle('Consulta inicial — Revisión general'), title: 'Revisar historial médico previo', dueDate: daysFromNow(6), completed: false, createdAt: daysFromNow(-2) },
    { id: uid(), dealId: byDealTitle('Valoración de ortodoncia invisible'), title: 'Sesión de seguimiento de ortodoncia', dueDate: daysFromNow(2), completed: false, createdAt: daysFromNow(-5) },
    { id: uid(), dealId: byDealTitle('Plan de fisioterapia'), title: 'Enviar presupuesto de fisioterapia actualizado', dueDate: daysFromNow(1), completed: false, createdAt: daysFromNow(-4) },
    { id: uid(), dealId: byDealTitle('Peeling facial — sesión inicial'), title: 'Confirmar fecha de la sesión de peeling', dueDate: daysFromNow(-1), completed: false, createdAt: daysFromNow(-3) },
    { id: uid(), dealId: byDealTitle('Revisión de ortodoncia'), title: 'Primera llamada de contacto', dueDate: daysFromNow(4), completed: false, createdAt: daysFromNow(-1) },
    { id: uid(), dealId: byDealTitle('Sesión de botox'), title: 'Enviar factura de la sesión', dueDate: daysFromNow(-8), completed: true, createdAt: daysFromNow(-14) },
  ];

  const activities = [
    { id: uid(), dealId: byDealTitle('Consulta inicial — Limpieza dental'), type: 'llamada', text: 'Primer contacto telefónico, pregunta por precio de limpieza dental.', date: daysFromNow(-3) },
    { id: uid(), dealId: byDealTitle('Consulta inicial — Limpieza dental'), type: 'nota', text: 'Paciente habitual, buen historial de asistencia.', date: daysFromNow(-3) },
    { id: uid(), dealId: byDealTitle('Valoración de ortodoncia invisible'), type: 'email', text: 'Enviada información sobre ortodoncia invisible.', date: daysFromNow(-5) },
    { id: uid(), dealId: byDealTitle('Valoración de ortodoncia invisible'), type: 'reunion', text: 'Consulta presencial, muy interesada en empezar tratamiento.', date: daysFromNow(-2) },
    { id: uid(), dealId: byDealTitle('Plan de fisioterapia'), type: 'nota', text: 'Quiere ampliar el plan de fisioterapia a 2 sesiones semanales.', date: daysFromNow(-6) },
    { id: uid(), dealId: byDealTitle('Sesión de botox'), type: 'reunion', text: 'Sesión de botox realizada en consulta.', date: daysFromNow(-14) },
  ];

  return { contacts, deals, tasks, activities };
}

function loadData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const seeded = seedData();
    saveData(seeded);
    return seeded;
  }
  try {
    const parsed = JSON.parse(raw);
    if (!parsed.contacts || !parsed.deals) throw new Error('shape');
    return parsed;
  } catch {
    const seeded = seedData();
    saveData(seeded);
    return seeded;
  }
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
```

Note the `loadData` shape guard drops the `!parsed.companies` check — with `companies` no longer part of `seedData()`'s return value, keeping that check would make every reload discard and reseed the data (`parsed.companies` would always be `undefined`), silently destroying anything the user edited. This is the one correctness trap in this migration; get it right here.

- [ ] **Step 2: Commit**

```bash
git add js/store.js
git commit -m "feat(intermedio): quita Empresas, pipeline de salud y pacientes de ejemplo"
```

### Task 7: `intermedio/index.html` — remove Empresas, rename Contactos→Pacientes/Tratos→Consultas

**Files:**
- Modify: `CRM/intermedio/index.html`

**Interfaces:**
- Produces DOM ids consumed by Task 8's `app.js`: `contact-service`, `contact-source` (replacing `contact-company`/`contact-position`), `deal-contact` (now `required`, no more `deal-company`), and removes `company-modal`/`company-form`/`companies-*` ids entirely — Task 8 must stop referencing them. Adds `#toast-container`.

- [ ] **Step 1: Title and brand**

Old: `  <title>CRM Intermedio · Demo</title>`
New: `  <title>Melray Intermedio · Demo</title>`

Old:
```html
        <div>
          <h1>CRM Intermedio</h1>
          <p class="subtitle-tag">Empresas, tratos con valor, tareas y actividad</p>
        </div>
```
New:
```html
        <div>
          <h1>Melray Intermedio</h1>
          <p class="subtitle-tag">Consultas con valor, pacientes, tareas y actividad</p>
        </div>
```

- [ ] **Step 2: Toolbar — search, stage filter, view toggle (drops the "Empresas" button), add-button label**

Old:
```html
              <div class="search-input-wrap">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input type="text" id="search-input" placeholder="Buscar trato, empresa o contacto...">
              </div>
              <select id="filter-stage">
                <option value="">Todas las etapas</option>
                <option value="nuevo">Nuevo</option>
                <option value="contactado">Contactado</option>
                <option value="propuesta">Propuesta</option>
                <option value="ganado">Ganado</option>
                <option value="perdido">Perdido</option>
              </select>
              <select id="sort-select">
                <option value="recent">Más recientes</option>
                <option value="value-desc">Valor: mayor a menor</option>
                <option value="value-asc">Valor: menor a mayor</option>
              </select>
            </div>
            <div class="view-toggle">
              <button type="button" data-view="kanban" class="active">Pipeline</button>
              <button type="button" data-view="tabla">Tabla</button>
              <button type="button" data-view="empresas">Empresas</button>
              <button type="button" data-view="contactos">Contactos</button>
            </div>
            <div class="toolbar-actions">
              <button id="toolbar-add-btn" class="btn-primary btn-icon-text">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                <span id="toolbar-add-label">Nuevo trato</span>
              </button>
            </div>
```
New:
```html
              <div class="search-input-wrap">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input type="text" id="search-input" placeholder="Buscar consulta o paciente...">
              </div>
              <select id="filter-stage">
                <option value="">Todas las etapas</option>
                <option value="nuevo">Nuevo contacto</option>
                <option value="recibida">Consulta recibida</option>
                <option value="contactado">Contactado</option>
                <option value="interesado">Interesado</option>
                <option value="turno">Turno reservado</option>
                <option value="atendido">Atendido</option>
                <option value="seguimiento">Seguimiento</option>
              </select>
              <select id="sort-select">
                <option value="recent">Más recientes</option>
                <option value="value-desc">Valor: mayor a menor</option>
                <option value="value-asc">Valor: menor a mayor</option>
              </select>
            </div>
            <div class="view-toggle">
              <button type="button" data-view="kanban" class="active">Pipeline</button>
              <button type="button" data-view="tabla">Tabla</button>
              <button type="button" data-view="contactos">Pacientes</button>
            </div>
            <div class="toolbar-actions">
              <button id="toolbar-add-btn" class="btn-primary btn-icon-text">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                <span id="toolbar-add-label">Nueva consulta</span>
              </button>
            </div>
```

- [ ] **Step 3: Table sections — drop the whole "Empresas" table wrap, drop the Empresa column from deals, relabel the contacts table**

Old:
```html
          <div class="data-table-wrap hidden" id="deals-table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Trato</th>
                  <th>Empresa</th>
                  <th>Contacto</th>
                  <th>Valor</th>
                  <th>Etapa</th>
                  <th>Tareas</th>
                  <th></th>
                </tr>
              </thead>
              <tbody id="deals-table-body"></tbody>
            </table>
          </div>

          <div class="data-table-wrap hidden" id="companies-table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Empresa</th>
                  <th>Sector</th>
                  <th>Contactos</th>
                  <th>Tratos</th>
                  <th>Valor total</th>
                  <th></th>
                </tr>
              </thead>
              <tbody id="companies-table-body"></tbody>
            </table>
          </div>

          <div class="data-table-wrap hidden" id="contacts-table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Empresa</th>
                  <th>Cargo</th>
                  <th>Email</th>
                  <th>Teléfono</th>
                  <th>Etiquetas</th>
                  <th></th>
                </tr>
              </thead>
              <tbody id="contacts-table-body"></tbody>
            </table>
          </div>
```
New:
```html
          <div class="data-table-wrap hidden" id="deals-table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Consulta</th>
                  <th>Paciente</th>
                  <th>Valor</th>
                  <th>Etapa</th>
                  <th>Tareas</th>
                  <th></th>
                </tr>
              </thead>
              <tbody id="deals-table-body"></tbody>
            </table>
          </div>

          <div class="data-table-wrap hidden" id="contacts-table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Servicio</th>
                  <th>Origen</th>
                  <th>Email</th>
                  <th>Teléfono</th>
                  <th>Etiquetas</th>
                  <th></th>
                </tr>
              </thead>
              <tbody id="contacts-table-body"></tbody>
            </table>
          </div>
```

- [ ] **Step 4: Deal modal — drop the company select, make the patient select required, 7-stage options, "trato"→"consulta" copy**

Old:
```html
  <!-- Modal: Trato -->
  <div id="deal-modal" class="modal hidden">
    <div class="modal-content modal-wide">
      <div class="modal-header">
        <h2 id="deal-modal-title">Nuevo trato</h2>
        <div class="btn-icon-text">
          <button type="button" id="deal-delete-btn" class="icon-btn danger hidden" title="Eliminar trato">
```
New:
```html
  <!-- Modal: Consulta -->
  <div id="deal-modal" class="modal hidden">
    <div class="modal-content modal-wide">
      <div class="modal-header">
        <h2 id="deal-modal-title">Nueva consulta</h2>
        <div class="btn-icon-text">
          <button type="button" id="deal-delete-btn" class="icon-btn danger hidden" title="Eliminar consulta">
```

Old:
```html
      <form id="deal-form">
        <input type="hidden" id="deal-id">
        <label for="deal-title">Título del trato</label>
        <input type="text" id="deal-title" required placeholder="Ej: Renovación pedido textil">

        <div class="field-row">
          <div>
            <label for="deal-company">Empresa</label>
            <select id="deal-company" required></select>
          </div>
          <div>
            <label for="deal-contact">Contacto</label>
            <select id="deal-contact"></select>
          </div>
        </div>

        <div class="field-row">
          <div>
            <label for="deal-value">Valor (€)</label>
            <input type="number" id="deal-value" min="0" step="50" required placeholder="0">
          </div>
          <div>
            <label for="deal-stage">Etapa</label>
            <select id="deal-stage">
              <option value="nuevo">Nuevo</option>
              <option value="contactado">Contactado</option>
              <option value="propuesta">Propuesta</option>
              <option value="ganado">Ganado</option>
              <option value="perdido">Perdido</option>
            </select>
          </div>
        </div>

        <div class="modal-buttons">
          <button type="button" class="btn-secondary" data-close-modal>Cancelar</button>
          <button type="submit" class="btn-primary">Guardar trato</button>
        </div>
      </form>
```
New:
```html
      <form id="deal-form">
        <input type="hidden" id="deal-id">
        <label for="deal-title">Título de la consulta</label>
        <input type="text" id="deal-title" required placeholder="Ej: Consulta inicial — blanqueamiento dental">

        <label for="deal-contact">Paciente</label>
        <select id="deal-contact" required></select>

        <div class="field-row">
          <div>
            <label for="deal-value">Valor (€)</label>
            <input type="number" id="deal-value" min="0" step="50" required placeholder="0">
          </div>
          <div>
            <label for="deal-stage">Etapa</label>
            <select id="deal-stage">
              <option value="nuevo">Nuevo contacto</option>
              <option value="recibida">Consulta recibida</option>
              <option value="contactado">Contactado</option>
              <option value="interesado">Interesado</option>
              <option value="turno">Turno reservado</option>
              <option value="atendido">Atendido</option>
              <option value="seguimiento">Seguimiento</option>
            </select>
          </div>
        </div>

        <div class="modal-buttons">
          <button type="button" class="btn-secondary" data-close-modal>Cancelar</button>
          <button type="submit" class="btn-primary">Guardar consulta</button>
        </div>
      </form>
```

- [ ] **Step 5: Delete the entire Company modal block**

Delete this whole block verbatim (from the `<!-- Modal: Empresa -->` comment through its closing `</div>`, right before `<!-- Modal: Contacto -->`):
```html
  <!-- Modal: Empresa -->
  <div id="company-modal" class="modal hidden">
    <div class="modal-content modal-wide">
      <div class="modal-header">
        <h2 id="company-modal-title">Nueva empresa</h2>
        <div class="btn-icon-text">
          <button type="button" id="company-delete-btn" class="icon-btn danger hidden" title="Eliminar empresa">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
          </button>
          <button type="button" class="modal-close" data-close-modal aria-label="Cerrar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="6" y1="18" x2="18" y2="6"/></svg>
          </button>
        </div>
      </div>
      <form id="company-form">
        <input type="hidden" id="company-id">
        <label for="company-name">Nombre</label>
        <input type="text" id="company-name" required placeholder="Ej: Textiles Rioja">

        <div class="field-row">
          <div>
            <label for="company-sector">Sector</label>
            <input type="text" id="company-sector" placeholder="Ej: Textil">
          </div>
          <div>
            <label for="company-website">Web</label>
            <input type="text" id="company-website" placeholder="ejemplo.com">
          </div>
        </div>

        <label for="company-notes">Notas</label>
        <textarea id="company-notes" rows="2" placeholder="Notas sobre la empresa..."></textarea>

        <div class="modal-buttons">
          <button type="button" class="btn-secondary" data-close-modal>Cancelar</button>
          <button type="submit" class="btn-primary">Guardar empresa</button>
        </div>
      </form>

      <div id="company-detail-sections" class="hidden">
        <div class="detail-section">
          <p class="detail-section-title">Contactos</p>
          <div class="related-list" id="company-contacts-list"></div>
        </div>
        <div class="detail-section">
          <p class="detail-section-title">Tratos</p>
          <div class="related-list" id="company-deals-list"></div>
        </div>
      </div>
    </div>
  </div>

```
(leave the blank line separating it from the following `<!-- Modal: Contacto -->` comment as-is once removed).

- [ ] **Step 6: Contact modal — Servicio/Origen instead of Empresa/Cargo, "paciente" copy**

Old:
```html
  <!-- Modal: Contacto -->
  <div id="contact-modal" class="modal hidden">
    <div class="modal-content modal-wide">
      <div class="modal-header">
        <h2 id="contact-modal-title">Nuevo contacto</h2>
        <div class="btn-icon-text">
          <button type="button" id="contact-delete-btn" class="icon-btn danger hidden" title="Eliminar contacto">
```
New:
```html
  <!-- Modal: Paciente -->
  <div id="contact-modal" class="modal hidden">
    <div class="modal-content modal-wide">
      <div class="modal-header">
        <h2 id="contact-modal-title">Nuevo paciente</h2>
        <div class="btn-icon-text">
          <button type="button" id="contact-delete-btn" class="icon-btn danger hidden" title="Eliminar paciente">
```

Old:
```html
        <div class="field-row">
          <div>
            <label for="contact-company">Empresa</label>
            <select id="contact-company">
              <option value="">Sin empresa</option>
            </select>
          </div>
          <div>
            <label for="contact-position">Cargo</label>
            <input type="text" id="contact-position" placeholder="Ej: Responsable de Compras">
          </div>
        </div>

        <div class="field-row">
          <div>
            <label for="contact-email">Email</label>
            <input type="email" id="contact-email" placeholder="ejemplo@empresa.com">
          </div>
          <div>
            <label for="contact-phone">Teléfono</label>
            <input type="tel" id="contact-phone" placeholder="+34 600 000 000">
          </div>
        </div>

        <label>Etiquetas</label>
        <div class="tag-checkbox-group" id="contact-tags-group"></div>

        <div class="modal-buttons">
          <button type="button" class="btn-secondary" data-close-modal>Cancelar</button>
          <button type="submit" class="btn-primary">Guardar contacto</button>
        </div>
      </form>

      <div id="contact-detail-sections" class="hidden">
        <div class="detail-section">
          <p class="detail-section-title">Tratos asociados</p>
          <div class="related-list" id="contact-deals-list"></div>
        </div>
      </div>
```
New:
```html
        <div class="field-row">
          <div>
            <label for="contact-service">Servicio de interés</label>
            <input type="text" id="contact-service" placeholder="Ej: Limpieza dental">
          </div>
          <div>
            <label for="contact-source">Origen</label>
            <select id="contact-source">
              <option value="whatsapp">WhatsApp</option>
              <option value="instagram">Instagram</option>
              <option value="web">Web</option>
              <option value="telefono">Teléfono</option>
              <option value="formulario">Formulario</option>
            </select>
          </div>
        </div>

        <div class="field-row">
          <div>
            <label for="contact-email">Email</label>
            <input type="email" id="contact-email" placeholder="ejemplo@email.com">
          </div>
          <div>
            <label for="contact-phone">Teléfono</label>
            <input type="tel" id="contact-phone" placeholder="+34 600 000 000">
          </div>
        </div>

        <label>Etiquetas</label>
        <div class="tag-checkbox-group" id="contact-tags-group"></div>

        <div class="modal-buttons">
          <button type="button" class="btn-secondary" data-close-modal>Cancelar</button>
          <button type="submit" class="btn-primary">Guardar paciente</button>
        </div>
      </form>

      <div id="contact-detail-sections" class="hidden">
        <div class="detail-section">
          <p class="detail-section-title">Consultas asociadas</p>
          <div class="related-list" id="contact-deals-list"></div>
        </div>
      </div>
```

- [ ] **Step 7: Add the toast container**

Old:
```html
  <script src="js/store.js"></script>
  <script src="js/app.js"></script>
  <script src="js/theme.js"></script>
</body>
</html>
```
New:
```html
  <div id="toast-container" class="toast-container"></div>

  <script src="js/store.js"></script>
  <script src="js/app.js"></script>
  <script src="js/theme.js"></script>
</body>
</html>
```

- [ ] **Step 8: Commit**

```bash
git add index.html
git commit -m "feat(intermedio): quita Empresas del markup, Pacientes/Consultas y marca Melray"
```

### Task 8: `intermedio/js/app.js` — drop Empresas logic, patient fields, toasts

**Files:**
- Modify: `CRM/intermedio/js/app.js`

**Interfaces:**
- Consumes: `STAGES`/`stageInfo`/`TAGS`/`tagInfo`/`ACTIVITY_TYPES`/`activityTypeLabel`/`uid`/`loadData`/`saveData` (Task 6); DOM ids from Task 7 (`contact-service`, `contact-source`, `deal-contact` now required, no more `deal-company`/`company-*`, `#toast-container`).
- Produces: `showToast(message)`, `notifyStatusChange(newStage, previousStage)`, `sourceLabel(key)` — same signatures reused verbatim in `completo` (Task 13).

- [ ] **Step 1: Lookups — drop company helpers, add `sourceLabel`**

Old:
```js
function companyById(id) { return data.companies.find((c) => c.id === id); }
function contactById(id) { return data.contacts.find((c) => c.id === id); }
function dealById(id) { return data.deals.find((d) => d.id === id); }
function contactsByCompany(companyId) { return data.contacts.filter((c) => c.companyId === companyId); }
function dealsByCompany(companyId) { return data.deals.filter((d) => d.companyId === companyId); }
function dealsByContact(contactId) { return data.deals.filter((d) => d.contactId === contactId); }
```
New:
```js
function contactById(id) { return data.contacts.find((c) => c.id === id); }
function dealById(id) { return data.deals.find((d) => d.id === id); }
function dealsByContact(contactId) { return data.deals.filter((d) => d.contactId === contactId); }

const SOURCE_LABELS = { whatsapp: 'WhatsApp', instagram: 'Instagram', web: 'Web', telefono: 'Teléfono', formulario: 'Formulario' };
function sourceLabel(key) { return SOURCE_LABELS[key] || key || '—'; }
```

- [ ] **Step 2: `els` — drop `dealCompany`/company refs/`companies*`, replace contact company/position with service/source**

Old:
```js
  dealsTableWrap: document.getElementById('deals-table-wrap'),
  dealsTableBody: document.getElementById('deals-table-body'),
  companiesTableWrap: document.getElementById('companies-table-wrap'),
  companiesTableBody: document.getElementById('companies-table-body'),
  contactsTableWrap: document.getElementById('contacts-table-wrap'),
```
New:
```js
  dealsTableWrap: document.getElementById('deals-table-wrap'),
  dealsTableBody: document.getElementById('deals-table-body'),
  contactsTableWrap: document.getElementById('contacts-table-wrap'),
```

Old:
```js
  dealCompany: document.getElementById('deal-company'),
  dealContact: document.getElementById('deal-contact'),
```
New:
```js
  dealContact: document.getElementById('deal-contact'),
```

Old:
```js
  companyModal: document.getElementById('company-modal'),
  companyModalTitle: document.getElementById('company-modal-title'),
  companyForm: document.getElementById('company-form'),
  companyId: document.getElementById('company-id'),
  companyName: document.getElementById('company-name'),
  companySector: document.getElementById('company-sector'),
  companyWebsite: document.getElementById('company-website'),
  companyNotes: document.getElementById('company-notes'),
  companyDeleteBtn: document.getElementById('company-delete-btn'),
  companyDetailSections: document.getElementById('company-detail-sections'),
  companyContactsList: document.getElementById('company-contacts-list'),
  companyDealsList: document.getElementById('company-deals-list'),

  contactModal: document.getElementById('contact-modal'),
  contactModalTitle: document.getElementById('contact-modal-title'),
  contactForm: document.getElementById('contact-form'),
  contactId: document.getElementById('contact-id'),
  contactName: document.getElementById('contact-name'),
  contactCompany: document.getElementById('contact-company'),
  contactPosition: document.getElementById('contact-position'),
  contactEmail: document.getElementById('contact-email'),
```
New:
```js
  contactModal: document.getElementById('contact-modal'),
  contactModalTitle: document.getElementById('contact-modal-title'),
  contactForm: document.getElementById('contact-form'),
  contactId: document.getElementById('contact-id'),
  contactName: document.getElementById('contact-name'),
  contactService: document.getElementById('contact-service'),
  contactSource: document.getElementById('contact-source'),
  contactEmail: document.getElementById('contact-email'),
```

Old:
```js
let editingDealId = null;
let editingCompanyId = null;
let editingContactId = null;
```
New:
```js
let editingDealId = null;
let editingContactId = null;
```

- [ ] **Step 3: `renderStats` — active-stage list and "ganado"→"atendido", plus add `showToast`/`notifyStatusChange`**

Old:
```js
function renderStats() {
  const activeStages = ['nuevo', 'contactado', 'propuesta'];
  const activeDeals = data.deals.filter((d) => activeStages.includes(d.stage));
  const pipelineValue = activeDeals.reduce((sum, d) => sum + d.value, 0);
  const wonValue = data.deals.filter((d) => d.stage === 'ganado').reduce((sum, d) => sum + d.value, 0);
  const pendingTasks = data.tasks.filter((t) => !t.completed);
  const overdueTasks = pendingTasks.filter((t) => t.dueDate < Date.now());

  els.statsGrid.innerHTML = `
    <div class="stat-card total">
      <span class="stat-value">${formatCurrency(pipelineValue)}</span>
      <span class="stat-label">Valor en pipeline</span>
    </div>
    <div class="stat-card">
      <span class="stat-value">${activeDeals.length}</span>
      <span class="stat-label">Tratos activos</span>
    </div>
    <div class="stat-card">
      <span class="stat-value">${formatCurrency(wonValue)}</span>
      <span class="stat-label"><span class="stat-dot" style="background:${stageInfo('ganado').color}"></span>Valor ganado</span>
    </div>
    <div class="stat-card">
      <span class="stat-value">${pendingTasks.length}</span>
      <span class="stat-label">Tareas pendientes</span>
    </div>
    <div class="stat-card ${overdueTasks.length ? 'warning' : ''}">
      <span class="stat-value">${overdueTasks.length}</span>
      <span class="stat-label">Tareas vencidas</span>
    </div>
  `;
}
```
New:
```js
function renderStats() {
  const activeStages = ['nuevo', 'recibida', 'contactado', 'interesado', 'turno'];
  const activeDeals = data.deals.filter((d) => activeStages.includes(d.stage));
  const pipelineValue = activeDeals.reduce((sum, d) => sum + d.value, 0);
  const attendedValue = data.deals.filter((d) => d.stage === 'atendido').reduce((sum, d) => sum + d.value, 0);
  const pendingTasks = data.tasks.filter((t) => !t.completed);
  const overdueTasks = pendingTasks.filter((t) => t.dueDate < Date.now());

  els.statsGrid.innerHTML = `
    <div class="stat-card total">
      <span class="stat-value">${formatCurrency(pipelineValue)}</span>
      <span class="stat-label">Valor en pipeline</span>
    </div>
    <div class="stat-card">
      <span class="stat-value">${activeDeals.length}</span>
      <span class="stat-label">Consultas activas</span>
    </div>
    <div class="stat-card">
      <span class="stat-value">${formatCurrency(attendedValue)}</span>
      <span class="stat-label"><span class="stat-dot" style="background:${stageInfo('atendido').color}"></span>Valor atendido</span>
    </div>
    <div class="stat-card">
      <span class="stat-value">${pendingTasks.length}</span>
      <span class="stat-label">Tareas pendientes</span>
    </div>
    <div class="stat-card ${overdueTasks.length ? 'warning' : ''}">
      <span class="stat-value">${overdueTasks.length}</span>
      <span class="stat-label">Tareas vencidas</span>
    </div>
  `;
}

function showToast(message) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span class="toast-icon">🔥</span><span>${escapeHtml(message)}</span>`;
  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

function notifyStatusChange(newStage, previousStage) {
  if (newStage === previousStage) return;
  if (newStage === 'turno') showToast('Booked. We love to see it.');
  else if (newStage === 'atendido') showToast('Nice work.');
}
```

- [ ] **Step 4: Filtering — drop company matching everywhere, delete `getFilteredCompanies`**

Old:
```js
function getFilteredDeals() {
  let list = data.deals.slice();
  const term = searchTerm.trim().toLowerCase();
  if (term) {
    list = list.filter((d) => {
      const company = companyById(d.companyId);
      const contact = contactById(d.contactId);
      return d.title.toLowerCase().includes(term)
        || (company && company.name.toLowerCase().includes(term))
        || (contact && contact.name.toLowerCase().includes(term));
    });
  }
  if (stageFilter) list = list.filter((d) => d.stage === stageFilter);

  if (sortMode === 'value-desc') list.sort((a, b) => b.value - a.value);
  else if (sortMode === 'value-asc') list.sort((a, b) => a.value - b.value);
  else list.sort((a, b) => b.createdAt - a.createdAt);

  return list;
}

function getFilteredCompanies() {
  let list = data.companies.slice();
  const term = searchTerm.trim().toLowerCase();
  if (term) list = list.filter((c) => c.name.toLowerCase().includes(term) || (c.sector || '').toLowerCase().includes(term));
  return list.sort((a, b) => a.name.localeCompare(b.name));
}

function getFilteredContacts() {
  let list = data.contacts.slice();
  const term = searchTerm.trim().toLowerCase();
  if (term) {
    list = list.filter((c) => {
      const company = companyById(c.companyId);
      return c.name.toLowerCase().includes(term)
        || (company && company.name.toLowerCase().includes(term))
        || (c.email || '').toLowerCase().includes(term);
    });
  }
  return list.sort((a, b) => a.name.localeCompare(b.name));
}
```
New:
```js
function getFilteredDeals() {
  let list = data.deals.slice();
  const term = searchTerm.trim().toLowerCase();
  if (term) {
    list = list.filter((d) => {
      const contact = contactById(d.contactId);
      return d.title.toLowerCase().includes(term)
        || (contact && contact.name.toLowerCase().includes(term));
    });
  }
  if (stageFilter) list = list.filter((d) => d.stage === stageFilter);

  if (sortMode === 'value-desc') list.sort((a, b) => b.value - a.value);
  else if (sortMode === 'value-asc') list.sort((a, b) => a.value - b.value);
  else list.sort((a, b) => b.createdAt - a.createdAt);

  return list;
}

function getFilteredContacts() {
  let list = data.contacts.slice();
  const term = searchTerm.trim().toLowerCase();
  if (term) {
    list = list.filter((c) => {
      return c.name.toLowerCase().includes(term)
        || (c.service || '').toLowerCase().includes(term)
        || (c.email || '').toLowerCase().includes(term);
    });
  }
  return list.sort((a, b) => a.name.localeCompare(b.name));
}
```

- [ ] **Step 5: Kanban — card shows service, drop notifies on drop**

Old:
```js
    const cardsHtml = items.length
      ? items.map((d) => {
        const company = companyById(d.companyId);
        const pending = pendingTasksForDeal(d.id).sort((a, b) => a.dueDate - b.dueDate)[0];
        const overdue = pending && pending.dueDate < Date.now();
        return `
          <div class="kanban-card" draggable="true" data-id="${d.id}">
            <h4>${escapeHtml(d.title)}</h4>
            <p class="card-company">${company ? escapeHtml(company.name) : 'Sin empresa'}</p>
            <p class="card-value">${formatCurrency(d.value)}</p>
            <div class="card-footer">
              ${pending ? `<span class="card-task-badge ${overdue ? 'overdue' : ''}">📅 ${formatDate(pending.dueDate)}</span>` : '<span></span>'}
            </div>
          </div>
        `;
      }).join('')
      : '<p class="kanban-empty">Sin tratos</p>';
```
New:
```js
    const cardsHtml = items.length
      ? items.map((d) => {
        const contact = contactById(d.contactId);
        const pending = pendingTasksForDeal(d.id).sort((a, b) => a.dueDate - b.dueDate)[0];
        const overdue = pending && pending.dueDate < Date.now();
        return `
          <div class="kanban-card" draggable="true" data-id="${d.id}">
            <h4>${escapeHtml(d.title)}</h4>
            <p class="card-company">${contact ? escapeHtml(contact.service || 'Sin servicio') : 'Sin paciente'}</p>
            <p class="card-value">${formatCurrency(d.value)}</p>
            <div class="card-footer">
              ${pending ? `<span class="card-task-badge ${overdue ? 'overdue' : ''}">📅 ${formatDate(pending.dueDate)}</span>` : '<span></span>'}
            </div>
          </div>
        `;
      }).join('')
      : '<p class="kanban-empty">Sin consultas</p>';
```

Old:
```js
      if (deal && deal.stage !== newStage) {
        deal.stage = newStage;
        saveData(data);
        renderAll();
      }
```
New:
```js
      if (deal && deal.stage !== newStage) {
        const previousStage = deal.stage;
        deal.stage = newStage;
        notifyStatusChange(newStage, previousStage);
        saveData(data);
        renderAll();
      }
```

- [ ] **Step 6: Deals table — drop the Empresa column and lookup, colspan 7→6**

Old:
```js
function renderDealsTable() {
  const filtered = getFilteredDeals();
  if (!filtered.length) {
    els.dealsTableBody.innerHTML = '<tr><td colspan="7" class="empty-text">No hay tratos que coincidan con la búsqueda.</td></tr>';
    return;
  }
  els.dealsTableBody.innerHTML = filtered.map((d) => {
    const company = companyById(d.companyId);
    const contact = contactById(d.contactId);
    const stage = stageInfo(d.stage);
    const pendingCount = pendingTasksForDeal(d.id).length;
    return `
      <tr class="clickable" data-open-deal="${d.id}">
        <td class="cell-name">${escapeHtml(d.title)}</td>
        <td class="cell-muted">${company ? escapeHtml(company.name) : '—'}</td>
        <td class="cell-muted">${contact ? escapeHtml(contact.name) : '—'}</td>
        <td class="cell-name">${formatCurrency(d.value)}</td>
```
New:
```js
function renderDealsTable() {
  const filtered = getFilteredDeals();
  if (!filtered.length) {
    els.dealsTableBody.innerHTML = '<tr><td colspan="6" class="empty-text">No hay consultas que coincidan con la búsqueda.</td></tr>';
    return;
  }
  els.dealsTableBody.innerHTML = filtered.map((d) => {
    const contact = contactById(d.contactId);
    const stage = stageInfo(d.stage);
    const pendingCount = pendingTasksForDeal(d.id).length;
    return `
      <tr class="clickable" data-open-deal="${d.id}">
        <td class="cell-name">${escapeHtml(d.title)}</td>
        <td class="cell-muted">${contact ? escapeHtml(contact.name) : '—'}</td>
        <td class="cell-name">${formatCurrency(d.value)}</td>
```

- [ ] **Step 7: Delete `renderCompaniesTable` entirely**

Delete this whole function (comment header included):
```js
/* ---------- Companies table ---------- */

function renderCompaniesTable() {
  const filtered = getFilteredCompanies();
  if (!filtered.length) {
    els.companiesTableBody.innerHTML = '<tr><td colspan="6" class="empty-text">No hay empresas que coincidan con la búsqueda.</td></tr>';
    return;
  }
  els.companiesTableBody.innerHTML = filtered.map((c) => {
    const contactsCount = contactsByCompany(c.id).length;
    const deals = dealsByCompany(c.id);
    const totalValue = deals.reduce((sum, d) => sum + d.value, 0);
    return `
      <tr class="clickable" data-open-company="${c.id}">
        <td class="cell-name">${escapeHtml(c.name)}</td>
        <td class="cell-muted">${escapeHtml(c.sector || '—')}</td>
        <td class="cell-muted">${contactsCount}</td>
        <td class="cell-muted">${deals.length}</td>
        <td class="cell-name">${formatCurrency(totalValue)}</td>
        <td>
          <div class="row-actions">
            <button class="icon-btn" title="Editar" data-open-company="${c.id}">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z"/></svg>
            </button>
            <button class="icon-btn danger" title="Eliminar" data-delete-company="${c.id}">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  els.companiesTableBody.querySelectorAll('[data-open-company]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      openCompanyModal(el.dataset.openCompany);
    });
  });
  els.companiesTableBody.querySelectorAll('[data-delete-company]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteCompany(btn.dataset.deleteCompany);
    });
  });
}

```

- [ ] **Step 8: Contacts table — service/source columns**

Old:
```js
function renderContactsTable() {
  const filtered = getFilteredContacts();
  if (!filtered.length) {
    els.contactsTableBody.innerHTML = '<tr><td colspan="7" class="empty-text">No hay contactos que coincidan con la búsqueda.</td></tr>';
    return;
  }
  els.contactsTableBody.innerHTML = filtered.map((c) => {
    const company = companyById(c.companyId);
    const tagsHtml = (c.tags || []).map((tk) => {
      const t = tagInfo(tk);
      return t ? `<span class="tag-chip" style="background:${t.color}22;color:${t.color}">${t.label}</span>` : '';
    }).join('');
    return `
      <tr class="clickable" data-open-contact="${c.id}">
        <td class="cell-name">${escapeHtml(c.name)}</td>
        <td class="cell-muted">${company ? escapeHtml(company.name) : '—'}</td>
        <td class="cell-muted">${escapeHtml(c.position || '—')}</td>
        <td class="cell-muted">${escapeHtml(c.email || '—')}</td>
```
New:
```js
function renderContactsTable() {
  const filtered = getFilteredContacts();
  if (!filtered.length) {
    els.contactsTableBody.innerHTML = '<tr><td colspan="7" class="empty-text">No hay pacientes que coincidan con la búsqueda.</td></tr>';
    return;
  }
  els.contactsTableBody.innerHTML = filtered.map((c) => {
    const tagsHtml = (c.tags || []).map((tk) => {
      const t = tagInfo(tk);
      return t ? `<span class="tag-chip" style="background:${t.color}22;color:${t.color}">${t.label}</span>` : '';
    }).join('');
    return `
      <tr class="clickable" data-open-contact="${c.id}">
        <td class="cell-name">${escapeHtml(c.name)}</td>
        <td class="cell-muted">${escapeHtml(c.service || '—')}</td>
        <td class="cell-muted">${sourceLabel(c.source)}</td>
        <td class="cell-muted">${escapeHtml(c.email || '—')}</td>
```

- [ ] **Step 9: View switching — drop the "empresas" view everywhere**

Old:
```js
function updateToolbarForView() {
  const dealsView = currentView === 'kanban' || currentView === 'tabla';
  els.filterStage.classList.toggle('hidden', !dealsView);
  els.sortSelect.classList.toggle('hidden', !dealsView);

  if (currentView === 'empresas') {
    els.toolbarAddLabel.textContent = 'Nueva empresa';
  } else if (currentView === 'contactos') {
    els.toolbarAddLabel.textContent = 'Nuevo contacto';
  } else {
    els.toolbarAddLabel.textContent = 'Nuevo trato';
  }
}

function renderAll() {
  renderStats();
  renderTaskSidebar();
  updateToolbarForView();

  els.kanbanBoard.classList.add('hidden');
  els.dealsTableWrap.classList.add('hidden');
  els.companiesTableWrap.classList.add('hidden');
  els.contactsTableWrap.classList.add('hidden');

  if (currentView === 'kanban') {
    els.kanbanBoard.classList.remove('hidden');
    renderKanban();
  } else if (currentView === 'tabla') {
    els.dealsTableWrap.classList.remove('hidden');
    renderDealsTable();
  } else if (currentView === 'empresas') {
    els.companiesTableWrap.classList.remove('hidden');
    renderCompaniesTable();
  } else if (currentView === 'contactos') {
    els.contactsTableWrap.classList.remove('hidden');
    renderContactsTable();
  }
}
```
New:
```js
function updateToolbarForView() {
  const dealsView = currentView === 'kanban' || currentView === 'tabla';
  els.filterStage.classList.toggle('hidden', !dealsView);
  els.sortSelect.classList.toggle('hidden', !dealsView);

  if (currentView === 'contactos') {
    els.toolbarAddLabel.textContent = 'Nuevo paciente';
  } else {
    els.toolbarAddLabel.textContent = 'Nueva consulta';
  }
}

function renderAll() {
  renderStats();
  renderTaskSidebar();
  updateToolbarForView();

  els.kanbanBoard.classList.add('hidden');
  els.dealsTableWrap.classList.add('hidden');
  els.contactsTableWrap.classList.add('hidden');

  if (currentView === 'kanban') {
    els.kanbanBoard.classList.remove('hidden');
    renderKanban();
  } else if (currentView === 'tabla') {
    els.dealsTableWrap.classList.remove('hidden');
    renderDealsTable();
  } else if (currentView === 'contactos') {
    els.contactsTableWrap.classList.remove('hidden');
    renderContactsTable();
  }
}
```

- [ ] **Step 10: Deal modal — drop company select, patient required, "consulta" copy, notify on stage change**

Old:
```js
function populateDealCompanySelect() {
  els.dealCompany.innerHTML = data.companies.map((c) => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('');
}

function populateDealContactSelect(companyId) {
  const contacts = companyId ? contactsByCompany(companyId) : data.contacts;
  els.dealContact.innerHTML = '<option value="">Sin contacto</option>' + contacts.map((c) => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('');
}
```
New:
```js
function populateDealContactSelect() {
  els.dealContact.innerHTML = data.contacts.map((c) => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('');
}
```

Old:
```js
function openDealModal(id) {
  editingDealId = id || null;
  populateDealCompanySelect();

  if (id) {
    const deal = dealById(id);
    els.dealModalTitle.textContent = 'Editar trato';
    els.dealId.value = deal.id;
    els.dealTitle.value = deal.title;
    els.dealCompany.value = deal.companyId;
    populateDealContactSelect(deal.companyId);
    els.dealContact.value = deal.contactId || '';
    els.dealValue.value = deal.value;
    els.dealStage.value = deal.stage;
    els.dealDeleteBtn.classList.remove('hidden');
    els.dealDetailSections.classList.remove('hidden');
    renderDealTasks(id);
    renderDealActivities(id);
  } else {
    els.dealModalTitle.textContent = 'Nuevo trato';
    els.dealForm.reset();
    els.dealId.value = '';
    populateDealContactSelect('');
    els.dealStage.value = 'nuevo';
    els.dealDeleteBtn.classList.add('hidden');
    els.dealDetailSections.classList.add('hidden');
  }

  els.dealModal.classList.remove('hidden');
}

function handleDealFormSubmit(e) {
  e.preventDefault();
  const payload = {
    title: els.dealTitle.value.trim(),
    companyId: els.dealCompany.value,
    contactId: els.dealContact.value || null,
    value: Number(els.dealValue.value) || 0,
    stage: els.dealStage.value,
  };
  if (!payload.title || !payload.companyId) return;

  if (editingDealId) {
    Object.assign(dealById(editingDealId), payload);
  } else {
    data.deals.push({ id: uid(), ...payload, createdAt: Date.now() });
  }
  saveData(data);
  closeModal(els.dealModal);
  renderAll();
}
```
New:
```js
function openDealModal(id) {
  editingDealId = id || null;
  populateDealContactSelect();

  if (id) {
    const deal = dealById(id);
    els.dealModalTitle.textContent = 'Editar consulta';
    els.dealId.value = deal.id;
    els.dealTitle.value = deal.title;
    els.dealContact.value = deal.contactId || '';
    els.dealValue.value = deal.value;
    els.dealStage.value = deal.stage;
    els.dealDeleteBtn.classList.remove('hidden');
    els.dealDetailSections.classList.remove('hidden');
    renderDealTasks(id);
    renderDealActivities(id);
  } else {
    els.dealModalTitle.textContent = 'Nueva consulta';
    els.dealForm.reset();
    els.dealId.value = '';
    els.dealStage.value = 'nuevo';
    els.dealDeleteBtn.classList.add('hidden');
    els.dealDetailSections.classList.add('hidden');
  }

  els.dealModal.classList.remove('hidden');
}

function handleDealFormSubmit(e) {
  e.preventDefault();
  const payload = {
    title: els.dealTitle.value.trim(),
    contactId: els.dealContact.value,
    value: Number(els.dealValue.value) || 0,
    stage: els.dealStage.value,
  };
  if (!payload.title || !payload.contactId) return;

  if (editingDealId) {
    const deal = dealById(editingDealId);
    const previousStage = deal.stage;
    Object.assign(deal, payload);
    notifyStatusChange(deal.stage, previousStage);
  } else {
    data.deals.push({ id: uid(), ...payload, createdAt: Date.now() });
  }
  saveData(data);
  closeModal(els.dealModal);
  renderAll();
}
```

- [ ] **Step 11: `deleteDeal` confirm copy**

Old:
```js
  if (!confirm(`¿Eliminar el trato "${deal.title}"? También se eliminarán sus tareas y actividad asociadas.`)) return;
```
New:
```js
  if (!confirm(`¿Eliminar la consulta "${deal.title}"? También se eliminarán sus tareas y actividad asociadas.`)) return;
```

- [ ] **Step 12: Delete the entire Company modal section**

Delete this whole block (comment header through `deleteCompany`'s closing `}`):
```js
/* ---------- Company modal ---------- */

function renderCompanyRelated(companyId) {
  const contacts = contactsByCompany(companyId);
  els.companyContactsList.innerHTML = contacts.length ? contacts.map((c) => `
    <div class="related-item">
      <div>
        <div class="related-main">${escapeHtml(c.name)}</div>
        <div class="related-sub">${escapeHtml(c.position || 'Sin cargo')}</div>
      </div>
    </div>
  `).join('') : '<p class="empty-text">Sin contactos</p>';

  const deals = dealsByCompany(companyId);
  els.companyDealsList.innerHTML = deals.length ? deals.map((d) => {
    const stage = stageInfo(d.stage);
    return `
      <div class="related-item">
        <div>
          <div class="related-main">${escapeHtml(d.title)}</div>
          <div class="related-sub">${formatCurrency(d.value)}</div>
        </div>
        <span class="status-badge" style="background:${stage.color}22;color:${stage.color}">${stage.label}</span>
      </div>
    `;
  }).join('') : '<p class="empty-text">Sin tratos</p>';
}

function openCompanyModal(id) {
  editingCompanyId = id || null;

  if (id) {
    const company = companyById(id);
    els.companyModalTitle.textContent = 'Editar empresa';
    els.companyId.value = company.id;
    els.companyName.value = company.name;
    els.companySector.value = company.sector || '';
    els.companyWebsite.value = company.website || '';
    els.companyNotes.value = company.notes || '';
    els.companyDeleteBtn.classList.remove('hidden');
    els.companyDetailSections.classList.remove('hidden');
    renderCompanyRelated(id);
  } else {
    els.companyModalTitle.textContent = 'Nueva empresa';
    els.companyForm.reset();
    els.companyId.value = '';
    els.companyDeleteBtn.classList.add('hidden');
    els.companyDetailSections.classList.add('hidden');
  }

  els.companyModal.classList.remove('hidden');
}

function handleCompanyFormSubmit(e) {
  e.preventDefault();
  const payload = {
    name: els.companyName.value.trim(),
    sector: els.companySector.value.trim(),
    website: els.companyWebsite.value.trim(),
    notes: els.companyNotes.value.trim(),
  };
  if (!payload.name) return;

  if (editingCompanyId) {
    Object.assign(companyById(editingCompanyId), payload);
  } else {
    data.companies.push({ id: uid(), ...payload, createdAt: Date.now() });
  }
  saveData(data);
  closeModal(els.companyModal);
  renderAll();
}

function deleteCompany(id) {
  const company = companyById(id);
  if (!company) return;
  const linkedContacts = contactsByCompany(id).length;
  const linkedDeals = dealsByCompany(id).length;
  const warning = (linkedContacts || linkedDeals)
    ? ` Tiene ${linkedContacts} contacto(s) y ${linkedDeals} trato(s) que quedarán sin empresa asignada.`
    : '';
  if (!confirm(`¿Eliminar la empresa "${company.name}"?${warning}`)) return;

  data.companies = data.companies.filter((c) => c.id !== id);
  data.contacts.forEach((c) => { if (c.companyId === id) c.companyId = null; });
  data.deals.forEach((d) => { if (d.companyId === id) d.companyId = null; });
  saveData(data);
  closeModal(els.companyModal);
  renderAll();
}

```

- [ ] **Step 13: Contact modal — service/source, "paciente" copy, toast on create**

Old:
```js
/* ---------- Contact modal ---------- */

function populateContactCompanySelect() {
  els.contactCompany.innerHTML = '<option value="">Sin empresa</option>'
    + data.companies.map((c) => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('');
}

function renderContactTagsCheckboxes(selectedTags) {
```
New:
```js
/* ---------- Contact modal ---------- */

function renderContactTagsCheckboxes(selectedTags) {
```

Old:
```js
function openContactModal(id) {
  editingContactId = id || null;
  populateContactCompanySelect();

  if (id) {
    const contact = contactById(id);
    els.contactModalTitle.textContent = 'Editar contacto';
    els.contactId.value = contact.id;
    els.contactName.value = contact.name;
    els.contactCompany.value = contact.companyId || '';
    els.contactPosition.value = contact.position || '';
    els.contactEmail.value = contact.email || '';
    els.contactPhone.value = contact.phone || '';
    renderContactTagsCheckboxes(contact.tags || []);
    els.contactDeleteBtn.classList.remove('hidden');
    els.contactDetailSections.classList.remove('hidden');
    renderContactDeals(id);
  } else {
    els.contactModalTitle.textContent = 'Nuevo contacto';
    els.contactForm.reset();
    els.contactId.value = '';
    renderContactTagsCheckboxes([]);
    els.contactDeleteBtn.classList.add('hidden');
    els.contactDetailSections.classList.add('hidden');
  }

  els.contactModal.classList.remove('hidden');
}

function handleContactFormSubmit(e) {
  e.preventDefault();
  const payload = {
    name: els.contactName.value.trim(),
    companyId: els.contactCompany.value || null,
    position: els.contactPosition.value.trim(),
    email: els.contactEmail.value.trim(),
    phone: els.contactPhone.value.trim(),
    tags: getSelectedContactTags(),
  };
  if (!payload.name) return;

  if (editingContactId) {
    Object.assign(contactById(editingContactId), payload);
  } else {
    data.contacts.push({ id: uid(), ...payload, createdAt: Date.now() });
  }
  saveData(data);
  closeModal(els.contactModal);
  renderAll();
}

function deleteContact(id) {
  const contact = contactById(id);
  if (!contact) return;
  const linkedDeals = dealsByContact(id).length;
  const warning = linkedDeals ? ` Tiene ${linkedDeals} trato(s) que quedarán sin contacto asignado.` : '';
  if (!confirm(`¿Eliminar a ${contact.name}?${warning}`)) return;

  data.contacts = data.contacts.filter((c) => c.id !== id);
  data.deals.forEach((d) => { if (d.contactId === id) d.contactId = null; });
  saveData(data);
  closeModal(els.contactModal);
  renderAll();
}
```
New:
```js
function openContactModal(id) {
  editingContactId = id || null;

  if (id) {
    const contact = contactById(id);
    els.contactModalTitle.textContent = 'Editar paciente';
    els.contactId.value = contact.id;
    els.contactName.value = contact.name;
    els.contactService.value = contact.service || '';
    els.contactSource.value = contact.source || 'whatsapp';
    els.contactEmail.value = contact.email || '';
    els.contactPhone.value = contact.phone || '';
    renderContactTagsCheckboxes(contact.tags || []);
    els.contactDeleteBtn.classList.remove('hidden');
    els.contactDetailSections.classList.remove('hidden');
    renderContactDeals(id);
  } else {
    els.contactModalTitle.textContent = 'Nuevo paciente';
    els.contactForm.reset();
    els.contactId.value = '';
    renderContactTagsCheckboxes([]);
    els.contactDeleteBtn.classList.add('hidden');
    els.contactDetailSections.classList.add('hidden');
  }

  els.contactModal.classList.remove('hidden');
}

function handleContactFormSubmit(e) {
  e.preventDefault();
  const payload = {
    name: els.contactName.value.trim(),
    service: els.contactService.value.trim(),
    source: els.contactSource.value,
    email: els.contactEmail.value.trim(),
    phone: els.contactPhone.value.trim(),
    tags: getSelectedContactTags(),
  };
  if (!payload.name) return;

  if (editingContactId) {
    Object.assign(contactById(editingContactId), payload);
  } else {
    data.contacts.push({ id: uid(), ...payload, createdAt: Date.now() });
    showToast('New patient unlocked.');
  }
  saveData(data);
  closeModal(els.contactModal);
  renderAll();
}

function deleteContact(id) {
  const contact = contactById(id);
  if (!contact) return;
  const linkedDeals = dealsByContact(id).length;
  const warning = linkedDeals ? ` Tiene ${linkedDeals} consulta(s) que quedarán sin paciente asignado.` : '';
  if (!confirm(`¿Eliminar a ${contact.name}?${warning}`)) return;

  data.contacts = data.contacts.filter((c) => c.id !== id);
  data.deals.forEach((d) => { if (d.contactId === id) d.contactId = null; });
  saveData(data);
  closeModal(els.contactModal);
  renderAll();
}
```

- [ ] **Step 14: Modal helpers — drop `editingCompanyId`**

Old:
```js
function closeModal(modal) {
  modal.classList.add('hidden');
  editingDealId = null;
  editingCompanyId = null;
  editingContactId = null;
}

function closeAllModals() {
  document.querySelectorAll('.modal').forEach((m) => m.classList.add('hidden'));
  editingDealId = null;
  editingCompanyId = null;
  editingContactId = null;
}
```
New:
```js
function closeModal(modal) {
  modal.classList.add('hidden');
  editingDealId = null;
  editingContactId = null;
}

function closeAllModals() {
  document.querySelectorAll('.modal').forEach((m) => m.classList.add('hidden'));
  editingDealId = null;
  editingContactId = null;
}
```

- [ ] **Step 15: `init()` — drop the "empresas" toolbar case, the company-select change listener, and all company form wiring**

Old:
```js
  els.toolbarAddBtn.addEventListener('click', () => {
    if (currentView === 'empresas') openCompanyModal(null);
    else if (currentView === 'contactos') openContactModal(null);
    else openDealModal(null);
  });

  els.dealForm.addEventListener('submit', handleDealFormSubmit);
  els.dealDeleteBtn.addEventListener('click', () => deleteDeal(editingDealId));
  els.dealCompany.addEventListener('change', () => populateDealContactSelect(els.dealCompany.value));
  els.dealAddTaskBtn.addEventListener('click', () => {
```
New:
```js
  els.toolbarAddBtn.addEventListener('click', () => {
    if (currentView === 'contactos') openContactModal(null);
    else openDealModal(null);
  });

  els.dealForm.addEventListener('submit', handleDealFormSubmit);
  els.dealDeleteBtn.addEventListener('click', () => deleteDeal(editingDealId));
  els.dealAddTaskBtn.addEventListener('click', () => {
```

Old:
```js
  els.companyForm.addEventListener('submit', handleCompanyFormSubmit);
  els.companyDeleteBtn.addEventListener('click', () => deleteCompany(editingCompanyId));

  els.contactForm.addEventListener('submit', handleContactFormSubmit);
```
New:
```js
  els.contactForm.addEventListener('submit', handleContactFormSubmit);
```

- [ ] **Step 16: Commit**

```bash
git add js/app.js
git commit -m "feat(intermedio): logica sin Empresas, pacientes con servicio/origen y toasts"
```

### Task 9: `intermedio/css/style.css` — 7-column kanban and toast styles

**Files:**
- Modify: `CRM/intermedio/css/style.css`

**Note:** the `.stats-grid { grid-template-columns: repeat(5, 1fr); }` rule (around line 293) stays untouched — the Resumen page still shows exactly 5 stat cards (Task 8 kept the same 5-card layout, only relabeled "Valor ganado"→"Valor atendido" and "Tratos activos"→"Consultas activas"). Only the kanban grid (7 pipeline stages now) changes.

- [ ] **Step 1: Kanban grid, desktop**

Old:
```css
.kanban-board {
  display: grid;
  grid-template-columns: repeat(5, minmax(230px, 1fr));
  gap: 14px;
  overflow-x: auto;
  padding-bottom: 4px;
}
```
New:
```css
.kanban-board {
  display: grid;
  grid-template-columns: repeat(7, minmax(210px, 1fr));
  gap: 14px;
  overflow-x: auto;
  padding-bottom: 4px;
}
```

- [ ] **Step 2: Kanban grid, mobile/tablet media query**

Old:
```css
  .kanban-board {
    grid-template-columns: repeat(5, 240px);
  }
```
New:
```css
  .kanban-board {
    grid-template-columns: repeat(7, 220px);
  }
```

- [ ] **Step 3: Append toast component styles at the end of the file**

```css

/* ---------- Toasts ---------- */
.toast-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--surface);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 12px 16px;
  box-shadow: var(--shadow-hover);
  font-size: 13px;
  font-weight: 600;
  max-width: 320px;
  opacity: 0;
  transform: translateY(8px);
  transition: opacity 0.25s var(--ease), transform 0.25s var(--ease);
}

.toast.show {
  opacity: 1;
  transform: translateY(0);
}

.toast-icon {
  font-size: 16px;
  flex-shrink: 0;
}
```

- [ ] **Step 4: Commit**

```bash
git add css/style.css
git commit -m "feat(intermedio): kanban a 7 etapas y estilos de toast"
```

### Task 10: Manual verification — `intermedio`

**Files:** none (browser-only check)

- [ ] **Step 1: Clear stale data and load the page**

`localStorage.removeItem('crm_intermedio_data')`, then reload `http://localhost:8021` (the `crm-intermedio` entry already in `.claude/launch.json`).

- [ ] **Step 2: Visual/functional checklist**

- Header says "Melray Intermedio", tab title "Melray Intermedio · Demo".
- The view-toggle row shows only Pipeline / Tabla / Pacientes — no "Empresas" button anywhere.
- Kanban has 7 columns with the new labels; dragging a card into "Turno reservado" fires the 🔥 "Booked. We love to see it." toast, into "Atendido" fires 🔥 "Nice work.".
- Switch to "Tabla": the Consultas table has no "Empresa" column (Consulta / Paciente / Valor / Etapa / Tareas / actions). Switch to "Pacientes": columns are Nombre / Servicio / Origen / Email / Teléfono / Etiquetas — Origen shows human labels (WhatsApp/Instagram/Web/Teléfono/Formulario), not raw keys.
- Open "Nueva consulta": there is no company selector, only a required "Paciente" select and the 7-stage "Etapa" select; try submitting with no patient chosen → the browser's native required-field validation blocks it.
- Open "Nuevo paciente", fill the name, save → 🔥 "New patient unlocked." toast appears.
- Toggle dark mode → toast and the new service/source fields render with dark background/text.
- Confirm no leftover reference to "Empresa" anywhere in the UI (search bar placeholder, table headers, modals).

---

## Part C — `CRM/completo`

### Task 11: `completo/js/store.js` — data model and seed (Empresas removed)

**Files:**
- Modify: `CRM/completo/js/store.js` (full file rewrite — it is 187 lines)

**Interfaces:**
- Produces: `STAGES` (7 entries), `TAGS`, `ACTIVITY_TYPES`, `EVENT_TYPES` (no `empresa` entry, `trato`→"Consultas", `contacto`→"Pacientes"), `stageInfo`, `tagInfo`, `activityTypeLabel`, `eventTypeLabel`, `uid`, `daysFromNow`, `loadData()`/`saveData()` returning/accepting `{ users, contacts, deals, tasks, activities, automations, events }` (no `companies`). `contacts[i]`: `{id, name, service, source, email, phone, tags, createdAt}`. `deals[i]`: `{id, title, contactId, ownerId, value, stage, createdAt}` (no `companyId`). `automations[i].triggerStage` uses the new stage keys. Consumed by `js/app.js` (Task 13) and `index.html`'s hardcoded `<option>` lists (Task 12).

- [ ] **Step 1: Rewrite `store.js`**

```js
const STORAGE_KEY = 'crm_completo_data';

const STAGES = [
  { key: 'nuevo', label: 'Nuevo contacto', color: '#8a7565' },
  { key: 'recibida', label: 'Consulta recibida', color: '#a9754a' },
  { key: 'contactado', label: 'Contactado', color: '#b64211' },
  { key: 'interesado', label: 'Interesado', color: '#df3314' },
  { key: 'turno', label: 'Turno reservado', color: '#eda100' },
  { key: 'atendido', label: 'Atendido', color: '#3f6b28' },
  { key: 'seguimiento', label: 'Seguimiento', color: '#6b8a52' },
];

const TAGS = [
  { key: 'vip', label: 'VIP', color: '#92400e' },
  { key: 'frio', label: 'Frío', color: '#8a7565' },
  { key: 'caliente', label: 'Caliente', color: '#b11e1b' },
];

const ACTIVITY_TYPES = [
  { key: 'nota', label: 'Nota' },
  { key: 'llamada', label: 'Llamada' },
  { key: 'email', label: 'Email' },
  { key: 'reunion', label: 'Reunión' },
];

const EVENT_TYPES = [
  { key: 'trato', label: 'Consultas' },
  { key: 'tarea', label: 'Tareas' },
  { key: 'contacto', label: 'Pacientes' },
  { key: 'automatizacion', label: 'Automatizaciones' },
];

function stageInfo(key) {
  return STAGES.find((s) => s.key === key) || STAGES[0];
}

function tagInfo(key) {
  return TAGS.find((t) => t.key === key);
}

function activityTypeLabel(key) {
  const t = ACTIVITY_TYPES.find((a) => a.key === key);
  return t ? t.label : key;
}

function eventTypeLabel(key) {
  const t = EVENT_TYPES.find((e) => e.key === key);
  return t ? t.label : key;
}

function uid() {
  return (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`);
}

function daysFromNow(n) {
  return Date.now() + n * 86400000;
}

function seedData() {
  const users = [
    { id: uid(), name: 'Laura Méndez', initials: 'LM', color: '#2a78d6' },
    { id: uid(), name: 'Iván Costa', initials: 'IC', color: '#1baf7a' },
    { id: uid(), name: 'Nerea Blanco', initials: 'NB', color: '#eda100' },
    { id: uid(), name: 'Óscar Reyes', initials: 'OR', color: '#4a3aa7' },
  ];
  const userByName = (n) => users.find((u) => u.name === n).id;

  const contacts = [
    { id: uid(), name: 'Marta Gil', service: 'Limpieza dental', source: 'whatsapp', email: 'marta.gil@email.com', phone: '+34 611 223 344', tags: ['caliente'], createdAt: daysFromNow(-58) },
    { id: uid(), name: 'Javier Prats', service: 'Revisión general', source: 'telefono', email: 'javier.prats@email.com', phone: '+34 622 334 455', tags: [], createdAt: daysFromNow(-49) },
    { id: uid(), name: 'Ana Belén Ruiz', service: 'Ortodoncia invisible', source: 'instagram', email: 'ab.ruiz@email.com', phone: '+34 633 445 566', tags: ['vip'], createdAt: daysFromNow(-88) },
    { id: uid(), name: 'Rubén Ibáñez', service: 'Revisión de ortodoncia', source: 'whatsapp', email: 'ruben.ibanez@email.com', phone: '+34 634 445 567', tags: [], createdAt: daysFromNow(-20) },
    { id: uid(), name: 'Carlos Fuentes', service: 'Consulta general', source: 'formulario', email: 'carlos.fuentes@email.com', phone: '+34 644 556 677', tags: [], createdAt: daysFromNow(-38) },
    { id: uid(), name: 'Lucía Herrero', service: 'Sesión de fisioterapia', source: 'web', email: 'lucia.herrero@email.com', phone: '+34 655 667 788', tags: ['vip', 'caliente'], createdAt: daysFromNow(-118) },
    { id: uid(), name: 'Pedro Salas', service: 'Peeling facial', source: 'instagram', email: 'pedro.salas@email.com', phone: '+34 666 778 899', tags: ['frio'], createdAt: daysFromNow(-28) },
    { id: uid(), name: 'Elena Campos', service: 'Sesión de botox', source: 'whatsapp', email: 'elena.campos@email.com', phone: '+34 677 889 900', tags: ['vip'], createdAt: daysFromNow(-198) },
    { id: uid(), name: 'David Montes', service: 'Blanqueamiento dental', source: 'whatsapp', email: 'david.montes@email.com', phone: '+34 688 990 011', tags: [], createdAt: daysFromNow(-68) },
    { id: uid(), name: 'Marina Vidal', service: 'Revisión anual', source: 'web', email: 'marina.vidal@email.com', phone: '+34 699 001 122', tags: ['vip'], createdAt: daysFromNow(-172) },
    { id: uid(), name: 'Jorge Ferrer', service: 'Limpieza facial', source: 'instagram', email: 'jorge.ferrer@email.com', phone: '+34 610 112 233', tags: [], createdAt: daysFromNow(-78) },
  ];
  const byContactName = (n) => contacts.find((c) => c.name === n).id;

  const deals = [
    // Pipeline actual
    { id: uid(), title: 'Consulta inicial — Limpieza dental', contactId: byContactName('Marta Gil'), ownerId: userByName('Laura Méndez'), value: 4200, stage: 'nuevo', createdAt: daysFromNow(-3) },
    { id: uid(), title: 'Consulta inicial — Revisión general', contactId: byContactName('Javier Prats'), ownerId: userByName('Óscar Reyes'), value: 1800, stage: 'nuevo', createdAt: daysFromNow(-2) },
    { id: uid(), title: 'Valoración de ortodoncia invisible', contactId: byContactName('Ana Belén Ruiz'), ownerId: userByName('Iván Costa'), value: 12500, stage: 'contactado', createdAt: daysFromNow(-5) },
    { id: uid(), title: 'Revisión de ortodoncia', contactId: byContactName('Rubén Ibáñez'), ownerId: userByName('Iván Costa'), value: 2300, stage: 'nuevo', createdAt: daysFromNow(-1) },
    { id: uid(), title: 'Consulta general de seguimiento', contactId: byContactName('Carlos Fuentes'), ownerId: userByName('Nerea Blanco'), value: 8600, stage: 'contactado', createdAt: daysFromNow(-6) },
    { id: uid(), title: 'Plan de fisioterapia', contactId: byContactName('Lucía Herrero'), ownerId: userByName('Nerea Blanco'), value: 15000, stage: 'interesado', createdAt: daysFromNow(-9) },
    { id: uid(), title: 'Peeling facial — sesión inicial', contactId: byContactName('Pedro Salas'), ownerId: userByName('Laura Méndez'), value: 3100, stage: 'interesado', createdAt: daysFromNow(-7) },
    { id: uid(), title: 'Sesión de botox', contactId: byContactName('Elena Campos'), ownerId: userByName('Óscar Reyes'), value: 6400, stage: 'atendido', createdAt: daysFromNow(-14) },
    { id: uid(), title: 'Blanqueamiento dental', contactId: byContactName('David Montes'), ownerId: userByName('Iván Costa'), value: 5200, stage: 'seguimiento', createdAt: daysFromNow(-16) },

    // Histórico (últimos ~6 meses) para informes
    { id: uid(), title: 'Revisión anual', contactId: byContactName('Marina Vidal'), ownerId: userByName('Laura Méndez'), value: 9800, stage: 'atendido', createdAt: daysFromNow(-170) },
    { id: uid(), title: 'Consulta general de seguimiento (histórico)', contactId: byContactName('Carlos Fuentes'), ownerId: userByName('Iván Costa'), value: 2200, stage: 'seguimiento', createdAt: daysFromNow(-165) },
    { id: uid(), title: 'Peeling facial — sesión de mantenimiento', contactId: byContactName('Pedro Salas'), ownerId: userByName('Nerea Blanco'), value: 3400, stage: 'atendido', createdAt: daysFromNow(-150) },
    { id: uid(), title: 'Limpieza dental semestral', contactId: byContactName('Marta Gil'), ownerId: userByName('Óscar Reyes'), value: 15600, stage: 'atendido', createdAt: daysFromNow(-140) },
    { id: uid(), title: 'Blanqueamiento dental — retoque', contactId: byContactName('David Montes'), ownerId: userByName('Laura Méndez'), value: 4100, stage: 'seguimiento', createdAt: daysFromNow(-130) },
    { id: uid(), title: 'Ortodoncia — ajuste trimestral', contactId: byContactName('Ana Belén Ruiz'), ownerId: userByName('Iván Costa'), value: 7200, stage: 'atendido', createdAt: daysFromNow(-115) },
    { id: uid(), title: 'Sesión de botox — retoque', contactId: byContactName('Elena Campos'), ownerId: userByName('Nerea Blanco'), value: 5300, stage: 'atendido', createdAt: daysFromNow(-100) },
    { id: uid(), title: 'Revisión general — seguimiento', contactId: byContactName('Javier Prats'), ownerId: userByName('Óscar Reyes'), value: 1200, stage: 'seguimiento', createdAt: daysFromNow(-90) },
    { id: uid(), title: 'Limpieza facial — mantenimiento', contactId: byContactName('Jorge Ferrer'), ownerId: userByName('Laura Méndez'), value: 2600, stage: 'atendido', createdAt: daysFromNow(-75) },
    { id: uid(), title: 'Revisión de blanqueamiento', contactId: byContactName('David Montes'), ownerId: userByName('Iván Costa'), value: 6700, stage: 'atendido', createdAt: daysFromNow(-60) },
    { id: uid(), title: 'Fisioterapia — nuevo plan', contactId: byContactName('Lucía Herrero'), ownerId: userByName('Nerea Blanco'), value: 11200, stage: 'atendido', createdAt: daysFromNow(-45) },
    { id: uid(), title: 'Limpieza dental — cita perdida', contactId: byContactName('Marta Gil'), ownerId: userByName('Óscar Reyes'), value: 1900, stage: 'seguimiento', createdAt: daysFromNow(-30) },
  ];
  const byDealTitle = (t) => deals.find((d) => d.title === t).id;
  const ownerOfDeal = (t) => deals.find((d) => d.title === t).ownerId;

  const tasks = [
    { id: uid(), dealId: byDealTitle('Consulta inicial — Limpieza dental'), ownerId: ownerOfDeal('Consulta inicial — Limpieza dental'), title: 'Llamar para confirmar la cita', dueDate: daysFromNow(-2), completed: false, createdAt: daysFromNow(-3) },
    { id: uid(), dealId: byDealTitle('Consulta inicial — Revisión general'), ownerId: ownerOfDeal('Consulta inicial — Revisión general'), title: 'Revisar historial médico previo', dueDate: daysFromNow(6), completed: false, createdAt: daysFromNow(-2) },
    { id: uid(), dealId: byDealTitle('Valoración de ortodoncia invisible'), ownerId: ownerOfDeal('Valoración de ortodoncia invisible'), title: 'Sesión de seguimiento de ortodoncia', dueDate: daysFromNow(2), completed: false, createdAt: daysFromNow(-5) },
    { id: uid(), dealId: byDealTitle('Plan de fisioterapia'), ownerId: ownerOfDeal('Plan de fisioterapia'), title: 'Enviar presupuesto de fisioterapia actualizado', dueDate: daysFromNow(1), completed: false, createdAt: daysFromNow(-4) },
    { id: uid(), dealId: byDealTitle('Peeling facial — sesión inicial'), ownerId: ownerOfDeal('Peeling facial — sesión inicial'), title: 'Confirmar fecha de la sesión de peeling', dueDate: daysFromNow(-1), completed: false, createdAt: daysFromNow(-3) },
    { id: uid(), dealId: byDealTitle('Revisión de ortodoncia'), ownerId: ownerOfDeal('Revisión de ortodoncia'), title: 'Primera llamada de contacto', dueDate: daysFromNow(4), completed: false, createdAt: daysFromNow(-1) },
    { id: uid(), dealId: byDealTitle('Consulta general de seguimiento'), ownerId: ownerOfDeal('Consulta general de seguimiento'), title: 'Preparar historial para la consulta', dueDate: daysFromNow(9), completed: false, createdAt: daysFromNow(-2) },
    { id: uid(), dealId: byDealTitle('Sesión de botox'), ownerId: ownerOfDeal('Sesión de botox'), title: 'Enviar factura de la sesión', dueDate: daysFromNow(-8), completed: true, createdAt: daysFromNow(-14) },
  ];

  const activities = [
    { id: uid(), dealId: byDealTitle('Consulta inicial — Limpieza dental'), type: 'llamada', text: 'Primer contacto telefónico, pregunta por precio de limpieza dental.', date: daysFromNow(-3) },
    { id: uid(), dealId: byDealTitle('Consulta inicial — Limpieza dental'), type: 'nota', text: 'Paciente habitual, buen historial de asistencia.', date: daysFromNow(-3) },
    { id: uid(), dealId: byDealTitle('Valoración de ortodoncia invisible'), type: 'email', text: 'Enviada información sobre ortodoncia invisible.', date: daysFromNow(-5) },
    { id: uid(), dealId: byDealTitle('Valoración de ortodoncia invisible'), type: 'reunion', text: 'Consulta presencial, muy interesada en empezar tratamiento.', date: daysFromNow(-2) },
    { id: uid(), dealId: byDealTitle('Plan de fisioterapia'), type: 'nota', text: 'Quiere ampliar el plan de fisioterapia a 2 sesiones semanales.', date: daysFromNow(-6) },
    { id: uid(), dealId: byDealTitle('Sesión de botox'), type: 'reunion', text: 'Sesión de botox realizada en consulta.', date: daysFromNow(-14) },
  ];

  const automations = [
    { id: uid(), name: 'Bienvenida tras atender', triggerStage: 'atendido', taskTitle: 'Enviar recomendaciones post-consulta', daysOffset: 1, enabled: true },
    { id: uid(), name: 'Reactivar seguimiento', triggerStage: 'seguimiento', taskTitle: 'Programar llamada de reactivación en 30 días', daysOffset: 30, enabled: true },
    { id: uid(), name: 'Seguimiento de interesados', triggerStage: 'interesado', taskTitle: 'Confirmar interés y ofrecer turno', daysOffset: 2, enabled: false },
  ];

  const events = [];
  deals.forEach((d) => {
    events.push({ id: uid(), type: 'trato', text: `Consulta creada: "${d.title}"`, date: d.createdAt });
    if (d.stage === 'atendido' || d.stage === 'seguimiento') {
      events.push({ id: uid(), type: 'trato', text: `Consulta marcada como ${stageInfo(d.stage).label}: "${d.title}"`, date: d.createdAt + 86400000 * 2 });
    }
  });
  events.push({ id: uid(), type: 'tarea', text: 'Tarea completada: "Enviar factura de la sesión"', date: daysFromNow(-8) });
  events.push({ id: uid(), type: 'contacto', text: 'Nuevo paciente: Rubén Ibáñez', date: daysFromNow(-20) });
  events.sort((a, b) => b.date - a.date);

  return { users, contacts, deals, tasks, activities, automations, events };
}

function loadData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const seeded = seedData();
    saveData(seeded);
    return seeded;
  }
  try {
    const parsed = JSON.parse(raw);
    if (!parsed.contacts || !parsed.deals || !parsed.users) throw new Error('shape');
    return parsed;
  } catch {
    const seeded = seedData();
    saveData(seeded);
    return seeded;
  }
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
```

Same `loadData` correctness note as Task 6: the shape guard drops `!parsed.companies` (it no longer exists) but **keeps** `!parsed.users` (still a real, populated field) — dropping the wrong check here would either wrongly force a reseed forever (if `companies` is kept in the guard) or silently accept genuinely broken data (if `users` is dropped from the guard). Match the `if` exactly as written above.

- [ ] **Step 2: Commit**

```bash
git add js/store.js
git commit -m "feat(completo): quita Empresas, pipeline de salud y pacientes de ejemplo"
```

### Task 12: `completo/index.html` — remove Empresas, rename Contactos→Pacientes/Tratos→Consultas

**Files:**
- Modify: `CRM/completo/index.html`

**Interfaces:**
- Produces DOM ids consumed by Task 13's `app.js`: `contact-service`, `contact-source` (replacing `contact-company`/`contact-position`), `deal-contact` (now `required`, no `deal-company`), removes `company-modal`/`company-form`/`companies-*`/`page-empresas` ids entirely, adds `#toast-container`.

- [ ] **Step 1: Title and sidenav brand**

Old: `  <title>CRM Completo · Demo</title>`
New: `  <title>Melray Completo · Demo</title>`

Old: `        <span class="sidenav-title">CRM Completo</span>`
New: `        <span class="sidenav-title">Melray Completo</span>`

- [ ] **Step 2: Nav links — drop "Empresas", rename "Tratos"→"Consultas" and "Contactos"→"Pacientes"**

Old:
```html
        <button type="button" class="sidenav-link" data-page="tratos">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
          Tratos
        </button>
        <button type="button" class="sidenav-link" data-page="empresas">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="18" rx="1"/><line x1="8" y1="7" x2="8.01" y2="7"/><line x1="12" y1="7" x2="12.01" y2="7"/><line x1="16" y1="7" x2="16.01" y2="7"/><line x1="8" y1="11" x2="8.01" y2="11"/><line x1="12" y1="11" x2="12.01" y2="11"/><line x1="16" y1="11" x2="16.01" y2="11"/><line x1="8" y1="15" x2="16" y2="15"/></svg>
          Empresas
        </button>
        <button type="button" class="sidenav-link" data-page="contactos">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          Contactos
        </button>
```
New:
```html
        <button type="button" class="sidenav-link" data-page="tratos">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
          Consultas
        </button>
        <button type="button" class="sidenav-link" data-page="contactos">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          Pacientes
        </button>
```

- [ ] **Step 3: Topbar subtitle default text + owner-filter label**

Old:
```html
            <div>
              <h1 id="page-title">Resumen</h1>
              <p class="subtitle-tag" id="page-subtitle">Visión general del negocio</p>
            </div>
          </div>
          <div class="topbar-filter" id="owner-filter-wrap">
            <label for="owner-filter">Vendedor</label>
```
New:
```html
            <div>
              <h1 id="page-title">Resumen</h1>
              <p class="subtitle-tag" id="page-subtitle">Menos WhatsApp. Menos tareas manuales. Más pacientes.</p>
            </div>
          </div>
          <div class="topbar-filter" id="owner-filter-wrap">
            <label for="owner-filter">Profesional</label>
```

- [ ] **Step 4: Resumen page — "Top vendedores" → "Top profesionales"**

Old:
```html
            <section class="panel">
              <p class="section-label">Top vendedores</p>
              <div class="ranking-list" id="home-ranking-list"></div>
            </section>
```
New:
```html
            <section class="panel">
              <p class="section-label">Top profesionales</p>
              <div class="ranking-list" id="home-ranking-list"></div>
            </section>
```

- [ ] **Step 5: Pipeline page — search placeholder, 7-stage filter, "Nueva consulta"**

Old:
```html
                  <input type="text" id="search-input" placeholder="Buscar trato, empresa o contacto...">
                </div>
                <select id="filter-stage">
                  <option value="">Todas las etapas</option>
                  <option value="nuevo">Nuevo</option>
                  <option value="contactado">Contactado</option>
                  <option value="propuesta">Propuesta</option>
                  <option value="ganado">Ganado</option>
                  <option value="perdido">Perdido</option>
                </select>
                <select id="sort-select">
                  <option value="recent">Más recientes</option>
                  <option value="value-desc">Valor: mayor a menor</option>
                  <option value="value-asc">Valor: menor a mayor</option>
                </select>
              </div>
              <div class="toolbar-actions">
                <button id="pipeline-add-deal" class="btn-primary btn-icon-text">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Nuevo trato
                </button>
              </div>
            </div>
          </section>
          <section class="panel">
            <div class="kanban-board" id="kanban-board"></div>
          </section>
        </section>
```
New:
```html
                  <input type="text" id="search-input" placeholder="Buscar consulta o paciente...">
                </div>
                <select id="filter-stage">
                  <option value="">Todas las etapas</option>
                  <option value="nuevo">Nuevo contacto</option>
                  <option value="recibida">Consulta recibida</option>
                  <option value="contactado">Contactado</option>
                  <option value="interesado">Interesado</option>
                  <option value="turno">Turno reservado</option>
                  <option value="atendido">Atendido</option>
                  <option value="seguimiento">Seguimiento</option>
                </select>
                <select id="sort-select">
                  <option value="recent">Más recientes</option>
                  <option value="value-desc">Valor: mayor a menor</option>
                  <option value="value-asc">Valor: menor a mayor</option>
                </select>
              </div>
              <div class="toolbar-actions">
                <button id="pipeline-add-deal" class="btn-primary btn-icon-text">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Nueva consulta
                </button>
              </div>
            </div>
          </section>
          <section class="panel">
            <div class="kanban-board" id="kanban-board"></div>
          </section>
        </section>
```

- [ ] **Step 6: Página Tratos → "Página: Consultas" — search placeholder, 7-stage filter, drop Empresa column**

Old:
```html
        <!-- Página: Tratos -->
        <section class="page hidden" id="page-tratos">
          <section class="panel">
            <div class="toolbar">
              <div class="toolbar-filters">
                <div class="search-input-wrap">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  <input type="text" id="deals-search-input" placeholder="Buscar trato, empresa o contacto...">
                </div>
                <select id="deals-filter-stage">
                  <option value="">Todas las etapas</option>
                  <option value="nuevo">Nuevo</option>
                  <option value="contactado">Contactado</option>
                  <option value="propuesta">Propuesta</option>
                  <option value="ganado">Ganado</option>
                  <option value="perdido">Perdido</option>
                </select>
                <select id="deals-sort-select">
                  <option value="recent">Más recientes</option>
                  <option value="value-desc">Valor: mayor a menor</option>
                  <option value="value-asc">Valor: menor a mayor</option>
                </select>
              </div>
              <div class="toolbar-actions">
                <div class="export-group">
                  <button type="button" class="btn-secondary btn-small" data-export-csv="deals">CSV</button>
                  <button type="button" class="btn-secondary btn-small" data-export-xlsx="deals">Excel</button>
                </div>
                <button id="deals-add-btn" class="btn-primary btn-icon-text">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Nuevo trato
                </button>
              </div>
            </div>
          </section>
          <section class="panel">
            <div class="data-table-wrap">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Trato</th>
                    <th>Empresa</th>
                    <th>Contacto</th>
                    <th>Responsable</th>
                    <th class="num">Valor</th>
                    <th>Etapa</th>
                    <th>Tareas</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody id="deals-table-body"></tbody>
              </table>
            </div>
          </section>
        </section>
```
New:
```html
        <!-- Página: Consultas -->
        <section class="page hidden" id="page-tratos">
          <section class="panel">
            <div class="toolbar">
              <div class="toolbar-filters">
                <div class="search-input-wrap">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  <input type="text" id="deals-search-input" placeholder="Buscar consulta o paciente...">
                </div>
                <select id="deals-filter-stage">
                  <option value="">Todas las etapas</option>
                  <option value="nuevo">Nuevo contacto</option>
                  <option value="recibida">Consulta recibida</option>
                  <option value="contactado">Contactado</option>
                  <option value="interesado">Interesado</option>
                  <option value="turno">Turno reservado</option>
                  <option value="atendido">Atendido</option>
                  <option value="seguimiento">Seguimiento</option>
                </select>
                <select id="deals-sort-select">
                  <option value="recent">Más recientes</option>
                  <option value="value-desc">Valor: mayor a menor</option>
                  <option value="value-asc">Valor: menor a mayor</option>
                </select>
              </div>
              <div class="toolbar-actions">
                <div class="export-group">
                  <button type="button" class="btn-secondary btn-small" data-export-csv="deals">CSV</button>
                  <button type="button" class="btn-secondary btn-small" data-export-xlsx="deals">Excel</button>
                </div>
                <button id="deals-add-btn" class="btn-primary btn-icon-text">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Nueva consulta
                </button>
              </div>
            </div>
          </section>
          <section class="panel">
            <div class="data-table-wrap">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Consulta</th>
                    <th>Paciente</th>
                    <th>Responsable</th>
                    <th class="num">Valor</th>
                    <th>Etapa</th>
                    <th>Tareas</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody id="deals-table-body"></tbody>
              </table>
            </div>
          </section>
        </section>
```

- [ ] **Step 7: Delete the entire "Página: Empresas" section**

Delete this whole block verbatim (from the `<!-- Página: Empresas -->` comment through its closing `</section>`, right before `<!-- Página: Contactos -->`):
```html
        <!-- Página: Empresas -->
        <section class="page hidden" id="page-empresas">
          <section class="panel">
            <div class="toolbar">
              <div class="toolbar-filters">
                <div class="search-input-wrap">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  <input type="text" id="companies-search-input" placeholder="Buscar empresa o sector...">
                </div>
              </div>
              <div class="toolbar-actions">
                <div class="export-group">
                  <button type="button" class="btn-secondary btn-small" data-export-csv="companies">CSV</button>
                  <button type="button" class="btn-secondary btn-small" data-export-xlsx="companies">Excel</button>
                </div>
                <button id="companies-add-btn" class="btn-primary btn-icon-text">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Nueva empresa
                </button>
              </div>
            </div>
          </section>
          <section class="panel">
            <div class="data-table-wrap">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Empresa</th>
                    <th>Sector</th>
                    <th class="num">Contactos</th>
                    <th class="num">Tratos</th>
                    <th class="num">Valor total</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody id="companies-table-body"></tbody>
              </table>
            </div>
          </section>
        </section>

```

- [ ] **Step 8: Página Contactos → "Página: Pacientes" — search placeholder, button, Servicio/Origen columns**

Old:
```html
        <!-- Página: Contactos -->
        <section class="page hidden" id="page-contactos">
          <section class="panel">
            <div class="toolbar">
              <div class="toolbar-filters">
                <div class="search-input-wrap">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  <input type="text" id="contacts-search-input" placeholder="Buscar contacto, empresa o email...">
                </div>
              </div>
              <div class="toolbar-actions">
                <div class="export-group">
                  <button type="button" class="btn-secondary btn-small" data-export-csv="contacts">CSV</button>
                  <button type="button" class="btn-secondary btn-small" data-export-xlsx="contacts">Excel</button>
                </div>
                <button id="contacts-add-btn" class="btn-primary btn-icon-text">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Nuevo contacto
                </button>
              </div>
            </div>
          </section>
          <section class="panel">
            <div class="data-table-wrap">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Empresa</th>
                    <th>Cargo</th>
                    <th>Email</th>
                    <th>Teléfono</th>
                    <th>Etiquetas</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody id="contacts-table-body"></tbody>
              </table>
            </div>
          </section>
        </section>
```
New:
```html
        <!-- Página: Pacientes -->
        <section class="page hidden" id="page-contactos">
          <section class="panel">
            <div class="toolbar">
              <div class="toolbar-filters">
                <div class="search-input-wrap">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  <input type="text" id="contacts-search-input" placeholder="Buscar paciente o email...">
                </div>
              </div>
              <div class="toolbar-actions">
                <div class="export-group">
                  <button type="button" class="btn-secondary btn-small" data-export-csv="contacts">CSV</button>
                  <button type="button" class="btn-secondary btn-small" data-export-xlsx="contacts">Excel</button>
                </div>
                <button id="contacts-add-btn" class="btn-primary btn-icon-text">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Nuevo paciente
                </button>
              </div>
            </div>
          </section>
          <section class="panel">
            <div class="data-table-wrap">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Servicio</th>
                    <th>Origen</th>
                    <th>Email</th>
                    <th>Teléfono</th>
                    <th>Etiquetas</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody id="contacts-table-body"></tbody>
              </table>
            </div>
          </section>
        </section>
```

- [ ] **Step 9: Informes page — ranking label, plus the two "Ingresos ganados" revenue-chart labels (Resumen and Informes) which say "ganados" because they used to sum the `ganado` stage — Task 13 repoints them at the `atendido` stage, so the labels need to match**

Old (Resumen page, `two-col` block):
```html
            <section class="panel">
              <p class="section-label">Ingresos ganados · últimos 6 meses</p>
              <div id="home-revenue-chart"></div>
            </section>
```
New:
```html
            <section class="panel">
              <p class="section-label">Ingresos atendidos · últimos 6 meses</p>
              <div id="home-revenue-chart"></div>
            </section>
```

Old (Informes page):
```html
            <section class="panel">
              <p class="section-label">Ingresos ganados por mes</p>
              <div id="chart-revenue"></div>
            </section>
            <section class="panel">
              <p class="section-label">Ranking de vendedores (valor ganado)</p>
              <div id="chart-ranking"></div>
            </section>
```
New:
```html
            <section class="panel">
              <p class="section-label">Ingresos atendidos por mes</p>
              <div id="chart-revenue"></div>
            </section>
            <section class="panel">
              <p class="section-label">Ranking de profesionales (valor atendido)</p>
              <div id="chart-ranking"></div>
            </section>
```

- [ ] **Step 10: Actividad page — feed type filter options**

Old:
```html
                <select id="feed-filter-type">
                  <option value="">Todos los tipos</option>
                  <option value="trato">Tratos</option>
                  <option value="tarea">Tareas</option>
                  <option value="contacto">Contactos</option>
                  <option value="empresa">Empresas</option>
                  <option value="automatizacion">Automatizaciones</option>
                </select>
```
New:
```html
                <select id="feed-filter-type">
                  <option value="">Todos los tipos</option>
                  <option value="trato">Consultas</option>
                  <option value="tarea">Tareas</option>
                  <option value="contacto">Pacientes</option>
                  <option value="automatizacion">Automatizaciones</option>
                </select>
```

- [ ] **Step 11: Deal modal — drop company field, patient required, 7-stage options, "consulta" copy**

Old:
```html
  <!-- Modal: Trato -->
  <div id="deal-modal" class="modal hidden">
    <div class="modal-content modal-wide">
      <div class="modal-header">
        <h2 id="deal-modal-title">Nuevo trato</h2>
        <div class="btn-icon-text">
          <button type="button" id="deal-delete-btn" class="icon-btn danger hidden" title="Eliminar trato">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
          </button>
          <button type="button" class="modal-close" data-close-modal aria-label="Cerrar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="6" y1="18" x2="18" y2="6"/></svg>
          </button>
        </div>
      </div>
      <form id="deal-form">
        <input type="hidden" id="deal-id">
        <label for="deal-title">Título del trato</label>
        <input type="text" id="deal-title" required placeholder="Ej: Renovación pedido textil">

        <div class="field-row">
          <div>
            <label for="deal-company">Empresa</label>
            <select id="deal-company" required></select>
          </div>
          <div>
            <label for="deal-contact">Contacto</label>
            <select id="deal-contact"></select>
          </div>
        </div>

        <div class="field-row">
          <div>
            <label for="deal-value">Valor (€)</label>
            <input type="number" id="deal-value" min="0" step="50" required placeholder="0">
          </div>
          <div>
            <label for="deal-stage">Etapa</label>
            <select id="deal-stage">
              <option value="nuevo">Nuevo</option>
              <option value="contactado">Contactado</option>
              <option value="propuesta">Propuesta</option>
              <option value="ganado">Ganado</option>
              <option value="perdido">Perdido</option>
            </select>
          </div>
        </div>

        <label for="deal-owner">Responsable</label>
        <select id="deal-owner" required></select>

        <div class="modal-buttons">
          <button type="button" class="btn-secondary" data-close-modal>Cancelar</button>
          <button type="submit" class="btn-primary">Guardar trato</button>
        </div>
      </form>
```
New:
```html
  <!-- Modal: Consulta -->
  <div id="deal-modal" class="modal hidden">
    <div class="modal-content modal-wide">
      <div class="modal-header">
        <h2 id="deal-modal-title">Nueva consulta</h2>
        <div class="btn-icon-text">
          <button type="button" id="deal-delete-btn" class="icon-btn danger hidden" title="Eliminar consulta">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
          </button>
          <button type="button" class="modal-close" data-close-modal aria-label="Cerrar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="6" y1="18" x2="18" y2="6"/></svg>
          </button>
        </div>
      </div>
      <form id="deal-form">
        <input type="hidden" id="deal-id">
        <label for="deal-title">Título de la consulta</label>
        <input type="text" id="deal-title" required placeholder="Ej: Consulta inicial — blanqueamiento dental">

        <label for="deal-contact">Paciente</label>
        <select id="deal-contact" required></select>

        <div class="field-row">
          <div>
            <label for="deal-value">Valor (€)</label>
            <input type="number" id="deal-value" min="0" step="50" required placeholder="0">
          </div>
          <div>
            <label for="deal-stage">Etapa</label>
            <select id="deal-stage">
              <option value="nuevo">Nuevo contacto</option>
              <option value="recibida">Consulta recibida</option>
              <option value="contactado">Contactado</option>
              <option value="interesado">Interesado</option>
              <option value="turno">Turno reservado</option>
              <option value="atendido">Atendido</option>
              <option value="seguimiento">Seguimiento</option>
            </select>
          </div>
        </div>

        <label for="deal-owner">Responsable</label>
        <select id="deal-owner" required></select>

        <div class="modal-buttons">
          <button type="button" class="btn-secondary" data-close-modal>Cancelar</button>
          <button type="submit" class="btn-primary">Guardar consulta</button>
        </div>
      </form>
```

- [ ] **Step 12: Delete the entire Company modal block**

Delete this whole block verbatim (from `<!-- Modal: Empresa -->` through its closing `</div>`, right before `<!-- Modal: Contacto -->`):
```html
  <!-- Modal: Empresa -->
  <div id="company-modal" class="modal hidden">
    <div class="modal-content modal-wide">
      <div class="modal-header">
        <h2 id="company-modal-title">Nueva empresa</h2>
        <div class="btn-icon-text">
          <button type="button" id="company-delete-btn" class="icon-btn danger hidden" title="Eliminar empresa">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
          </button>
          <button type="button" class="modal-close" data-close-modal aria-label="Cerrar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="6" y1="18" x2="18" y2="6"/></svg>
          </button>
        </div>
      </div>
      <form id="company-form">
        <input type="hidden" id="company-id">
        <label for="company-name">Nombre</label>
        <input type="text" id="company-name" required placeholder="Ej: Textiles Rioja">

        <div class="field-row">
          <div>
            <label for="company-sector">Sector</label>
            <input type="text" id="company-sector" placeholder="Ej: Textil">
          </div>
          <div>
            <label for="company-website">Web</label>
            <input type="text" id="company-website" placeholder="ejemplo.com">
          </div>
        </div>

        <label for="company-notes">Notas</label>
        <textarea id="company-notes" rows="2" placeholder="Notas sobre la empresa..."></textarea>

        <div class="modal-buttons">
          <button type="button" class="btn-secondary" data-close-modal>Cancelar</button>
          <button type="submit" class="btn-primary">Guardar empresa</button>
        </div>
      </form>

      <div id="company-detail-sections" class="hidden">
        <div class="detail-section">
          <p class="detail-section-title">Contactos</p>
          <div class="related-list" id="company-contacts-list"></div>
        </div>
        <div class="detail-section">
          <p class="detail-section-title">Tratos</p>
          <div class="related-list" id="company-deals-list"></div>
        </div>
      </div>
    </div>
  </div>

```

- [ ] **Step 13: Contact modal — Servicio/Origen instead of Empresa/Cargo, "paciente" copy**

Old:
```html
  <!-- Modal: Contacto -->
  <div id="contact-modal" class="modal hidden">
    <div class="modal-content modal-wide">
      <div class="modal-header">
        <h2 id="contact-modal-title">Nuevo contacto</h2>
        <div class="btn-icon-text">
          <button type="button" id="contact-delete-btn" class="icon-btn danger hidden" title="Eliminar contacto">
```
New:
```html
  <!-- Modal: Paciente -->
  <div id="contact-modal" class="modal hidden">
    <div class="modal-content modal-wide">
      <div class="modal-header">
        <h2 id="contact-modal-title">Nuevo paciente</h2>
        <div class="btn-icon-text">
          <button type="button" id="contact-delete-btn" class="icon-btn danger hidden" title="Eliminar paciente">
```

Old:
```html
        <div class="field-row">
          <div>
            <label for="contact-company">Empresa</label>
            <select id="contact-company">
              <option value="">Sin empresa</option>
            </select>
          </div>
          <div>
            <label for="contact-position">Cargo</label>
            <input type="text" id="contact-position" placeholder="Ej: Responsable de Compras">
          </div>
        </div>

        <div class="field-row">
          <div>
            <label for="contact-email">Email</label>
            <input type="email" id="contact-email" placeholder="ejemplo@empresa.com">
          </div>
          <div>
            <label for="contact-phone">Teléfono</label>
            <input type="tel" id="contact-phone" placeholder="+34 600 000 000">
          </div>
        </div>

        <label>Etiquetas</label>
        <div class="tag-checkbox-group" id="contact-tags-group"></div>

        <div class="modal-buttons">
          <button type="button" class="btn-secondary" data-close-modal>Cancelar</button>
          <button type="submit" class="btn-primary">Guardar contacto</button>
        </div>
      </form>

      <div id="contact-detail-sections" class="hidden">
        <div class="detail-section">
          <p class="detail-section-title">Tratos asociados</p>
          <div class="related-list" id="contact-deals-list"></div>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal: Automatización -->
```
New:
```html
        <div class="field-row">
          <div>
            <label for="contact-service">Servicio de interés</label>
            <input type="text" id="contact-service" placeholder="Ej: Limpieza dental">
          </div>
          <div>
            <label for="contact-source">Origen</label>
            <select id="contact-source">
              <option value="whatsapp">WhatsApp</option>
              <option value="instagram">Instagram</option>
              <option value="web">Web</option>
              <option value="telefono">Teléfono</option>
              <option value="formulario">Formulario</option>
            </select>
          </div>
        </div>

        <div class="field-row">
          <div>
            <label for="contact-email">Email</label>
            <input type="email" id="contact-email" placeholder="ejemplo@email.com">
          </div>
          <div>
            <label for="contact-phone">Teléfono</label>
            <input type="tel" id="contact-phone" placeholder="+34 600 000 000">
          </div>
        </div>

        <label>Etiquetas</label>
        <div class="tag-checkbox-group" id="contact-tags-group"></div>

        <div class="modal-buttons">
          <button type="button" class="btn-secondary" data-close-modal>Cancelar</button>
          <button type="submit" class="btn-primary">Guardar paciente</button>
        </div>
      </form>

      <div id="contact-detail-sections" class="hidden">
        <div class="detail-section">
          <p class="detail-section-title">Consultas asociadas</p>
          <div class="related-list" id="contact-deals-list"></div>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal: Automatización -->
```

- [ ] **Step 14: Automation modal — 7-stage trigger options, "consulta" copy**

Old:
```html
        <label for="automation-trigger">Cuando un trato pasa a...</label>
        <select id="automation-trigger">
          <option value="nuevo">Nuevo</option>
          <option value="contactado">Contactado</option>
          <option value="propuesta">Propuesta</option>
          <option value="ganado">Ganado</option>
          <option value="perdido">Perdido</option>
        </select>
```
New:
```html
        <label for="automation-trigger">Cuando una consulta pasa a...</label>
        <select id="automation-trigger">
          <option value="nuevo">Nuevo contacto</option>
          <option value="recibida">Consulta recibida</option>
          <option value="contactado">Contactado</option>
          <option value="interesado">Interesado</option>
          <option value="turno">Turno reservado</option>
          <option value="atendido">Atendido</option>
          <option value="seguimiento">Seguimiento</option>
        </select>
```

- [ ] **Step 15: Add the toast container**

Old:
```html
  <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script>
  <script src="js/store.js"></script>
  <script src="js/app.js"></script>
  <script src="js/theme.js"></script>
</body>
</html>
```
New:
```html
  <div id="toast-container" class="toast-container"></div>

  <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script>
  <script src="js/store.js"></script>
  <script src="js/app.js"></script>
  <script src="js/theme.js"></script>
</body>
</html>
```

- [ ] **Step 16: Commit**

```bash
git add index.html
git commit -m "feat(completo): quita Empresas del markup, Pacientes/Consultas y marca Melray"
```

### Task 13: `completo/js/app.js` — drop Empresas logic, patient fields, toasts, CSV export

**Files:**
- Modify: `CRM/completo/js/app.js`

**Interfaces:**
- Consumes: `STAGES`/`stageInfo`/`TAGS`/`tagInfo`/`ACTIVITY_TYPES`/`activityTypeLabel`/`EVENT_TYPES`/`eventTypeLabel`/`uid`/`daysFromNow`/`loadData`/`saveData` (Task 11); DOM ids from Task 12.
- Produces: `showToast`, `notifyStatusChange`, `sourceLabel` (same signatures as Tasks 3/8, copy verbatim).

- [ ] **Step 1: Lookups — drop company helpers, add `sourceLabel`**

Old:
```js
function userById(id) { return data.users.find((u) => u.id === id); }
function companyById(id) { return data.companies.find((c) => c.id === id); }
function contactById(id) { return data.contacts.find((c) => c.id === id); }
function dealById(id) { return data.deals.find((d) => d.id === id); }
function contactsByCompany(companyId) { return data.contacts.filter((c) => c.companyId === companyId); }
function dealsByCompany(companyId) { return data.deals.filter((d) => d.companyId === companyId); }
function dealsByContact(contactId) { return data.deals.filter((d) => d.contactId === contactId); }
```
New:
```js
function userById(id) { return data.users.find((u) => u.id === id); }
function contactById(id) { return data.contacts.find((c) => c.id === id); }
function dealById(id) { return data.deals.find((d) => d.id === id); }
function dealsByContact(contactId) { return data.deals.filter((d) => d.contactId === contactId); }

const SOURCE_LABELS = { whatsapp: 'WhatsApp', instagram: 'Instagram', web: 'Web', telefono: 'Teléfono', formulario: 'Formulario' };
function sourceLabel(key) { return SOURCE_LABELS[key] || key || '—'; }
```

- [ ] **Step 2: Top-level state — drop `editingCompanyId`/`companiesSearchTerm`**

Old:
```js
let companiesSearchTerm = '';
let contactsSearchTerm = '';
```
New:
```js
let contactsSearchTerm = '';
```

Old:
```js
let editingDealId = null;
let editingCompanyId = null;
let editingContactId = null;
```
New:
```js
let editingDealId = null;
let editingContactId = null;
```

- [ ] **Step 3: `cacheEls` — drop `dealCompany`/`companies*`/company-modal refs, contact company/position → service/source**

Old:
```js
    companiesSearch: document.getElementById('companies-search-input'),
    companiesAddBtn: document.getElementById('companies-add-btn'),
    companiesTableBody: document.getElementById('companies-table-body'),

    contactsSearch: document.getElementById('contacts-search-input'),
```
New:
```js
    contactsSearch: document.getElementById('contacts-search-input'),
```

Old:
```js
    dealTitle: document.getElementById('deal-title'),
    dealCompany: document.getElementById('deal-company'),
    dealContact: document.getElementById('deal-contact'),
```
New:
```js
    dealTitle: document.getElementById('deal-title'),
    dealContact: document.getElementById('deal-contact'),
```

Old:
```js
    companyModal: document.getElementById('company-modal'),
    companyModalTitle: document.getElementById('company-modal-title'),
    companyForm: document.getElementById('company-form'),
    companyId: document.getElementById('company-id'),
    companyName: document.getElementById('company-name'),
    companySector: document.getElementById('company-sector'),
    companyWebsite: document.getElementById('company-website'),
    companyNotes: document.getElementById('company-notes'),
    companyDeleteBtn: document.getElementById('company-delete-btn'),
    companyDetailSections: document.getElementById('company-detail-sections'),
    companyContactsList: document.getElementById('company-contacts-list'),
    companyDealsList: document.getElementById('company-deals-list'),

    contactModal: document.getElementById('contact-modal'),
    contactModalTitle: document.getElementById('contact-modal-title'),
    contactForm: document.getElementById('contact-form'),
    contactId: document.getElementById('contact-id'),
    contactName: document.getElementById('contact-name'),
    contactCompany: document.getElementById('contact-company'),
    contactPosition: document.getElementById('contact-position'),
    contactEmail: document.getElementById('contact-email'),
```
New:
```js
    contactModal: document.getElementById('contact-modal'),
    contactModalTitle: document.getElementById('contact-modal-title'),
    contactForm: document.getElementById('contact-form'),
    contactId: document.getElementById('contact-id'),
    contactName: document.getElementById('contact-name'),
    contactService: document.getElementById('contact-service'),
    contactSource: document.getElementById('contact-source'),
    contactEmail: document.getElementById('contact-email'),
```

- [ ] **Step 4: `renderStats` — active-stage list, "ganado"→"atendido", add `showToast`/`notifyStatusChange`**

Old:
```js
function renderStats() {
  const deals = getDealsForOwnerFilter(data.deals);
  const activeStages = ['nuevo', 'contactado', 'propuesta'];
  const activeDeals = deals.filter((d) => activeStages.includes(d.stage));
  const pipelineValue = activeDeals.reduce((sum, d) => sum + d.value, 0);
  const wonValue = deals.filter((d) => d.stage === 'ganado').reduce((sum, d) => sum + d.value, 0);
  const tasks = getTasksForOwnerFilter(data.tasks);
  const pendingTasks = tasks.filter((t) => !t.completed);
  const overdueTasks = pendingTasks.filter((t) => t.dueDate < Date.now());

  els.statsGrid.innerHTML = `
    <div class="stat-card total">
      <span class="stat-value">${formatCurrency(pipelineValue)}</span>
      <span class="stat-label">Valor en pipeline</span>
    </div>
    <div class="stat-card">
      <span class="stat-value">${activeDeals.length}</span>
      <span class="stat-label">Tratos activos</span>
    </div>
    <div class="stat-card">
      <span class="stat-value">${formatCurrency(wonValue)}</span>
      <span class="stat-label"><span class="stat-dot" style="background:${stageInfo('ganado').color}"></span>Valor ganado</span>
    </div>
    <div class="stat-card">
      <span class="stat-value">${pendingTasks.length}</span>
      <span class="stat-label">Tareas pendientes</span>
    </div>
    <div class="stat-card ${overdueTasks.length ? 'warning' : ''}">
      <span class="stat-value">${overdueTasks.length}</span>
      <span class="stat-label">Tareas vencidas</span>
    </div>
  `;
}
```
New:
```js
function renderStats() {
  const deals = getDealsForOwnerFilter(data.deals);
  const activeStages = ['nuevo', 'recibida', 'contactado', 'interesado', 'turno'];
  const activeDeals = deals.filter((d) => activeStages.includes(d.stage));
  const pipelineValue = activeDeals.reduce((sum, d) => sum + d.value, 0);
  const attendedValue = deals.filter((d) => d.stage === 'atendido').reduce((sum, d) => sum + d.value, 0);
  const tasks = getTasksForOwnerFilter(data.tasks);
  const pendingTasks = tasks.filter((t) => !t.completed);
  const overdueTasks = pendingTasks.filter((t) => t.dueDate < Date.now());

  els.statsGrid.innerHTML = `
    <div class="stat-card total">
      <span class="stat-value">${formatCurrency(pipelineValue)}</span>
      <span class="stat-label">Valor en pipeline</span>
    </div>
    <div class="stat-card">
      <span class="stat-value">${activeDeals.length}</span>
      <span class="stat-label">Consultas activas</span>
    </div>
    <div class="stat-card">
      <span class="stat-value">${formatCurrency(attendedValue)}</span>
      <span class="stat-label"><span class="stat-dot" style="background:${stageInfo('atendido').color}"></span>Valor atendido</span>
    </div>
    <div class="stat-card">
      <span class="stat-value">${pendingTasks.length}</span>
      <span class="stat-label">Tareas pendientes</span>
    </div>
    <div class="stat-card ${overdueTasks.length ? 'warning' : ''}">
      <span class="stat-value">${overdueTasks.length}</span>
      <span class="stat-label">Tareas vencidas</span>
    </div>
  `;
}

function showToast(message) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span class="toast-icon">🔥</span><span>${escapeHtml(message)}</span>`;
  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

function notifyStatusChange(newStage, previousStage) {
  if (newStage === previousStage) return;
  if (newStage === 'turno') showToast('Booked. We love to see it.');
  else if (newStage === 'atendido') showToast('Nice work.');
}
```

- [ ] **Step 5: `computeRanking` — "ganado"→"atendido"**

Old:
```js
function computeRanking() {
  return data.users.map((u) => ({
    user: u,
    total: data.deals.filter((d) => d.ownerId === u.id && d.stage === 'ganado').reduce((s, d) => s + d.value, 0),
  })).sort((a, b) => b.total - a.total);
}
```
New:
```js
function computeRanking() {
  return data.users.map((u) => ({
    user: u,
    total: data.deals.filter((d) => d.ownerId === u.id && d.stage === 'atendido').reduce((s, d) => s + d.value, 0),
  })).sort((a, b) => b.total - a.total);
}
```

- [ ] **Step 6: `renderHomeStageBar` — active-stage list and empty-state copy**

Old:
```js
function renderHomeStageBar() {
  const activeStages = ['nuevo', 'contactado', 'propuesta'];
  const deals = getDealsForOwnerFilter(data.deals).filter((d) => activeStages.includes(d.stage));
```
New:
```js
function renderHomeStageBar() {
  const activeStages = ['nuevo', 'recibida', 'contactado', 'interesado', 'turno'];
  const deals = getDealsForOwnerFilter(data.deals).filter((d) => activeStages.includes(d.stage));
```

Old:
```js
    els.homeStageLegend.innerHTML = emptyState('Sin tratos activos', 'Crea un trato nuevo desde Pipeline para empezar.');
```
New:
```js
    els.homeStageLegend.innerHTML = emptyState('Sin consultas activas', 'Crea una consulta nueva desde Pipeline para empezar.');
```

- [ ] **Step 7: `filterAndSortDeals` — drop company matching**

Old:
```js
function filterAndSortDeals(list, { term, stage, sort }) {
  let result = list;
  const t = term.trim().toLowerCase();
  if (t) {
    result = result.filter((d) => {
      const company = companyById(d.companyId);
      const contact = contactById(d.contactId);
      return d.title.toLowerCase().includes(t)
        || (company && company.name.toLowerCase().includes(t))
        || (contact && contact.name.toLowerCase().includes(t));
    });
  }
```
New:
```js
function filterAndSortDeals(list, { term, stage, sort }) {
  let result = list;
  const t = term.trim().toLowerCase();
  if (t) {
    result = result.filter((d) => {
      const contact = contactById(d.contactId);
      return d.title.toLowerCase().includes(t)
        || (contact && contact.name.toLowerCase().includes(t));
    });
  }
```

- [ ] **Step 8: Delete `getFilteredCompanies`, fix `getFilteredContacts`**

Old:
```js
function getFilteredCompanies() {
  let list = data.companies.slice();
  const term = companiesSearchTerm.trim().toLowerCase();
  if (term) list = list.filter((c) => c.name.toLowerCase().includes(term) || (c.sector || '').toLowerCase().includes(term));
  return list.sort((a, b) => a.name.localeCompare(b.name));
}

function getFilteredContacts() {
  let list = data.contacts.slice();
  const term = contactsSearchTerm.trim().toLowerCase();
  if (term) {
    list = list.filter((c) => {
      const company = companyById(c.companyId);
      return c.name.toLowerCase().includes(term)
        || (company && company.name.toLowerCase().includes(term))
        || (c.email || '').toLowerCase().includes(term);
    });
  }
  return list.sort((a, b) => a.name.localeCompare(b.name));
}
```
New:
```js
function getFilteredContacts() {
  let list = data.contacts.slice();
  const term = contactsSearchTerm.trim().toLowerCase();
  if (term) {
    list = list.filter((c) => {
      return c.name.toLowerCase().includes(term)
        || (c.service || '').toLowerCase().includes(term)
        || (c.email || '').toLowerCase().includes(term);
    });
  }
  return list.sort((a, b) => a.name.localeCompare(b.name));
}
```

- [ ] **Step 9: Kanban card — show service, drop notify+event copy on drop**

Old:
```js
    const cardsHtml = items.length
      ? items.map((d) => {
        const company = companyById(d.companyId);
        const pending = pendingTasksForDeal(d.id).sort((a, b) => a.dueDate - b.dueDate)[0];
        const overdue = pending && pending.dueDate < Date.now();
        return `
          <div class="kanban-card" draggable="true" data-id="${d.id}">
            <h4>${escapeHtml(d.title)}</h4>
            <p class="card-company">${company ? escapeHtml(company.name) : 'Sin empresa'}</p>
            <p class="card-value">${formatCurrency(d.value)}</p>
            <div class="card-footer">
              ${pending ? `<span class="card-task-badge ${overdue ? 'overdue' : ''}">📅 ${formatDate(pending.dueDate)}</span>` : '<span></span>'}
              ${ownerAvatarCompact(d.ownerId)}
            </div>
          </div>
        `;
      }).join('')
      : '<p class="kanban-empty">Sin tratos</p>';
```
New:
```js
    const cardsHtml = items.length
      ? items.map((d) => {
        const contact = contactById(d.contactId);
        const pending = pendingTasksForDeal(d.id).sort((a, b) => a.dueDate - b.dueDate)[0];
        const overdue = pending && pending.dueDate < Date.now();
        return `
          <div class="kanban-card" draggable="true" data-id="${d.id}">
            <h4>${escapeHtml(d.title)}</h4>
            <p class="card-company">${contact ? escapeHtml(contact.service || 'Sin servicio') : 'Sin paciente'}</p>
            <p class="card-value">${formatCurrency(d.value)}</p>
            <div class="card-footer">
              ${pending ? `<span class="card-task-badge ${overdue ? 'overdue' : ''}">📅 ${formatDate(pending.dueDate)}</span>` : '<span></span>'}
              ${ownerAvatarCompact(d.ownerId)}
            </div>
          </div>
        `;
      }).join('')
      : '<p class="kanban-empty">Sin consultas</p>';
```

Old:
```js
      if (deal && deal.stage !== newStage) {
        const previousStage = deal.stage;
        deal.stage = newStage;
        pushEvent('trato', `Trato movido a ${stageInfo(newStage).label}: "${deal.title}"`);
        runAutomationsForDeal(deal, previousStage);
        saveData(data);
        renderPage(currentPage);
      }
```
New:
```js
      if (deal && deal.stage !== newStage) {
        const previousStage = deal.stage;
        deal.stage = newStage;
        pushEvent('trato', `Consulta movida a ${stageInfo(newStage).label}: "${deal.title}"`);
        notifyStatusChange(newStage, previousStage);
        runAutomationsForDeal(deal, previousStage);
        saveData(data);
        renderPage(currentPage);
      }
```

- [ ] **Step 10: Deals table — drop the Empresa column, colspan 8→7**

Old:
```js
function renderDealsTable() {
  const filtered = getFilteredDealsForTable();
  if (!filtered.length) {
    els.dealsTableBody.innerHTML = `<tr><td colspan="8">${emptyState('Sin resultados', 'Prueba a cambiar los filtros de búsqueda.')}</td></tr>`;
    return;
  }
  els.dealsTableBody.innerHTML = filtered.map((d) => {
    const company = companyById(d.companyId);
    const contact = contactById(d.contactId);
    const stage = stageInfo(d.stage);
    const pendingCount = pendingTasksForDeal(d.id).length;
    return `
      <tr class="clickable" data-open-deal="${d.id}">
        <td class="cell-name">${escapeHtml(d.title)}</td>
        <td class="cell-muted">${company ? escapeHtml(company.name) : '—'}</td>
        <td class="cell-muted">${contact ? escapeHtml(contact.name) : '—'}</td>
        <td>${ownerChipHtml(d.ownerId)}</td>
```
New:
```js
function renderDealsTable() {
  const filtered = getFilteredDealsForTable();
  if (!filtered.length) {
    els.dealsTableBody.innerHTML = `<tr><td colspan="7">${emptyState('Sin resultados', 'Prueba a cambiar los filtros de búsqueda.')}</td></tr>`;
    return;
  }
  els.dealsTableBody.innerHTML = filtered.map((d) => {
    const contact = contactById(d.contactId);
    const stage = stageInfo(d.stage);
    const pendingCount = pendingTasksForDeal(d.id).length;
    return `
      <tr class="clickable" data-open-deal="${d.id}">
        <td class="cell-name">${escapeHtml(d.title)}</td>
        <td class="cell-muted">${contact ? escapeHtml(contact.name) : '—'}</td>
        <td>${ownerChipHtml(d.ownerId)}</td>
```

- [ ] **Step 11: Delete the entire "Página: Empresas" section (`renderCompaniesTable`)**

Delete this whole function (comment header included):
```js
/* ---------- Página: Empresas ---------- */

function renderCompaniesTable() {
  const filtered = getFilteredCompanies();
  if (!filtered.length) {
    els.companiesTableBody.innerHTML = `<tr><td colspan="6">${emptyState('Sin resultados', 'Prueba a cambiar los filtros de búsqueda.')}</td></tr>`;
    return;
  }
  els.companiesTableBody.innerHTML = filtered.map((c) => {
    const contactsCount = contactsByCompany(c.id).length;
    const deals = dealsByCompany(c.id);
    const totalValue = deals.reduce((sum, d) => sum + d.value, 0);
    return `
      <tr class="clickable" data-open-company="${c.id}">
        <td class="cell-name">${escapeHtml(c.name)}</td>
        <td class="cell-muted">${escapeHtml(c.sector || '—')}</td>
        <td class="cell-muted num">${contactsCount}</td>
        <td class="cell-muted num">${deals.length}</td>
        <td class="cell-value num">${formatCurrency(totalValue)}</td>
        <td>
          <div class="row-actions">
            <button class="icon-btn" title="Editar" data-open-company="${c.id}">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z"/></svg>
            </button>
            <button class="icon-btn danger" title="Eliminar" data-delete-company="${c.id}">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  els.companiesTableBody.querySelectorAll('[data-open-company]').forEach((el) => {
    el.addEventListener('click', (e) => { e.stopPropagation(); openCompanyModal(el.dataset.openCompany); });
  });
  els.companiesTableBody.querySelectorAll('[data-delete-company]').forEach((btn) => {
    btn.addEventListener('click', (e) => { e.stopPropagation(); deleteCompany(btn.dataset.deleteCompany); });
  });
}

```

- [ ] **Step 12: Contacts table — service/source columns**

Old:
```js
function renderContactsTable() {
  const filtered = getFilteredContacts();
  if (!filtered.length) {
    els.contactsTableBody.innerHTML = `<tr><td colspan="7">${emptyState('Sin resultados', 'Prueba a cambiar los filtros de búsqueda.')}</td></tr>`;
    return;
  }
  els.contactsTableBody.innerHTML = filtered.map((c) => {
    const company = companyById(c.companyId);
    const tagsHtml = (c.tags || []).map((tk) => {
      const t = tagInfo(tk);
      return t ? `<span class="tag-chip" style="background:${t.color}22;color:${t.color}">${t.label}</span>` : '';
    }).join('');
    return `
      <tr class="clickable" data-open-contact="${c.id}">
        <td class="cell-name">${escapeHtml(c.name)}</td>
        <td class="cell-muted">${company ? escapeHtml(company.name) : '—'}</td>
        <td class="cell-muted">${escapeHtml(c.position || '—')}</td>
        <td class="cell-muted">${escapeHtml(c.email || '—')}</td>
```
New:
```js
function renderContactsTable() {
  const filtered = getFilteredContacts();
  if (!filtered.length) {
    els.contactsTableBody.innerHTML = `<tr><td colspan="7">${emptyState('Sin resultados', 'Prueba a cambiar los filtros de búsqueda.')}</td></tr>`;
    return;
  }
  els.contactsTableBody.innerHTML = filtered.map((c) => {
    const tagsHtml = (c.tags || []).map((tk) => {
      const t = tagInfo(tk);
      return t ? `<span class="tag-chip" style="background:${t.color}22;color:${t.color}">${t.label}</span>` : '';
    }).join('');
    return `
      <tr class="clickable" data-open-contact="${c.id}">
        <td class="cell-name">${escapeHtml(c.name)}</td>
        <td class="cell-muted">${escapeHtml(c.service || '—')}</td>
        <td class="cell-muted">${sourceLabel(c.source)}</td>
        <td class="cell-muted">${escapeHtml(c.email || '—')}</td>
```

- [ ] **Step 13: `computeRevenueByMonth` — "ganado"→"atendido"**

Old:
```js
  deals.filter((d) => d.stage === 'ganado').forEach((d) => {
```
New:
```js
  deals.filter((d) => d.stage === 'atendido').forEach((d) => {
```

- [ ] **Step 14: `PAGE_META`/`renderPage` — drop "empresas", rename titles/subtitles**

Old:
```js
const PAGE_META = {
  resumen: { title: 'Resumen', subtitle: 'Visión general del negocio' },
  pipeline: { title: 'Pipeline', subtitle: 'Tratos organizados por etapa' },
  tratos: { title: 'Tratos', subtitle: 'Todos los tratos en formato tabla' },
  empresas: { title: 'Empresas', subtitle: 'Cuentas y organizaciones' },
  contactos: { title: 'Contactos', subtitle: 'Personas de contacto' },
  calendario: { title: 'Calendario', subtitle: 'Tareas organizadas por fecha' },
  informes: { title: 'Informes', subtitle: 'Analítica de ventas' },
  automatizaciones: { title: 'Automatizaciones', subtitle: 'Reglas que actúan por ti' },
  actividad: { title: 'Actividad', subtitle: 'Historial de eventos del CRM' },
};

const OWNER_FILTER_PAGES = ['resumen', 'pipeline', 'tratos', 'calendario', 'informes'];

function renderPage(page) {
  if (page === 'resumen') renderResumen();
  else if (page === 'pipeline') renderKanban();
  else if (page === 'tratos') renderDealsTable();
  else if (page === 'empresas') renderCompaniesTable();
  else if (page === 'contactos') renderContactsTable();
  else if (page === 'calendario') renderCalendar();
  else if (page === 'informes') renderInformes();
  else if (page === 'automatizaciones') renderAutomations();
  else if (page === 'actividad') renderFeedFull();
}
```
New:
```js
const PAGE_META = {
  resumen: { title: 'Resumen', subtitle: 'Menos WhatsApp. Menos tareas manuales. Más pacientes.' },
  pipeline: { title: 'Pipeline', subtitle: 'Consultas organizadas por etapa' },
  tratos: { title: 'Consultas', subtitle: 'Todas las consultas en formato tabla' },
  contactos: { title: 'Pacientes', subtitle: 'Pacientes y su historial' },
  calendario: { title: 'Calendario', subtitle: 'Turnos y agenda' },
  informes: { title: 'Informes', subtitle: 'Analítica de consultas' },
  automatizaciones: { title: 'Automatizaciones', subtitle: 'Reglas que actúan por ti' },
  actividad: { title: 'Actividad', subtitle: 'Historial de eventos de Melray' },
};

const OWNER_FILTER_PAGES = ['resumen', 'pipeline', 'tratos', 'calendario', 'informes'];

function renderPage(page) {
  if (page === 'resumen') renderResumen();
  else if (page === 'pipeline') renderKanban();
  else if (page === 'tratos') renderDealsTable();
  else if (page === 'contactos') renderContactsTable();
  else if (page === 'calendario') renderCalendar();
  else if (page === 'informes') renderInformes();
  else if (page === 'automatizaciones') renderAutomations();
  else if (page === 'actividad') renderFeedFull();
}
```

- [ ] **Step 15: Deal modal — drop company select, patient required, "consulta" copy, notify on stage change**

Old:
```js
function populateDealCompanySelect() {
  els.dealCompany.innerHTML = data.companies.map((c) => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('');
}

function populateDealContactSelect(companyId) {
  const contacts = companyId ? contactsByCompany(companyId) : data.contacts;
  els.dealContact.innerHTML = '<option value="">Sin contacto</option>' + contacts.map((c) => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('');
}
```
New:
```js
function populateDealContactSelect() {
  els.dealContact.innerHTML = data.contacts.map((c) => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('');
}
```

Old:
```js
function openDealModal(id) {
  editingDealId = id || null;
  populateDealCompanySelect();
  populateDealOwnerSelect();

  if (id) {
    const deal = dealById(id);
    els.dealModalTitle.textContent = 'Editar trato';
    els.dealId.value = deal.id;
    els.dealTitle.value = deal.title;
    els.dealCompany.value = deal.companyId;
    populateDealContactSelect(deal.companyId);
    els.dealContact.value = deal.contactId || '';
    els.dealValue.value = deal.value;
    els.dealStage.value = deal.stage;
    els.dealOwner.value = deal.ownerId || '';
    els.dealDeleteBtn.classList.remove('hidden');
    els.dealDetailSections.classList.remove('hidden');
    renderDealTasks(id);
    renderDealActivities(id);
  } else {
    els.dealModalTitle.textContent = 'Nuevo trato';
    els.dealForm.reset();
    els.dealId.value = '';
    populateDealContactSelect('');
    els.dealStage.value = 'nuevo';
    els.dealDeleteBtn.classList.add('hidden');
    els.dealDetailSections.classList.add('hidden');
  }

  els.dealModal.classList.remove('hidden');
}

function handleDealFormSubmit(e) {
  e.preventDefault();
  const payload = {
    title: els.dealTitle.value.trim(),
    companyId: els.dealCompany.value,
    contactId: els.dealContact.value || null,
    value: Number(els.dealValue.value) || 0,
    stage: els.dealStage.value,
    ownerId: els.dealOwner.value,
  };
  if (!payload.title || !payload.companyId) return;

  if (editingDealId) {
    const deal = dealById(editingDealId);
    const previousStage = deal.stage;
    Object.assign(deal, payload);
    if (deal.stage !== previousStage) {
      pushEvent('trato', `Trato movido a ${stageInfo(deal.stage).label}: "${deal.title}"`);
      runAutomationsForDeal(deal, previousStage);
    } else {
      pushEvent('trato', `Trato actualizado: "${deal.title}"`);
    }
  } else {
    const deal = { id: uid(), ...payload, createdAt: Date.now() };
    data.deals.push(deal);
    pushEvent('trato', `Trato creado: "${deal.title}"`);
    runAutomationsForDeal(deal, null);
  }
  saveData(data);
  closeModal(els.dealModal);
  renderPage(currentPage);
}
```
New:
```js
function openDealModal(id) {
  editingDealId = id || null;
  populateDealContactSelect();
  populateDealOwnerSelect();

  if (id) {
    const deal = dealById(id);
    els.dealModalTitle.textContent = 'Editar consulta';
    els.dealId.value = deal.id;
    els.dealTitle.value = deal.title;
    els.dealContact.value = deal.contactId || '';
    els.dealValue.value = deal.value;
    els.dealStage.value = deal.stage;
    els.dealOwner.value = deal.ownerId || '';
    els.dealDeleteBtn.classList.remove('hidden');
    els.dealDetailSections.classList.remove('hidden');
    renderDealTasks(id);
    renderDealActivities(id);
  } else {
    els.dealModalTitle.textContent = 'Nueva consulta';
    els.dealForm.reset();
    els.dealId.value = '';
    els.dealStage.value = 'nuevo';
    els.dealDeleteBtn.classList.add('hidden');
    els.dealDetailSections.classList.add('hidden');
  }

  els.dealModal.classList.remove('hidden');
}

function handleDealFormSubmit(e) {
  e.preventDefault();
  const payload = {
    title: els.dealTitle.value.trim(),
    contactId: els.dealContact.value,
    value: Number(els.dealValue.value) || 0,
    stage: els.dealStage.value,
    ownerId: els.dealOwner.value,
  };
  if (!payload.title || !payload.contactId) return;

  if (editingDealId) {
    const deal = dealById(editingDealId);
    const previousStage = deal.stage;
    Object.assign(deal, payload);
    if (deal.stage !== previousStage) {
      pushEvent('trato', `Consulta movida a ${stageInfo(deal.stage).label}: "${deal.title}"`);
      notifyStatusChange(deal.stage, previousStage);
      runAutomationsForDeal(deal, previousStage);
    } else {
      pushEvent('trato', `Consulta actualizada: "${deal.title}"`);
    }
  } else {
    const deal = { id: uid(), ...payload, createdAt: Date.now() };
    data.deals.push(deal);
    pushEvent('trato', `Consulta creada: "${deal.title}"`);
    runAutomationsForDeal(deal, null);
  }
  saveData(data);
  closeModal(els.dealModal);
  renderPage(currentPage);
}
```

- [ ] **Step 16: `deleteDeal` — "consulta" copy**

Old:
```js
function deleteDeal(id) {
  const deal = dealById(id);
  if (!deal) return;
  if (!confirm(`¿Eliminar el trato "${deal.title}"? También se eliminarán sus tareas y actividad asociadas.`)) return;
  data.deals = data.deals.filter((d) => d.id !== id);
  data.tasks = data.tasks.filter((t) => t.dealId !== id);
  data.activities = data.activities.filter((a) => a.dealId !== id);
  pushEvent('trato', `Trato eliminado: "${deal.title}"`);
  saveData(data);
  closeModal(els.dealModal);
  renderPage(currentPage);
}
```
New:
```js
function deleteDeal(id) {
  const deal = dealById(id);
  if (!deal) return;
  if (!confirm(`¿Eliminar la consulta "${deal.title}"? También se eliminarán sus tareas y actividad asociadas.`)) return;
  data.deals = data.deals.filter((d) => d.id !== id);
  data.tasks = data.tasks.filter((t) => t.dealId !== id);
  data.activities = data.activities.filter((a) => a.dealId !== id);
  pushEvent('trato', `Consulta eliminada: "${deal.title}"`);
  saveData(data);
  closeModal(els.dealModal);
  renderPage(currentPage);
}
```

- [ ] **Step 17: Delete the entire "Modal: Empresa" JS section**

Delete this whole block (comment header through `deleteCompany`'s closing `}`):
```js
/* ---------- Modal: Empresa ---------- */

function renderCompanyRelated(companyId) {
  const contacts = contactsByCompany(companyId);
  els.companyContactsList.innerHTML = contacts.length ? contacts.map((c) => `
    <div class="related-item">
      <div>
        <div class="related-main">${escapeHtml(c.name)}</div>
        <div class="related-sub">${escapeHtml(c.position || 'Sin cargo')}</div>
      </div>
    </div>
  `).join('') : '<p class="empty-text">Sin contactos</p>';

  const deals = dealsByCompany(companyId);
  els.companyDealsList.innerHTML = deals.length ? deals.map((d) => {
    const stage = stageInfo(d.stage);
    return `
      <div class="related-item">
        <div>
          <div class="related-main">${escapeHtml(d.title)}</div>
          <div class="related-sub">${formatCurrency(d.value)}</div>
        </div>
        <span class="status-badge" style="background:${stage.color}22;color:${stage.color}">${stage.label}</span>
      </div>
    `;
  }).join('') : '<p class="empty-text">Sin tratos</p>';
}

function openCompanyModal(id) {
  editingCompanyId = id || null;

  if (id) {
    const company = companyById(id);
    els.companyModalTitle.textContent = 'Editar empresa';
    els.companyId.value = company.id;
    els.companyName.value = company.name;
    els.companySector.value = company.sector || '';
    els.companyWebsite.value = company.website || '';
    els.companyNotes.value = company.notes || '';
    els.companyDeleteBtn.classList.remove('hidden');
    els.companyDetailSections.classList.remove('hidden');
    renderCompanyRelated(id);
  } else {
    els.companyModalTitle.textContent = 'Nueva empresa';
    els.companyForm.reset();
    els.companyId.value = '';
    els.companyDeleteBtn.classList.add('hidden');
    els.companyDetailSections.classList.add('hidden');
  }

  els.companyModal.classList.remove('hidden');
}

function handleCompanyFormSubmit(e) {
  e.preventDefault();
  const payload = {
    name: els.companyName.value.trim(),
    sector: els.companySector.value.trim(),
    website: els.companyWebsite.value.trim(),
    notes: els.companyNotes.value.trim(),
  };
  if (!payload.name) return;

  if (editingCompanyId) {
    Object.assign(companyById(editingCompanyId), payload);
    pushEvent('empresa', `Empresa actualizada: "${payload.name}"`);
  } else {
    data.companies.push({ id: uid(), ...payload, createdAt: Date.now() });
    pushEvent('empresa', `Empresa creada: "${payload.name}"`);
  }
  saveData(data);
  closeModal(els.companyModal);
  renderPage(currentPage);
}

function deleteCompany(id) {
  const company = companyById(id);
  if (!company) return;
  const linkedContacts = contactsByCompany(id).length;
  const linkedDeals = dealsByCompany(id).length;
  const warning = (linkedContacts || linkedDeals)
    ? ` Tiene ${linkedContacts} contacto(s) y ${linkedDeals} trato(s) que quedarán sin empresa asignada.`
    : '';
  if (!confirm(`¿Eliminar la empresa "${company.name}"?${warning}`)) return;

  data.companies = data.companies.filter((c) => c.id !== id);
  data.contacts.forEach((c) => { if (c.companyId === id) c.companyId = null; });
  data.deals.forEach((d) => { if (d.companyId === id) d.companyId = null; });
  pushEvent('empresa', `Empresa eliminada: "${company.name}"`);
  saveData(data);
  closeModal(els.companyModal);
  renderPage(currentPage);
}

```

- [ ] **Step 18: Contact modal — service/source, "paciente" copy, toast on create**

Old:
```js
/* ---------- Modal: Contacto ---------- */

function populateContactCompanySelect() {
  els.contactCompany.innerHTML = '<option value="">Sin empresa</option>'
    + data.companies.map((c) => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('');
}

function renderContactTagsCheckboxes(selectedTags) {
```
New:
```js
/* ---------- Modal: Contacto ---------- */

function renderContactTagsCheckboxes(selectedTags) {
```

Old:
```js
function openContactModal(id) {
  editingContactId = id || null;
  populateContactCompanySelect();

  if (id) {
    const contact = contactById(id);
    els.contactModalTitle.textContent = 'Editar contacto';
    els.contactId.value = contact.id;
    els.contactName.value = contact.name;
    els.contactCompany.value = contact.companyId || '';
    els.contactPosition.value = contact.position || '';
    els.contactEmail.value = contact.email || '';
    els.contactPhone.value = contact.phone || '';
    renderContactTagsCheckboxes(contact.tags || []);
    els.contactDeleteBtn.classList.remove('hidden');
    els.contactDetailSections.classList.remove('hidden');
    renderContactDeals(id);
  } else {
    els.contactModalTitle.textContent = 'Nuevo contacto';
    els.contactForm.reset();
    els.contactId.value = '';
    renderContactTagsCheckboxes([]);
    els.contactDeleteBtn.classList.add('hidden');
    els.contactDetailSections.classList.add('hidden');
  }

  els.contactModal.classList.remove('hidden');
}

function handleContactFormSubmit(e) {
  e.preventDefault();
  const payload = {
    name: els.contactName.value.trim(),
    companyId: els.contactCompany.value || null,
    position: els.contactPosition.value.trim(),
    email: els.contactEmail.value.trim(),
    phone: els.contactPhone.value.trim(),
    tags: getSelectedContactTags(),
  };
  if (!payload.name) return;

  if (editingContactId) {
    Object.assign(contactById(editingContactId), payload);
    pushEvent('contacto', `Contacto actualizado: "${payload.name}"`);
  } else {
    data.contacts.push({ id: uid(), ...payload, createdAt: Date.now() });
    pushEvent('contacto', `Contacto creado: "${payload.name}"`);
  }
  saveData(data);
  closeModal(els.contactModal);
  renderPage(currentPage);
}

function deleteContact(id) {
  const contact = contactById(id);
  if (!contact) return;
  const linkedDeals = dealsByContact(id).length;
  const warning = linkedDeals ? ` Tiene ${linkedDeals} trato(s) que quedarán sin contacto asignado.` : '';
  if (!confirm(`¿Eliminar a ${contact.name}?${warning}`)) return;

  data.contacts = data.contacts.filter((c) => c.id !== id);
  data.deals.forEach((d) => { if (d.contactId === id) d.contactId = null; });
  pushEvent('contacto', `Contacto eliminado: "${contact.name}"`);
  saveData(data);
  closeModal(els.contactModal);
  renderPage(currentPage);
}
```
New:
```js
function openContactModal(id) {
  editingContactId = id || null;

  if (id) {
    const contact = contactById(id);
    els.contactModalTitle.textContent = 'Editar paciente';
    els.contactId.value = contact.id;
    els.contactName.value = contact.name;
    els.contactService.value = contact.service || '';
    els.contactSource.value = contact.source || 'whatsapp';
    els.contactEmail.value = contact.email || '';
    els.contactPhone.value = contact.phone || '';
    renderContactTagsCheckboxes(contact.tags || []);
    els.contactDeleteBtn.classList.remove('hidden');
    els.contactDetailSections.classList.remove('hidden');
    renderContactDeals(id);
  } else {
    els.contactModalTitle.textContent = 'Nuevo paciente';
    els.contactForm.reset();
    els.contactId.value = '';
    renderContactTagsCheckboxes([]);
    els.contactDeleteBtn.classList.add('hidden');
    els.contactDetailSections.classList.add('hidden');
  }

  els.contactModal.classList.remove('hidden');
}

function handleContactFormSubmit(e) {
  e.preventDefault();
  const payload = {
    name: els.contactName.value.trim(),
    service: els.contactService.value.trim(),
    source: els.contactSource.value,
    email: els.contactEmail.value.trim(),
    phone: els.contactPhone.value.trim(),
    tags: getSelectedContactTags(),
  };
  if (!payload.name) return;

  if (editingContactId) {
    Object.assign(contactById(editingContactId), payload);
    pushEvent('contacto', `Paciente actualizado: "${payload.name}"`);
  } else {
    data.contacts.push({ id: uid(), ...payload, createdAt: Date.now() });
    pushEvent('contacto', `Nuevo paciente: "${payload.name}"`);
    showToast('New patient unlocked.');
  }
  saveData(data);
  closeModal(els.contactModal);
  renderPage(currentPage);
}

function deleteContact(id) {
  const contact = contactById(id);
  if (!contact) return;
  const linkedDeals = dealsByContact(id).length;
  const warning = linkedDeals ? ` Tiene ${linkedDeals} consulta(s) que quedarán sin paciente asignado.` : '';
  if (!confirm(`¿Eliminar a ${contact.name}?${warning}`)) return;

  data.contacts = data.contacts.filter((c) => c.id !== id);
  data.deals.forEach((d) => { if (d.contactId === id) d.contactId = null; });
  pushEvent('contacto', `Paciente eliminado: "${contact.name}"`);
  saveData(data);
  closeModal(els.contactModal);
  renderPage(currentPage);
}
```

- [ ] **Step 19: CSV/Excel export — drop the "companies" scope, drop Empresa/Cargo columns**

Old:
```js
function getExportRows(scope) {
  if (scope === 'deals') {
    return getFilteredDealsForTable().map((d) => ({
      Trato: d.title,
      Empresa: companyById(d.companyId)?.name || '',
      Contacto: contactById(d.contactId)?.name || '',
      Responsable: userById(d.ownerId)?.name || '',
      Valor: d.value,
      Etapa: stageInfo(d.stage).label,
    }));
  }
  if (scope === 'companies') {
    return getFilteredCompanies().map((c) => ({
      Empresa: c.name,
      Sector: c.sector || '',
      Web: c.website || '',
      Contactos: contactsByCompany(c.id).length,
      Tratos: dealsByCompany(c.id).length,
      'Valor total': dealsByCompany(c.id).reduce((s, d) => s + d.value, 0),
    }));
  }
  if (scope === 'contacts') {
    return getFilteredContacts().map((c) => ({
      Nombre: c.name,
      Empresa: companyById(c.companyId)?.name || '',
      Cargo: c.position || '',
      Email: c.email || '',
      Teléfono: c.phone || '',
      Etiquetas: (c.tags || []).map((tk) => tagInfo(tk)?.label).filter(Boolean).join('; '),
    }));
  }
  return [];
}
```
New:
```js
function getExportRows(scope) {
  if (scope === 'deals') {
    return getFilteredDealsForTable().map((d) => ({
      Consulta: d.title,
      Paciente: contactById(d.contactId)?.name || '',
      Responsable: userById(d.ownerId)?.name || '',
      Valor: d.value,
      Etapa: stageInfo(d.stage).label,
    }));
  }
  if (scope === 'contacts') {
    return getFilteredContacts().map((c) => ({
      Nombre: c.name,
      Servicio: c.service || '',
      Origen: sourceLabel(c.source),
      Email: c.email || '',
      Teléfono: c.phone || '',
      Etiquetas: (c.tags || []).map((tk) => tagInfo(tk)?.label).filter(Boolean).join('; '),
    }));
  }
  return [];
}
```

- [ ] **Step 20: Modal helpers — drop `editingCompanyId`**

Old:
```js
function closeModal(modal) {
  modal.classList.add('hidden');
  editingDealId = null;
  editingCompanyId = null;
  editingContactId = null;
}

function closeAllModals() {
  document.querySelectorAll('.modal').forEach((m) => m.classList.add('hidden'));
  editingDealId = null;
  editingCompanyId = null;
  editingContactId = null;
}
```
New:
```js
function closeModal(modal) {
  modal.classList.add('hidden');
  editingDealId = null;
  editingContactId = null;
}

function closeAllModals() {
  document.querySelectorAll('.modal').forEach((m) => m.classList.add('hidden'));
  editingDealId = null;
  editingContactId = null;
}
```

- [ ] **Step 21: `init()` — drop the companies search/add listeners, the company-select change listener, and company form wiring**

Old:
```js
  els.companiesSearch.addEventListener('input', (e) => { companiesSearchTerm = e.target.value; renderCompaniesTable(); });
  els.companiesAddBtn.addEventListener('click', () => openCompanyModal(null));

  els.contactsSearch.addEventListener('input', (e) => { contactsSearchTerm = e.target.value; renderContactsTable(); });
```
New:
```js
  els.contactsSearch.addEventListener('input', (e) => { contactsSearchTerm = e.target.value; renderContactsTable(); });
```

Old:
```js
  els.dealForm.addEventListener('submit', handleDealFormSubmit);
  els.dealDeleteBtn.addEventListener('click', () => deleteDeal(editingDealId));
  els.dealCompany.addEventListener('change', () => populateDealContactSelect(els.dealCompany.value));
  els.dealAddTaskBtn.addEventListener('click', () => {
```
New:
```js
  els.dealForm.addEventListener('submit', handleDealFormSubmit);
  els.dealDeleteBtn.addEventListener('click', () => deleteDeal(editingDealId));
  els.dealAddTaskBtn.addEventListener('click', () => {
```

Old:
```js
  els.companyForm.addEventListener('submit', handleCompanyFormSubmit);
  els.companyDeleteBtn.addEventListener('click', () => deleteCompany(editingCompanyId));

  els.contactForm.addEventListener('submit', handleContactFormSubmit);
```
New:
```js
  els.contactForm.addEventListener('submit', handleContactFormSubmit);
```

- [ ] **Step 22: Commit**

```bash
git add js/app.js
git commit -m "feat(completo): logica sin Empresas, pacientes con servicio/origen, toasts y export actualizado"
```

### Task 14: `completo/css/style.css` — 7-column kanban and toast styles

**Files:**
- Modify: `CRM/completo/css/style.css`

**Note:** same as Task 9 — the `.stats-grid { grid-template-columns: repeat(5, 1fr); }` rule (around line 430) stays untouched, the Resumen page still shows exactly 5 stat cards. Only the kanban grid changes.

- [ ] **Step 1: Kanban grid, desktop**

Old:
```css
.kanban-board {
  display: grid;
  grid-template-columns: repeat(5, minmax(220px, 1fr));
  gap: 14px;
  overflow-x: auto;
  padding-bottom: 4px;
}
```
New:
```css
.kanban-board {
  display: grid;
  grid-template-columns: repeat(7, minmax(200px, 1fr));
  gap: 14px;
  overflow-x: auto;
  padding-bottom: 4px;
}
```

- [ ] **Step 2: Kanban grid, mobile/tablet media query**

Old:
```css
  .kanban-board {
    grid-template-columns: repeat(5, 240px);
  }
```
New:
```css
  .kanban-board {
    grid-template-columns: repeat(7, 220px);
  }
```

- [ ] **Step 3: Append toast component styles at the end of the file**

```css

/* ---------- Toasts ---------- */
.toast-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--surface);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 12px 16px;
  box-shadow: var(--shadow-hover);
  font-size: 13px;
  font-weight: 600;
  max-width: 320px;
  opacity: 0;
  transform: translateY(8px);
  transition: opacity 0.25s var(--ease), transform 0.25s var(--ease);
}

.toast.show {
  opacity: 1;
  transform: translateY(0);
}

.toast-icon {
  font-size: 16px;
  flex-shrink: 0;
}
```

- [ ] **Step 4: Commit**

```bash
git add css/style.css
git commit -m "feat(completo): kanban a 7 etapas y estilos de toast"
```

### Task 15: Manual verification — `completo`

**Files:** none (browser-only check)

- [ ] **Step 1: Clear stale data and load the page**

`localStorage.removeItem('crm_completo_data')`, then reload `http://localhost:8022` (the `crm-completo` entry already in `.claude/launch.json`).

- [ ] **Step 2: Visual/functional checklist**

- Sidenav says "Melray Completo", tab title "Melray Completo · Demo". Nav has no "Empresas" item; "Tratos" reads "Consultas", "Contactos" reads "Pacientes".
- Topbar filter label says "Profesional" (not "Vendedor").
- Resumen: subtitle shows "Menos WhatsApp. Menos tareas manuales. Más pacientes.", stat cards read "Consultas activas" / "Valor atendido" (not "Tratos activos"/"Valor ganado"), "Top profesionales" panel populated, revenue chart panel says "Ingresos atendidos · últimos 6 meses".
- Pipeline: 7 kanban columns with the new labels; card text under the title shows a service name, not a company; dragging a card to "Turno reservado" fires 🔥 "Booked. We love to see it.", to "Atendido" fires 🔥 "Nice work.".
- Consultas (tabla): no Empresa column (Consulta / Paciente / Responsable / Valor / Etapa / Tareas / actions); CSV/Excel export still works — open the downloaded CSV (or check via `read_network_requests`/file save) and confirm headers are `Consulta,Paciente,Responsable,Valor,Etapa` with no `Empresa`.
- Pacientes: columns Nombre / Servicio / Origen / Email / Teléfono / Etiquetas; Origen shows human labels. Export CSV headers are `Nombre,Servicio,Origen,Email,Teléfono,Etiquetas`.
- Open "Nueva consulta": no company selector, a required "Paciente" select, 7-stage "Etapa" select, "Responsable" select unchanged.
- Open "Nuevo paciente", fill name, save → 🔥 "New patient unlocked." toast, and the created patient shows up in the Pacientes table with the service/origin you entered.
- Automatizaciones: "Nueva automatización" modal's "Cuando una consulta pasa a..." select lists the 7 new stages; existing 3 seeded rules show sensible text (no stale "Nuevo"/"Propuesta"/"Ganado"/"Perdido" wording) because `stageInfo` now resolves through the new `STAGES`.
- Informes: funnel chart shows all 7 stages; "Ranking de profesionales (valor atendido)" panel is populated (matches the Resumen ranking).
- Actividad: type filter has no "Empresas" option; filtering by "Consultas" and "Pacientes" both return non-empty, correctly-labeled results.
- Toggle dark mode → toast, kanban cards, and every new/changed field (service/source inputs, Consultas/Pacientes tables) render with dark background/text, matching the earlier dark-mode fix.
- Confirm zero leftover mentions of "Empresa"/"Vendedor"/"Tratos" (as opposed to "Consultas") anywhere in the rendered UI.

---

## Part D — Cross-repo final check

### Task 16: Verify the spec's acceptance criteria across all three tiers

**Files:** none (review only, referencing `docs/superpowers/specs/2026-09-16-melray-fase1-marca-terminologia-design.md` in each repo)

- [ ] **Step 1: Re-read the spec's "Criterios de aceptación" section and check each line off against what Tasks 1–15 actually produced**

Go through each of the spec's 8 acceptance bullets and confirm, for `basico`, `intermedio` and `completo`:
1. No screen mentions "Empresa"/"Empresas" and no broken `companyId`/`company-modal` references remain (grep each repo for `companyId` and `company-modal` — both should return zero matches after Tasks 1–14).
2. Patients show `service`/`source` instead of company/cargo (Tasks 2/7/12 markup, Tasks 3/8/13 logic).
3. Kanban/Pipeline shows the 7 new stages, no `propuesta`/`ganado`/`perdido` keys survive (grep each repo's `store.js` and `app.js` for `'ganado'`/`'perdido'`/`'propuesta'` — should return zero matches; `stageInfo`/`STATUSES`/`STAGES` are the only source of truth).
4. Wordmark and `<title>` say "Melray <Nivel>".
5. Seed data is health-themed (grep each repo's `store.js` for `Textiles`, `Ferretería`, `Moda Levante`, `Hostelería`, `Legal` — should return zero matches).
6. Creating a patient / moving to "Turno reservado" / moving to "Atendido" fires the matching toast in all three tiers.
7. Dark mode renders correctly on every new/changed element.
8. Everything not explicitly listed above still works exactly as before (add/edit/delete, filters, kanban drag-and-drop, CSV/Excel export in `completo`).

- [ ] **Step 2: Grep-based regression sweep (run in each of the three repo roots)**

```bash
grep -rniE "empresa|company|companyid" --include="*.js" --include="*.html" .
```
Expected: no matches in `basico` (it never had a `company` entity concept beyond the removed field) or in `intermedio`/`completo` beyond code comments that were intentionally left in place per this plan's "internal identifiers stay" rule — re-check any hit against Tasks 6–14 before treating it as a miss.

```bash
grep -rn "'ganado'\|'perdido'\|'propuesta'" --include="*.js" .
```
Expected: zero matches in all three repos.

- [ ] **Step 3: Report**

Summarize, per tier, which of the 8 acceptance criteria pass and which (if any) need a follow-up fix before considering Fase 1 done. This step produces no commit — it is the plan's final gate before moving on to Fase 2 (reserva de turnos).
