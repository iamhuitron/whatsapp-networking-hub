/**
 * Utilidades de normalización compartidas por el parser social y el
 * agregador de perfiles. No inferir nada aquí: solo limpiar formato.
 */

/** Normaliza un username de Instagram: quita @, minúsculas, trims. */
export function normalizeInstagramUsername(raw: string): string {
  return raw.trim().replace(/^@/, "").toLowerCase();
}

export function buildInstagramUrl(username: string): string {
  return `https://www.instagram.com/${normalizeInstagramUsername(username)}/`;
}

/** Normaliza una URL de LinkedIn eliminando parámetros de tracking. */
export function buildLinkedInUrl(username: string): string {
  const clean = username.trim().replace(/\/$/, "");
  return `https://www.linkedin.com/in/${clean}/`;
}

/**
 * Clave estable para deduplicar contactos por nombre: minúsculas, sin
 * acentos, espacios colapsados. Dos mensajes del "mismo" WhatsApp author
 * string siempre producen la misma key, así que esto principalmente
 * protege contra diferencias triviales de espaciado.
 */
export function normalizeNameKey(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

/** Título simple: primera letra de cada palabra en mayúscula. */
export function toTitleCase(value: string): string {
  return value
    .toLowerCase()
    .split(" ")
    .map((w) => (w.length > 0 ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

export function cleanExtractedValue(value: string): string {
  return value
    .replace(/[.,;:]+$/g, "") // puntuación colgante al final
    .replace(/\s+/g, " ")
    .trim();
}
