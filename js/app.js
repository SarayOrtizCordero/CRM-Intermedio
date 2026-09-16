let data = loadData();
let currentView = 'kanban';
let searchTerm = '';
let stageFilter = '';
let sortMode = 'recent';
let editingDealId = null;
let editingContactId = null;
let draggedDealId = null;

const currencyFmt = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });

function formatCurrency(v) {
  return currencyFmt.format(v || 0);
}

function formatDate(ts) {
  return new Date(ts).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str == null ? '' : str;
  return div.innerHTML;
}

function contactById(id) { return data.contacts.find((c) => c.id === id); }
function dealById(id) { return data.deals.find((d) => d.id === id); }
function dealsByContact(contactId) { return data.deals.filter((d) => d.contactId === contactId); }

const SOURCE_LABELS = { whatsapp: 'WhatsApp', instagram: 'Instagram', web: 'Web', telefono: 'Teléfono', formulario: 'Formulario' };
function sourceLabel(key) { return SOURCE_LABELS[key] || key || '—'; }
function tasksByDeal(dealId) { return data.tasks.filter((t) => t.dealId === dealId); }
function activitiesByDeal(dealId) { return data.activities.filter((a) => a.dealId === dealId).sort((a, b) => b.date - a.date); }
function pendingTasksForDeal(dealId) { return tasksByDeal(dealId).filter((t) => !t.completed); }

const els = {
  statsGrid: document.getElementById('stats-grid'),
  pendingTasksList: document.getElementById('pending-tasks-list'),
  pendingTasksCount: document.getElementById('pending-tasks-count'),
  completedTasksList: document.getElementById('completed-tasks-list'),
  completedTasksCount: document.getElementById('completed-tasks-count'),
  search: document.getElementById('search-input'),
  filterStage: document.getElementById('filter-stage'),
  sortSelect: document.getElementById('sort-select'),
  viewToggleBtns: document.querySelectorAll('.view-toggle button'),
  kanbanBoard: document.getElementById('kanban-board'),
  dealsTableWrap: document.getElementById('deals-table-wrap'),
  dealsTableBody: document.getElementById('deals-table-body'),
  contactsTableWrap: document.getElementById('contacts-table-wrap'),
  contactsTableBody: document.getElementById('contacts-table-body'),
  toolbarAddBtn: document.getElementById('toolbar-add-btn'),
  toolbarAddLabel: document.getElementById('toolbar-add-label'),

  dealModal: document.getElementById('deal-modal'),
  dealModalTitle: document.getElementById('deal-modal-title'),
  dealForm: document.getElementById('deal-form'),
  dealId: document.getElementById('deal-id'),
  dealTitle: document.getElementById('deal-title'),
  dealContact: document.getElementById('deal-contact'),
  dealValue: document.getElementById('deal-value'),
  dealStage: document.getElementById('deal-stage'),
  dealDeleteBtn: document.getElementById('deal-delete-btn'),
  dealDetailSections: document.getElementById('deal-detail-sections'),
  dealTaskList: document.getElementById('deal-task-list'),
  dealNewTaskTitle: document.getElementById('deal-new-task-title'),
  dealNewTaskDue: document.getElementById('deal-new-task-due'),
  dealAddTaskBtn: document.getElementById('deal-add-task-btn'),
  dealActivityList: document.getElementById('deal-activity-list'),
  dealNewActivityType: document.getElementById('deal-new-activity-type'),
  dealNewActivityText: document.getElementById('deal-new-activity-text'),
  dealAddActivityBtn: document.getElementById('deal-add-activity-btn'),

  contactModal: document.getElementById('contact-modal'),
  contactModalTitle: document.getElementById('contact-modal-title'),
  contactForm: document.getElementById('contact-form'),
  contactId: document.getElementById('contact-id'),
  contactName: document.getElementById('contact-name'),
  contactService: document.getElementById('contact-service'),
  contactSource: document.getElementById('contact-source'),
  contactEmail: document.getElementById('contact-email'),
  contactPhone: document.getElementById('contact-phone'),
  contactTagsGroup: document.getElementById('contact-tags-group'),
  contactDeleteBtn: document.getElementById('contact-delete-btn'),
  contactDetailSections: document.getElementById('contact-detail-sections'),
  contactDealsList: document.getElementById('contact-deals-list'),
};

