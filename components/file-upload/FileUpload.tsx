"use client";

import { useCallback, useRef, useState } from "react";
import { parseWhatsAppChat } from "@/lib/parser";
import type { ParsedChatResult } from "@/lib/types";

type UploadState =
  | { status: "idle" }
  | { status: "reading" }
  | { status: "error"; message: string }
  | { status: "loaded"; fileName: string; result: ParsedChatResult };

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB, generoso para chats grandes

/**
 * Lee el archivo enteramente en memoria del navegador usando FileReader.
 * El contenido NUNCA se envía a ningún servidor: no hay fetch(), no hay
 * XMLHttpRequest, no hay FormData submit. Ver README > Privacidad.
 *
 * Nota: el parseo real (detección de participantes, redes, carrera, etc.)
 * se implementará en la Fase 2 sobre lib/parser/whatsapp-parser.ts, una vez
 * analizada la estructura real de un export de WhatsApp. Por ahora este
 * componente valida el archivo y muestra estadísticas básicas para
 * confirmar que la lectura local funciona correctamente.
 */
function readFileLocally(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("No se pudo leer el archivo como texto."));
      }
    };
    reader.onerror = () => reject(new Error("Error al leer el archivo."));
    // UTF-8 es el encoding estándar de exportación de WhatsApp; el parser
    // definitivo (Fase 2) manejará también BOM/UTF-16 si aparecen casos reales.
    reader.readAsText(file, "utf-8");
  });
}

function validateFile(file: File): string | null {
  const isTxt = file.name.toLowerCase().endsWith(".txt");
  if (!isTxt) {
    return "El archivo debe tener extensión .txt (exportación de chat de WhatsApp).";
  }
  if (file.size === 0) {
    return "El archivo está vacío.";
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return "El archivo es demasiado grande (máximo 50 MB).";
  }
  return null;
}

export function FileUpload() {
  const [state, setState] = useState<UploadState>({ status: "idle" });
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setState({ status: "error", message: validationError });
      return;
    }

    setState({ status: "reading" });
    try {
      const text = await readFileLocally(file);
      const result = parseWhatsAppChat(text);

      if (result.totalParticipants === 0) {
        setState({
          status: "error",
          message:
            "No pudimos reconocer el formato de este archivo. Asegúrate de haber exportado el chat de WhatsApp como archivo de texto (.txt).",
        });
        return;
      }

      setState({ status: "loaded", fileName: file.name, result });
    } catch (err) {
      setState({
        status: "error",
        message:
          "No pudimos reconocer el formato de este archivo. Asegúrate de haber exportado el chat de WhatsApp como archivo de texto (.txt).",
      });
    }
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return (
    <div className="w-full max-w-xl mx-auto">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        className={`cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-colors ${
          isDragging
            ? "border-brand-500 bg-brand-50"
            : "border-gray-300 hover:border-brand-500 hover:bg-gray-50"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".txt"
          className="hidden"
          onChange={onInputChange}
        />
        <p className="text-lg font-medium text-gray-800">
          Arrastra aquí tu archivo .txt
        </p>
        <p className="mt-1 text-sm text-gray-500">
          o haz clic para seleccionar el archivo
        </p>
      </div>

      {state.status === "reading" && (
        <p className="mt-4 text-center text-sm text-gray-500">
          Leyendo archivo localmente…
        </p>
      )}

      {state.status === "error" && (
        <div className="mt-4 rounded-lg bg-red-50 p-4 text-sm text-red-700">
          {state.message}
        </div>
      )}

      {state.status === "loaded" && (
        <div className="mt-4 rounded-lg bg-brand-50 p-4 text-sm text-brand-700">
          <p className="font-medium">✓ {state.fileName} procesado correctamente</p>
          <ul className="mt-2 space-y-1 text-gray-700">
            <li>
              {state.result.totalParticipants.toLocaleString("es")} participantes
              detectados
            </li>
            <li>
              {state.result.totalMessages.toLocaleString("es")} mensajes
              analizados
            </li>
            {state.result.ambiguousCount > 0 && (
              <li className="text-amber-700">
                {state.result.ambiguousCount} perfiles con datos ambiguos
                (marcados para revisión)
              </li>
            )}
          </ul>
          <p className="mt-2 text-xs text-gray-500">
            Todo el análisis ocurrió en tu navegador. Siguiente paso:
            selección de tu identidad y el dashboard (próxima fase de UI).
          </p>
        </div>
      )}
    </div>
  );
}
