# Plan maestro — Extremadura es Futuro HOY

**Versión:** 1.2 · 19 de noviembre de 2026
**Estado:** producto, diseño y despliegue confirmados; esqueleto funcional construido y pendiente de revisión

> **Implementación:** portada, noticias (199 piezas), entrevistas (53), encuentros (94 piezas + 7 eventos), Instagram (243 publicaciones), YouTube (133 vídeos), TikTok (72 vídeos), búsqueda, 183 fichas de archivo y páginas legales. Datos reales de HOY y del WordPress original. Build verificado y workflow diario a la 01:00.
**Objetivo:** sustituir el WordPress actual de `hoyextremaduraesfuturo.es` por un sitio editorial y social, estático, rápido, accesible y pensado para SEO, que reutilice el contenido de HOY y las redes del proyecto sin canibalizar al diario.

**Decisiones ya cerradas:**

- Modelo de contenido: **hub + fichas de entidad** (no duplicar los artículos de HOY).
- Diseño: dirección **“Revista-cartel”** aprobada, basada en las caps de Instagram.
- Redes sociales: **curación manual** (sin depender de APIs de Instagram/TikTok).
- Stack: **Astro estático + TypeScript + Tailwind + Lucide + GitHub Actions**, sin islas de React.
- Actualización: **build diario a la 01:00 (Europe/Madrid)**, listo a las 08:00, más build manual y build al hacer push de contenido.

---

## Índice