/* ---------- Dashboard ---------- */

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

function taskSidebarItemHtml(t) {
  const deal = dealById(t.dealId);
  const overdue = !t.completed && t.dueDate < Date.now();
  return `
    <div class="task-sidebar-item ${t.completed ? 'completed' : ''} ${overdue ? 'overdue' : ''}">
      <input type="checkbox" data-toggle-sidebar-task="${t.id}" ${t.completed ? 'checked' : ''}>
      <div class="task-sidebar-body">
        <span class="task-sidebar-title">${escapeHtml(t.title)}</span>
        <div class="task-sidebar-meta">
          <span class="task-sidebar-deal" data-open-deal="${t.dealId}">${deal ? escapeHtml(deal.title) : ''}</span>
          <span class="task-sidebar-due">${formatDate(t.dueDate)}</span>
        </div>
      </div>
    </div>
  `;
}

function renderTaskSidebar() {
  const pending = data.tasks.filter((t) => !t.completed).sort((a, b) => a.dueDate - b.dueDate);
  const completed = data.tasks.filter((t) => t.completed).sort((a, b) => b.dueDate - a.dueDate);

  els.pendingTasksCount.textContent = pending.length;
  els.completedTasksCount.textContent = completed.length;

  els.pendingTasksList.innerHTML = pending.length
    ? pending.map(taskSidebarItemHtml).join('')
    : '<p class="empty-text">Sin tareas pendientes.</p>';
  els.completedTasksList.innerHTML = completed.length
    ? completed.map(taskSidebarItemHtml).join('')
    : '<p class="empty-text">Sin tareas realizadas.</p>';

  document.querySelectorAll('[data-toggle-sidebar-task]').forEach((cb) => {
    cb.addEventListener('change', () => {
      const task = data.tasks.find((t) => t.id === cb.dataset.toggleSidebarTask);
      task.completed = cb.checked;
      saveData(data);
      renderAll();
    });
  });
  document.querySelectorAll('.task-sidebar-deal').forEach((el) => {
    el.addEventListener('click', () => openDealModal(el.dataset.openDeal));
  });
}

/* ---------- Filtering ---------- */

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

/* ---------- Kanban ---------- */

function renderKanban() {
  const filtered = getFilteredDeals();
  els.kanbanBoard.innerHTML = STAGES.map((s) => {
    const items = filtered.filter((d) => d.stage === s.key);
    const stageValue = items.reduce((sum, d) => sum + d.value, 0);
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

    return `
      <div class="kanban-column" data-stage="${s.key}">
        <div class="kanban-column-header" style="border-color:${s.color}">
          <span class="kanban-column-title">${s.label}</span>
          <span class="count-badge">${items.length}</span>
        </div>
        <div class="kanban-column-value">${formatCurrency(stageValue)}</div>
        <div class="kanban-cards" data-stage="${s.key}">${cardsHtml}</div>
      </div>
    `;
  }).join('');

  attachKanbanEvents();
}

function attachKanbanEvents() {
  els.kanbanBoard.querySelectorAll('.kanban-card').forEach((card) => {
    card.addEventListener('dragstart', (e) => {
      draggedDealId = card.dataset.id;
      card.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });
    card.addEventListener('dragend', () => {
      card.classList.remove('dragging');
      draggedDealId = null;
    });
    card.addEventListener('click', () => openDealModal(card.dataset.id));
  });

  els.kanbanBoard.querySelectorAll('.kanban-column').forEach((col) => {
    col.addEventListener('dragover', (e) => {
      e.preventDefault();
      col.classList.add('drag-over');
    });
    col.addEventListener('dragleave', () => col.classList.remove('drag-over'));
    col.addEventListener('drop', (e) => {
      e.preventDefault();
      col.classList.remove('drag-over');
      if (!draggedDealId) return;
      const newStage = col.dataset.stage;
      const deal = dealById(draggedDealId);
      if (deal && deal.stage !== newStage) {
        const previousStage = deal.stage;
        deal.stage = newStage;
        notifyStatusChange(newStage, previousStage);
        saveData(data);
        renderAll();
      }
    });
  });
}

