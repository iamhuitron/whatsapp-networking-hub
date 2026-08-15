import { describe, expect, it } from "vitest";
import { extractInstagram, extractLinkedIn } from "@/lib/parser/social-parser";

describe("extractInstagram", () => {
  it("reconoce @usuario con contexto de instagram", () => {
    const result = extractInstagram("Mi IG es @carlos123");
    expect(result).toEqual({
      username: "carlos123",
      url: "https://www.instagram.com/carlos123/",
    });
  });

  it("no reconoce @usuario sin contexto de instagram (evita falsos positivos)", () => {
    expect(extractInstagram("Saludos a @carlos123 de parte de todos")).toBeNull();
  });

  it("reconoce instagram.com/usuario sin protocolo", () => {
    const result = extractInstagram("instagram.com/carlos123");
    expect(result?.username).toBe("carlos123");
  });

  it("reconoce www.instagram.com/usuario", () => {
    const result = extractInstagram("www.instagram.com/carlos123");
    expect(result?.username).toBe("carlos123");
  });

  it("reconoce https URL completa con slash final y normaliza", () => {
    const result = extractInstagram("https://www.instagram.com/carlos123/");
    expect(result?.url).toBe("https://www.instagram.com/carlos123/");
  });

  it("reconoce https://instagram.com/usuario/ (sin www)", () => {
    const result = extractInstagram("https://instagram.com/carlos123/");
    expect(result?.username).toBe("carlos123");
  });

  it("ignora rutas reservadas de Instagram como /p/ o /reel/", () => {
    expect(
      extractInstagram("mira esto instagram.com/p/Cxyz123abc")
    ).toBeNull();
  });

  it("devuelve null si no hay ninguna mención de instagram", () => {
    expect(extractInstagram("Hola a todos, ¿cómo están?")).toBeNull();
  });
});

describe("extractLinkedIn", () => {
  it("reconoce linkedin.com/in/usuario", () => {
    const result = extractLinkedIn("linkedin.com/in/carlos-perez");
    expect(result?.url).toBe("https://www.linkedin.com/in/carlos-perez/");
  });

  it("reconoce www.linkedin.com/in/usuario", () => {
    const result = extractLinkedIn("www.linkedin.com/in/carlos-perez");
    expect(result?.username).toBe("carlos-perez");
  });

  it("reconoce URL completa https y elimina parámetros de tracking", () => {
    const result = extractLinkedIn(
      "https://www.linkedin.com/in/carlos-perez/?utm_source=share"
    );
    expect(result?.url).toBe("https://www.linkedin.com/in/carlos-perez/");
  });

  it("devuelve null si no hay linkedin", () => {
    expect(extractLinkedIn("Nos vemos mañana")).toBeNull();
  });
});
