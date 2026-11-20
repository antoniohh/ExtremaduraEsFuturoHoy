# 📰 Extremadura es Futuro HOY — Hub editorial y social

[![Astro](https://img.shields.io/badge/Astro-7-FF5D01?style=flat-square&logo=astro&logoColor=white)](https://astro.build)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind](https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![SEO](https://img.shields.io/badge/SEO-JSON--LD%20%2B%20Sitemaps-brightgreen?style=flat-square)](https://schema.org)
[![A11y](https://img.shields.io/badge/A11y-WCAG%202.2%20AA-blue?style=flat-square)](https://www.w3.org/WAI/WCAG22/quickref/)
[![Release](https://img.shields.io/badge/Release-v1.0.0-brightgreen?style=flat-square)](https://github.com)

> Hub editorial y social de **Extremadura es Futuro HOY**, el proyecto de **Diario HOY**, la **Universidad de Extremadura** y su **Consejo Social** para contar el talento, la empresa y el territorio extremeño. Sitio estático construido con Astro, TypeScript, Tailwind CSS y Pagefind, con build diario en GitHub Actions y despliegue en IONOS.

---

## 🚀 Release v1.0.0 — 20 de noviembre de 2026

Primera versión completa del nuevo sitio, que sustituye al WordPress histórico de `hoyextremaduraesfuturo.es`.

### Contenido publicado

- **199 noticias** en `/noticias/`:
  - 16 piezas de HOY 2026, con enlace al artículo original.
  - 183 piezas de 2021–2025 recuperadas del WordPress, con contenido y ficha propia.
- **53 entrevistas** en `/entrevistas/`.
- **94 piezas de encuentros** y **7 eventos** con página propia en `/encuentros/`.
- **243 publicaciones de Instagram** en `/instagram/`, con imagen local y enlace al post original.
- **133 vídeos de YouTube** en `/youtube/`, con ficha y enlace a la reproducción.
- **72 vídeos de TikTok** en `/tiktok/`, recuperados de la caché pública del WordPress.
- **184 reglas de redirección 301** generadas automáticamente para las URLs antiguas.
- **207 páginas** construidas en total.

### Diseño y experiencia

- Dirección visual **“Revista-cartel”**, basada en las caps de Instagram del proyecto.
- Cabeceras de sección con campo amarillo y títulos grandes alineados.
- Cabeceras de redes con campo de color propio, misma altura y misma proporción que las secciones.
- Nombres de protagonistas en amarillo/dorado, pills blancas, corchetes, cintas y marcos.
- Sistema único de subrayado en hover: **2 px de grosor y 4 px de separación**.
- Búsqueda estática con Pagefind y navegación sin dependencias de JavaScript.

### Calidad

- `pnpm check`: **0 errores y 0 warnings**.
- Auditoría interna: **0 incidencias** de H1, JSON-LD, descripciones, imágenes sin `alt` o enlaces internos.
- Lighthouse en portada: **92 Performance · 100 Accesibilidad · 100 Buenas prácticas · 100 SEO**.
- Accesibilidad de las páginas sociales: **100**.

> **Tag pendiente:** `v1.0.0`. El tag lo crea el responsable del repositorio; este README solo documenta la release.

### Limitaciones conocidas de la v1.0.0

- TikTok expone **72 vídeos** en la caché del WordPress; la cuenta tiene 225. Los 153 restantes requieren API oficial o acceso a la cuenta.
- El formulario de contacto y los textos legales definitivos quedan pendientes de la siguiente fase.
- Las fichas de protagonistas y empresas (entidades) están planificadas, pero no forman parte de esta primera release.
- El despliegue a IONOS requiere configurar los secretos FTP en GitHub.

---

## 🎯 Propósito del proyecto

`hoy.es` publica las noticias, entrevistas y reportajes del proyecto. Este sitio no pretende duplicar el diario: ordena ese contenido, lo separa por tipo y lo completa con:

- **Entrevistas** con contexto, empresa, aprendizajes y vídeo.
- **Encuentros** con fecha, lugar, ponentes, crónica, galería y vídeo.
- **Archivo histórico** de 2021–2025 con ficha propia y redirecciones.
- **Redes sociales** con todas las publicaciones disponibles, no solo una selección.
- **Búsqueda** y navegación pensadas para SEO y lectura.

El objetivo es que el lector que llega desde Google, Instagram, YouTube o TikTok encuentre la historia completa y llegue al contenido original con atribución.

---

## ✨ Características principales

### Contenido

- **199 piezas** de noticias, entrevistas y reportajes en `/noticias/`, agrupadas por año.
- **Entrevistas y encuentros separados** en secciones propias e indexables.
- **183 fichas de archivo** con el contenido recuperado del WordPress original.
- **7 eventos** con página de detalle, ponentes, fecha, lugar, mapa y calendario.
- **243 publicaciones de Instagram**, **133 vídeos de YouTube** y **72 de TikTok** en sus secciones.
- Clasificación editorial: `entrevista`, `encuentro` y `reportaje`.

### Diseño

- Sistema **“Revista-cartel”** con paleta crema, amarillo, negro, cian, magenta y verde.
- Tipografías autoalojadas: Bebas Neue, Bodoni Moda, Archivo y Caveat.
- Componentes: `Masthead`, `Ticker`, `LeadStory`, `NewsRow`, `InterviewCard`, `EventPoster`, `SocialTile`, `VideoCard`, `SectionHeader`, `SocialHeader`.
- Hover unificado en todos los enlaces de texto.
- Bloques de color coherentes y títulos de sección alineados.

### SEO y rendimiento

- HTML estático, sin islas de React.
- Canonicals, Open Graph, Twitter Cards y JSON-LD por tipo de página.
- Sitemap, `robots.txt`, RSS y redirecciones 301.
- Imágenes AVIF/WebP con variantes 480/800/1200 y `srcset`.
- Pagefind para búsqueda estática.
- Presupuesto de rendimiento y auditoría Lighthouse.

### Automatización

- Build diario a la **01:00 (Europe/Madrid)** para que el sitio esté listo a las 08:00.
- `workflow_dispatch` para relanzar a mano.
- Build al hacer push de contenido.
- Generación automática de `.htaccess` con las redirecciones del WordPress.
- Deploy estático a IONOS por FTP/SFTP.

---

## 🧱 Stack

| Capa | Tecnología |
| :--- | :--- |
| Framework | Astro 7 (estático) |
| Lenguaje | TypeScript estricto |
| Estilos | Tailwind CSS 4 + tokens CSS |
| Iconos | Lucide (`@lucide/astro`) |
| Búsqueda | Pagefind |
| Validación | Zod |
| Imágenes | Sharp |
| Fechas | date-fns |
| Automatización | GitHub Actions |
| Hosting | IONOS (estático) |
| Runtime | Node.js 22 + pnpm 11 |

---

## 🏗️ Arquitectura

```text
                         ┌─────────────────────────────┐
                         │  Fuentes                    │
                         │  HOY · WordPress · Redes    │
                         └─────────────┬───────────────┘
                                       │
                         ┌─────────────▼───────────────┐
                         │  Scripts Node/TS            │
                         │  sync · import · validate   │
                         └─────────────┬───────────────┘
                                       │
                         ┌─────────────▼───────────────┐
                         │  JSON + imágenes locales    │
                         │  articles · archive · social│
                         │  youtube · tiktok · events  │
                         └─────────────┬───────────────┘
                                       │
                         ┌─────────────▼───────────────┐
                         │  Astro build                │
                         │  207 páginas + sitemaps     │
                         │  Pagefind + .htaccess       │
                         └─────────────┬───────────────┘
                                       │
                         ┌─────────────▼───────────────┐
                         │  IONOS / CDN                │
                         │  HTML estático + media      │
                         └─────────────────────────────┘
```

No hay backend, base de datos ni sesiones. El sitio se genera por completo antes de publicarse.

---

## 📂 Estructura del repositorio

```text
ExtremaduraEsFuturoHoy/
├── .github/
│   └── workflows/
│       └── build.yml                  # Sync, build, Pagefind y deploy
├── docs/
│   └── plans/
│       └── plan-maestro.md            # Plan de producto, SEO y diseño
├── public/
│   ├── fonts/                         # Bebas, Bodoni, Archivo y Caveat
│   ├── media/
│   │   ├── articles/                  # Imágenes de las 16 piezas de HOY
│   │   ├── archive/                   # Imágenes del archivo 2021–2025
│   │   ├── archive-content/           # Imágenes dentro del contenido
│   │   ├── instagram/                 # 243 publicaciones
│   │   ├── tiktok/                    # 72 portadas
│   │   ├── demo/                      # Material de demostración
│   │   └── partners/                  # Logos institucionales
│   ├── .htaccess                      # Generado en cada build
│   ├── robots.txt
│   ├── logo.png
│   ├── logo-header.webp
│   └── logo-light.webp
├── scripts/
│   ├── sync.ts                        # HOY: temática + autor
│   ├── import-archive.ts              # WordPress 2021–2025
│   ├── import-social.ts               # Instagram + YouTube
│   ├── import-tiktok.ts               # TikTok desde la caché
│   ├── localize-content-images.ts     # Imágenes dentro del contenido
│   ├── build-htaccess.ts              # Redirecciones 301
│   └── validate.ts                    # Validación Zod
├── src/
│   ├── components/                    # Sistema de diseño
│   ├── data/                          # JSON de contenido
│   ├── layouts/                       # BaseLayout
│   ├── lib/                           # data, schema, seo, format, media, url
│   ├── pages/                         # Rutas del sitio
│   └── styles/                        # Tailwind + tokens + componentes
├── AGENTS.md                          # Guía para agentes y desarrollo
├── PRODUCT.md                         # Contexto de producto
├── README.md
├── astro.config.mjs
├── package.json
├── pnpm-lock.yaml
└── tsconfig.json
```

---

## 📊 Datos y fuentes

| Fuente | Uso | Volumen |
| :--- | :--- | ---: |
| Temática de HOY | Noticias 2026 | 16 |
| Página de autor de HOY | Noticias 2026 | 16 |
| WordPress original | Archivo 2021–2025 | 183 |
| WordPress · feed Instagram | Publicaciones | 243 |
| WordPress · feed YouTube | Vídeos | 133 |
| WordPress · caché TikTok | Portadas | 72 |
| WordPress · Instagram/news | Eventos | 7 |

### Ficheros de datos

| Fichero | Contenido |
| :--- | :--- |
| `src/data/articles.json` | 16 piezas de HOY 2026 |
| `src/data/archive.json` | 183 piezas de 2021–2025 con contenido |
| `src/data/social.json` | 243 publicaciones de Instagram |
| `src/data/youtube.json` | 133 vídeos de YouTube |
| `src/data/tiktok.json` | 72 vídeos de TikTok |
| `src/data/events.json` | 7 encuentros y próximas citas |
| `src/data/sync-status.json` | Última ejecución de HOY |

Todos los JSON se validan con Zod. Las imágenes se guardan localmente para no depender de URLs caducadas de redes sociales.

---

## 💻 Puesta en marcha en local

Requisitos: Node.js 22+ y pnpm 11+.

```bash
pnpm install
pnpm dev
```

Abre **http://localhost:4321**.

### Comandos

```bash
pnpm dev             # Servidor de desarrollo
pnpm sync            # Actualiza las 16 piezas de HOY y sync-status
pnpm import:archive  # Reimporta el archivo 2021–2025 desde WordPress
pnpm import:social   # Reimporta Instagram (243) y YouTube (133)
pnpm import:tiktok   # Reimporta las portadas de TikTok (72)
pnpm validate        # Valida todos los JSON con Zod
pnpm check           # Comprueba tipos y componentes Astro
pnpm build           # Genera .htaccess, dist/ y el índice Pagefind
pnpm preview         # Sirve el build final
```

> Los comandos `import:*` son de recuperación puntual. El build diario no depende del WordPress antiguo: usa los JSON e imágenes ya commiteados.

---

## 🔄 Flujo de contenido

### Noticias de HOY

1. `pnpm sync` lee la temática y la página de autor.
2. Fusiona, deduplica y clasifica en `entrevista`, `encuentro` o `reportaje`.
3. Descarga y optimiza la imagen principal.
4. Escribe `articles.json` y `sync-status.json`.
5. El build genera la portada, `/noticias/`, `/entrevistas/` y `/encuentros/`.

### Archivo 2021–2025

1. `pnpm import:archive` consulta la API REST del WordPress.
2. Recupera título, contenido, fecha, categoría y medios.
3. Clasifica los `Encuentros` por categoría y los `News` por título/contenido.
4. Optimiza las imágenes y escribe `archive.json`.
5. Genera una ficha en `/noticias/[slug]/` y una redirección 301 desde la URL antigua.

### Redes sociales

1. `pnpm import:social` recorre el feed de Instagram y YouTube del WordPress.
2. Descarga las portadas de Instagram y guarda el resto de metadatos.
3. `pnpm import:tiktok` recupera las 72 portadas disponibles en la caché.
4. El build pinta `/instagram/`, `/youtube/` y `/tiktok/`.

### Encuentros

Los encuentros se guardan en `events.json` con fecha, hora, lugar, ciudad, provincia, ponentes, descripción, imagen y estado (`upcoming` / `past`). Cada uno genera una página en `/encuentros/[slug]/`.

---

## 🌐 Publicación y despliegue

El workflow `.github/workflows/build.yml`:

1. Instala dependencias con pnpm.
2. Ejecuta `pnpm sync` (solo HOY).
3. Valida los datos con `pnpm validate`.
4. Construye con `pnpm build`:
   - genera `public/.htaccess` con **184 redirecciones**;
   - construye las **207 páginas**;
   - indexa con Pagefind.
5. Sube el artefacto `dist` a GitHub Actions.
6. Despliega en IONOS por FTP/SFTP.

### Secretos de GitHub

```text
FTP_SERVER
FTP_USERNAME
FTP_PASSWORD
FTP_REMOTE_DIR
```

Ejemplo de `FTP_REMOTE_DIR`: `/public_html/`.

### Horario

- **01:00 Europe/Madrid** (00:00 UTC en invierno; 02:00 en verano).
- `workflow_dispatch` para lanzarlo a mano.
- Push a `main` para contenido editorial.

Si IONOS permite SSH, se puede sustituir el paso FTP por `rsync` para un despliegue atómico.

---

## 🔍 SEO

- Una sola URL canónica por página.
- Títulos y descripciones únicos, con límite de 160 caracteres en las descripciones.
- `Organization`, `WebSite`, `CollectionPage`, `ItemList`, `NewsArticle`, `Event`, `VideoObject` y `BreadcrumbList`.
- Sitemap automático; se excluyen búsqueda y textos legales en borrador.
- `robots.txt` con sitemap.
- RSS con las últimas 30 piezas.
- Redirecciones 301 del WordPress antiguo a las nuevas fichas.
- Open Graph image 1200×630.
- Imágenes con `alt`, dimensiones, `srcset` y crédito.
- Búsqueda Pagefind indexada en cada build.

---

## 🎨 Sistema de diseño

### Paleta

```css
--paper:   #FEF6E3;
--ink:     #141110;
--lemon:   #F9EC2E;
--gold:    #FFD400;
--cyan:    #13C1DB;
--magenta: #F81D97;
--green:   #0E7A3C;
```

### Tipografía

- **Bebas Neue** — titulares y nombres.
- **Bodoni Moda** — entradillas, citas y textos editoriales.
- **Archivo** — interfaz, metadatos y navegación.
- **Caveat** — anotaciones y guiños.

### Reglas visuales

- Las cabeceras de sección usan una banda de color con el título grande.
- Las cabeceras de redes usan el mismo padding, tamaño y proporción; solo cambia el color.
- El identificador de la red va debajo del título grande.
- El titular principal de la portada va completo sobre un bloque amarillo.
- Todos los enlaces de texto comparten el mismo subrayado hover: 2 px / 4 px.
- Los botones mantienen hover de fondo, sin mezclar subrayado.
- Los nombres de protagonistas usan dorado; la empresa va en pill blanca.
- Fotografías con crédito, recortes y marcos; sin autoplay ni embeds pesados.

---

## 🧩 Modelo de contenido

| Tipo | Dónde aparece | Origen |
| :--- | :--- | :--- |
| `entrevista` | `/entrevistas/` | HOY 2026 + archivo WordPress |
| `encuentro` | `/encuentros/` y archivo | Categoría “Encuentros” + eventos + reportajes de foro/charla |
| `reportaje` | `/noticias/` | News de HOY y archivo |
| `evento` | `/encuentros/[slug]/` | `events.json` |
| `social` | `/instagram/`, `/youtube/`, `/tiktok/` | Feeds del WordPress |

---

## 🏛️ Organización y créditos

- **Proyecto:** Extremadura es Futuro HOY.
- **Impulsa:** Universidad de Extremadura y su Consejo Social.
- **Desarrolla:** Diario HOY.
- **Apoyo:** Fundación MAPFRE, Junta de Extremadura y Alianza Extremadura.
- **Dirección y contenido:** Daniel Vaquerizo.
- **Tecnología:** Astro, TypeScript, Tailwind CSS, Pagefind y GitHub Actions.

---

## 📋 Historial de versiones

### [v1.0.0] — 2026-11-20

- Primera release completa del hub editorial y social.
- 199 noticias, 183 fichas de archivo y 184 redirecciones 301.
- 53 entrevistas, 94 piezas de encuentros y 7 eventos.
- 243 publicaciones de Instagram, 133 vídeos de YouTube y 72 de TikTok.
- Diseño “Revista-cartel” con cabeceras de color, títulos alineados y hover unificado.
- Búsqueda Pagefind, sitemap, RSS, JSON-LD y auditoría Lighthouse 92/100/100/100.
- Build diario en GitHub Actions y despliegue estático en IONOS.

---

## 📄 Licencia

Copyright © 2026 Vocento. Todos los derechos reservados. Consulta [`LICENSE.txt`](LICENSE.txt).

---

## 📚 Documentación

- [`AGENTS.md`](AGENTS.md) — arquitectura, diseño y reglas de desarrollo.
- [`PRODUCT.md`](PRODUCT.md) — contexto de producto.
- [`docs/plans/plan-maestro.md`](docs/plans/plan-maestro.md) — plan de producto, SEO y diseño.
