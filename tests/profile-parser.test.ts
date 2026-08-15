import { describe, expect, it } from "vitest";
import {
  extractCareer,
  extractCity,
  extractCompany,
  extractJobTitle,
  extractUniversity,
} from "@/lib/parser/profile-parser";

describe("extractCareer", () => {
  it("reconoce 'Estudio X'", () => {
    expect(extractCareer("Estudio Ingeniería en Sistemas en el IPN.")).toBe(
      "Ingeniería en Sistemas"
    );
  });

  it("reconoce 'Estudio la carrera de X'", () => {
    expect(
      extractCareer("Estudio la carrera de Informática en la UNAM.")
    ).toBe("Informática");
  });

  it("devuelve null si no hay mención de estudios", () => {
    expect(extractCareer("Hola a todos")).toBeNull();
  });
});

describe("extractUniversity", () => {
  it("reconoce una sigla de universidad conocida", () => {
    expect(extractUniversity("Estudio en el IPN")).toBe("IPN");
  });

  it("reconoce 'universidad de X'", () => {
    expect(extractUniversity("Voy en la universidad de Guadalajara")).toBe(
      "Guadalajara"
    );
  });

  it("devuelve null sin contexto de universidad", () => {
    expect(extractUniversity("Nos vemos en el parque")).toBeNull();
  });
});

describe("extractCity", () => {
  it("reconoce 'Soy de X'", () => {
    expect(extractCity("Soy de Puebla.")).toBe("Puebla");
  });

  it("reconoce 'Vivo en X'", () => {
    expect(extractCity("Actualmente vivo en Guadalajara")).toBe(
      "Guadalajara"
    );
  });
});

describe("extractJobTitle / extractCompany", () => {
  it("reconoce 'trabajo como X'", () => {
    expect(extractJobTitle("Trabajo como desarrollador backend.")).toBe(
      "desarrollador backend"
    );
  });

  it("reconoce 'trabajo en X' como empresa", () => {
    expect(extractCompany("Trabajo en Tech Company haciendo backend")).toBe(
      "Tech Company"
    );
  });

  it("reconoce 'Soy [profesión]'", () => {
    expect(extractJobTitle("Soy ingeniero de software desde 2020")).toBe(
      "ingeniero de software desde 2020"
    );
  });
});
