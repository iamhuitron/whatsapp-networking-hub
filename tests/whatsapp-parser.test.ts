import { describe, expect, it } from "vitest";
import { parseWhatsAppMessages } from "@/lib/parser/whatsapp-parser";

describe("parseWhatsAppMessages", () => {
  it("parsea el formato Android (12h, con AM/PM)", () => {
    const raw = "12/31/23, 11:59 PM - Ana Ejemplo: Hola a todos";
    const [msg] = parseWhatsAppMessages(raw);
    expect(msg.author).toBe("Ana Ejemplo");
    expect(msg.text).toBe("Hola a todos");
    expect(msg.isSystem).toBe(false);
  });

  it("parsea el formato Android (24h, DD/MM/YYYY)", () => {
    const raw = "31/12/2023, 23:59 - Ana Ejemplo: Hola a todos";
    const [msg] = parseWhatsAppMessages(raw);
    expect(msg.author).toBe("Ana Ejemplo");
    expect(msg.text).toBe("Hola a todos");
  });

  it("parsea el formato iOS (con corchetes y segundos)", () => {
    const raw = "[31/12/2023, 23:59:59] Ana Ejemplo: Hola a todos";
    const [msg] = parseWhatsAppMessages(raw);
    expect(msg.author).toBe("Ana Ejemplo");
    expect(msg.text).toBe("Hola a todos");
  });

  it("parsea el formato iOS con AM/PM y espacio angosto (U+202F)", () => {
    const raw = "[12/31/23, 11:59:59\u202FPM] Ana Ejemplo: Hola a todos";
    const [msg] = parseWhatsAppMessages(raw);
    expect(msg.author).toBe("Ana Ejemplo");
    expect(msg.text).toBe("Hola a todos");
  });

  it("combina mensajes multilínea con el mensaje anterior", () => {
    const raw = [
      "31/12/2023, 23:59 - Ana Ejemplo: Primera línea",
      "segunda línea sin timestamp",
      "tercera línea también",
    ].join("\n");
    const messages = parseWhatsAppMessages(raw);
    expect(messages).toHaveLength(1);
    expect(messages[0].text).toBe(
      "Primera línea\nsegunda línea sin timestamp\ntercera línea también"
    );
  });

  it("detecta mensajes consecutivos del mismo remitente como mensajes separados", () => {
    const raw = [
      "31/12/2023, 23:59 - Ana Ejemplo: Hola",
      "31/12/2023, 23:59 - Ana Ejemplo: ¿Cómo están?",
    ].join("\n");
    const messages = parseWhatsAppMessages(raw);
    expect(messages).toHaveLength(2);
    expect(messages[0].text).toBe("Hola");
    expect(messages[1].text).toBe("¿Cómo están?");
  });

  it("marca mensajes de sistema conocidos sin autor", () => {
    const raw =
      "31/12/2023, 00:00 - Los mensajes y llamadas están cifrados de extremo a extremo.";
    const [msg] = parseWhatsAppMessages(raw);
    expect(msg.isSystem).toBe(true);
    expect(msg.author).toBeNull();
  });

  it("ignora líneas vacías", () => {
    const raw = [
      "31/12/2023, 23:59 - Ana Ejemplo: Hola",
      "",
      "   ",
      "31/12/2023, 23:59 - Ana Ejemplo: Adiós",
    ].join("\n");
    const messages = parseWhatsAppMessages(raw);
    expect(messages).toHaveLength(2);
  });

  it("quita el BOM inicial si está presente", () => {
    const raw = "\uFEFF31/12/2023, 23:59 - Ana Ejemplo: Hola";
    const [msg] = parseWhatsAppMessages(raw);
    expect(msg.author).toBe("Ana Ejemplo");
  });

  it("maneja nombres con emoji y acentos", () => {
    const raw = "31/12/2023, 23:59 - José 🚀: Hola equipo";
    const [msg] = parseWhatsAppMessages(raw);
    expect(msg.author).toBe("José 🚀");
  });
});
