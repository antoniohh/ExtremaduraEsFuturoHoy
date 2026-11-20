# 🤖 AGENTS.md — Arquitectura, contenido y guía de desarrollo

Este documento define la arquitectura, las restricciones y las decisiones de diseño de **Extremadura es Futuro HOY** para cualquier persona o agente de IA que trabaje en el repositorio.

---

## 1. Principios y restricciones

> [!IMPORTANT]
> El sitio es **estático**. No hay backend, base de datos, sesiones ni panel de administración.

- **Astro 7** con salida estática. **No React**, no islas, no SPA.
- **TypeScript estricto**, **Tailwind CSS 4**, **Lucide**, **Pagefind**, **Zod** y **Sharp**.
- **Node.js 22+** y **pnpm 11+**.
- El contenido vive en JSON versionado. Las imágenes viven en `public/media/` y también se versionan.
- El build diario **no depende del WordPress antiguo**. Los scripts `import:*` son de recuperación puntual.
- No se inventan cifras, testimonios, clientes, premios ni resultados.
- No se republica el texto íntegro de HOY sin acuerdo. Las piezas de 2026 enlazan al artículo original.
- El archivo 2021–2025 sí tiene ficha propia porque se recuperó del WordPress del proyecto.
- El tag `v1.0.0` lo crea el responsable del repositorio. El agente **no debe crear tags**.

---

## 2. Arquitectura

```text
Fuentes
  HOY (temática + autor)
  WordPress (REST + AJAX)
  Instagram / YouTube / TikTok
        │
        ▼
scripts/*.ts
  sync · import-archive · import-social · import-tiktok
  validate · build-htaccess
        │
        ▼
src/data/*.json + public/media/*
        │
        ▼
Astro build
  207 páginas · sitemaps · RSS · JSON-LD
  Pagefind · public/.htaccess
        │
        ▼
dist/ → GitHub Actions → IONOS
```

### Flujo de publicación

1. GitHub Actions se ejecuta a las **01:00 Europe/Madrid**, con `workflow_dispatch` o push.
2. `pnpm sync` actualiza solo las piezas de HOY 2026.
3. `pnpm validate` valida los JSON con Zod.
4. `pnpm build` genera `.htaccess`, HTML, sitemaps, RSS y Pagefind.
5. El artefacto `dist` se despliega en IONOS por FTP/SFTP.

### Regla de oro

**No añadir `import:archive`, `import:social` ni `import:tiktok` al workflow diario.** Dependen del WordPress antiguo y ya se ejecutaron para generar los datos actuales. Si se vuelven a ejecutar, hacerlo de forma manual y revisar el diff.

---

## 3. Stack y comandos

| Capa | Tecnología |
| :--- | :--- |
| Framework | Astro 7 |
| Lenguaje | TypeScript 6 |
| Estilos | Tailwind CSS 4 |
| Iconos | `@lucide/astro` |
| Búsqueda | Pagefind 1.6 |
| Validación | Zod 4 |
| Imágenes | Sharp |
| Fechas | date-fns 4 |
| Automatización | GitHub Actions |
| Hosting | IONOS estático |

```bash
pnpm install
pnpm dev             # http://localhost:4321
pnpm sync            # HOY 2026
pnpm import:archive  # WordPress 2021–2025 (manual)
pnpm import:social   # Instagram + YouTube (manual)
pnpm import:tiktok   # TikTok desde la caché (manual)
pnpm validate        # Zod
pnpm check           # Astro + TypeScript
pnpm build           # .htaccess + Astro + Pagefind
pnpm preview
```

Antes de terminar cualquier cambio:

```bash
pnpm check && pnpm validate && pnpm build
```

---

## 4. Datos y modelos

### Ficheros

| Fichero | Contenido | Volumen |
| :--- | :--- | ---: |
| `src/data/articles.json` | HOY 2026 | 16 |
| `src/data/archive.json` | Archivo WordPress 2021–2025 | 183 |
| `src/data/social.json` | Instagram | 243 |
| `src/data/youtube.json` | YouTube | 133 |
| `src/data/tiktok.json` | TikTok | 72 |
| `src/data/events.json` | Encuentros y citas | 7 |
| `src/data/sync-status.json` | Última sincronización de HOY | — |

### Totales editoriales

- **199 noticias** = 16 HOY + 183 archivo.
- **53 entrevistas**.
- **94 piezas de encuentros**.
- **52 reportajes**.
- **7 eventos** con página propia.
- **207 páginas** generadas.

### Esquema de artículo

Campos principales en `src/lib/schema.ts`:

```ts
type Article = {
  id: string;
  source: "hoy" | "archive";
  sourceUrl: string;
  href: string;              // externo en HOY; interno en archivo
  title: string;
  excerpt: string;
  contentHtml: string;       // solo archivo
  image: string;
  imageWidth: number;
  imageHeight: number;
  authorName: string;
  authorUrl: string;
  section: string;
  categories: string[];
  publishedAt: string;
  modifiedAt: string;
  kind: "entrevista" | "encuentro" | "reportaje";
  tags: string[];
  featured: boolean;
  fetchedAt: string;
};
```

