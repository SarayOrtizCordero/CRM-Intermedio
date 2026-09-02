# Retoque de marca — CRM básico / intermedio / completo

## Contexto

`CRM/basico`, `CRM/intermedio` y `CRM/completo` ya son tres demos funcionales
(sin build step, HTML/CSS/JS vainilla, `localStorage` como "base de datos"),
en la misma línea de producto que los paneles de inventario de `Panel-Web/`
(`panel-basico`, `panel-intermedio`, `panel-completo`). Funcionalmente ya
sirven para cualquier tipo de negocio de servicios (empresas, contactos,
tratos con pipeline Nuevo/Contactado/Propuesta/Ganado/Perdido, tareas,
actividad, calendario según el nivel) — el objetivo original de "que sirvan
para clínicas, odontólogos, constructoras, etc. y no solo para negocios de
ropa" ya está resuelto a nivel de funcionalidad y terminología.

Lo que falta es el **retoque de marca**: los tres CRM usan hoy una paleta
azul plana ad-hoc (`--primary: #1d4ed8`) que no tiene relación con la
identidad visual ya validada en `Panel-Web/`, no soportan modo oscuro, y sus
datos de ejemplo tienen nombres de empresa con sabor textil/retail
(`Textiles Rioja`, `Moda Levante S.L.`...) que contradicen el objetivo de
servir a cualquier rubro.

Los tres CRM comparten exactamente el mismo bloque de variables CSS (mismos
nombres, mismos valores), así que el remapeo de colores es idéntico en los
tres proyectos.

## Alcance

**Dentro:**
1. Sistema de color (variables CSS) de los tres niveles.
2. Modo claro/oscuro en los tres niveles (hoy no existe en ninguno).
3. Icono/marca de topbar y `favicon.svg` de los tres niveles.
4. Datos de ejemplo (empresas, contactos, tratos, tareas, actividad):
   sustituir cualquier nombre o texto que delate un rubro concreto (textil,
   moda, ferretería...) por equivalentes neutros.

**Fuera:**
- Funcionalidades, estructura de páginas, layout, campos de formularios.
- Cualquier cambio a `Panel-Web/` (es la fuente de la que copiamos, no se
  toca).

## 1. Sistema de color

**Decisión: los tres niveles usan la misma paleta**, la cálida
naranja/terracota de `panel-basico`/`panel-intermedio` (no la azul de
`panel-completo`). Se copian literalmente los dos bloques `:root` de
`Panel-Web/panel-basico/css/styles.css` (claro y `:root[data-theme="dark"]`)
a los tres `CRM/*/css/style.css`, remapeando los nombres de variable actuales
del CRM a los de Panel-Web:

| Variable actual del CRM      | Variable Panel-Web equivalente        |
|-------------------------------|----------------------------------------|
| `--primary`                   | `--primary`                            |
| `--primary-dark`               | `--primary-strong`                     |
| `--accent` / `--accent-light`  | `--primary-soft` (o `--accent`/`--accent-soft` de intermedio si se necesita un segundo tono) |
| `--danger`                     | `--danger`                             |
| `--success`                    | `--ok`                                 |
| `--warning`                    | *(no existe en Panel-Web; mantener con un tono ámbar coherente con la paleta, p. ej. derivado de `--primary-strong`)* |
| `--neutral` / `--text-muted`   | `--text-muted`                         |
| `--bg`                         | `--bg`                                 |
| `--card-bg`                    | `--surface`                            |
| `--border`                     | `--border`                             |
| `--text`                       | `--text`                               |
| `--radius`                     | `--radius-md` (usar `--radius-lg` donde el CRM hoy use un radio mayor, p. ej. `.panel`, `.modal-content`) |

Todo uso de estas variables en `style.css` (y estilos inline en JS que
referencien colores de estado tipo `s.color`) se revisa para que sigan
siendo legibles sobre la nueva paleta. Los colores de `STATUSES` (etapas del
pipeline) en `store.js` de cada nivel se ajustan a tonos que combinen con la
paleta cálida en vez del azul/verde/ámbar genérico actual.

## 2. Modo claro/oscuro

Se añade a los tres niveles el botón de tema (sol/luna) en la topbar y la
lógica de `data-theme` sobre `<html>` + persistencia en `localStorage`,
replicando el patrón de Panel-Web:

- **Básico**: si el usuario nunca ha tocado el botón, se usa el tema del
  sistema operativo (`prefers-color-scheme`).
- **Intermedio y completo**: por defecto siempre arrancan en claro,
  independientemente del tema del sistema.

## 3. Icono de marca

Se sustituye el badge cuadrado con letra "C" (idéntico y sin relación con la
paleta en los tres niveles) por **la llamita con degradado naranja de
Panel-Web** (`panel-basico`/`panel-intermedio`), igual en los tres niveles:

- Topbar: el SVG inline de la llamita (con sus `<defs>`/gradiente), mismo
  tamaño aproximado que el badge que sustituye.
- `favicon.svg` de cada nivel: mismo contenido SVG de la llamita (el
  degradado funciona igual en un favicon SVG independiente).

Los tres niveles quedan visualmente idénticos en marca — la única diferencia
entre ellos sigue siendo el texto ("CRM Básico" / "CRM Intermedio" / "CRM
Completo") y, claro, las funcionalidades de cada uno.

## 4. Datos de ejemplo neutros

Se revisan `CRM/basico/js/store.js`, `CRM/intermedio/js/store.js` y
`CRM/completo/js/store.js` (y cualquier archivo adicional de datos en
completo) para sustituir:

- Nombres de empresa que delatan rubro (`Textiles Rioja`, `Ferretería
  Prats`, `Moda Levante S.L.`) y su campo `sector` correspondiente, por
  nombres/sectores neutros (p. ej. razones sociales genéricas tipo "Grupo
  Alameda", "Consultora Vega", "Asesoría Marín" con sectores como
  "Servicios", "Consultoría", "Distribución"...).
- Títulos de trato que citan el rubro (`Renovación pedido textil`,
  `Colección otoño-invierno`, `Mantelería de temporada`) por títulos
  genéricos de negocio a negocio.
- Emails/dominios derivados del nombre de empresa, para que seguir
  coincidiendo tras el cambio de nombre.

Se mantiene exactamente la misma estructura de datos (mismo número de
empresas/contactos/tratos, mismas relaciones por id, mismas fechas
relativas, mismos valores en €) — solo cambia el texto que es visible.

## Criterios de aceptación

- Los tres `CRM/*/css/style.css` usan el mismo esquema de variables que
  `Panel-Web/panel-basico/css/styles.css` (mismos nombres, mismos valores en
  claro y oscuro).
- Los tres CRM tienen un botón de tema funcional que persiste en
  `localStorage` y respeta el comportamiento por defecto descrito arriba.
- Los tres `favicon.svg` y el icono de topbar muestran la llamita naranja,
  no la letra "C".
- Ningún dato de ejemplo (empresa, contacto, trato, tarea, actividad) menciona
  textil, moda, ferretería, hostelería ni ningún otro rubro específico.
- Las tres demos siguen funcionando igual que antes (altas, ediciones,
  filtros, kanban, exportación en completo) — no se ha tocado JS de lógica,
  solo datos y estilos.
