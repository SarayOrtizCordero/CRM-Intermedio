# Melray — Fase 1: marca y terminología (reposicionamiento a salud)

## Contexto

`CRM/basico`, `CRM/intermedio` y `CRM/completo` acaban de recibir un retoque
de marca genérico (paleta cálida, modo oscuro, llamita como icono, datos de
ejemplo neutros — ver `2026-09-02-retoque-marca-crm-design.md`). Ese trabajo
asumía que el producto servía "para cualquier tipo de negocio de servicios".

Un brief nuevo ("Melray — Brief") redefine el público objetivo: pequeños
negocios de salud con agenda propia — médicos con consultorio, odontólogos,
clínicas odontológicas pequeñas, cosmetólogas, profesionales y clínicas de
estética. El producto deja de venderse como "un CRM más" y pasa a resolver
un problema concreto: que gestionar consultas, pacientes y turnos no
dependa de estar todo el día contestando WhatsApp.

El brief completo describe una visión de producto en 4 piezas: CRM,
Pipeline de consulta, Reserva de turnos y Automatizaciones, más una visión
futura de agente de IA. Es demasiado alcance para una sola spec, así que se
divide en fases:

1. **Fase 1 (esta spec)** — marca y terminología: nombre Melray, relabeling
   de entidades/pipeline a lenguaje de salud, datos de ejemplo, toasts con
   personalidad.
2. Fase 2 — reserva de turnos (página/flujo de booking).
3. Fase 3 — automatizaciones de mensajes (evoluciona la automatización
   actual, hoy limitada a crear tareas).
4. Fase 4 — agente de IA (probablemente una demo/mock, no hay backend real).

Cada fase es su propia spec → plan → implementación.

## Alcance (Fase 1)

**Dentro:**
1. Eliminar la entidad "Empresas" de Intermedio y Completo (array, página o
   vista, modal, columnas, referencias `companyId`).
2. Sustituir el campo "Empresa" de los contactos (Básico: texto libre;
   Intermedio/Completo: relación) por `service` (servicio de interés) y
   `source` (origen de la consulta).
3. Reemplazar las 5 etapas de pipeline actuales por las 7 etapas de consulta
   del brief.
4. Renombrar entidades/nav en la UI: Contactos → Pacientes, Tratos →
   Consultas, filtro "Vendedor" → "Profesional".
5. Marca: wordmark "CRM" → "Melray" (manteniendo el sufijo de nivel: Melray
   Básico / Melray Intermedio / Melray Completo) en sidenav-brand y
   `<title>`.
6. Copy: subtítulos de página y línea de posicionamiento en Resumen.
7. Datos de ejemplo: pacientes y consultas de salud en vez de
   empresas/tratos textil-moda-ferretería.
8. Sistema de toast nuevo (los tres niveles) con los mensajes con
   personalidad 🔥 del brief, en los triggers de acción (no temporales).

**Fuera:**
- Reserva de turnos como página/flujo propio (Fase 2).
- Automatizaciones de mensajería / WhatsApp, recordatorios temporales
  (Fase 3).
- Agente de IA (Fase 4).
- Paleta de color, modo oscuro, icono/favicon (ya resueltos en la fase de
  marca anterior, no se tocan).
- Cualquier cambio a `Panel-Web/`.

## 1. Modelo de datos

**Básico** (`CRM/basico/js/store.js`): hoy un único array `contacts` con
`{name, company, email, phone, status, notes}` en `localStorage` bajo
`crm_basico_contacts`. Pasa a representar pacientes (se mantiene el nombre
de variable `contacts`/la clave de storage para no arriesgar referencias
cruzadas con `app.js`, pero la UI habla de "Pacientes"):
- Se quita `company`.
- Se añade `service` (texto: servicio/tratamiento de interés, ej. "Limpieza
  dental") y `source` (uno de: WhatsApp, Instagram, Web, Teléfono,
  Formulario).
- `status` pasa a usar las 7 etapas nuevas (sección 2).

**Intermedio y Completo** (`js/store.js` de cada uno): hoy `companies` +
`contacts` (`companyId`, `position`) + `deals` (`companyId`, `contactId`,
`stage`, `value`). Cambios:
- Se elimina `companies` por completo: el array, la página/vista
  "Empresas", el modal de empresa, la columna "Empresa" en tablas, y
  `companyId` en `contacts` y `deals`.
- `contacts` pierde `position` y gana `service` + `source` (igual que en
  Básico).
- `deals` deja de pasar por empresa: la consulta queda ligada directamente
  al paciente vía `contactId`. Se mantiene `value` (precio estimado del
  servicio) y `stage`.
- `users` (staff: Laura Méndez, Iván Costa, Nerea Blanco, Óscar Reyes) no
  cambia de estructura — representan al profesional/staff que atiende,
  solo cambia su etiqueta visible de "Vendedor" a "Profesional".
- Completo además: `EVENT_TYPES` pierde la entrada `empresa`; el evento de
  alta de contacto pasa a decir "Nuevo paciente: <nombre>" (sin mención de
  empresa).

