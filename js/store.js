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
