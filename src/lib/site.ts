export const SITE = {
  name: "Extremadura es Futuro HOY",
  shortName: "EEFH",
  url: "https://www.hoyextremaduraesfuturo.es",
  description:
    "Noticias, entrevistas y encuentros de Extremadura es Futuro HOY, el proyecto de Diario HOY, la Universidad de Extremadura y la Alianza Extremadura.",
  author: "Daniel Vaquerizo",
  social: {
    instagram: "https://www.instagram.com/extremaduraesfuturohoy/",
    youtube: "https://www.youtube.com/@ExtremaduraEsFuturo",
    tiktok: "https://www.tiktok.com/@extremaduraesfuturohoy",
  },
  hoy: {
    tematica: "https://www.hoy.es/tematicas/extremadura-es-futuro-hoy.html",
    autor: "https://www.hoy.es/autor/daniel-vaquerizo-7580.html",
  },
} as const;

export const NAV = [
  { href: "/noticias/", label: "Noticias" },
  { href: "/entrevistas/", label: "Entrevistas" },
  { href: "/encuentros/", label: "Encuentros" },
  { href: "/instagram/", label: "Instagram" },
  { href: "/youtube/", label: "YouTube" },
  { href: "/tiktok/", label: "TikTok" },
  { href: "/ediciones/", label: "Ediciones" },
] as const;

export const SOCIAL_LINKS = [
  { href: SITE.social.instagram, label: "Instagram", short: "IG" },
  { href: SITE.social.youtube, label: "YouTube", short: "YT" },
  { href: SITE.social.tiktok, label: "TikTok", short: "TT" },
] as const;

export const PARTNERS = [
  {
    name: "Universidad de Extremadura",
    href: "https://www.unex.es/",
    image: "/media/partners/uni-extremadura.jpg",
  },
  {
    name: "Consejo Social de la UEx",
    href: "https://consejosocial.unex.es/",
    image: "/media/partners/consejo-social-logo.png",
  },
  {
    name: "Fundación MAPFRE",
    href: "https://www.fundacionmapfre.org/",
    image: "/media/partners/fundacion-mapfre.jpg",
  },
  {
    name: "Fundación Universidad Sociedad",
    href: "https://www.uexfundacion.es/",
    image: "/media/partners/fundacion-logo.png",
  },
  {
    name: "Diario HOY",
    href: "https://www.hoy.es/",
    image: "/media/partners/hoy-logo.png",
  },
] as const;

export const KIND_LABEL = {
  entrevista: "Entrevista",
  encuentro: "Encuentro",
  reportaje: "Reportaje",
} as const;

export const KIND_COLOR = {
  entrevista: "bg-cyan",
  encuentro: "bg-magenta",
  reportaje: "bg-green",
} as const;