1. [Resumen ejecutivo](#1-resumen-ejecutivo)
2. [Diagnóstico y activos](#2-diagnóstico-y-activos)
3. [Decisión de producto y contenido](#3-decisión-de-producto-y-contenido)
4. [Stack y arquitectura](#4-stack-y-arquitectura)
5. [Modelo de datos](#5-modelo-de-datos)
6. [Rutas, migración y SEO](#6-rutas-migración-y-seo)
7. [Sistema de diseño](#7-sistema-de-diseño)
8. [Integraciones y sincronización](#8-integraciones-y-sincronización)
9. [Rendimiento, accesibilidad, seguridad y legal](#9-rendimiento-accesibilidad-seguridad-y-legal)
10. [Operación editorial](#10-operación-editorial)
11. [Roadmap](#11-roadmap)
12. [Medición y KPIs](#12-medición-y-kpis)
13. [Riesgos](#13-riesgos)
14. [Decisiones abiertas](#14-decisiones-abiertas)
15. [Siguientes pasos](#15-siguientes-pasos)

---

## 1. Resumen ejecutivo

### Qué vamos a construir

Un **hub editorial de marca** para Extremadura es Futuro HOY, no una copia de `hoy.es`. La portada será el listado de noticias del proyecto, tal y como pediste, pero el valor diferencial estará en:

- separar **Entrevistas** y **Encuentros** en secciones propias e indexables;
- convertir cada protagonista y cada empresa en una **ficha única** (bio, empresa, aprendizajes, vídeo, redes y enlace a la entrevista completa);
- convertir cada encuentro en una **página de evento** con crónica, ponentes, galería, vídeo y materiales;
- integrar **Instagram, YouTube y TikTok** mediante curación manual, sin scripts pesados ni dependencias de APIs;
- conservar y ordenar el archivo histórico de 2021–2025;
- publicar con un pipeline reproducible: GitHub Actions sincroniza, construye y despliega estático en IONOS.

### Las dos opciones que planteaste

| Criterio | **A. Astro estático + GitHub Actions** (recomendada) | **B. React + PHP Slim en IONOS** |
|---|---|---|
| SEO | Excelente: HTML ya renderizado | Malo si el React es una SPA; exigiría SSR o prerender |
| Core Web Vitals | Muy buenos: cero JS innecesario | Peor: hidratación, bundle y servidor PHP |
| Complejidad | Baja: un lenguaje, un build | Alta: React + PHP + MySQL + dos despliegues |
| Coste | Muy bajo | Medio: mantenimiento de PHP/MySQL |
| Actualización | Build diario a la 01:00 + manual | Tiempo real |
| Edición | Git/MDX o CMS Git-based | Panel PHP o CMS |
| Seguridad | Superficie mínima: no hay backend | Más superficie: PHP, sesiones, formularios |
| Escalabilidad | CDN/estático | Servidor y base de datos |

**Recomendación:** la opción **A**. El objetivo principal es SEO y rendimiento; un sitio estático es la mejor base posible. La opción B solo tendría sentido si necesitáis un backend propio desde el día 1 (usuarios, pagos, panel a medida). Para este proyecto, no hace falta: las noticias se leen de HOY en el build y las redes se curan a mano.

### Decisiones recomendadas

| Decisión | Recomendación | Por qué |
|---|---|---|
| Framework | **Astro estático** | HTML servido, cero JS por defecto, SEO y CWV superiores |
| Interactividad | **TypeScript vanilla** (sin React) | Filtros, búsqueda, lightbox y fachadas con JS mínimo |
| Estilos | **Tailwind CSS v4** + tokens CSS | Velocidad y sistema de diseño consistente |
| Iconos | **Lucide** (`lucide-astro`) | SVG ligero y coherente |
| Ingesta | **Node.js + TypeScript en GitHub Actions** | Sin servidor, reproducible, programable |
| Datos | **JSON + MDX validados con Zod** | Sin base de datos; versionado en Git |
| Búsqueda | **Pagefind** | Índice estático, sin servidor, sin React |
| Hosting | **Estático en IONOS** detrás de Cloudflare (opcional) | Coste mínimo y caché global |
| CMS | **Git/MDX**; Sveltia CMS opcional | Sin backend; el editor puede usar formularios |
| Social | **Curación manual** + YouTube RSS opcional | Sin aprobaciones de Meta/TikTok |
| Diseño | **Revista-cartel** | Identidad real del proyecto, no plantilla |

### Resultado esperado

- Un sitio que se siente como la campaña de Instagram, pero se lee como una publicación.
- Portada fresca, con noticias, entrevistas y encuentros separados sin fricción.
- Fichas de protagonistas y empresas que pueden posicionar a largo plazo.
- Cero dependencia de APIs sociales para publicar.
- Migración sin perder el SEO acumulado del dominio actual.
- Un build reproducible que cualquiera del equipo puede relanzar.

---

## 2. Diagnóstico y activos

### 2.1 Qué hay hoy

El sitio actual es un WordPress con:

- **Yoast SEO** y sitemaps (`post-sitemap.xml`, `page-sitemap.xml`).
- **Smash Balloon Instagram Feed** y **Feeds for YouTube** para incrustar redes.
- **183 posts** publicados entre 2021 y 2025, además de 8 páginas.
- Un menú reducido: Inicio, Ediciones anteriores, Instagram, TikTok, YouTube.
- El contenido principal (entrevistas, reportajes y encuentros) vive en `hoy.es`; la web del proyecto actúa como escaparate.

### 2.2 Problemas detectados

1. **Arquitectura SEO pobre:** no hay separación clara entre entrevistas, encuentros y reportajes; no hay páginas de entidad ni de evento.
2. **Contenido prestado:** casi todo el valor informativo está en `hoy.es`, pero el proyecto no tiene páginas propias que compitan por búsquedas long-tail.
3. **Dependencia de plugins:** los feeds sociales cargan scripts de terceros y condicionan el rendimiento.
4. **Experiencia móvil mejorable:** el menú actual y los embeds no están pensados para lectura rápida ni para compartir.
5. **Sin datos estructurados propios:** no hay `Person`, `Event`, `VideoObject` ni un grafo de entidades del proyecto.
6. **Archivo desaprovechado:** 183 posts antiguos sin una taxonomía útil ni enlazado interno.
7. **Migración pendiente:** hay que inventariar y redirigir todas las URLs antes de apagar WordPress.

### 2.3 Activos que debemos conservar

- La marca y el logotipo: “EXTREMADURA” en condensada + “es futuro” en script.
- El lenguaje visual de las caps: crema, amarillo, negro, cian y magenta; tipografía condensada, serif editorial, etiquetas trackeadas, marcos, cintas y recortes.
- El archivo de entrevistas y encuentros.
- La autoría de **Daniel Vaquerizo** y la credibilidad del diario HOY.
- El respaldo institucional: Universidad de Extremadura, Consejo Social, Fundación MAPFRE, Junta de Extremadura y Alianza Extremadura.
- Las cuentas activas de Instagram, YouTube y TikTok.

### 2.4 Fuentes de datos

| Fuente | URL | Qué aporta | Cómo la integramos |
|---|---|---|---|
| Temática HOY | `https://www.hoy.es/tematicas/extremadura-es-futuro-hoy.html` | Últimas noticias del proyecto, con imagen, extracto, autor y fecha | Scraping HTML con Cheerio; enriquecimiento con el JSON-LD de cada artículo |
| Autor HOY | `https://www.hoy.es/autor/daniel-vaquerizo-7580.html` | Todo lo publicado por Daniel Vaquerizo, incluidas piezas fuera de la temática | Scraping HTML + paginación `/pagina-N.html`; filtro por etiqueta y patrón de URL |
| Instagram | `https://www.instagram.com/extremaduraesfuturohoy/` | Posts y reels del proyecto | Curación manual en MDX/JSON; imagen subida o URL estable |
| YouTube | `https://www.youtube.com/@ExtremaduraEsFuturo` | Entrevistas y encuentros en vídeo | Curación manual + RSS público del canal (sin API key) |
| TikTok | `https://www.tiktok.com/@extremaduraesfuturohoy` | Vídeos cortos y clips | Curación manual + oEmbed público para miniatura |
| Web actual | `https://www.hoyextremaduraesfuturo.es/` | 183 posts y 8 páginas | Inventario, auditoría y redirecciones 301 |

### 2.5 Lo que hemos verificado

- La página de autor pagina correctamente (`/pagina-2.html` responde 200).
- La paginación de la temática (`/pagina-1.html`, `/pagina-2.html`) devuelve 404; el enlace “Ver más” no es fiable. **La fuente principal será la página de autor + la portada de la temática**.
- El RSS de la temática existe pero está vacío; el de secciones sí funciona. No sirve como fuente del proyecto.
- Cada artículo de `hoy.es` incluye JSON-LD `NewsArticle` con `articleBody`, fechas, autor, imagen y `keywords`. Es la mejor vía para enriquecer sin scrapear el cuerpo a mano.
- `robots.txt` de `hoy.es` bloquea a bots de entrenamiento de IA, no a un lector editorial. Aun así, la ingesta debe ser lenta, identificada y, preferiblemente, pactada.
- Instagram sirve la imagen de un post público en `https://www.instagram.com/p/{shortcode}/media/?size=l`. Es un endpoint **no documentado**: solo lo usaremos como ayuda de curación, nunca como base de producción.
- TikTok oEmbed funciona para posts individuales y para el perfil, pero no devuelve un listado de últimos vídeos.
- YouTube tiene un **RSS público** por canal (`https://www.youtube.com/feeds/videos.xml?channel_id=...`) que no requiere API key. La importación final usa el feed de WordPress para recuperar los 133 vídeos del canal, no solo los 15 del RSS.
- Instagram y TikTok se han recuperado del feed de WordPress: 243 publicaciones de Instagram y 72 portadas de TikTok disponibles en la caché del plugin.
- El canal de YouTube está identificado: `UC1I4SH_7zLg7ILl7Ens1rsA`.

### 2.6 Clasificación: entrevistas vs. encuentros

La separación no puede depender solo del título. Propuesta de reglas, con intervención editorial cuando haya duda:

| Tipo | Señales | Ejemplo |
|---|---|---|
| **Entrevista** | URL `-nt.html`; titular entre «»; autor Daniel Vaquerizo; sección Economía; etiqueta `Extremadura Es Futuro HOY` | “Francisco José Vaquero: «No le debemos nada a nadie…»” |
| **Encuentro** | URL con `encuentro` o `-ga.html` (galería); titular “Así fue el encuentro…”; autor José Vicente Arnelas; sección Extremadura; varias fotos | “Así fue el encuentro… con la productora The Glow” |
| **Reportaje** | Listados, balances, piezas de la UEx, especiales | “Nueve empresas extremeñas exitosas que desconoces” |

**Insight clave:** un encuentro no es una noticia suelta. Es una entidad que agrupa:

- la crónica o galería de fotos;
- la entrevista posterior (si existe);
- el vídeo de YouTube;
- el post o reel de Instagram;
- los ponentes y la empresa;
- la fecha, el lugar y el estado (próximo / celebrado).

El modelo de datos —en este caso, los ficheros de contenido— debe modelar eso como `event`, no como tres artículos independientes.

---

## 3. Decisión de producto y contenido

### 3.1 Modelo elegido: hub + entidades

**Decidido: modelo D.**

| Modelo | Qué hace | Veredicto |
|---|---|---|
| A. Escaparate puro | Tarjetas que enlazan a `hoy.es`; sin fichas propias | Insuficiente para SEO |
| B. Sindicación con canonical | Reproduce el artículo y canonicaliza a `hoy.es` | No posiciona |
| C. Réplica completa | Publica el texto íntegro con canonical propio | Canibaliza `hoy.es` |
| **D. Hub + entidades** | Feed curado + páginas propias de protagonistas, empresas, encuentros y ediciones | **Elegido** |

Reglas:

1. Las tarjetas de noticias enlazan a `hoy.es` con atribución visible (“Leer en HOY”).
2. No se republica el texto completo sin un acuerdo explícito y una estrategia de canonicalización.
3. Se crean páginas propias y originales para:
   - protagonistas;
   - empresas;
   - encuentros;
   - ediciones;
   - temas.
4. Cada ficha enlaza a la entrevista original, al vídeo y al post social. El usuario circula, y el diario recibe tráfico.
5. Si en el futuro se decide publicar artículos completos, la arquitectura lo permite con un flag `contentMode` y canonical configurable.

### 3.2 La portada

La portada será el listado de noticias, como pediste. Pero no un muro de tarjetas iguales:

1. **Cabecera-masthead** con el logotipo, la fecha y la hora de actualización.
2. **Noticia principal** a gran escala, con imagen, titular y extracto.
3. **“Lo último”**: 5 noticias en columna, con hora y tipo.
4. **Pestañas**: Todas / Entrevistas / Encuentros. En escritorio filtran; en móvil navegan a las secciones.
5. **Río de noticias**: 9 piezas con imagen 4:3, tipo, fecha y autor.
6. **Voces**: 3 protagonistas con retrato 4:5.
7. **Franja social**: 4 posts de Instagram, 2 vídeos de YouTube y 2 de TikTok.
8. **Próximo encuentro**: cartel con fecha, lugar y “Asistencia libre”.
9. **Archivo** y footer institucional.

Sin JavaScript, las pestañas siguen funcionando como enlaces a `/entrevistas/` y `/encuentros/`.

### 3.3 Navegación

- Noticias
- Entrevistas
- Encuentros
- Instagram
- YouTube
- TikTok
- Ediciones
- Sobre el proyecto

En móvil: cabecera compacta + botón de menú + pestañas desplazables. Sin barra inferior tipo app: es un sitio de lectura, no una app.

### 3.4 Recorridos principales

| Llega desde | Quiere | Le damos |
|---|---|---|
| Instagram | Ver la entrevista completa | Post → ficha de protagonista → vídeo → artículo en HOY |
| Google | Información sobre una empresa o persona | Ficha única con datos, aprendizajes y enlaces |
| Un encuentro | Saber qué pasó o si hay otro | Página de evento con crónica, fotos, vídeo y próximo encuentro |
| HOY | Conocer el proyecto | Portada + sobre el proyecto + colaboradores |
| Una marca o institución | Colaborar | Contacto y dossier |

---

## 4. Stack y arquitectura

### 4.1 Astro o React: la respuesta definitiva

**Astro estático, sin islas de React.**

- **Astro** construye todas las páginas en HTML y CSS. No se envía una aplicación JavaScript.
- **TypeScript vanilla** cubre la poca interacción necesaria:
  - filtros progresivos en la portada;
  - búsqueda con Pagefind;
  - lightbox de galería;
  - fachada de vídeo con reproducción bajo demanda;
  - menú móvil.
- **No React** porque:
  - añade bundle y hidratación sin necesidad;
  - el contenido es estático y se puede resolver con enlaces y pequeñas mejoras;
  - el objetivo es SEO y CWV, no una app.

**La opción React + PHP Slim** solo se justificaría si en el futuro hay área de usuario, pagos o un panel a medida. No es el caso. Si algún día se necesita, se puede añadir un backend aparte sin rehacer el frontend estático.

### 4.2 Piezas

| Capa | Tecnología | Uso |
|---|---|---|
| Framework web | Astro (última estable) | Rutas, layouts, content collections, sitemaps |
| Lenguaje | TypeScript estricto | Todo el proyecto |
| Estilos | Tailwind CSS v4 + CSS custom properties | Tokens y utilidades |
| Iconos | Lucide (`lucide-astro`) | Iconografía renderizada en build |
| Datos | JSON + MDX validados con Zod | Contenido generado y editorial |
| Búsqueda | Pagefind | Índice estático en `/buscar/` |
| Fechas | `date-fns` con locale `es` | Formatos y zonas horarias |
| Imágenes | `sharp` | AVIF/WebP, recortes 4:5, 16:9, 1:1 |
| Scraping | Cheerio + `fast-xml-parser` | HOY y RSS de YouTube |
| Tests | Vitest + Playwright | Adaptadores y flujos críticos |
| Lint/format | ESLint + Prettier | Consistencia |
| Package manager | pnpm | Build reproducible |
| Automatización | GitHub Actions | Sync, build, test y deploy |

### 4.3 Arquitectura

```
                ┌─────────────────────────────────────┐
                │        Fuentes externas             │
                │  hoy.es · YouTube RSS · redes manual│
                └───────────────┬─────────────────────┘
                                │
                    ┌───────────▼───────────┐
                    │  GitHub Actions       │
                    │  Node/TS + pnpm       │
                    │  sync → validate →    │
                    │  build → test → deploy│
                    └───────────┬───────────┘
                                │
                ┌───────────────▼─────────────────┐
                │  Repo: JSON + MDX + imágenes    │
                │  articles · people · companies  │
                │  events · social · topics       │
                └───────────────┬─────────────────┘
                                │
                    ┌───────────▼───────────┐
                    │  Astro build          │
                    │  HTML + CSS + assets  │
                    │  Pagefind + sitemaps  │
                    └───────────┬───────────┘
                                │
                    ┌───────────▼───────────┐
                    │  IONOS (estático)     │
                    │  .htaccess + 404      │
                    └───────────┬───────────┘
                                │
                    ┌───────────▼───────────┐
                    │  Cloudflare (opcional)│
                    │  CDN + WAF + caché    │
                    └───────────────────────┘
```

### 4.4 Build, frescura y caché

- **Build programado** todos los días a la **01:00 (Europe/Madrid)**, además de:
  - `workflow_dispatch` para relanzar a mano;
  - push a `main` cuando cambie contenido editorial;
  - build nocturno de auditoría.
- **Por qué a la 01:00:** el WordPress actual arrastra un retraso de unas 7 horas; con este horario el sitio queda listo antes de las 08:00. El coste es mínimo y el contenido del día anterior ya está consolidado.
- **Frecuencia decidida:** diaria. Si más adelante se necesita más frescura, se puede añadir un segundo build a las 13:00 sin cambiar la arquitectura.
- **Caché de HTML:** 5–15 min en el servidor/CDN; los assets con hash, un año.
- **Última actualización visible:** “Actualizado hoy a las …” en la portada y en el footer.
- **Sin SSR:** todo el HTML se genera en el build. No hay servidor de aplicación.
- **Rollback:** conservar el build anterior en IONOS y poder restaurarlo en un comando.

### 4.5 Hosting y despliegue en IONOS

**Recomendado: estático en IONOS.**

- El dominio y el hosting actual se mantienen.
- El build se sube a `public_html` por SFTP/FTP (o `rsync` si hay SSH).
- `.htaccess` genera:
  - redirecciones 301/410;
  - cabeceras de caché;
  - cabeceras de seguridad;
  - `ErrorDocument 404 /404.html`.
- **Despliegue atómico:** subir a `public_html_release` y intercambiar, o usar `rsync` con backup previo. Si IONOS no permite symlinks, hacer backup + `rsync --delete` y tener un job de rollback.
- **Cloudflare delante (opcional pero recomendado):** CDN, WAF, caché y HTTPS gestionado.
- **Formulario de contacto:** pequeño endpoint PHP en IONOS (`/contact.php`) o servicio externo (Formspree/Basin). Es la única pieza dinámica.
- **Newsletter:** Brevo/Mailchimp/Buttondown con formulario embebido; sin backend propio.
- **Backups:** GitHub es la fuente de verdad; IONOS solo contiene el build. Backup semanal del `public_html`.

**Alternativa descartada: React + PHP Slim.**

- Un React SPA servido desde `public/` de Slim no es indexable bien sin SSR/prerender.
- Si se quisiera hacer bien, habría que añadir SSR (Vike, Next export, prerender) y mantener PHP + MySQL + React.
- Añade dos stacks, más superficie de seguridad y más coste de mantenimiento para un proyecto cuyo valor es contenido.

### 4.6 Estructura del repositorio

```
ExtremaduraFuturoHoy/
├── docs/
│   ├── plans/
│   │   └── plan-maestro.md
│   ├── seo/
│   └── runbooks/
├── src/
│   ├── pages/
│   ├── layouts/
│   ├── components/
│   ├── content/            # MDX: personas, empresas, eventos, temas, social
│   ├── data/               # JSON generado: articles, youtube, sync-status
│   ├── lib/
│   │   ├── sources/        # hoy, youtube, social
│   │   ├── seo/            # JSON-LD, sitemaps, metadatos
│   │   ├── media/
│   │   └── utils/
│   └── styles/
├── scripts/
│   ├── sync.ts
│   ├── validate.ts
│   ├── build-htaccess.ts
│   └── build-search.ts
├── public/
│   ├── media/
│   ├── .htaccess
│   └── 404.html
├── tests/
├── .github/workflows/
│   ├── build.yml
│   └── lighthouse.yml
├── astro.config.mjs
├── tailwind.config.ts
├── .env.example
└── package.json
```

### 4.7 Variables y secretos

```bash
PUBLIC_SITE_URL=https://www.hoyextremaduraesfuturo.es
PUBLIC_SITE_NAME=Extremadura es Futuro HOY

HOY_TEMATICA_URL=https://www.hoy.es/tematicas/extremadura-es-futuro-hoy.html
HOY_AUTHOR_URL=https://www.hoy.es/autor/daniel-vaquerizo-7580.html
HOY_PAGES=3
HOY_REQUEST_DELAY_MS=2000

YOUTUBE_CHANNEL_ID=UC1I4SH_7zLg7ILl7Ens1rsA
YOUTUBE_RSS_URL=https://www.youtube.com/feeds/videos.xml?channel_id=UC1I4SH_7zLg7ILl7Ens1rsA

PAGE_SIZE=12
BUILD_TIMEZONE=Europe/Madrid
```

Secretos de GitHub Actions (no van al repo):

```text
FTP_SERVER=
FTP_USERNAME=
FTP_PASSWORD=
FTP_REMOTE_DIR=/public_html/
```

Si se usa Cloudflare: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ZONE_ID` para purgar caché.

### 4.8 CI/CD

**Workflow principal (`build.yml`):**

```yaml
name: build-and-deploy

on:
  schedule:
    # 00:00 UTC = 01:00 Europe/Madrid en invierno (CET).
    # En verano (CEST) se ejecuta a las 02:00, todavía lejos de las 08:00.
    - cron: "0 0 * * *"
  workflow_dispatch:
  push:
    branches: [main]
    paths:
      - "src/**"
      - "content/**"
      - "public/**"
      - "scripts/**"
      - "package.json"
      - "pnpm-lock.yaml"

concurrency:
  group: site-build
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    timeout-minutes: 20
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm

      - run: pnpm install --frozen-lockfile
      - run: pnpm sync
      - run: pnpm validate
      - run: pnpm build
      - run: pnpm test

      - name: Deploy a IONOS
        uses: SamKirkland/FTP-Deploy-Action@v4
        with:
          server: ${{ secrets.FTP_SERVER }}
          username: ${{ secrets.FTP_USERNAME }}
          password: ${{ secrets.FTP_PASSWORD }}
          local-dir: ./dist/
          server-dir: ${{ secrets.FTP_REMOTE_DIR }}
```

Notas:

- El deploy FTP es incremental; para atomicidad, valorar SFTP + `rsync` si IONOS ofrece SSH.
- Si el build falla, **no se despliega** y sigue el último build bueno.
- Guardar `dist/` como artifact durante 14 días para inspección y rollback.
- Añadir un job de Lighthouse CI contra el build local (no contra producción) con umbral 95 en Performance/SEO/Accessibility/Best Practices.
- Avisar por email/Slack si el workflow falla dos veces seguidas.

### 4.9 Límites de GitHub Actions

- Cron no es exacto: puede retrasarse 5–15 min. Aceptable.
- Minutos: un build diario de 3–5 min ≈ 90–150 min/mes. Cabe de sobra en el plan gratuito de repos privados (2.000 min).
- Si el build crece, mantener el build diario y añadir un segundo build solo si el contenido lo exige.
- Evitar commits automáticos que disparen builds en bucle; el sync no debe hacer commit en cada ejecución.

---

## 5. Modelo de datos

### 5.1 Filosofía

Sin base de datos. El contenido vive en:

- **JSON generado** (`src/data/articles.json`, `src/data/youtube.json`) por el script de sync.
- **MDX editorial** (`src/content/people/*.mdx`, `companies/*.mdx`, `events/*.mdx`, `topics/*.mdx`, `social/*.mdx`) escrito por el equipo.
- **Imágenes** en `public/media/`, optimizadas en build.

Todo se valida con **Zod** antes de construir. Si un dato no cumple el esquema, el build falla con un mensaje claro.

### 5.2 Ficheros

```
src/data/
├── articles.json       # generado por sync
├── youtube.json        # generado por RSS/oEmbed
├── sync-status.json    # última ejecución, errores, counts
└── redirects.json      # mapa 301/410

src/content/
├── people/*.mdx
├── companies/*.mdx
├── events/*.mdx
├── topics/*.mdx
├── editions/*.mdx
└── social/*.mdx
```

### 5.3 Esquema de artículo

| Campo | Tipo | Notas |
|---|---|---|
| `id` | string | Hash estable de la URL |
| `source` | `"hoy"` | |
| `sourceUrl` | string | URL canónica en `hoy.es` |
| `title` | string | |
| `excerpt` | string | |
| `image` | string | URL original o local |
| `imageWidth` / `imageHeight` | number | Para evitar CLS |
| `authorName` | string | |
| `authorUrl` | string | |
| `section` | string | Economía, Extremadura… |
| `publishedAt` | ISO string | |
| `modifiedAt` | ISO string | |
| `kind` | `"entrevista" \| "encuentro" \| "reportaje"` | |
| `tags` | string[] | |
| `eventSlug` | string? | Enlace a `events` |
| `personSlug` | string? | Enlace a `people` |
| `companySlug` | string? | Enlace a `companies` |
| `featured` | boolean | |
| `hash` | string | Detectar cambios |
| `fetchedAt` | ISO string | |

### 5.4 Esquema de persona

| Campo | Tipo |
|---|---|
| `slug` | string |
| `name` | string |
| `role` | string |
| `company` | string? |
| `bio` | string (MDX) |
| `photo` | string |
| `location` | string? |
| `website` | string? |
| `instagram` | string? |
| `linkedin` | string? |
| `tags` | string[] |
| `seoTitle` / `seoDescription` | string |

### 5.5 Esquema de empresa

`slug`, `name`, `sector`, `location`, `description`, `logo`, `website`, `founders`, `tags`, `seoTitle`, `seoDescription`.

### 5.6 Esquema de evento

`slug`, `title`, `subtitle`, `date`, `time`, `place`, `address`, `city`, `province`, `description`, `speakers` (referencias a `people`), `articleSlug`, `videoUrl`, `gallery`, `status` (`upcoming` / `past`), `registrationUrl`, `cover`, `seoTitle`, `seoDescription`.

### 5.7 Esquema social (MDX)

```mdx
---
platform: instagram
url: https://www.instagram.com/p/Df2Q7GsOr4r/
date: 2026-11-17
image: /media/social/2026-11-17-vaquero.jpg
caption: "Le pidieron seguir de prácticas… y terminó creando esto"
relatedPerson: francisco-jose-vaquero
featured: true
---
```

Campos:

- `platform`: `instagram` | `youtube` | `tiktok`.
- `url`: enlace público.
- `date`: fecha de publicación.
- `image`: imagen local optimizada.
- `caption`: texto breve (no el caption completo si es muy largo).
- `relatedPerson` / `relatedCompany` / `relatedEvent`: enlaces internos.
- `featured`: para la franja de portada.
- `videoId`: solo YouTube/TikTok, para oEmbed y `VideoObject`.
- `duration`: opcional.

### 5.8 Deduplicación y actualización

- Clave de artículo: `sourceUrl` normalizada (sin query, sin fragmento).
- Clave social: `(platform, url)`.
- Si el `hash` cambia, se actualiza el artículo y se marca `modifiedAt`.
- Si una pieza desaparece de HOY, no se borra: se marca `hidden` o se deja en archivo.
- El sync nunca toca los MDX editoriales.
- `sync-status.json` guarda: fecha, fuente, vistos, actualizados, errores.

### 5.9 Búsqueda

- **Pagefind** indexa el HTML generado.
- Página `/buscar/` con el UI de Pagefind (vanilla JS).
- Índice dividido por idioma (`es`).
- No indexar la página de resultados (`noindex, follow`).
- Añadir `data-pagefind-ignore` a navegación, footer y elementos repetidos.

---

## 6. Rutas, migración y SEO

### 6.1 Mapa de rutas

| Ruta | Tipo | Indexable | Contenido |
|---|---|---|---|
| `/` | Portada | Sí | Feed de noticias + destacados + social + próximo encuentro |
| `/noticias/` | Listado | Sí | Todas las piezas, paginadas |
| `/entrevistas/` | Hub | Sí | Entrevistas, con intro y filtros |
| `/encuentros/` | Hub | Sí | Encuentros, con próximo evento y archivo |
| `/noticias/[slug]/` | Ficha | Solo si hay contenido propio | Resumen + contexto + enlaces |
| `/protagonistas/` | Índice | Sí | Personas |
| `/protagonistas/[slug]/` | Ficha | Sí | Bio, empresa, aprendizajes, vídeo, redes |
| `/empresas/` | Índice | Sí | Empresas y proyectos |
| `/empresas/[slug]/` | Ficha | Sí | Sector, ubicación, historia, contenidos |
| `/encuentros/[slug]/` | Evento | Sí | Cartel, datos, ponentes, crónica, galería, vídeo |
| `/temas/[slug]/` | Tema | Sí | Introducción + contenido relacionado |
| `/instagram/` | Social | Sí | Muro 4:5 + perfil |
| `/youtube/` | Social | Sí | Vídeos + canal |
| `/tiktok/` | Social | Sí | Vídeos + perfil |
| `/ediciones/` | Archivo | Sí | Años |
| `/ediciones/[year]/` | Archivo | Sí | Piezas del año |
| `/sobre-el-proyecto/` | Institucional | Sí | Misión, equipo, metodología |
| `/colaboradores/` | Institucional | Sí | UEx, Consejo Social, MAPFRE, Junta, Alianza |
| `/contacto/` | Institucional | Sí | Formulario y datos |
| `/buscar/` | Búsqueda | No (`noindex, follow`) | Resultados Pagefind |
| `/legal/`, `/privacidad/`, `/cookies/`, `/accesibilidad/` | Legal | Sí | Textos legales |
| `/rss.xml` | Feed | — | Últimas piezas |
| `/sitemap-index.xml` | Sitemap | — | Índice |
| `/sitemap-news.xml` | Sitemap | — | Solo si hay noticias propias |
| `/robots.txt` | — | — | Reglas |

**Reglas de URL:**

- Dominio con `www` (como hoy), 301 desde el apex.
- Sin barra final, salvo `/`.
- Minúsculas, guiones, sin fechas ni IDs.
- Paginación por ruta: `/noticias/pagina/2/`.
- Filtros por query (`?tipo=entrevista`) con canonical a la ruta limpia y sin indexar variantes.
- Las pestañas de la portada enlazan a `/entrevistas/` y `/encuentros/`, no generan duplicados.

### 6.2 Migración desde WordPress

1. **Inventario:** rastrear `post-sitemap.xml` y `page-sitemap.xml`; obtener 183 posts y 8 páginas.
2. **Auditoría:** cruzar con Analytics y Search Console para ver qué URLs tienen tráfico, enlaces o backlinks.
3. **Clasificar:**
   - mantener y migrar las 30–50 mejores piezas históricas;
   - redirigir el resto a la ficha de protagonista, empresa, tema o archivo más cercano;
   - eliminar páginas técnicas (`login`, `register`, `resetpass`, `your-profile`) con 410.
4. **Mapa de redirecciones:** CSV/JSON `from,to,status,note`; máximo un salto; sin cadenas.
5. **Implementar:** generar reglas en `.htaccess` desde `redirects.json`; test automatizado de que ninguna URL antigua devuelve 404.
6. **Lanzar:** mantener el sitemap antiguo 30 días, enviar el nuevo a Google Search Console y Bing, monitorizar 404 y cobertura durante 90 días.
7. **Enlazado interno:** actualizar los enlaces que apunten a URLs antiguas.
8. **No cambiar de dominio** salvo que sea imprescindible; si se cambia, usar “Cambio de dirección” en GSC.

**Tabla de ejemplo:**

| Antigua | Nueva | Código |
|---|---|---|
| `/ediciones-anteriores/` | `/ediciones/` | 301 |
| `/2021/12/21/sobrevivir-como-empresario-en-extremadura-es-un-reto/` | `/protagonistas/[slug]/` o `/ediciones/2021/` | 301 |
| `/login/`, `/register/`, `/resetpass/` | `/` | 410 |
| `/category/...` | `/temas/...` | 301 |

### 6.3 SEO on-page

**Títulos** (≤ 60 caracteres, patrón `{tema} | Extremadura es Futuro HOY`):

- Portada: `Extremadura es Futuro HOY — Talento y emprendimiento extremeño`
- Entrevistas: `Entrevistas a emprendedores extremeños | Extremadura es Futuro HOY`
- Encuentros: `Encuentros Extremadura es Futuro | UEx y Diario HOY`
- Persona: `{Nombre}, {empresa}: entrevista y trayectoria | EEFH`
- Evento: `{Título} · {Ciudad} · {fecha} | EEFH`
- Instagram: `Instagram de Extremadura es Futuro HOY: últimas publicaciones`
- YouTube: `YouTube de Extremadura es Futuro HOY: entrevistas y encuentros`
- TikTok: `TikTok de Extremadura es Futuro HOY: vídeos`

**Descripciones:** 140–160 caracteres, únicas, con el ángulo de la página. No repetir el extracto automático en todas.

**Estructura:**

- Un solo `H1` por página.
- `H2`/`H3` jerárquicos; los títulos de tarjeta no son `H1`.
- Breadcrumbs visibles y en JSON-LD.
- Fecha visible y `dateModified` real.
- Autor visible con enlace a su ficha.
- Enlaces internos contextuales (persona → empresa → evento → tema).
- Sin texto oculto ni keyword stuffing.

**Imágenes:**

- AVIF/WebP, `srcset`, `width`/`height`, `loading="lazy"` salvo la imagen LCP.
- `fetchpriority="high"` en la imagen principal.
- `alt` descriptivo; crédito y licencia en el pie.
- OG image 1200×630 generada con la plantilla de cartel.

### 6.4 Datos estructurados

| Página | Schema |
|---|---|
| Global | `Organization` + `WebSite` (`SearchAction`) |
| Portada / hubs | `CollectionPage` + `ItemList` + `BreadcrumbList` |
| Ficha de persona | `ProfilePage` + `Person` + `BreadcrumbList` |
| Ficha de empresa | `Organization` + `BreadcrumbList` |
| Evento | `Event` (`Place`, `Person`, `offers` gratuito) + `BreadcrumbList` |
| Vídeo | `VideoObject` (`contentUrl`, `embedUrl`, `thumbnailUrl`, `uploadDate`, `duration`) |
| Artículo propio | `NewsArticle` o `BlogPosting` con autor y `dateModified` |
| Post social | `SocialMediaPosting` (opcional, para grafo de entidad) |
| Galería | `ImageGallery` + `ImageObject` |

Reglas:

- No marcar como propio un artículo que vive en `hoy.es`; usar `ItemList` con la URL externa y `citation`.
- Validar con Rich Results Test y Schema Markup Validator.
- `Organization.sameAs`: Instagram, YouTube, TikTok, `hoy.es`, UEx, Consejo Social.
- `Event` solo para eventos reales, no para “encuentros” genéricos sin fecha.

### 6.5 Sitemaps, robots y feeds

- `sitemap-index.xml` con: páginas, noticias, imágenes, vídeo, entidades.
- `sitemap-news.xml` solo si hay artículos propios frescos (últimas 48 h).
- `robots.txt` con `Sitemap:` y sin bloquear CSS/JS.
- `rss.xml` con las últimas 30 piezas.
- `lastmod` real, no la fecha de build.
- Enviar a Google Search Console y Bing Webmaster Tools.

### 6.6 Estrategia de contenidos y keywords

**Clústeres:**

1. **Emprendimiento y empresa**
   - emprender en Extremadura
   - empresas extremeñas con éxito
   - entrevistas a emprendedores extremeños
2. **Talento y formación**
   - talento extremeño
   - encuentros Universidad de Extremadura
   - jóvenes y empleabilidad
3. **Cultura y audiovisual**
   - cine desde Extremadura
   - productora audiovisual Cabeza del Buey
   - animación extremeña
4. **Agroalimentación y territorio**
   - Aceitunas Jope Almendralejo
   - artesanía extremeña
   - empresa familiar extremeña
5. **Deporte y sociedad**
   - Club Voleibol A7 Badajoz
   - deporte femenino Extremadura
6. **Institucional**
   - Alianza Extremadura
   - Consejo Social UEx
   - Fundación MAPFRE Extremadura

**Páginas que deben existir:**

- Una ficha por protagonista y empresa mencionada.
- Una página por encuentro.
- Una página por tema.
- Una introducción original de 150–250 palabras en cada hub social.

**Contenido que no debe existir:**

- Páginas de etiquetas vacías.
- Listados duplicados por query.
- Fichas de noticias con solo un extracto y un enlace (mejor no crearlas).
- Texto copiado de `hoy.es` sin valor añadido.

### 6.7 E-E-A-T

- Página de autor de Daniel Vaquerizo con foto, bio, `sameAs` a `hoy.es`, LinkedIn y YouTube.
- “Cómo trabajamos”: metodología, correcciones, publicidad y financiación.
- “Colaboradores”: UEx, Consejo Social, Fundación MAPFRE, Junta y Alianza, con enlaces.
- Fechas de publicación y actualización visibles.
- Contacto real y política de correcciones.
- Créditos de fotografía y vídeo.

### 6.8 Discover y News

- **Discover:** imágenes de al menos 1200 px de ancho, títulos claros, `max-image-preview:large`, autor y fecha visibles.
- **Google News:** solo tiene sentido si se publican noticias originales. Si el modelo es hub curado, no solicitar inclusión.
- **No** usar títulos engañosos ni portadas repetidas.

### 6.9 Checklist de lanzamiento SEO

- [ ] 301 de todas las URLs antiguas.
- [ ] `robots.txt` correcto y sin bloquear assets.
- [ ] Sitemap enviado y sin errores.
- [ ] Canonicals autorreferentes.
- [ ] Sin `noindex` accidental en producción.
- [ ] Metadatos únicos en las 20 páginas principales.
- [ ] JSON-LD validado.
- [ ] 404 personalizada y 410 donde toque.
- [ ] Enlaces internos sin huérfanas.
- [ ] Imágenes con `alt` y dimensiones.
- [ ] Core Web Vitals en verde en staging.
- [ ] Search Console y Bing verificados.
- [ ] Analítica sin cookies antes de consentimiento.
- [ ] Monitor de 404 y de redirecciones.

---

## 7. Sistema de diseño

### 7.1 Lo que dicen las caps

Hemos analizado cinco piezas reales de Instagram. El lenguaje es consistente:

- **Fondo crema** `#FEF6E3` o **amarillo limón** `#F9EC2E` a sangre.
- **Negro tinta** `#141110` para texto y marcos.
- **Amarillo dorado** `#FFD400` para nombres y subrayados.
- **Cian** `#13C1DB` y **magenta** `#F81D97` como señales gráficas.
- **Verde** de la Alianza Extremadura como acento institucional.
- Tipografía **condensada en mayúsculas** para “EXTREMADURA” y los nombres.
- **Serif de alto contraste** para nombres editoriales (“Guadalupe Alcañiz”).
- **Script manuscrita** para “es futuro” y anotaciones.
- **Etiquetas tipo pill** blancas con texto trackeado en mayúsculas.
- **Marcos**: corchetes negros, líneas discontinuas, cintas negras inclinadas.
- **Recortes de personas** sobre color, a veces en blanco y negro.
- **Formas**: blobs, flechas circulares, destellos, subrayados.
- **Composición de cartel**: mucho aire, jerarquía muy marcada, una sola idea por pieza.

### 7.2 Dirección aprobada: “Revista-cartel”

**Tesis:** la energía de un cartel de campaña con la estructura de una revista semanal. No es un landing de SaaS con fotos; es una publicación que se puede hojear.

**Paleta:**

```css
--paper:    #FEF6E3;  /* fondo principal */
--ink:      #141110;  /* texto y marcos */
--lemon:    #F9EC2E;  /* campo de campaña */
--gold:     #FFD400;  /* nombres y acentos */
--cyan:     #13C1DB;  /* entrevistas */
--magenta:  #F81D97;  /* encuentros */
--green:    #0E7A3C;  /* reportajes / institucional */
--white:    #FFFFFF;
--muted:    #6B625A;
--line:     #D9CDB8;
```

**Tipografía:**

| Rol | Fuente | Uso |
|---|---|---|
| Display | **Bebas Neue** | Titulares, nombres, cifras, “EXTREMADURA” |
| Serif editorial | **Bodoni Moda** | Citas, nombres en fichas, entradillas |
| Texto | **Archivo** (400–700) | Párrafos, UI, metadatos |
| Script | **Caveat** | Anotaciones y guiños, con moderación |
| Etiquetas | **Archivo 700**, mayúsculas, tracking `.12em` | Chips y pills |

> El logotipo “es futuro” es una imagen; no intentamos reconstruirlo con una fuente. La script se usa solo como acento.

**Retícula:**

- 12 columnas, ancho máximo 1280 px, gutter 24 px.
- Base de espaciado 8 px.
- Asimetría editorial: 7/5, 8/4, 5/7.
- Márgenes generosos; una sección densa seguida de una tranquila.
- Líneas de 1 px en `--line` para separar, como en el periódico.

**Componentes:**

- `Masthead`: logo, fecha, hora de actualización, redes.
- `Ticker`: franja negra con texto en movimiento (última hora / próximo encuentro).
- `LeadStory`: imagen grande + titular Bebas + entradilla serif.
- `NewsRow`: fila de periódico con thumbnail 4:3, tipo, fecha, autor.
- `InterviewCard`: retrato 4:5, nombre en Bebas amarillo, pill blanca con empresa, marco discontinuo cian.
- `EventPoster`: bloque amarillo, corchetes negros, fecha/lugar, recorte del ponente, “Asistencia libre”.
- `SocialTile`: 4:5, marco crema, hover con caption y plataforma.
- `VideoFacade`: 16:9, botón de play amarillo, carga el iframe solo al clic (JS vanilla).
- `Sticker`: etiqueta rotada -3°, sombra dura, para “Nuevo”, “En directo”, “Última hora”.
- `BracketFrame`: corchetes negros para citas y datos.
- `ArrowLink`: círculo amarillo + flecha, como en las caps.
- `Tabs`: enlaces reales; subrayado grueso; sin JS obligatorio.
- `Pagination`: números grandes, sin infinite scroll.
- `EmptyState`: ilustración/sticker + texto claro + reintento.

**Fotografía:**

- Retratos reales del proyecto, no stock.
- Recorte sobre crema/amarillo cuando la foto lo permita.
- Duotono negro + acento en piezas de archivo.
- Crédito visible y `alt` descriptivo.

**Movimiento:**

- Ticker continuo (40 s), pausa al hover.
- Sticker que se endereza al hover.
- Imagen que escala 1.03 y revela con `clip-path`.
- Flecha que avanza 4 px.
- Transiciones de página con View Transitions (opcional).
- Todo con `prefers-reduced-motion: reduce`.

**Qué evitar:**

- Fondo blanco de SaaS, glassmorphism, gradientes morados.
- Tarjetas idénticas en cuadrícula infinita.
- Autoplay de vídeo o audio.
- Pop-ups y muros de cookies antes de contenido.
- Iconos genéricos en cuadrícula.
- Ilustraciones de stock que no sean del proyecto.

### 7.3 Wireframes por página

**Portada**

```
┌──────────────────────────────────────────────────────────┐
│ LOGO        EXTREMADURA ES FUTURO HOY      19 NOV 2026  │
│ Noticias  Entrevistas  Encuentros  IG  YT  TT  Ediciones │
├──────────────────────────────────────────────────────────┤
│ TICKER: Próximo encuentro · 23 nov · Plasencia           │
├───────────────────────────────┬──────────────────────────┤
│                               │  LO ÚLTIMO               │
│      [IMAGEN PRINCIPAL]       │  · Noticia 1       12:40 │
│      ENTREVISTA               │  · Noticia 2       11:10 │
│      Titular grande           │  · Noticia 3       09:05 │
│      Entradilla serif         │  · Noticia 4       ayer  │
│      [Leer en HOY →]          │  · Noticia 5       ayer  │
│                               ├──────────────────────────┤
│                               │  [CARTEL PRÓXIMO ENCUENTRO]│
├───────────────────────────────┴──────────────────────────┤
│ [Todas] [Entrevistas] [Encuentros]                       │
│ ┌────────┐ ┌────────┐ ┌────────┐                         │
│ │ noticia│ │ noticia│ │ noticia│                         │
│ └────────┘ └────────┘ └────────┘                         │
│ ... río de 9 piezas ...                                  │
├──────────────────────────────────────────────────────────┤
│ VOCES: 3 retratos 4:5 con nombre y empresa               │
├──────────────────────────────────────────────────────────┤
│ SOCIAL: 4 IG + 2 YT + 2 TT                               │
├──────────────────────────────────────────────────────────┤
│ FOOTER: colaboradores, legal, contacto                   │
└──────────────────────────────────────────────────────────┘
```

**Entrevistas**

- Cabecera grande “ENTREVISTAS” + intro + contador.
- Entrevista destacada 7/5.
- Filtros por sector (chips; enlaces o JS progresivo).
- Cuadrícula 4:5 de retratos.
- Paginación.

**Encuentros**

- Cabecera + cartel del próximo evento.
- Lista cronológica de encuentros pasados, cada uno como cartel.
- Cada cartel: fecha, ciudad, ponentes, “Ver crónica”.

**Instagram**

- Cabecera con avatar, `@handle`, bio, botón “Seguir”.
- Reels destacados.
- Cuadrícula 4:5, 24 piezas, “Cargar más”.
- Nota de atribución y enlace a Instagram.

**YouTube**

- Cabecera con banner/avatar y “Suscribirse”.
- Vídeo destacado 16:9.
- Cuadrícula de vídeos con duración y fecha.
- Playlists: Entrevistas, Encuentros, Especiales.

**TikTok**

- Cabecera de perfil.
- Cuadrícula 9:16 (o 3:4) con caption.
- “Ver en TikTok”.

**Ficha de protagonista**

- Breadcrumb.
- Nombre en Bebas + rol/empresa.
- Retrato y cita serif.
- Datos clave.
- Bio (150–300 palabras, original).
- “Lo que aprendimos”: 3–5 bullets.
- Vídeo, post de Instagram, enlace a HOY.
- Relacionados: empresa, evento, otras entrevistas.

**Evento**

- Cartel superior amarillo.
- Fecha, hora, lugar, “Asistencia libre”.
- Ponentes.
- Crónica.
- Galería.
- Vídeo.
- Entrevista relacionada.
- “Cómo llegar” y “Añadir al calendario”.

### 7.4 Activos necesarios

- Logotipo en SVG (versión clara y oscura).
- 6–10 caps de Instagram en alta resolución para calibrar el sistema.
- Fuentes licenciadas o de Google Fonts (Bebas Neue, Bodoni Moda, Archivo, Caveat).
- Fotos de protagonistas y encuentros con crédito.
- Logos de colaboradores en SVG/PNG.
- Plantilla de OG image (1200×630) con el estilo de cartel.
- Favicon y iconos de app.

---

## 8. Integraciones y sincronización

### 8.1 HOY: dos fuentes, una sola verdad

**Fuente A — Temática**

- URL: `https://www.hoy.es/tematicas/extremadura-es-futuro-hoy.html`.
- Extraer las tarjetas: título, URL, imagen, extracto, autor, fecha y sección.
- La paginación actual no es fiable; no depender de ella.
- Esta fuente da la selección editorial del proyecto.

**Fuente B — Autor**

- URL: `https://www.hoy.es/autor/daniel-vaquerizo-7580.html`.
- Paginación real: `/pagina-2.html`, `/pagina-3.html`…
- Incluye piezas que no están en la temática; filtrar por:
  - etiqueta `Extremadura Es Futuro HOY`;
  - patrón de URL (`extremadura-futuro`, `encuentro`, `-ga.html`);
  - sección y autor.

**Enriquecimiento**

- Para cada artículo, obtener el JSON-LD `NewsArticle`:
  - `articleBody` (para resumen y búsqueda);
  - `datePublished`, `dateModified`;
  - `author`, `image`, `keywords`.
- Guardar `hash` para no reescribir si no cambió.

**Clasificación**

```ts
type Kind = "entrevista" | "encuentro" | "reportaje";

function classify(article: {
  url: string;
  title: string;
  author: string;
  section: string;
}): Kind {
  const url = article.url.toLowerCase();
  const title = article.title.toLowerCase();

  if (
    url.includes("encuentro") ||
    url.endsWith("-ga.html") ||
    title.includes("así fue el encuentro") ||
    title.includes("charla-coloquio")
  ) {
    return "encuentro";
  }

  if (
    url.endsWith("-nt.html") &&
    (title.includes("«") || article.author === "Daniel Vaquerizo")
  ) {
    return "entrevista";
  }

  return "reportaje";
}
```

La clasificación automática se guarda con `confidence` y el editor puede corregirla en el MDX o en un override JSON.

**Ritmo y ética**

- 1 petición cada 2 s, `If-None-Match`/`If-Modified-Since`.
- User-Agent identificable: `ExtremaduraFuturoHoyBot/1.0 (+https://www.hoyextremaduraesfuturo.es/sobre-el-proyecto)`.
- Respetar `robots.txt` y no scrapear áreas privadas.
- Pedir a Vocento un **feed JSON/RSS propio** para la temática. Si se concede, sustituir el scraper por el feed sin cambiar el resto del sistema.
- No usar el scraper para republicar el texto íntegro.

### 8.2 Redes: curación manual

Sin APIs de Instagram/TikTok. El equipo decide qué se destaca y lo añade como MDX.

**Flujo:**

1. El editor copia la URL del post.
2. Descarga la imagen o captura (con permiso) y la guarda en `public/media/social/`.
3. Crea `src/content/social/{fecha}-{slug}.mdx` con el frontmatter.
4. Marca `featured: true` si va a portada.
5. Hace commit/push; GitHub Actions reconstruye y despliega.

**Ventajas:**

- Cero dependencia de tokens, aprobaciones o límites de API.
- Control editorial total.
- Rendimiento: no se cargan scripts de terceros.

**Coste:**

- Hay que actualizar a mano. Recomendación: 2–3 piezas nuevas por semana y una revisión mensual.

### 8.3 YouTube: automático sin API key

Además de la curación manual, se puede leer el **RSS público del canal**:

```text
https://www.youtube.com/feeds/videos.xml?channel_id=UC1I4SH_7zLg7ILl7Ens1rsA
```

- Devuelve los últimos ~15 vídeos con título, URL, fecha, miniatura y autor.
- No requiere API key ni aprobación.
- Se puede usar para la sección `/youtube/` y para `VideoObject`.
- La curación manual decide cuáles se destacan y se relacionan con personas/eventos.

**Enriquecimiento opcional:** oEmbed (`https://www.youtube.com/oembed?url=...&format=json`) para título y miniatura, si el RSS no basta.

### 8.4 Instagram: manual + ayuda visual

- Sin API. El editor aporta la imagen.
- Si se quiere una ayuda, el endpoint público `https://www.instagram.com/p/{shortcode}/media/?size=l` devuelve la imagen de un post público. Es **no documentado** y puede cambiar; usarlo solo como referencia, nunca en producción.
- Para reels, usar una captura o el poster que proporcione el equipo.
- Guardar siempre `url` y crédito.

### 8.5 TikTok: manual + oEmbed

- Sin API. El editor aporta URL, caption e imagen.
- oEmbed público (`https://www.tiktok.com/oembed?url=...`) puede devolver título, miniatura y HTML de embed. Se puede usar en build para completar metadatos, con fallback si falla.
- El embed oficial se carga solo al hacer clic (fachada).

### 8.6 Orquestación en GitHub Actions

| Fuente | Frecuencia | Cómo |
|---|---|---|
| HOY temática + autor | Cada build diario | `pnpm sync` |
| YouTube RSS | Cada build | `pnpm sync:youtube` |
| Instagram / TikTok | Manual | Commit de MDX |
| Búsqueda Pagefind | Cada build | `pnpm build` |
| Deploy | Cada build correcto | FTP/SFTP |

- Un solo workflow, con pasos separados.
- `sync-status.json` con la última ejecución y los errores.
- Si HOY falla, el build usa el último `articles.json` bueno y muestra una nota discreta en el footer (“Actualizado a las…”).
- Si el build falla, no se despliega; se conserva la versión anterior.

### 8.7 Pipeline de medios

1. Descargar la imagen original (o recibirla del editor).
2. Calcular hash; si ya existe, reutilizar.
3. Generar AVIF/WebP en 4:5, 4:3, 16:9 y 1:1.
4. Guardar `alt`, `credit`, `license`.
5. Servir desde `/media/{hash}/{variant}.avif` con caché inmutable.
6. Borrar originales huérfanos tras 30 días.

Con 183 posts históricos, optimizar solo los que se migren (30–50), no todos.

### 8.8 Modos de fallo

| Fallo | Efecto | Respuesta |
|---|---|---|
| HOY cambia el HTML | No entran noticias nuevas | Alerta, adapter alternativo, aviso a Vocento |
| GitHub Actions no se ejecuta | Portada desactualizada | `workflow_dispatch` manual + alerta |
| Build falla | No se despliega | Último build bueno; revisar logs |
| IONOS no responde | Deploy falla | Reintento + backup + rollback |
| Falta una imagen social | Hueco visual | Placeholder de cartel + edición |
| YouTube RSS cambia | Sin últimos vídeos | Curación manual |

---

## 9. Rendimiento, accesibilidad, seguridad y legal

### 9.1 Presupuesto de rendimiento

| Métrica | Objetivo |
|---|---|
| LCP (móvil, p75) | ≤ 2,0 s |
| INP | ≤ 200 ms |
| CLS | ≤ 0,05 |
| TTFB | ≤ 500 ms (estático/CDN) |
| JS inicial | ≤ 20 KB gzip |
| JS total | ≤ 60 KB |
| CSS crítico | ≤ 30 KB |
| Imagen hero | ≤ 180 KB AVIF |
| Fuentes | 2 familias, ≤ 4 archivos, ≤ 120 KB |
| Terceros en carga | 0 (salvo analítica con consentimiento) |

Medidas:

- Cero JS de Instagram/TikTok/YouTube antes de la interacción.
- Fuentes autoalojadas, subset `latin` + `latin-ext`, `font-display: swap`.
- Imágenes con `srcset` y tamaños correctos.
- Sin librerías de UI pesadas.
- Cache de HTML y media.
- Lighthouse 95+ en móvil como puerta de CI.

### 9.2 Accesibilidad (WCAG 2.2 AA)

- Contraste: negro sobre crema/amarillo; nunca cian sobre crema para texto.
- Foco visible en todos los interactivos.
- Skip link y landmarks.
- Navegación completa por teclado, incluidos tabs y lightbox.
- `alt` en imágenes; decorativas con `alt=""`.
- Subtítulos en vídeos; transcripción en fichas cuando sea posible.
- Formularios con `label`, ayuda y errores claros.
- Objetivos táctiles de 44×44 px.
- `prefers-reduced-motion`.
- No usar solo color para indicar tipo (chip + texto).
- Enlaces externos con aviso visual y `rel="noopener"`.

### 9.3 Seguridad

- Sitio estático: no hay base de datos ni sesiones que comprometer.
- Secretos solo en GitHub Actions; nunca en el repo.
- CSP con nonces o hashes; `frame-src` limitado a `youtube-nocookie.com`, `instagram.com`, `tiktok.com`.
- HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` en `.htaccess`.
- Formulario de contacto con honeypot, rate limit y validación.
- Dependencias auditadas (`pnpm audit`) en CI.
- Backups: GitHub + backup semanal de `public_html`.
- Monitorización: uptime, errores de build, fallos de sync.

### 9.4 Legal y privacidad

- Aviso legal, privacidad, cookies y accesibilidad.
- Analítica sin cookies (Plausible/Umami) para evitar banner; si se usa GA4, Consent Mode.
- Newsletter con doble opt-in y baja fácil.
- Imágenes: crédito y licencia; no reutilizar fotos de terceros sin permiso.
- Contenido de redes: enlazar al post original; si se incrusta, usar el embed oficial y cargarlo bajo demanda.
- Enlaces a `hoy.es` con atribución clara.
- Si hay contenido generado por IA, declararlo cuando corresponda.

---

## 10. Operación editorial

### 10.1 Roles

- **Editor:** destaca noticias, aprueba fichas, cura redes, corrige clasificaciones.
- **Autor:** escribe bios, crónicas y aprendizajes.
- **Técnico:** mantiene el workflow, el deploy y la monitorización.

### 10.2 Flujo semanal

1. El workflow detecta nuevas piezas de HOY.
2. El editor revisa la portada: clasifica, asigna persona/empresa/evento, elige imagen.
3. Se publica en portada y hubs.
4. Se enlaza desde la ficha de protagonista/empresa.
5. Se añade el vídeo y el post social relacionado (MDX).
6. Se comparte en redes con enlace a la ficha, no solo al artículo.

### 10.3 Plantillas

**Ficha de protagonista**

- Titular: `{Nombre}: “{cita}”`
- Entradilla: 2 frases con el ángulo.
- Bio: 150–300 palabras.
- “Lo que aprendimos”: 3–5 bullets.
- Datos: empresa, sector, municipio, año.
- Enlaces: artículo en HOY, vídeo, Instagram, web de la empresa.
- Relacionados.

**Encuentro**

- Título: `{Tema} · {Ciudad}`
- Fecha, hora, lugar, aforo.
- Ponentes con foto y cargo.
- Crónica: 200–400 palabras.
- Galería con crédito.
- Vídeo.
- Entrevista relacionada.
- Próximo encuentro.

**Hub social**

- Introducción de 150–250 palabras.
- Qué se publica y cada cuánto.
- Series destacadas.
- Enlace a la plataforma.
- Últimas 24 piezas.

### 10.4 Calendario

- Semanal: 1 destacada, 3 secundarias, 1 evento, 1–2 piezas sociales.
- Mensual: revisión de SEO, enlaces rotos, CWV, 404, imágenes huérfanas.
- Trimestral: auditoría de contenido y actualización de fichas.

### 10.5 Edición sin CMS (v1)

- Los MDX se editan en GitHub o en el editor local.
- Para el editor no técnico, se puede añadir **Sveltia CMS** (Git-based, sin servidor) en fase 2:
  - edita MDX/JSON desde una interfaz;
  - hace commit en GitHub;
  - dispara el workflow.
- Alternativa: un pequeño panel PHP en IONOS que edite JSON y lance el workflow vía API. Solo si Sveltia no encaja.

### 10.6 Gobierno del dato sincronizado

- Los campos de origen (`title`, `excerpt`, `image`, `published_at`) no se editan.
- Las correcciones van en un `overrides.json` o en la ficha de entidad.
- Si HOY corrige una pieza, el sync actualiza y marca `updatedAt`.
- Las fichas de entidad son 100 % editoriales.

---

## 11. Roadmap

### Fase 0 — Descubrimiento (3–5 días)

- Inventario de URLs y redirecciones.
- Auditoría de contenido y palabras clave.
- Referencias visuales y activos.
- Confirmación del modelo de despliegue estático.
- Baseline de Search Console y analítica.

**Entregable:** plan actualizado + inventario + mapa de redirecciones + baseline.

### Fase 1 — Fundamentos (1 semana)

- Repo, Astro, TypeScript, Tailwind, tokens.
- Layout, masthead, footer, estilos base.
- SEO base: metadatos, canonical, sitemap, robots, JSON-LD.
- Workflow de GitHub Actions y deploy a staging.
- Componentes de diseño: botones, chips, cards, tabs.
- Pagefind y página de búsqueda.

**Entregable:** home maquetada con datos de ejemplo + pipeline de deploy.

### Fase 2 — Motor de noticias (1,5 semanas)

- Esquema Zod y scripts de sync.
- Adaptador de HOY (temática + autor).
- Clasificación y deduplicación.
- Portada, `/noticias/`, `/entrevistas/`, `/encuentros/`.
- Paginación y RSS.
- `sync-status.json` y alertas.

**Entregable:** feed real actualizado a diario y listo a las 08:00.

### Fase 3 — Social manual (1 semana)

- Colección `social` en MDX.
- Páginas `/instagram/`, `/youtube/`, `/tiktok/`.
- YouTube RSS + oEmbed.
- Fachadas, lightbox y caché de media.
- Curación de las primeras 12–18 piezas.

**Entregable:** tres secciones sociales estables y rápidas.

### Fase 4 — Entidades y archivo (1,5 semanas)

- Fichas de protagonistas y empresas.
- Páginas de encuentros.
- Temas y ediciones.
- Enlazado interno y relacionados.
- Migración de las mejores piezas históricas.

**Entregable:** contenido propio indexable y archivo ordenado.

### Fase 5 — SEO, migración y QA (1 semana)

- Mapa de redirecciones completo y `.htaccess`.
- Auditoría SEO técnica y de contenido.
- CWV, accesibilidad y seguridad.
- Pruebas en dispositivos reales.
- Search Console, Bing, sitemaps.

**Entregable:** checklist de lanzamiento cerrado.

### Fase 6 — Lanzamiento y 30 días

- Despliegue.
- Monitorización diaria de 404, build y CWV.
- Correcciones rápidas.
- Primer informe de rendimiento.

### MVP en 3–4 semanas

- portada, noticias, entrevistas y encuentros;
- Instagram, YouTube y TikTok en modo manual;
- SEO base y redirecciones;
- sin fichas de entidad ni buscador.

El resto se añade en iteraciones.

---

## 12. Medición y KPIs

### Antes de lanzar (baseline)

- Search Console: impresiones, clics, CTR, posición media, páginas indexadas.
- Analítica: sesiones, fuentes, páginas más vistas, rebote.
- Core Web Vitals de campo (CrUX) si hay datos.
- Seguidores y alcance social.

### Objetivos a 3, 6 y 12 meses

| KPI | 3 meses | 6 meses | 12 meses |
|---|---|---|---|
| Páginas clave indexadas | 100 % | 100 % | 100 % |
| LCP móvil p75 | < 2,5 s | < 2,0 s | < 2,0 s |
| Errores 404 de URLs antiguas | 0 | 0 | 0 |
| Builds correctos | > 95 % | > 98 % | > 98 % |
| Keywords en top 10 | 5 | 20 | 40 |
| Sesiones orgánicas/mes | baseline + 30 % | 2× baseline | 4× baseline |
| Fichas de entidad publicadas | 10 | 30 | 60 |
| Suscriptores newsletter | — | 250 | 750 |

> Los objetivos de tráfico son hipótesis a acordar tras ver el baseline real. No prometer cifras sin datos.

### Eventos a medir

- Clic en “Leer en HOY”.
- Reproducción de vídeo.
- Apertura de post social.
- Uso de filtros y búsqueda.
- Suscripción a newsletter.
- Tiempo de lectura en fichas.

---

## 13. Riesgos

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| Duplicidad y canibalización con `hoy.es` | Alta | Alto | Modelo hub + entidades; no republicar texto completo; canonical claro |
| Scraping frágil | Media | Alto | Adaptadores, tests, alertas, feed oficial de Vocento |
| GitHub Actions retrasa o falla | Media | Medio | `workflow_dispatch`, alerta, último build bueno |
| Portada desactualizada hasta 24 h | Media | Medio | `workflow_dispatch` manual; segundo build opcional a las 13:00 |
| Curación social irregular | Alta | Medio | Calendario, plantillas, 2–3 piezas/semana |
| Pérdida de SEO en la migración | Media | Alto | Inventario, 301, monitorización 90 días |
| Diseño pesado | Media | Medio | Imágenes optimizadas, CSS para formas, fachadas |
| Deploy FTP no atómico | Media | Medio | SFTP/rsync o release + swap; backup previo |
| Derechos de imagen | Media | Alto | Créditos, licencias, contenido propio |
| Dependencia de IONOS | Baja | Medio | Build reproducible; posibilidad de mover a otro hosting |

---

## 14. Decisiones abiertas

| # | Decisión | Estado | Recomendación |
|---|---|---|---|
| 1 | ¿Mantener `hoyextremaduraesfuturo.es` con `www`? | Abierta | Sí |
| 2 | ¿Astro estático + GitHub Actions o React + PHP Slim? | **Cerrada** | Astro estático |
| 3 | ¿Frecuencia de build? | **Cerrada** | Diario a la 01:00 + manual |
| 4 | ¿CMS? | Abierta | MDX/Git en v1; Sveltia CMS en v2 |
| 5 | ¿Formulario de contacto? | Abierta | PHP en IONOS o Formspree |
| 6 | ¿Cloudflare delante? | Abierta | Sí, si se puede cambiar DNS |
| 7 | ¿Newsletter? | Abierta | Brevo/Buttondown |
| 8 | ¿Publicidad? | Abierta | No al inicio |
| 9 | ¿Analítica? | Abierta | Plausible/Umami sin cookies |
| 10 | ¿Fecha de lanzamiento? | Abierta | 7–8 semanas |

---

## 15. Siguientes pasos

1. **Confirmar el modelo de despliegue**: Astro estático + GitHub Actions (recomendado) o React + PHP Slim.
2. **Entregar activos**: logotipo SVG, 6–10 caps de Instagram, fotos con crédito y logos de colaboradores.
3. **Cerrar el mapa de redirecciones** de las 183 URLs antiguas.
4. **Confirmar el build diario a la 01:00** y el flujo de curación social.
5. **Arrancar la Fase 0**: inventario, baseline y primer prototipo de portada.

---

### Anexo A — Checklist SEO por pieza

- [ ] Título único ≤ 60 caracteres.
- [ ] Meta description 140–160 caracteres.
- [ ] Un `H1`.
- [ ] URL corta y semántica.
- [ ] Imagen con `alt`, dimensiones y crédito.
- [ ] Fecha y autor visibles.
- [ ] Enlaces internos (persona, empresa, evento, tema).
- [ ] Enlace externo a HOY con atribución.
- [ ] JSON-LD correcto.
- [ ] Open Graph y Twitter Card.
- [ ] Canonical autorreferente.
- [ ] Incluida en sitemap.
- [ ] Sin duplicar texto de HOY.

### Anexo B — Checklist de encuentro

- [ ] Fecha, hora y lugar confirmados.
- [ ] Cartel en 4:5 y 16:9.
- [ ] Ponentes con foto, cargo y empresa.
- [ ] Texto de sala y “asistencia libre”.
- [ ] Enlace de mapa.
- [ ] Archivo ICS.
- [ ] Crónica y galería después.
- [ ] Vídeo de YouTube enlazado.
- [ ] Entrevista relacionada.
- [ ] Post de Instagram enlazado.
- [ ] `Event` JSON-LD actualizado.

### Anexo C — Frontmatter social

```mdx
---
platform: instagram
url: https://www.instagram.com/p/Df2Q7GsOr4r/
date: 2026-11-17
image: /media/social/2026-11-17-vaquero.jpg
caption: "Le pidieron seguir de prácticas… y terminó creando esto"
relatedPerson: francisco-jose-vaquero
featured: true
---
```

### Anexo D — `.htaccess` mínimo

```apache
ErrorDocument 404 /404.html

Redirect 301 /ediciones-anteriores/ /ediciones/
RedirectMatch 410 ^/(login|register|resetpass|your-profile)/?$

<IfModule mod_headers.c>
  <FilesMatch "\.(css|js|woff2|avif|webp|jpg|png|svg)$">
    Header set Cache-Control "public, max-age=31536000, immutable"
  </FilesMatch>
  <FilesMatch "\.html$">
    Header set Cache-Control "public, max-age=300, must-revalidate"
  </FilesMatch>
  Header set X-Content-Type-Options "nosniff"
  Header set Referrer-Policy "strict-origin-when-cross-origin"
  Header set Permissions-Policy "camera=(), microphone=(), geolocation=()"
</IfModule>
```

### Anexo E — Glosario

- **Hub:** página de sección que reúne y presenta contenido.
- **Entidad:** persona, empresa, evento o tema con página propia.
- **Fachada:** imagen ligera que sustituye a un embed hasta que el usuario hace clic.
- **Canonical:** URL preferida que se indica a los buscadores.
- **Pagefind:** generador de índice de búsqueda estático.
- **Core Web Vitals:** métricas de experiencia de Google (LCP, INP, CLS).

---

**Fin del plan.**
