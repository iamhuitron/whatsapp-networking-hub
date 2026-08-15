import { buildInstagramUrl, buildLinkedInUrl } from "./normalizer";

export interface SocialMatch {
  username: string;
  url: string;
}

const IG_USERNAME = "[a-zA-Z0-9_.]{2,30}";

// instagram.com/usuario, www.instagram.com/usuario, https://.../usuario/
const IG_URL_RE = new RegExp(
  `(?:https?:\\/\\/)?(?:www\\.)?instagram\\.com\\/(${IG_USERNAME})\\/?(?:\\?[^\\s]*)?`,
  "i"
);

// @usuario, solo cuando hay contexto de Instagram cerca (evita falsos
// positivos con menciones genéricas de @alguien en el chat).
const IG_CONTEXT_RE = /\b(ig|insta|instagram)\b/i;
const IG_HANDLE_RE = new RegExp(`@(${IG_USERNAME})`, "g");

const RESERVED_IG_PATHS = new Set([
  "p",
  "reel",
  "reels",
  "stories",
  "explore",
  "accounts",
  "direct",
]);

export function extractInstagram(text: string): SocialMatch | null {
  const urlMatch = text.match(IG_URL_RE);
  if (urlMatch) {
    const username = urlMatch[1].replace(/\.$/, "");
    if (!RESERVED_IG_PATHS.has(username.toLowerCase())) {
      return { username, url: buildInstagramUrl(username) };
    }
  }

  if (IG_CONTEXT_RE.test(text)) {
    const handles = [...text.matchAll(IG_HANDLE_RE)];
    if (handles.length > 0) {
      // Instagram usernames pueden contener ".", pero un punto final suele
      // ser puntuación de la frase ("Mi IG es @user."), no parte del handle.
      const username = handles[0][1].replace(/\.$/, "");
      return { username, url: buildInstagramUrl(username) };
    }
  }

  return null;
}

const LINKEDIN_URL_RE =
  /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9\-_%]+)\/?(?:\?[^\s]*)?/i;

export function extractLinkedIn(text: string): SocialMatch | null {
  const match = text.match(LINKEDIN_URL_RE);
  if (!match) return null;
  const username = match[1];
  return { username, url: buildLinkedInUrl(username) };
}
