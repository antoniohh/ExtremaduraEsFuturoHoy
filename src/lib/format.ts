const TIME_ZONE = "Europe/Madrid";

function toDate(value: string): Date {
  return new Date(value);
}

export function formatDate(value: string): string {
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: TIME_ZONE,
  })
    .format(toDate(value))
    .replace(".", "");
}

export function formatShortDate(value: string): string {
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
    timeZone: TIME_ZONE,
  })
    .format(toDate(value))
    .replace(".", "")
    .toUpperCase();
}

export function formatLongDate(value: string): string {
  const formatted = new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: TIME_ZONE,
  }).format(toDate(value));

  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export function formatTime(value: string): string {
  return new Intl.DateTimeFormat("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: TIME_ZONE,
  }).format(toDate(value));
}

export function formatDateTime(value: string): string {
  return `${formatDate(value)} · ${formatTime(value)}`;
}

export function formatEventDate(value: string): string {
  return new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: TIME_ZONE,
  })
    .format(toDate(`${value}T12:00:00`))
    .replace(/^./, (letter) => letter.toUpperCase());
}

export function formatBuildTime(value: string): string {
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: TIME_ZONE,
  })
    .format(toDate(value))
    .replace(".", "");
}

export function isToday(value: string): boolean {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: TIME_ZONE,
  });

  return formatter.format(toDate(value)) === formatter.format(new Date());
}

export function truncate(value: string, max = 155): string {
  const text = value.replace(/\s+/g, " ").trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).replace(/\s+\S*$/, "").trim()}…`;
}

export function parseInterviewTitle(title: string): {
  name: string;
  company: string;
  quote: string;
  headline: string;
} {
  const quote = title.match(/«([^»]+)»/)?.[1]?.trim() ?? "";
  const beforeColon = title.split(":")[0]?.trim() ?? "";
  const excludedStart =
    /^(dejó|empezaron|el club|nueve|los cuatro|así fue|estos|las |los )/i.test(
      beforeColon,
    );
  const looksLikeName =
    !excludedStart &&
    beforeColon.length > 2 &&
    beforeColon.length <= 70 &&
    /^[A-ZÁÉÍÓÚÑ]/.test(beforeColon);

  const name = looksLikeName
    ? beforeColon
        .replace(
          /,\s*(?:de|fundadora de|fundador de|creador de|creadora de)\s+.+$/i,
          "",
        )
        .trim()
    : "";

  const company = looksLikeName
    ? (beforeColon.match(
        /(?:de|fundadora de|fundador de|creador de|creadora de)\s+(.+)$/i,
      )?.[1]?.trim() ?? "")
    : "";

  return {
    name,
    company,
    quote,
    headline: quote || title.replace(/^[^:]+:\s*/, "").trim() || title,
  };
}
