import { cleanExtractedValue } from "./normalizer";

/**
 * Extracción basada en frases explícitas típicas de presentación en
 * español ("estudio X", "trabajo en Y", "soy de Z"). Solo se extrae lo que
 * está escrito literalmente — nunca se infiere ni se busca información
 * externa (ver regla de no-inferencia del proyecto).
 *
 * Estos patrones son heurísticos y deliberadamente conservadores: es
 * preferible no detectar un dato ambiguo a inventarlo.
 */

// Corta la captura en el primer conector de otra idea (punto, coma antes de
// otra frase, salto de línea, o palabras que suelen iniciar la siguiente idea).
const STOP_WORDS =
  "(?=[.\\n]|,\\s*(?:y|trabajo|estudio|vivo|soy de|mi (?:ig|instagram|linkedin))|\\s+en\\s+(?:el|la)\\b|\\s+haciendo\\b|$)";

function firstMatch(text: string, patterns: RegExp[]): string | null {
  for (const re of patterns) {
    const match = text.match(re);
    if (match?.[1]) {
      const value = cleanExtractedValue(match[1]);
      if (value.length > 1) return value;
    }
  }
  return null;
}

export function extractCareer(text: string): string | null {
  return firstMatch(text, [
    new RegExp(
      `(?:estudio|estudi[eé]|estudiando)\\s+(?:la carrera de\\s+|la licenciatura en\\s+)?([^\\n]+?)${STOP_WORDS}`,
      "i"
    ),
    new RegExp(`carrera de\\s+([^\\n]+?)${STOP_WORDS}`, "i"),
  ]);
}

const UNIVERSITY_ACRONYMS =
  /\b(IPN|UNAM|ITESM|Tec de Monterrey|UANL|UDG|BUAP|UV|IBERO|Anáhuac|La Salle|UAM|Poli)\b/;

export function extractUniversity(text: string): string | null {
  return firstMatch(text, [
    new RegExp(`universidad\\s+(?:de\\s+|del\\s+)?([^\\n]+?)${STOP_WORDS}`, "i"),
    // Solo se intenta "en el/la X" cuando hay contexto explícito de estudio
    // en la misma oración, para evitar falsos positivos con "en el grupo".
    new RegExp(
      `(?:estudio|estudi[eé]|estudiando)[^\\n.]*?en\\s+(?:el|la)\\s+([^\\n]+?)${STOP_WORDS}`,
      "i"
    ),
    UNIVERSITY_ACRONYMS,
  ]);
}

export function extractCity(text: string): string | null {
  return firstMatch(text, [
    new RegExp(
      `(?:soy de|vivo en|radico en|estoy en)\\s+([^\\n]+?)${STOP_WORDS}`,
      "i"
    ),
  ]);
}

export function extractJobTitle(text: string): string | null {
  return firstMatch(text, [
    new RegExp(
      `trabajo\\s+como\\s+([^\\n]+?)${STOP_WORDS}`,
      "i"
    ),
    new RegExp(
      `soy\\s+((?:desarrollador|desarrolladora|ingenier[oa]|dise[ñn]ador(?:a)?|product manager|pm|data scientist|analista|consultor(?:a)?|freelance|freelancer|programador(?:a)?|full[\\s-]?stack|backend|frontend|marketer|abogado|abogada|médico|médica|contador(?:a)?|arquitect[oa])[^\\n]*?)${STOP_WORDS}`,
      "i"
    ),
  ]);
}

export function extractCompany(text: string): string | null {
  return firstMatch(text, [
    new RegExp(
      `trabajo\\s+en\\s+([^\\n]+?)${STOP_WORDS}`,
      "i"
    ),
    new RegExp(`en la empresa\\s+([^\\n]+?)${STOP_WORDS}`, "i"),
  ]);
}

/**
 * "Hola, soy Carlos." — fallback para inferir el nombre propio SOLO cuando
 * el autor de WhatsApp no es un nombre utilizable (p.ej. un número de
 * teléfono). No se usa si ya hay un nombre de autor válido.
 */
export function extractSelfIntroducedName(text: string): string | null {
  const match = text.match(
    /(?:hola,?\s*)?soy\s+([A-ZÁÉÍÓÚÑ][a-zA-ZÀ-ÿ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-zA-ZÀ-ÿ]+){0,2})\b/
  );
  if (!match) return null;
  // Evita capturar "Soy desarrollador..." como si fuera un nombre.
  const PROFESSION_WORDS =
    /desarrollador|desarrolladora|ingenier|dise[ñn]ador|programador|analista|estudiante/i;
  if (PROFESSION_WORDS.test(match[1])) return null;
  return cleanExtractedValue(match[1]);
}