Se mantienen los nombres internos de variable (`contacts`, `deals`,
`companies` eliminado) tal como están en el código para no arriesgar
romper el `app.js` de 63KB de Completo; lo que cambia es qué campos
contienen y cómo se etiquetan en la UI. Cualquier `id` HTML específico de
empresa (`company-modal`, `deal-company`, `contact-company`, etc.) se
elimina o renombra según corresponda al quitar esos campos/vistas.

## 2. Pipeline (7 etapas)

Reemplaza `STAGES`/`STATUSES` en los tres niveles:

| key | label |
|---|---|
| `nuevo` | Nuevo contacto |
| `recibida` | Consulta recibida |
| `contactado` | Contactado |
| `interesado` | Interesado |
| `turno` | Turno reservado |
| `atendido` | Atendido |
| `seguimiento` | Seguimiento |

No hay etapa "Perdido": cancelaciones/no-shows se tratan como estado del
turno, no como etapa final del pipeline — es coherente con que el brief
los describe como disparador de automatización ("Canceló → posibilidad de
reprogramar"), no como resultado del pipeline. Los colores por etapa se
reasignan sobre la paleta cálida ya existente (sin introducir tonos
nuevos), reutilizando los 5 colores actuales y extendiendo con 2
intermedios coherentes para las etapas nuevas.

El Kanban de Intermedio/Completo pasa de 5 a 7 columnas (scroll horizontal
donde ya se soporta). Básico, que también tiene vista Pipeline/Tabla,
recibe el mismo cambio de etiquetas de `STATUSES`.

## 3. Copy y marca

- Wordmark: "CRM Básico" → **"Melray Básico"**, "CRM Intermedio" →
  **"Melray Intermedio"**, "CRM Completo" → **"Melray Completo"**, en
  `sidenav-brand`/header y `<title>` de cada `index.html`. Logo (llamita) y
  paleta no cambian.
- Nav/labels: "Contactos" → "Pacientes", "Empresas" → eliminado, "Tratos"
  → "Consultas", filtro "Vendedor" → "Profesional". "Pipeline",
  "Calendario", "Informes", "Automatizaciones", "Actividad" se mantienen.
- Subtítulos de página (ejemplos — se revisan todos en la implementación):
  - Resumen: "Visión general del negocio" → **"Menos WhatsApp. Menos
    tareas manuales. Más pacientes."** (línea de posicionamiento del
    brief).
  - Pacientes: "Personas de contacto" → "Pacientes y su historial".
  - Consultas/Pipeline: → "Consultas activas".
  - Calendario: → "Turnos y agenda".

## 4. Datos de ejemplo

Se reemplaza el seed de empresas/tratos textil-moda-ferretería-hostelería
por pacientes y consultas de salud, manteniendo la misma cantidad de
registros y relaciones relativas (mismas fechas relativas, mismos rangos
de `value`):
- Nombres de paciente (se reutilizan los nombres de contacto actuales,
  cambia el contexto).
- `service`: tratamientos plausibles por especialidad variada (ej.
  "Limpieza dental", "Consulta general", "Ortodoncia", "Sesión de botox",
  "Peeling facial", "Revisión anual").
- `source`: WhatsApp, Instagram, Web, Teléfono o Formulario, repartido de
  forma realista (mayoría WhatsApp/Instagram, coherente con el problema
  descrito en el brief).
- Títulos de consulta/trato acordes (ej. "Consulta inicial —
  blanqueamiento" en vez de "Renovación pedido textil").

## 5. Toasts con personalidad 🔥

Componente nuevo y reutilizable (los tres niveles), esquina inferior
derecha, auto-dismiss ~4s, reutilizando la llamita como ícono. Triggers
(solo eventos de acción directa del usuario, no temporales):
- Crear un paciente nuevo → *"🔥 New patient unlocked."*
- Mover una consulta a **Turno reservado** → *"🔥 Booked. We love to see
  it."*
- Mover una consulta a **Atendido** → *"🔥 Nice work."*

Los mensajes de tono "still waiting…" y los recordatorios ("Reminder
sent...") quedan fuera de esta fase por depender de lógica temporal —
se diseñan junto con la Fase 3 (Automatizaciones).

## Criterios de aceptación

- Ninguna pantalla de los tres niveles menciona "Empresa"/"Empresas" ni
  conserva referencias rotas a `companyId`/`company-modal` tras quitarlas.
- Los contactos/pacientes de Intermedio y Completo muestran `service` y
  `source` en vez de empresa/cargo; Básico muestra `service`/`source` en
  vez del campo `company`.
- El Kanban (Intermedio/Completo) y la vista Pipeline (Básico) muestran las
  7 etapas nuevas, sin ninguna etapa "Propuesta"/"Ganado"/"Perdido" vieja.
- El wordmark y el `<title>` de los tres niveles dicen "Melray <Nivel>" en
  vez de "CRM <Nivel>".
- Los datos de ejemplo de los tres niveles son de salud (sin ningún nombre
  de empresa, sector o trato textil/moda/ferretería/hostelería/legal
  remanente).
- Crear un paciente, mover una consulta a "Turno reservado" y a "Atendido"
  disparan el toast correspondiente en los tres niveles.
- El modo oscuro (fase anterior) se ve correcto sobre los campos nuevos
  (`service`, `source`) y sobre el toast.
- Las tres demos siguen funcionando igual que antes en todo lo no listado
  arriba (altas, ediciones, filtros, kanban, exportación en completo).
