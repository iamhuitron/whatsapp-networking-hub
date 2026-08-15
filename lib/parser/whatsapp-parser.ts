/**
 * Parser de bajo nivel: convierte el texto crudo de un export de WhatsApp
 * en una lista de mensajes estructurados (autor, fecha, hora, texto).
 *
 * Formatos soportados (los dos formatos oficiales de exportación de WhatsApp,
 * en cualquier locale/idioma de fecha):
 *
 *  Android:  "12/31/23, 11:59 PM - Carlos: Hola a todos"
 *            "31/12/2023, 23:59 - Carlos: Hola a todos"
 *  iOS:      "[12/31/23, 11:59:59 PM] Carlos: Hola a todos"
 *            "[31/12/2023, 23:59:59] Carlos: Hola a todos"
 *
 * No se asume un único formato: se intenta contra varios patrones y se
 * conserva el primero que matchee cada línea. Cualquier línea que no
 * matchee un timestamp se trata como continuación (multilínea) del
 * mensaje anterior.
 */

export interface ChatMessage {
  author: string | null; // null para mensajes de sistema (sin remitente)
  rawDate: string;
  rawTime: string;
  text: string;
  isSystem: boolean;
}

// Espacio angosto sin separación (U+202F) y NBSP (U+00A0) aparecen en
// algunos exports de iOS antes de AM/PM. Los normalizamos a espacio normal.
function normalizeWhitespace(input: string): string {
  return input.replace(/[\u202F\u00A0]/g, " ");
}

// Quita BOM y normaliza saltos de línea.
export function preprocessRawText(input: string): string {
  const withoutBom = input.replace(/^\uFEFF/, "");
  return normalizeWhitespace(withoutBom).replace(/\r\n|\r/g, "\n");
}

const DATE = "\\d{1,4}[\\/.\\-]\\d{1,2}[\\/.\\-]\\d{1,4}";
const TIME = "\\d{1,2}:\\d{2}(?::\\d{2})?(?:\\s?[APap]\\.?\\s?[Mm]\\.?)?";

// Formato Android: "DD/MM/YYYY, HH:MM - " o "DD/MM/YY, HH:MM AM - "
const ANDROID_LINE_START = new RegExp(
  `^(${DATE}),?\\s+(${TIME})\\s*-\\s*(.*)$`
);

// Formato iOS: "[DD/MM/YYYY, HH:MM:SS] " (con o sin AM/PM)
const IOS_LINE_START = new RegExp(`^\\[(${DATE}),?\\s+(${TIME})\\]\\s*(.*)$`);

// Frases típicas de mensajes de sistema (sin remitente), en español e inglés.
const SYSTEM_MESSAGE_HINTS = [
  /mensajes y llamadas est[aá]n cifrados/i,
  /messages and calls are end-to-end encrypted/i,
  /cre[oó] el grupo/i,
  /created group/i,
  /cambiaste el asunto/i,
  /cambi[oó] el [ií]cono/i,
  /a[ñn]adi[oó] a/i,
  /added/i,
  /sali[oó] del grupo/i,
  /left$/i,
  /eliminó a/i,
  /removed/i,
  /cambi[oó] su n[uú]mero de tel[eé]fono/i,
  /changed their phone number/i,
];

/**
 * Intenta separar "Nombre: mensaje" del resto de la línea (ya sin fecha/hora).
 * Devuelve null si no hay un separador "autor: texto" reconocible, lo que
 * indica un mensaje de sistema.
 */
function splitAuthorAndText(
  rest: string
): { author: string; text: string } | null {
  // El nombre de un contacto no contiene "://" (evita romper con URLs que
  // empiecen la línea) y no suele superar ~70 caracteres.
  const match = rest.match(/^([^:]{1,70}?):\s(.*)$/s);
  if (!match) return null;

  const [, author, text] = match;
  if (author.includes("://")) return null;

  return { author: author.trim(), text: text.trim() };
}

function isSystemMessage(rest: string): boolean {
  return SYSTEM_MESSAGE_HINTS.some((re) => re.test(rest));
}

/**
 * Parsea el texto completo de un export de WhatsApp en mensajes
 * estructurados. Nunca lanza sobre contenido inesperado: las líneas que no
 * se reconocen como inicio de mensaje se anexan al mensaje anterior
 * (soporta mensajes multilínea).
 */
export function parseWhatsAppMessages(rawText: string): ChatMessage[] {
  const text = preprocessRawText(rawText);
  const lines = text.split("\n");

  const messages: ChatMessage[] = [];

  for (const line of lines) {
    if (line.trim() === "") continue;

    const androidMatch = line.match(ANDROID_LINE_START);
    const iosMatch = !androidMatch ? line.match(IOS_LINE_START) : null;
    const match = androidMatch ?? iosMatch;

    if (match) {
      const rawDate = match[1]!;
      const rawTime = match[2]!;
      const rest = match[3] ?? "";
      const parsed = splitAuthorAndText(rest);

      if (parsed) {
        messages.push({
          author: parsed.author,
          rawDate,
          rawTime,
          text: parsed.text,
          isSystem: false,
        });
      } else {
        messages.push({
          author: null,
          rawDate,
          rawTime,
          text: rest.trim(),
          isSystem: true,
        });
      }
      continue;
    }

    // Línea de continuación (mensaje multilínea): se anexa al último mensaje.
    const last = messages[messages.length - 1];
    if (last) {
      last.text = last.text.length > 0 ? `${last.text}\n${line}` : line;
    }
    // Si no hay mensaje previo (p.ej. encabezado antes del primer mensaje),
    // la línea se descarta silenciosamente.
  }

  // Segunda pasada: reclasificar como sistema mensajes sin autor que
  // matchearon frases de sistema conocidas pero sí tenían un "algo: texto"
  // (caso raro, p.ej. "El administrador: cambió la configuración").
  return messages.map((m) =>
    !m.isSystem && m.author === null && isSystemMessage(m.text)
      ? { ...m, isSystem: true }
      : m
  );
}
