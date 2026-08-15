import type { ParsedChatResult } from "@/lib/types";
import { parseWhatsAppMessages } from "./whatsapp-parser";
import { buildProfilesFromMessages } from "./build-profiles";

export { parseWhatsAppMessages } from "./whatsapp-parser";
export type { ChatMessage } from "./whatsapp-parser";
export { extractInstagram, extractLinkedIn } from "./social-parser";
export {
  extractCareer,
  extractCity,
  extractCompany,
  extractJobTitle,
  extractUniversity,
  extractSelfIntroducedName,
} from "./profile-parser";
export { buildProfilesFromMessages } from "./build-profiles";

/**
 * Punto de entrada principal: recibe el texto completo del .txt exportado
 * de WhatsApp y devuelve el directorio de contactos extraído.
 *
 * Se ejecuta enteramente en el navegador — no hay ninguna llamada de red
 * en este módulo ni en los que importa.
 */
export function parseWhatsAppChat(rawText: string): ParsedChatResult {
  const messages = parseWhatsAppMessages(rawText);
  return buildProfilesFromMessages(messages);
}
