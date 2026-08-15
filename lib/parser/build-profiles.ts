import type { ChatMessage } from "./whatsapp-parser";
import type { ContactProfile, ParsedChatResult } from "@/lib/types";
import { extractInstagram, extractLinkedIn } from "./social-parser";
import {
  extractCareer,
  extractCity,
  extractCompany,
  extractJobTitle,
  extractUniversity,
} from "./profile-parser";
import { normalizeNameKey } from "./normalizer";

type SingleValueField =
  | "career"
  | "university"
  | "jobTitle"
  | "company"
  | "city"
  | "instagramUsername"
  | "linkedinUrl";

interface FieldCandidates {
  career: Set<string>;
  university: Set<string>;
  jobTitle: Set<string>;
  company: Set<string>;
  city: Set<string>;
  instagramUsername: Set<string>;
  instagramUrl: Set<string>;
  linkedinUrl: Set<string>;
}

function emptyCandidates(): FieldCandidates {
  return {
    career: new Set(),
    university: new Set(),
    jobTitle: new Set(),
    company: new Set(),
    city: new Set(),
    instagramUsername: new Set(),
    instagramUrl: new Set(),
    linkedinUrl: new Set(),
  };
}

/**
 * Resuelve un conjunto de valores candidatos para un campo a un único
 * valor. Si hay más de un valor distinto, no se adivina: se toma el
 * primero (orden de aparición) y se marca el campo como ambiguo para
 * revisión manual, tal como exige la regla de no-inferencia del proyecto.
 */
function resolveField(
  candidates: Set<string>
): { value: string | null; ambiguous: boolean } {
  const values = [...candidates];
  if (values.length === 0) return { value: null, ambiguous: false };
  if (values.length === 1) return { value: values[0], ambiguous: false };
  return { value: values[0], ambiguous: true };
}

function simpleHash(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

/**
 * Agrupa mensajes por autor y extrae, de cada mensaje, cualquier dato
 * explícito reconocible. La identidad del contacto viene directamente del
 * remitente que WhatsApp ya reporta (el nombre/alias tal como aparece en
 * el chat exportado) — nunca se infiere un nombre.
 */
export function buildProfilesFromMessages(
  messages: ChatMessage[]
): ParsedChatResult {
  const byAuthor = new Map<
    string,
    { displayName: string; candidates: FieldCandidates; messageCount: number }
  >();

  for (const msg of messages) {
    if (msg.isSystem || !msg.author) continue;

    const key = normalizeNameKey(msg.author);
    if (!byAuthor.has(key)) {
      byAuthor.set(key, {
        displayName: msg.author,
        candidates: emptyCandidates(),
        messageCount: 0,
      });
    }
    const entry = byAuthor.get(key)!;
    entry.messageCount += 1;

    const career = extractCareer(msg.text);
    if (career) entry.candidates.career.add(career);

    const university = extractUniversity(msg.text);
    if (university) entry.candidates.university.add(university);

    const jobTitle = extractJobTitle(msg.text);
    if (jobTitle) entry.candidates.jobTitle.add(jobTitle);

    const company = extractCompany(msg.text);
    if (company) entry.candidates.company.add(company);

    const city = extractCity(msg.text);
    if (city) entry.candidates.city.add(city);

    const instagram = extractInstagram(msg.text);
    if (instagram) {
      entry.candidates.instagramUsername.add(instagram.username);
      entry.candidates.instagramUrl.add(instagram.url);
    }

    const linkedin = extractLinkedIn(msg.text);
    if (linkedin) {
      entry.candidates.linkedinUrl.add(linkedin.url);
    }
  }

  const contacts: ContactProfile[] = [];

  for (const [key, entry] of byAuthor.entries()) {
    const ambiguousFields: string[] = [];

    const fieldResults: Record<
      "career" | "university" | "jobTitle" | "company" | "city",
      { value: string | null; ambiguous: boolean }
    > = {
      career: resolveField(entry.candidates.career),
      university: resolveField(entry.candidates.university),
      jobTitle: resolveField(entry.candidates.jobTitle),
      company: resolveField(entry.candidates.company),
      city: resolveField(entry.candidates.city),
    };

    for (const [field, result] of Object.entries(fieldResults)) {
      if (result.ambiguous) ambiguousFields.push(field);
    }

    const igUsernameResult = resolveField(entry.candidates.instagramUsername);
    const igUrlResult = resolveField(entry.candidates.instagramUrl);
    const linkedinResult = resolveField(entry.candidates.linkedinUrl);
    if (igUsernameResult.ambiguous) ambiguousFields.push("instagramUsername");
    if (linkedinResult.ambiguous) ambiguousFields.push("linkedinUrl");

    contacts.push({
      id: simpleHash(key),
      name: entry.displayName,

      instagramUsername: igUsernameResult.value,
      instagramUrl: igUrlResult.value,
      linkedinUrl: linkedinResult.value,

      career: fieldResults.career.value,
      university: fieldResults.university.value,

      jobTitle: fieldResults.jobTitle.value,
      company: fieldResults.company.value,

      city: fieldResults.city.value,
      state: null,
      country: null,

      interests: [],
      technologies: [],

      isAmbiguous: ambiguousFields.length > 0,
      ambiguousFields,
      sourceMessageCount: entry.messageCount,

      status: "pendiente",
      priority: "media",
      notes: "",
    });
  }

  return {
    contacts,
    totalMessages: messages.length,
    totalParticipants: contacts.length,
    ambiguousCount: contacts.filter((c) => c.isAmbiguous).length,
  };
}
