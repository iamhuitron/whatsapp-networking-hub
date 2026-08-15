/**
 * Modelo de datos del directorio de networking.
 * Todo campo no detectado explícitamente debe ser `null`, nunca inferido.
 * La UI se encarga de mostrar "No especificado" cuando el valor es null.
 */

export type NetworkingStatus =
  | "pendiente"
  | "instagram_seguido"
  | "linkedin_conectado"
  | "ambos"
  | "omitido";

export type Priority = "alta" | "media" | "baja";

export interface ContactProfile {
  id: string; // hash estable derivado del nombre normalizado
  name: string;

  instagramUsername: string | null;
  instagramUrl: string | null;
  linkedinUrl: string | null;

  career: string | null;
  university: string | null;

  jobTitle: string | null;
  company: string | null;

  city: string | null;
  state: string | null;
  country: string | null;

  interests: string[];
  technologies: string[];

  // Metadatos del parser
  isAmbiguous: boolean; // true si hubo conflicto entre mensajes y no se pudo resolver con certeza
  ambiguousFields: string[]; // nombres de campos con valores en conflicto, para revisión manual
  sourceMessageCount: number;

  // Estado gestionado por el usuario (no viene del chat)
  status: NetworkingStatus;
  priority: Priority;
  notes: string;
}

export interface ParsedChatResult {
  contacts: ContactProfile[];
  totalMessages: number;
  totalParticipants: number;
  ambiguousCount: number;
}

export interface UserSelection {
  selectedContactId: string | null;
}
