import { describe, expect, it } from "vitest";
import { parseWhatsAppChat } from "@/lib/parser";

describe("parseWhatsAppChat — integración", () => {
  it("extrae un perfil completo del ejemplo de presentación de la spec", () => {
    const raw = [
      "31/12/2023, 20:00 - Carlos: Hola, soy Carlos.",
      "31/12/2023, 20:01 - Carlos: Estudio Ingeniería en Sistemas en el IPN.",
      "31/12/2023, 20:02 - Carlos: Soy de Puebla.",
      "31/12/2023, 20:03 - Carlos: Trabajo como desarrollador backend.",
      "31/12/2023, 20:04 - Carlos: Mi IG es @carlos123.",
    ].join("\n");

    const result = parseWhatsAppChat(raw);

    expect(result.totalParticipants).toBe(1);
    const [carlos] = result.contacts;

    expect(carlos.name).toBe("Carlos");
    expect(carlos.career).toBe("Ingeniería en Sistemas");
    expect(carlos.university).toBe("IPN");
    expect(carlos.city).toBe("Puebla");
    expect(carlos.jobTitle).toBe("desarrollador backend");
    expect(carlos.instagramUsername).toBe("carlos123");
    expect(carlos.instagramUrl).toBe("https://www.instagram.com/carlos123/");
    expect(carlos.isAmbiguous).toBe(false);
  });

  it("combina información de varios mensajes del mismo participante (mensajes no consecutivos)", () => {
    const raw = [
      "31/12/2023, 20:00 - Ana: Hola, soy Ana.",
      "31/12/2023, 20:05 - Luis: Bienvenida Ana!",
      "31/12/2023, 20:10 - Ana: Estudio Informática.",
      "31/12/2023, 20:15 - Luis: Yo estudio en la UNAM",
      "31/12/2023, 20:20 - Ana: Soy de CDMX.",
      "31/12/2023, 20:25 - Ana: Mi instagram es @ana_ejemplo",
    ].join("\n");

    const result = parseWhatsAppChat(raw);
    expect(result.totalParticipants).toBe(2);

    const ana = result.contacts.find((c) => c.name === "Ana");
    expect(ana?.career).toBe("Informática");
    expect(ana?.city).toBe("CDMX");
    expect(ana?.instagramUsername).toBe("ana_ejemplo");
  });

  it("marca como ambiguo un perfil con dos ciudades distintas declaradas", () => {
    const raw = [
      "31/12/2023, 20:00 - Luis: Soy de Monterrey.",
      "31/12/2023, 20:05 - Luis: Ahora vivo en Guadalajara.",
    ].join("\n");

    const result = parseWhatsAppChat(raw);
    const [luis] = result.contacts;

    expect(luis.isAmbiguous).toBe(true);
    expect(luis.ambiguousFields).toContain("city");
    // No se adivina: se conserva el primer valor detectado, no se descarta el dato.
    expect(luis.city).toBe("Monterrey");
  });

  it("no confunde a dos participantes distintos con el mismo dato", () => {
    const raw = [
      "31/12/2023, 20:00 - Marta: Soy de CDMX.",
      "31/12/2023, 20:05 - Pedro: Yo igual soy de CDMX.",
    ].join("\n");

    const result = parseWhatsAppChat(raw);
    expect(result.totalParticipants).toBe(2);
    expect(result.contacts.every((c) => c.city === "CDMX")).toBe(true);
    expect(result.ambiguousCount).toBe(0);
  });

  it("excluye mensajes de sistema del conteo de participantes", () => {
    const raw = [
      "31/12/2023, 00:00 - Los mensajes y llamadas están cifrados de extremo a extremo.",
      "31/12/2023, 20:00 - Carlos: Hola",
    ].join("\n");

    const result = parseWhatsAppChat(raw);
    expect(result.totalParticipants).toBe(1);
    expect(result.contacts[0].name).toBe("Carlos");
  });

  it("asigna estado inicial 'pendiente' y prioridad 'media' por defecto", () => {
    const raw = "31/12/2023, 20:00 - Carlos: Hola";
    const [carlos] = parseWhatsAppChat(raw).contacts;
    expect(carlos.status).toBe("pendiente");
    expect(carlos.priority).toBe("media");
  });
});
