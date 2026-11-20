# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Astro estático con TypeScript, Tailwind CSS v4, iconos Lucide y búsqueda Pagefind. Sin islas de React. Los datos se guardan en JSON y MDX validados con Zod. La sincronización, el build y el despliegue corren en GitHub Actions; el sitio se sirve estático en IONOS. Confirmado por el usuario el 19/11/2026.

## Users

- **Lector que llega desde Instagram o TikTok:** ha visto un reel o un post y quiere conocer la historia completa, ver el vídeo y leer la entrevista.
- **Lector que llega desde Google:** busca información sobre un emprendedor, una empresa o un encuentro de Extremadura.
- **Asistente o seguidor del proyecto:** quiere saber qué encuentros hay, quién participa y qué se ha publicado.
- **Empresa, institución o medio:** quiere entender el proyecto, sus colaboradores y cómo contactar.
- **Editor del proyecto:** necesita destacar noticias, curar redes sociales y mantener fichas sin depender de un CMS pesado.

## Product Purpose

Reunir, ordenar y dar contexto al contenido de Extremadura es Futuro HOY: noticias publicadas en HOY, entrevistas, encuentros, vídeos y publicaciones sociales. La portada es el listado de noticias; las entrevistas y los encuentros se separan en secciones propias. El sitio debe ser la referencia de marca del proyecto y una puerta de entrada al contenido completo alojado en `hoy.es`.

Éxito significa: el lector encuentra la historia que vio en redes, entiende quién es el protagonista, ve el vídeo y llega al artículo original; y el proyecto construye presencia orgánica para búsquedas de marca y long-tail sin canibalizar al diario.

## Positioning

No es una réplica de `hoy.es` ni un agregador automático. Es el **hub de marca** del proyecto: combina un feed curado con fichas originales de protagonistas, empresas, encuentros y ediciones que no existen en el diario. Cada ficha añade contexto, aprendizajes, vídeo y redes, y enlaza al artículo original con atribución.

## Operating Context

- El contenido informativo vive en `hoy.es`; el proyecto se publica bajo `hoyextremaduraesfuturo.es`.
- La temática de HOY y la página de autor de Daniel Vaquerizo son las dos fuentes de noticias.
- Las redes se curan a mano; no hay acceso a APIs de Instagram ni TikTok.
- YouTube puede leer su RSS público sin API key.
- El build programado se ejecuta una vez al día a la 01:00 (Europe/Madrid) para que el sitio esté listo a las 08:00; además hay build manual y build al hacer push de contenido.
- El editor trabaja con MDX/JSON en Git en la primera versión; un CMS Git-based es una mejora posterior.
- El hosting es IONOS; el formulario de contacto puede ser un pequeño endpoint PHP o un servicio externo.

## Capabilities and Constraints

- Portada con feed de noticias, destacados, próximo encuentro y franja social.
- Secciones `/entrevistas/` y `/encuentros/` separadas e indexables.
- Páginas `/instagram/`, `/youtube/` y `/tiktok/` con curación manual.
- Fichas de protagonistas, empresas, eventos, temas y ediciones.
- Búsqueda estática con Pagefind.
- Sin backend, sin base de datos, sin sesiones.
- No se republica el texto completo de HOY sin acuerdo explícito.
- No se inventan cifras, testimonios, clientes ni resultados.
- El archivo histórico se audita: se migran las mejores piezas y el resto se redirige.
- El sitio debe funcionar sin JavaScript para navegar y leer; la mejora progresiva cubre filtros, búsqueda, lightbox y vídeo.
- Rendimiento objetivo: LCP ≤ 2,0 s, INP ≤ 200 ms, CLS ≤ 0,05, JS inicial ≤ 20 KB.
- Accesibilidad objetivo: WCAG 2.2 AA.

## Brand Commitments

- Nombre: **Extremadura es Futuro HOY**.
- Logotipo: “EXTREMADURA” en condensada mayúscula + “es futuro” en script. Se usa como imagen, no se reconstruye con una fuente.
- Lenguaje visual de las caps de Instagram: crema `#FEF6E3`, amarillo limón `#F9EC2E`, negro `#141110`, amarillo dorado `#FFD400`, cian `#13C1DB`, magenta `#F81D97` y verde institucional `#0E7A3C`.
- Tipografías: Bebas Neue (display), Bodoni Moda (serif editorial), Archivo (texto), Caveat (anotaciones).
- Recursos gráficos: pills blancas trackeadas, corchetes negros, marcos discontinuos, cintas inclinadas, recortes de personas, flechas circulares y blobs.
- Tono: cercano, orgulloso de lo extremeño, ambicioso sin grandilocuencia; habla de personas y proyectos reales.
- Colaboradores: Universidad de Extremadura, Consejo Social, Fundación MAPFRE, Junta de Extremadura, Alianza Extremadura y Diario HOY.

## Evidence on Hand

- 183 posts históricos en el WordPress actual (2021–2025).
- Temática de HOY con ~15 piezas visibles y página de autor con paginación real.
- Cinco caps de Instagram analizadas (Vaquero, Guadalupe Alcañiz, encuentro de Plasencia, encuentro de Badajoz, José Sánchez).
- Logotipo en PNG (798×236) y logos de colaboradores enlazados desde la web actual.
- Artículos reales con imagen, extracto, autor y fecha.
- No hay testimonios, métricas de audiencia ni casos de éxito propios verificados: no inventarlos.

## Product Principles

1. **SEO primero, sin canibalizar:** el contenido propio es el que posiciona; el de HOY se enlaza y se atribuye.
2. **La marca se reconoce en tres segundos:** el sitio debe parecer la campaña de Instagram, no una plantilla de noticias.
3. **Curaduría sobre volumen:** pocas piezas bien elegidas y contextualizadas valen más que un feed automático sin criterio.
4. **Rendimiento y accesibilidad son parte del diseño:** sin embeds pesados, sin autoplay, sin muros.
5. **Cada pieza lleva a una persona:** el valor del proyecto son las historias y quién las protagoniza.

## Accessibility & Inclusion

- WCAG 2.2 AA.
- Navegación completa por teclado, foco visible y skip link.
- Contraste mínimo 4.5:1 en texto normal.
- Subtítulos en vídeos y transcripción cuando sea posible.
- Respeto a `prefers-reduced-motion`.
- Textos claros, sin jerga innecesaria.