/* ---------- Deals table ---------- */

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
        <td><span class="status-badge" style="background:${stage.color}22;color:${stage.color}"><span class="stat-dot" style="background:${stage.color}"></span>${stage.label}</span></td>
        <td class="cell-muted">${pendingCount ? `${pendingCount} pendiente${pendingCount > 1 ? 's' : ''}` : '—'}</td>
        <td>
          <div class="row-actions">
            <button class="icon-btn" title="Editar" data-open-deal="${d.id}">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z"/></svg>
            </button>
            <button class="icon-btn danger" title="Eliminar" data-delete-deal="${d.id}">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  els.dealsTableBody.querySelectorAll('[data-open-deal]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      openDealModal(el.dataset.openDeal);
    });
  });
  els.dealsTableBody.querySelectorAll('[data-delete-deal]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteDeal(btn.dataset.deleteDeal);
    });
  });
}

/* ---------- Contacts table ---------- */

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
        <td class="cell-muted">${escapeHtml(c.phone || '—')}</td>
        <td><div class="tag-chips-row">${tagsHtml || '—'}</div></td>
        <td>
          <div class="row-actions">
            <button class="icon-btn" title="Editar" data-open-contact="${c.id}">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z"/></svg>
            </button>
            <button class="icon-btn danger" title="Eliminar" data-delete-contact="${c.id}">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  els.contactsTableBody.querySelectorAll('[data-open-contact]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      openContactModal(el.dataset.openContact);
    });
  });
  els.contactsTableBody.querySelectorAll('[data-delete-contact]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteContact(btn.dataset.deleteContact);
    });
  });
}

/* ---------- View switching ---------- */

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

/* ---------- Deal modal ---------- */

