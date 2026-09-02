const STORAGE_KEY = 'crm_intermedio_data';

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
  const byName = (n) => companies.find((c) => c.name === n).id;

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
  const byContactName = (n) => contacts.find((c) => c.name === n).id;

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
  const byDealTitle = (t) => deals.find((d) => d.title === t).id;

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

  return { companies, contacts, deals, tasks, activities };
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
    if (!parsed.companies || !parsed.contacts || !parsed.deals) throw new Error('shape');
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