### Clasificación

- **HOY 2026**
  - `encuentro` si la URL contiene `encuentro`, termina en `-ga.html` o el título incluye “así fue el encuentro” / “charla-coloquio”.
  - `entrevista` si el título lleva «», contiene “entrevista” o el extracto incluye “cuenta”, “habla”, “conversamos”, “explica”, etc.
  - `reportaje` en el resto.
- **Archivo WordPress**
  - categoría `Encuentros` → `encuentro`.
  - títulos con “encuentro”, “foro”, “jornada”, “charla” o “coloquio” → `encuentro`.
  - señales de entrevista → `entrevista`.
  - resto → `reportaje`.
- Los `News` del WordPress se dividieron en entrevistas y reportajes; no volver a meter todos en entrevistas.

### Eventos

Cada evento de `events.json` genera una página `/encuentros/[slug]/`. Campos: `slug`, `title`, `subtitle`, `date`, `time`, `place`, `city`, `province`, `description`, `speakers`, `articleSlug`, `videoUrl`, `image`, `status` (`upcoming` / `past`), `registrationUrl`.

Los eventos recuperados de Instagram están en `events.json`; sus imágenes están en `public/media/instagram/`.

---

## 5. Rutas

| Ruta | Contenido |
| :--- | :--- |
| `/` | Portada: lead, último, río, voces, redes, archivo |
| `/noticias/` | 199 piezas agrupadas por año |
| `/noticias/[slug]/` | Ficha local del archivo 2021–2025 |
| `/entrevistas/` | 53 entrevistas |
| `/encuentros/` | Eventos recientes + archivo de encuentros |
| `/encuentros/[slug]/` | Detalle de evento |
| `/instagram/` | 243 publicaciones |
| `/youtube/` | 133 vídeos |
| `/tiktok/` | 72 vídeos |
| `/ediciones/` | Archivo por año |
| `/sobre-el-proyecto/` | Proyecto y equipo |
| `/colaboradores/` | Instituciones |
| `/contacto/` | Canales de contacto |
| `/buscar/` | Pagefind (`noindex`) |
| `/rss.xml` | Últimas 30 piezas |
| `/sitemap-index.xml` | Sitemap |

Las páginas legales (`/aviso-legal/`, `/privacidad/`, `/cookies/`, `/accesibilidad/`) son borradores `noindex` y están excluidas del sitemap.

---

## 6. Sistema de diseño

### Paleta

```css
--paper:   #FEF6E3;
--ink:     #141110;
--lemon:   #F9EC2E;
--gold:    #FFD400;
--cyan:    #13C1DB;
--magenta: #F81D97;
--green:   #0E7A3C;
--line:    #D9CDB8;
--muted:   #6B625A;
```

### Tipografía

- **Bebas Neue** — display y titulares.
- **Bodoni Moda** — serif editorial.
- **Archivo Variable** — interfaz y texto.
- **Caveat** — anotaciones.

Las fuentes se autoalojan en `public/fonts/`. No cargar Google Fonts en producción.

### Cabeceras

- `SectionHeader` (Noticias, Entrevistas, Encuentros, Archivo, Buscar): banda de color con **solo el título grande**; descripción y acciones debajo.
- `SocialHeader` (Instagram, YouTube, TikTok): misma estructura, mismo padding (`py-6 lg:py-8`), mismo tamaño de título (`clamp(3.4rem,9vw,7.5rem)`) y misma proporción de banda. El color cambia por plataforma; el identificador `Cuenta oficial / @handle` va **debajo** del título.
- No volver a meter el handle, la descripción o el botón dentro de la banda de color: desplazan el título y rompen la alineación con las secciones.

### Título principal de portada

- El H1 completo va dentro de un bloque `bg-lemon` con padding coherente.
- No volver a resaltar solo el nombre: la cobertura debe ser total.
- El subrayado del hover debe funcionar sobre el bloque amarillo.

### Hovers

Todos los enlaces de texto usan `.u-link`:

```css
text-decoration-line: underline;
text-decoration-thickness: 2px;
text-decoration-color: transparent;
text-underline-offset: 4px;
```

En hover/focus se aplica `text-decoration-color: currentColor`. El footer replica los mismos valores. Los botones usan hover de fondo, no subrayado.

No introducir `hover:underline` con otros offsets ni pseudo-elementos con `bottom: -5px`.

### Componentes

- `Masthead`, `Ticker`, `Footer`
- `SectionHeader`, `SocialHeader`
- `LeadStory`, `NewsRow`, `InterviewCard`
- `EventPoster`, `SocialTile`, `VideoCard`
- `TypeChip`, `ArrowLink`, `Breadcrumbs`, `ArticleMeta`

---

## 7. SEO