function populateDealContactSelect() {
  els.dealContact.innerHTML = data.contacts.map((c) => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('');
}

function renderDealTasks(dealId) {
  const tasks = tasksByDeal(dealId).sort((a, b) => a.dueDate - b.dueDate);
  els.dealTaskList.innerHTML = tasks.length ? tasks.map((t) => {
    const overdue = !t.completed && t.dueDate < Date.now();
    return `
      <div class="task-item ${t.completed ? 'completed' : ''} ${overdue ? 'overdue' : ''}">
        <input type="checkbox" ${t.completed ? 'checked' : ''} data-toggle-task="${t.id}">
        <span class="task-item-title">${escapeHtml(t.title)}</span>
        <span class="task-item-due">${formatDate(t.dueDate)}</span>
        <button type="button" class="icon-btn danger" data-delete-task="${t.id}" title="Eliminar tarea">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="6" y1="18" x2="18" y2="6"/></svg>
        </button>
      </div>
    `;
  }).join('') : '<p class="empty-text">Sin tareas</p>';

  els.dealTaskList.querySelectorAll('[data-toggle-task]').forEach((cb) => {
    cb.addEventListener('change', () => {
      const task = data.tasks.find((t) => t.id === cb.dataset.toggleTask);
      task.completed = cb.checked;
      saveData(data);
      renderDealTasks(dealId);
      renderAll();
    });
  });
  els.dealTaskList.querySelectorAll('[data-delete-task]').forEach((btn) => {
    btn.addEventListener('click', () => {
      data.tasks = data.tasks.filter((t) => t.id !== btn.dataset.deleteTask);
      saveData(data);
      renderDealTasks(dealId);
      renderAll();
    });
  });
}

function renderDealActivities(dealId) {
  const activities = activitiesByDeal(dealId);
  els.dealActivityList.innerHTML = activities.length ? activities.map((a) => `
    <div class="activity-item">
      <div class="activity-icon">${activityTypeLabel(a.type).charAt(0)}</div>
      <div class="activity-content">
        <div class="activity-meta"><span class="activity-type">${activityTypeLabel(a.type)}</span> · ${formatDate(a.date)}</div>
        <div>${escapeHtml(a.text)}</div>
      </div>
    </div>
  `).join('') : '<p class="empty-text">Sin actividad registrada</p>';
}

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

function deleteDeal(id) {
  const deal = dealById(id);
  if (!deal) return;
  if (!confirm(`¿Eliminar la consulta "${deal.title}"? También se eliminarán sus tareas y actividad asociadas.`)) return;
  data.deals = data.deals.filter((d) => d.id !== id);
  data.tasks = data.tasks.filter((t) => t.dealId !== id);
  data.activities = data.activities.filter((a) => a.dealId !== id);
  saveData(data);
  closeModal(els.dealModal);
  renderAll();
}

/* ---------- Contact modal ---------- */

function renderContactTagsCheckboxes(selectedTags) {
  els.contactTagsGroup.innerHTML = TAGS.map((t) => `
    <label>
      <input type="checkbox" value="${t.key}" ${selectedTags.includes(t.key) ? 'checked' : ''}>
      ${t.label}
    </label>
  `).join('');
}

function getSelectedContactTags() {
  return Array.from(els.contactTagsGroup.querySelectorAll('input[type="checkbox"]:checked')).map((cb) => cb.value);
}

function renderContactDeals(contactId) {
  const deals = dealsByContact(contactId);
  els.contactDealsList.innerHTML = deals.length ? deals.map((d) => {
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

/* ---------- Modal helpers ---------- */

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

/* ---------- Init ---------- */

function init() {
  els.search.addEventListener('input', (e) => { searchTerm = e.target.value; renderAll(); });
  els.filterStage.addEventListener('change', (e) => { stageFilter = e.target.value; renderAll(); });
  els.sortSelect.addEventListener('change', (e) => { sortMode = e.target.value; renderAll(); });

  els.viewToggleBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      currentView = btn.dataset.view;
      els.viewToggleBtns.forEach((b) => b.classList.toggle('active', b === btn));
      renderAll();
    });
  });

  els.toolbarAddBtn.addEventListener('click', () => {
    if (currentView === 'contactos') openContactModal(null);
    else openDealModal(null);
  });

  els.dealForm.addEventListener('submit', handleDealFormSubmit);
  els.dealDeleteBtn.addEventListener('click', () => deleteDeal(editingDealId));
  els.dealAddTaskBtn.addEventListener('click', () => {
    const title = els.dealNewTaskTitle.value.trim();
    if (!title || !editingDealId) return;
    const dueVal = els.dealNewTaskDue.value;
    data.tasks.push({
      id: uid(),
      dealId: editingDealId,
      title,
      dueDate: dueVal ? new Date(dueVal).getTime() : Date.now(),
      completed: false,
      createdAt: Date.now(),
    });
    saveData(data);
    els.dealNewTaskTitle.value = '';
    els.dealNewTaskDue.value = '';
    renderDealTasks(editingDealId);
    renderAll();
  });
  els.dealAddActivityBtn.addEventListener('click', () => {
    const text = els.dealNewActivityText.value.trim();
    if (!text || !editingDealId) return;
    data.activities.push({
      id: uid(),
      dealId: editingDealId,
      type: els.dealNewActivityType.value,
      text,
      date: Date.now(),
    });
    saveData(data);
    els.dealNewActivityText.value = '';
    renderDealActivities(editingDealId);
  });

  els.contactForm.addEventListener('submit', handleContactFormSubmit);
  els.contactDeleteBtn.addEventListener('click', () => deleteContact(editingContactId));

  document.querySelectorAll('[data-close-modal]').forEach((btn) => {
    btn.addEventListener('click', () => closeModal(btn.closest('.modal')));
  });
  document.querySelectorAll('.modal').forEach((modal) => {
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(modal); });
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAllModals();
  });

  renderAll();
}

init();