- Canonical autorreferente en todas las páginas indexables.
- Un solo `H1` por página.
- Descripciones ≤ 160 caracteres.
- JSON-LD: `Organization`, `WebSite`, `CollectionPage`, `ItemList`, `NewsArticle`, `Event`, `VideoObject`, `BreadcrumbList`.
- Sitemap automático; se excluyen `/buscar/` y legales.
- `robots.txt` con sitemap.
- `.htaccess` generado con **184 redirecciones 301** (183 piezas + `/ediciones-anteriores/`).
- Imágenes con `alt`, dimensiones, `srcset` y crédito.
- Pagefind indexa 207 páginas.
- No crear páginas de etiquetas vacías ni duplicar listados por query.

---

## 8. Rendimiento y accesibilidad

- Objetivo: LCP ≤ 2,0 s, INP ≤ 200 ms, CLS ≤ 0,05.
- JS inicial mínimo: no hay islas de React.
- Imágenes locales en AVIF/WebP; variantes 480/800/1200 en artículos y archivo.
- `loading="lazy"` salvo la imagen principal; `fetchpriority="high"` en el lead.
- Sin autoplay ni iframes de redes hasta interacción.
- WCAG 2.2 AA: foco visible, teclado, contraste, alt, `prefers-reduced-motion`.
- Lighthouse actual: 92 Performance / 100 Accesibilidad / 100 Buenas prácticas / 100 SEO.

---

## 9. Operación y despliegue

### Workflow

`.github/workflows/build.yml`:

- cron `0 0 * * *` (01:00 en invierno, 02:00 en verano).
- `workflow_dispatch`.
- push a `main`.
- `pnpm sync` → `pnpm validate` → `pnpm build`.
- artefacto `dist` + deploy FTP.

### Secretos

```text
FTP_SERVER
FTP_USERNAME
FTP_PASSWORD
FTP_REMOTE_DIR
```

### Generación de `.htaccess`

`scripts/build-htaccess.ts` lee `src/data/archive.json` y escribe `public/.htaccess` con:
- `ErrorDocument 404`.
- redirección de `/ediciones-anteriores/`.
- 410 para login/register/resetpass.
- 183 redirecciones de piezas antiguas.
- caché y cabeceras de seguridad.

No editar `public/.htaccess` a mano: se regenera en cada build.

---

## 10. Guía para agentes

### Antes de tocar

1. Lee este documento, `PRODUCT.md` y `docs/plans/plan-maestro.md`.
2. Ejecuta `git status` y no sobrescribas cambios ajenos.
3. Comprueba los conteos actuales en `src/data/`.
4. Si el cambio afecta a contenido, revisa si debe actualizarse `README.md` y este archivo.

### Al modificar

- Mantén el estilo visual y los tokens existentes.
- No introduzcas React, jQuery, Bootstrap ni un backend.
- No cambies las fuentes ni los colores sin aprobación.
- No rompas la alineación de `SectionHeader` y `SocialHeader`.
- No cambies el sistema `.u-link`.
- No elimines páginas de archivo ni redirecciones.
- No borres imágenes de `public/media/` sin revisar referencias.
- No añadas dependencias pesadas sin justificarlo.
- No crees tags ni releases en GitHub.

### Después de tocar

```bash
pnpm check
pnpm validate
pnpm build
```

Y revisa:

- 207 páginas.
- 0 incidencias de H1/JSON-LD/descripciones/alt/enlaces.
- 184 redirecciones en `.htaccess`.
- Que `/entrevistas/` no incluya encuentros.
- Que `/encuentros/` incluya los eventos de `events.json` y el archivo.
- Que las cabeceras de redes mantengan la misma proporción que las secciones.

### Checklist de contenido

- [ ] La noticia tiene título, extracto, fecha, imagen y tipo.
- [ ] La imagen está local y optimizada.
- [ ] La URL no duplica otra.
- [ ] La clasificación es correcta.
- [ ] La redirección antigua existe si viene del WordPress.
- [ ] El JSON valida con Zod.
- [ ] El build genera la página.

---

## 11. Limitaciones conocidas

- **TikTok:** 72 vídeos recuperados de la caché del WordPress; la cuenta tiene 225. Los 153 restantes necesitan API oficial o acceso.
- **Formulario de contacto:** pendiente de conectar.
- **Textos legales:** borradores `noindex`.
- **Fichas de protagonistas y empresas:** planificadas, no implementadas.
- **CMS:** no hay CMS; el contenido editorial se edita en JSON/MDX y Git.
- **Despliegue:** pendiente de configurar los secretos FTP de IONOS.
- **Tamaño del build:** ~77 MB por las 243 imágenes de Instagram y las 183 del archivo. Las listas usan `loading="lazy"`.

---

## 12. Criterio de aceptación de la v1.0.0

- 199 noticias, 53 entrevistas, 94 piezas de encuentros y 7 eventos.
- 243 Instagram, 133 YouTube y 72 TikTok.
- 207 páginas y 184 redirecciones.
- Cabeceras alineadas y hover unificado.
- `pnpm check`, `pnpm validate` y `pnpm build` en verde.
- Lighthouse: 92/100/100/100.
- Sin incidencias de H1, JSON-LD, descripciones, alt o enlaces internos.

El tag `v1.0.0` queda reservado al responsable del repositorio.
